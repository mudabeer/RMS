import { useRef } from "react";

function OtpInput({ length = 6, value = [], onChange, error }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length }, (_, idx) => value[idx] || "");

  const focusIndex = (idx) => {
    const target = inputRefs.current[idx];
    if (target) target.focus();
  };

  const handleChange = (e, index) => {
    const raw = e.target.value.replace(/\D/g, "");
    const next = [...digits];

    if (!raw) {
      next[index] = "";
      onChange(next);
      return;
    }

    if (raw.length > 1) {
      const pasted = raw.slice(0, length).split("");
      for (let i = 0; i < length; i += 1) {
        next[i] = pasted[i] || "";
      }
      onChange(next);
      focusIndex(Math.min(pasted.length, length - 1));
      return;
    }

    next[index] = raw;
    onChange(next);
    if (index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData?.getData("text") || "";
    const cleaned = pastedText.replace(/\D/g, "").slice(0, length);
    if (!cleaned) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => cleaned[i] || "");
    onChange(next);
    focusIndex(Math.min(cleaned.length - 1, length - 1));
  };

  return (
    <div>
      <div
        role="group"
        aria-label="One-time password"
        className="flex justify-between gap-xs"
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            aria-label={`OTP digit ${index + 1}`}
            className="w-full min-h-[48px] h-[48px] text-center rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface-container-lowest text-on-surface font-headline-md text-headline-md"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            placeholder="-"
            type="text"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>
      {error && <p className="text-label-sm text-error mt-xs">{error}</p>}
    </div>
  );
}

export default OtpInput;

