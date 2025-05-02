import React, { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/mutations/user.mutation";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    phoneNumber: "+998", // Start with +998
    password: "",
  });
  const [login, { loading }] = useMutation(LOGIN);
  const [isPasswordVisible, setPasswordVisible] = useState(false); // State for password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.phoneNumber || !loginData.password)
      return toast.error("Please fill in all fields");
    try {
      await login({
        variables: { input: loginData },
        refetchQueries: ["GetAuthenticatedUser"],
      });
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex rounded-lg overflow-hidden z-50 bg-gray-300">
        <div className="w-full bg-gray-100 min-w-80 sm:min-w-96 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <h1 className="text-3xl font-semibold mb-6 text-black text-center">
              Login
            </h1>
            <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
              Welcome back! Log in to your account
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <InputField
                label="Phone Number"
                id="phoneNumber"
                name="phoneNumber"
                value={loginData.phoneNumber}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "") {
                    e.target.value = "+998"; // Auto-fill on focus if empty
                  }
                }}
              />
              <div className="relative">
                <InputField
                  label="Password"
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"} // Use visibility state
                  value={loginData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 pt-6 right-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  {isPasswordVisible ? "🙈" : "👁️"}
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Login"}
                </button>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>
                {"Don't"} have an account?{" "}
                <Link to="/signup" className="text-black hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
