import { useRef, useState } from "react";
import {useNavigate} from 'react-router-dom'
import axios from "axios";

function Registrationform() {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    otp: Array(6).fill(''),
  });
  const [errors, setErrors] = useState("");
  const [responseError, setResponseErrors] = useState("");
  const navigate = useNavigate()

  const submitForm = async () =>{
    console.log(userData);
    try{
      const response = await axios.post('http://localhost:3000/api/v1/auth/register',
      {
        name:userData.name,
        email:userData.email,
        password:userData.password,
        otp: userData.otp.join('')
      })
      if(response.data.success){
        navigate('/dashboard');
      }
      else{
        setResponseErrors('same thing went wrong try later')
      }
    } catch(error){
      console.log(error.response.data)
      setResponseErrors(error.response.data.msg);
    }
  }

  const inputRefs = useRef([]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleChangeOtp = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) return;
    const newOtp = [...userData.otp];
    newOtp[index] = value;
    setUserData({ ...userData, otp: [...newOtp] });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !userData.otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handleKeyUp = (e, index) => {
    if (e.key.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!userData.name) newErrors.name = "name is required";
    if (!userData.email.includes("@")) newErrors.email = " invalid email";
    if (!userData.password) newErrors.password = "password is required";
    if (userData.otp.some((value) => value === "")) {
      newErrors.otp = "OTP is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await submitForm()
      console.log("successfully");
    }
  };

  return (
    <div className="w-full md:w-1/2 inner-form-card p-lg md:p-[48px] max-w-[480px] mx-auto md:max-w-none">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
          Sign Up
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Create an account to get started.
        </p>
      </div>
      <form className="space-y-md" onSubmit={handleSubmit}>
        {responseError && (
          <div className="p-sm rounded-lg bg-error-container border border-error flex items-center gap-xs mb-md">
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
        {/* Full Name */}
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
              onChange={handleChange}
            />
          </div>
          {errors.name && (
            <p className="text-label-sm text-error mt-xs">{errors.name}</p>
          )}
        </div>
        {/* Email */}
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
              onChange={handleChange}
            />
          </div>
          {errors.email && (
            <p className="text-label-sm text-error mt-xs">{errors.email}</p>
          )}
        </div>
        {/* Password */}
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
              onChange={handleChange}
            />
            <button
              className="absolute inset-y-0 right-0 pr-sm flex items-center text-outline hover:text-on-surface transition-colors"
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
        {/* OTP Verification */}
        <div className="pt-sm border-t border-surface-variant mt-sm">
          <label className="block font-label-md text-label-md text-on-surface mb-base">
            Verify OTP
          </label>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-sm">
            Sent to your email
          </p>
          <div className="flex justify-between gap-xs">
            {userData.otp.map((digit, index) => {
              return (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-full h-[48px] text-center rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface-container-lowest text-on-surface font-headline-md text-headline-md"
                  maxLength="1"
                  placeholder="-"
                  type="text"
                  onChange={(e) => handleChangeOtp(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onKeyUp={(e) => handleKeyUp(e, index)}
                />
              );
            })}
          </div>
          {errors.otp && (
            <p className="text-label-sm text-error mt-xs">{errors.otp}</p>
          )}
        </div>
        {/* Submit Button */}
        <div className="pt-sm mt-auto">
          <button
            className="w-full h-[48px] bg-primary text-on-primary rounded-md font-label-md text-label-md flex justify-center items-center gap-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-[0.98]"
            type="submit"
          >
            Create Account
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
        <a className="text-primary font-medium hover:underline" href="#">
          Log in
        </a>
      </p>
    </div>
  );
}

export default Registrationform;
