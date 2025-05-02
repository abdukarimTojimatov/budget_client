import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SIGN_UP } from "../graphql/mutations/user.mutation";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";

// InputField Component
const InputField = ({ label, id, name, type = "text", value, onChange }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type === "password" && !isPasswordVisible ? "password" : "text"}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 border-solid rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" // Add text color class here
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            {isPasswordVisible ? "🙈" : "👁️"}
          </button>
        )}
      </div>
    </div>
  );
};

// SignUpPage Component
const SignUpPage = () => {
  const [signUpData, setSignUpData] = useState({
    username: "",
    password: "",
    phoneNumber: "",
  });

  const [signup, { loading }] = useMutation(SIGN_UP);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({
        variables: {
          input: signUpData,
        },
        refetchQueries: ["GetAuthenticatedUser"],
      });
      toast.success("Ro'yxatdan o'tish muvaffaqiyatli");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex rounded-lg overflow-hidden z-50 bg-gray-300">
        <div className="w-full bg-gray-100 min-w-80 sm:min-w-96 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <h1 className="text-3xl font-semibold mb-6 text-black text-center">
              Ro'yhatdan o'tish
            </h1>
            <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
              Budget
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <InputField
                label="Ism"
                id="username"
                name="username"
                value={signUpData.username}
                onChange={handleChange}
              />
              <InputField
                label="Parol"
                id="password"
                name="password"
                type="password"
                value={signUpData.password}
                onChange={handleChange}
              />
              <InputField
                label="Telefon raqami"
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={signUpData.phoneNumber || "+998"}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "") {
                    e.target.value = "+998"; // Auto-fill on focus if empty
                  }
                }}
              />
              <div>
                <button
                  type="submit"
                  className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black  focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Ro'yhatdan o'tish"}
                </button>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>
                Agar accountingiz mavjud bo'lsa?
                <br />
                <Link to="/login" className="text-black hover:underline">
                  Bu yerga bosing 👉 Kirish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
