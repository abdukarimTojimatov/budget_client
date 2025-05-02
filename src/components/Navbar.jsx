import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LOGOUT } from "../graphql/mutations/user.mutation";
import { useMutation, useQuery } from "@apollo/client";
import { MdLogout, MdDashboard, MdCategory } from "react-icons/md";
import { FiDollarSign, FiPieChart } from "react-icons/fi";
import { TbCoin, TbMoneybag, TbArrowsExchange } from "react-icons/tb";
import { BsBank } from "react-icons/bs";

const Navbar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active page
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define navigation items
  const navItems = [
    // { name: "Dashboard", path: "/", icon: <MdDashboard className="mr-2" /> },
    {
      name: "Moliyaviy tahlil",
      path: "/dashboard",
      icon: <FiPieChart className="mr-2" />,
    },
    {
      name: "Qarzlar tahlili",
      path: "/debt-analysis",
      icon: <BsBank className="mr-2" />,
    },
    {
      name: "Kreditlar tahlili",
      path: "/loan-analysis",
      icon: <TbMoneybag className="mr-2" />,
    },
    {
      name: "Daromadlar tahlili",
      path: "/income-analysis",
      icon: <TbCoin className="mr-2" />,
    },
    {
      name: "Xarajatlar tahlili",
      path: "/expense-analysis",
      icon: <FiDollarSign className="mr-2" />,
    },
    {
      name: "Xarajatlar",
      path: "/expenses",
      icon: <FiDollarSign className="mr-2" />,
    },
    { name: "Daromadlar", path: "/incomes", icon: <TbCoin className="mr-2" /> },
    { name: "Qarzlar", path: "/debts", icon: <BsBank className="mr-2" /> },
    {
      name: "Haqlar",
      path: "/loans",
      icon: <TbMoneybag className="mr-2" />,
    },
  ];

  return (
    <div className="w-full">
      <nav className="relative bg-gray-900 shadow-lg">
        {/* Gradient effects */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-full blur-sm" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-full" />

        {/* Mobile menu button */}
        <div className="md:hidden px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-white">Budget App</div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  handleNavigation(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`${
                  isActive(item.path)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } 
                w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-white flex items-center">
                  <TbArrowsExchange className="mr-2 text-blue-400" />
                  Budget App
                </h1>
              </div> */}
              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`${
                      isActive(item.path)
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    } 
                    px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
