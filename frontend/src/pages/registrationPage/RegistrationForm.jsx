import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import OtpInput from "../../components/Auth/OtpInput";

function RegistrationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: location.state?.email || "",
    password: "",
    otp: Array(6).fill(""),
  });
  const [errors, setErrors] = useState({});
  const [responseError, setResponseError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async () => {
    setSubmitting(true);
    setResponseError("");
    try {
      const response = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        otp: userData.otp.join(""),
      });
      if (response.data?.success) {
        navigate("/login", {
          state: { infoMessage: "Account created successfully. Please sign in." },
        });
      } else {
        setResponseError("Something went wrong. Please try again later.");
      }
    } catch (error) {
      setResponseError(
        error.response?.data?.msg || error.message || "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = "Name is required";
    if (!userData.email.includes("@")) newErrors.email = "Invalid email";
    if (!userData.password) newErrors.password = "Password is required";
    if (userData.otp.some((value) => value === "")) {
      newErrors.otp = "OTP is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await submitForm();
  };

  return (
    <>
      <form className="space-y-md" onSubmit={handleSubmit}>
        {responseError && (
          <div
            role="alert"
            className="p-sm rounded-lg bg-error-container border border-error flex items-center gap-xs mb-md"
          >
            <span
              className="material-symbols-outlined text-error"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              error
            </span>
            <p className="text-label-sm text-on-error-container">
              {responseError}
            </p>
          </div>
        )}
        <div>
          <label
            className="block font-label-md text-label-md text-on-surface mb-xs"
            htmlFor="fullName"
          >
            Full Name
          </label>
          <div className="relative">
            <input
              className="w-full h-[48px] px-sm py-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="fullName"
              placeholder="John Doe"
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
            />
          </div>
          {errors.name && (
            <p className="text-label-sm text-error mt-xs">{errors.name}</p>
          )}
        </div>
        <div>
          <label
            className="block font-label-md text-label-md text-on-surface mb-xs"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="w-full h-[48px] px-sm py-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="email"
              placeholder="john@example.com"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && (
            <p className="text-label-sm text-error mt-xs">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            className="block font-label-md text-label-md text-on-surface mb-xs"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="w-full h-[48px] pl-sm pr-xl py-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="password"
              placeholder="••••••••"
              type={passwordVisibility ? "text" : "password"}
              name="password"
              value={userData.password}
              onChange={handleChange}
            />
            <button
              aria-label={passwordVisibility ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-sm flex min-w-[44px] items-center justify-center text-outline hover:text-on-surface transition-colors"
              type="button"
              onClick={() => {
                setPasswordVisibility(!passwordVisibility);
              }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                {passwordVisibility ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-label-sm text-error mt-xs">{errors.password}</p>
          )}
        </div>
        <div className="pt-sm border-t border-surface-variant mt-sm">
          <label className="block font-label-md text-label-md text-on-surface mb-base">
            Verify OTP
          </label>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-sm">
            Sent to your email
          </p>
          <OtpInput
            value={userData.otp}
            onChange={(otp) => setUserData({ ...userData, otp })}
            error={errors.otp}
          />
        </div>
        <div className="pt-sm mt-auto">
          <button
            disabled={submitting}
            className="w-full h-[48px] bg-primary text-on-primary rounded-md font-label-md text-label-md flex justify-center items-center gap-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-[0.98] disabled:opacity-60"
            type="submit"
          >
            {submitting ? "Creating Account..." : "Create Account"}
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              arrow_forward
            </span>
          </button>
        </div>
      </form>
      <p className="mt-md text-center font-body-md text-body-md text-on-surface-variant text-sm">
        Already have an account?{" "}
        <Link className="text-primary font-medium hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </>
  );
}

export default RegistrationForm;
