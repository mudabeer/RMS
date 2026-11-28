import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthPage from "../../components/Auth/AuthPage";
import api from "../../api/axios";

function ResetPasswordForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [responseError, setResponseError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setResponseError("");
    setSubmitting(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword:password,
      });
      if (response.data?.success !== false) {
        navigate("/login", {
          state: { infoMessage: "Password reset successful. Please sign in." },
        });
      }
    } catch (err) {
      setResponseError(
        err.response?.data?.msg || err.message || "Unable to reset password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form className="space-y-md" onSubmit={handleSubmit}>
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
            htmlFor="new-password"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-[48px] px-sm py-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <div>
          <label
            className="block font-label-md text-label-md text-on-surface mb-xs"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-[48px] px-sm py-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {error && <p className="text-label-sm text-error mt-xs">{error}</p>}
        </div>
        <button
          disabled={submitting}
          type="submit"
          className="w-full h-[48px] bg-primary text-on-primary rounded-md font-label-md text-label-md flex justify-center items-center gap-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-60"
        >
          {submitting ? "Resetting..." : "Reset Password"}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>
      <p className="mt-md text-center font-body-md text-body-md text-on-surface-variant text-sm">
        Back to{" "}
        <Link className="text-primary font-medium hover:underline" to="/login">
          Sign In
        </Link>
      </p>
    </>
  );
}

function ResetPasswordPage() {
  return (
    <AuthPage
      title="Reset Password"
      description="Choose a new password for your RMS account."
      brandingTitle={["Fast, Efficient", "and Productive"]}
      brandingDescription="Streamline your shared living experience today."
    >
      <ResetPasswordForm />
    </AuthPage>
  );
}

export default ResetPasswordPage;

