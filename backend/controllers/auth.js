// models
const User = require("../models/User");
const Otp = require("../models/Otp");
const RefreshToken = require("../models/RefreshToken");

const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateOtp = require("../utils/generateOTP");
const {
  sendRegCode,
  greetMail,
  resetPasswordMail,
} = require("../services/emailService");

const { attachRefreshToken, clearRefreshToken } = require("../utils/cookies");

const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors/index");
const { log } = require("console");

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const issueSession = async (res, user) => {
  const refreshToken = await user.createRefreshToken();
  const accessToken = await user.createAccessToken();

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
  });

  attachRefreshToken(res, refreshToken);
  return accessToken;
};

const revokeUserSessions = async (userId) => {
  await RefreshToken.deleteMany({ user: userId });
};

const sendCode = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw new BadRequestError("email already exist");
  }

  const otp = generateOtp();

  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  const result = await Otp.findOneAndUpdate(
    { email },
    {
      otp: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    {
      upsert: true,
    },
  );

  await sendRegCode(email, otp);

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "verification code sent!",
  });
};

const register = async (req, res) => {
  const { name, email, password, otp } = req.body;

  const otpDoc = await Otp.findOne({ email });

  if (!otpDoc) {
    throw new BadRequestError("OTP expired or not found");
  }

  const validateOtp = await bcrypt.compare(otp, otpDoc.otp);

  if (!validateOtp) {
    otpDoc.attempts += 1;

    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ email: otpDoc.email });

      throw new BadRequestError(
        "Too many failed attempts. Please request a new OTP.",
      );
    }

    await otpDoc.save();

    throw new BadRequestError("invalid OTP");
  }

  await Otp.deleteOne({ email });

  const user = await User.create({
    name,
    email,
    password,
  });

  await greetMail(email, name);

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "register successfully!!",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("please provide email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("user not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetLink = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  await resetPasswordMail(resetLink, email);

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "password reset link sent to email",
  });
};

const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({ passwordResetToken: hashedToken });

  if (!user || user.passwordResetExpires < Date.now()) {
    throw new BadRequestError("invalid token");
  }

  if (!newPassword) {
    throw new BadRequestError("please provide new password");
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    throw new BadRequestError("new password cannot be same as old password");
  }

  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  user.password = newPassword;
  await user.save();
  await revokeUserSessions(user._id);

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "password reset successfull",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("account does not exist");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new BadRequestError("credential does not match");
  }

  const accessToken = await issueSession(res, user);

  res.status(StatusCodes.OK).json({
    accessToken,
    success: true,
    user: {
      id: user._id,
      name: user.name,
    },
  });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new UnauthenticatedError("refresh token missing");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new UnauthenticatedError("invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const tokenDoc = await RefreshToken.findOne({ tokenHash });

  if (!tokenDoc) {
    await revokeUserSessions(payload.userId);
    clearRefreshToken(res);
    throw new UnauthenticatedError("invalid refresh token");
  }

  if (tokenDoc.expiresAt < Date.now()) {
    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    clearRefreshToken(res);
    throw new UnauthenticatedError("invalid refresh token");
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    clearRefreshToken(res);
    throw new UnauthenticatedError("invalid refresh token");
  }

  await RefreshToken.deleteOne({ _id: tokenDoc._id });
  const accessToken = await issueSession(res, user);

  res.status(StatusCodes.OK).json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
    },
  });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  } else {
    await revokeUserSessions(req.user.userId);
  }

  clearRefreshToken(res);

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "logout successfull!!",
  });
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("_id name email");

  if (!user) {
    throw new NotFoundError("user not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

module.exports = {
  sendCode,
  register,
  login,
  refresh,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
};
