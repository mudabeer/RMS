import { useState } from "react";
import { Link } from "react-router-dom";
import AuthPage from "../../components/Auth/AuthPage";
import api from "../../api/axios";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [responseError, setResponseError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Invalid email");
      return;
    }

    setError("");
    setResponseError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSuccessMessage(
        response.data?.msg ||
          "If that email is registered, a password reset link has been sent."
      );
    } catch (err) {
      setResponseError(
        err.response?.data?.msg || err.message || "Unable to send reset link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form className="space-y-md" onSubmit={handleSubmit}>
        {successMessage && (
          <div
            role="status"
            className="p-sm rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-primary">
              check_circle
            </span>
            <p className="text-label-sm text-on-surface">{successMessage}</p>
          </div>
        )}
        {responseError && (
          <div
            role="alert"
            className="p-sm rounded-lg bg-error-container border border-error flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-label-sm text-on-error-container">
              {responseError}
            </p>
          </div>
        )}
        <div>
          <label
            className="block font-label-md text-label-md text-on-surface mb-xs"
            htmlFor="reset-email"
          >
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full h-[48px] px-sm py-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {error && <p className="text-label-sm text-error mt-xs">{error}</p>}
        </div>
        <button
          disabled={submitting}
          type="submit"
          className="w-full h-[48px] bg-primary text-on-primary rounded-md font-label-md text-label-md flex justify-center items-center gap-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-60"
        >
          {submitting ? "Sending Reset Link..." : "Send Reset Link"}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>
      <p className="mt-md text-center font-body-md text-body-md text-on-surface-variant text-sm">
        Remember your password?{" "}
        <Link className="text-primary font-medium hover:underline" to="/login">
          Sign In
        </Link>
      </p>
    </>
  );
}

function ForgotPasswordPage() {
  return (
    <AuthPage
      title="Forgot Password"
      description="Enter your email address to receive a password reset link."
      brandingTitle={["Fast, Efficient", "and Productive"]}
      brandingDescription="Streamline your shared living experience today."
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}

export default ForgotPasswordPage;

