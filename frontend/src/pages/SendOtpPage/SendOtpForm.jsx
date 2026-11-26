import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function SendOtpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [responseError, setResponseError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async () => {
    setSubmitting(true);
    setResponseError("");
    try {
      const response = await api.post("/auth/send-code", {
        email,
      });
      if (response.data?.success) {
        navigate("/register", { state: { email } });
      } else {
        setResponseError("Something went wrong. Please try again later.");
      }
    } catch (err) {
      setResponseError(
        err.response?.data?.msg || err.message || "Failed to send OTP."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Invalid email");
      return;
    }
    setError("");
    await handleFormSubmit();
  };

  return (
    <>
      <form
        className="w-full flex flex-col items-center gap-8"
        id="otp-form"
        onSubmit={handleSubmit}
      >
        {responseError && (
          <div
            role="alert"
            className="w-full p-sm rounded-lg bg-error-container border border-error flex items-center gap-xs"
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
              value={email}
              onChange={handleChange}
            />
          </div>
          {error && <p className="text-label-sm text-error mt-xs">{error}</p>}
        </div>
        <div className="w-full flex flex-col gap-4">
          <button
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-body-md font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
            id="verify-btn"
            type="submit"
          >
            <span>{submitting ? "Sending..." : "Send OTP"}</span>
            <span className="material-symbols-outlined text-[18px]">
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

export default SendOtpForm;
