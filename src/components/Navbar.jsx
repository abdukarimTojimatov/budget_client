import React from "react";
import { useNavigate } from "react-router-dom";
import { LOGOUT } from "../graphql/mutations/user.mutation";
import { useMutation, useQuery } from "@apollo/client";
import { MdLogout } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full mb-8">
      <nav className="relative">
        {/* Gradient effects */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-full blur-sm" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-full" />

        {/* Responsive Navigation */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <button
              onClick={() => handleNavigation("/")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Dashboard
            </button>

            <button
              onClick={() => handleNavigation("/orders")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Buyurtma
            </button>
            <button
              onClick={() => handleNavigation("/rawMaterial")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Homashyo
            </button>
            <button
              onClick={() => handleNavigation("/expenses")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Harajat
            </button>
            <button
              onClick={() => handleNavigation("/sharings")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Ulush
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
