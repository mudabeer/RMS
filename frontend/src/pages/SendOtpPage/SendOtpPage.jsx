import SendotpForm from './SendOtpForm'
import "./SendOtpPage.css";


function SendOtpPage() {
  

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
          <SendotpForm />
        </div>
      </main>
    </div>
  );
}

export default SendOtpPage;
