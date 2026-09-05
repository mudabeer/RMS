import { useState } from "react";
import {useNavigate} from 'react-router-dom'
import "./SendOtpPage.css";
import axios from "axios";

function SendOtpPage() {
const navigate = useNavigate()
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
    if(response.data.success){
        navigate('/register');
      }
      else{
        setResponseErrors('same thing went wrong try later')
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
    <div>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden min-h-screen w-full">
        {/* p */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[350px] bg-surface-container-highest/60 rounded-full blur-3xl pointer-events-none -z-10"></div>
        {/* Centered Card Container */}
        <div className="w-full max-w-[480px] card rounded-xl border border-surface-container-high/60 shadow-[0_12px_40px_-15px_rgba(0,104,95,0.08)] p-6 sm:p-10 flex flex-col items-center">
          {/* Icon Badge Header */}
          <div className="w-14 h-14 rounded-full bg-surface-container-low border border-outline-variant/40 flex items-center justify-center text-primary mb-6 shadow-sm">
            <span className="material-symbols-outlined text-[28px]">
              mark_email_read
            </span>
          </div>
          {/* Text Headings */}
          <h1 className="text-on-surface font-display text-headline-lg font-bold text-center tracking-tight mb-2">
            Verify your email
          </h1>
          <p className="text-on-surface-variant text-body-md text-center max-w-[340px] mb-8">
            Enter your email to sent the 6-digit code
          </p>
          {/* OTP Input Row */}
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
              {error && (
                <p className="text-label-sm text-error mt-xs">{error}</p>
              )}
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
        </div>
      </main>
    </div>
  );
}

export default SendOtpPage;
