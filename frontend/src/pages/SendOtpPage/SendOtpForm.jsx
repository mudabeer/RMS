import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SendOtpPage() {
const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [reponseError, setResponseError] = useState("");
  const [error, setError] = useState("");

  const handleFormSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/send-code",
        {
          email,
        },
      );
      if (response.data.success) {
        navigate("/register");
      } else {
        setResponseErrors("same thing went wrong try later");
      }
    } catch (error) {
      setError(error.response.data.msg);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) setError("invalid email");
    await handleFormSubmit();
  };
  return (
    <>
      <form
        className="w-full flex flex-col items-center gap-8"
        id="otp-form"
        onSubmit={handleSubmit}
      >
        {reponseError && (
          <div className="p-sm rounded-lg bg-error-container border border-error flex items-center gap-xs mb-md">
            <span
              className="material-symbols-outlined text-error"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              error
            </span>
            <p className="text-label-sm text-on-error-container">
              {reponseError}
            </p>
          </div>
        )}
        <div className="w-full">
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
              onChange={handleChange}
            />
          </div>
          {error && <p className="text-label-sm text-error mt-xs">{error}</p>}
        </div>
        {/* Actions */}
        <div className="w-full flex flex-col gap-4">
          <button
            className="w-full h-12 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-body-md font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2"
            id="verify-btn"
            type="submit"
          >
            <span>Send OTP</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>
      </form>
      <p className="mt-md text-center font-body-md text-body-md text-on-surface-variant text-sm">
        Already have an account?{" "}
        <a className="text-primary font-medium hover:underline" href="/login">
          Log in
        </a>
      </p>
    </>
  );
}

export default SendOtpPage