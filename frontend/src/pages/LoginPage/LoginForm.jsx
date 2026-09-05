import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginForm (){
    const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState("");
  const [responseError, setResponseErrors] = useState("");
  const navigate = useNavigate();

  const submitForm = async () => {
    console.log(userData);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/login",
        {
          ...userData
        },
      );
      if (response.data.success) {
        navigate("/dashboard");
      } else {
        setResponseErrors("same thing went wrong try later");
      }
    } catch (error) {
      console.log(error.response.data);
      setResponseErrors(error.response.data.msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!userData.email.includes("@")) newErrors.email = " invalid email";
    if (!userData.password) newErrors.password = "password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await submitForm();
    }
  };

  return (
    <>
      <form className="space-y-md " onSubmit={handleSubmit}>
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
        Don't have an account?{" "}
        <a className="text-primary font-medium hover:underline" href="/sendotp">
          Sign up
        </a>
      </p>
    </>
  );
}

export default LoginForm