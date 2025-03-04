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
  const [logout, { loading, client }] = useMutation(LOGOUT);

  const handleLogout = async () => {
    try {
      await logout({
        refetchQueries: [{ query: GET_AUTHENTICATED_USER }],
      });
      client.resetStore();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.message);
    }
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
              Xarajat
            </button>
            <button
              onClick={() => handleNavigation("/sharings")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Ulush
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
              onClick={() => handleNavigation("/dashboard")}
              className="text-white hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
