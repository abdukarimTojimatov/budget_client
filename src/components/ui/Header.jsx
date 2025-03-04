import { Link } from "react-router-dom";
import React from "react";
import { LOGOUT } from "../../graphql/mutations/user.mutation";
import { useMutation, useQuery } from "@apollo/client";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { GET_AUTHENTICATED_USER } from "../../graphql/queries/user.query";

const Header = () => {
  const navigate = useNavigate();

  const [logout, { loading, client }] = useMutation(LOGOUT);

  const handleLogout = async () => {
    try {
      await logout({
        refetchQueries: [{ query: GET_AUTHENTICATED_USER }],
      });
      client.resetStore();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.message);
    }
  };
  return (
    <div className="mb-10">
      <h1 className="md:text-6xl text-4xl lg:text-8xl font-bold text-center relative z-50 text-white pt-10">
        <Link to="/">Elegro Mebel</Link>
        <button className="text-white pl-2 hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base md:text-lg lg:text-xl">
          {!loading && (
            <MdLogout className="cursor-pointer" onClick={handleLogout} />
          )}
        </button>
      </h1>
      <div className="relative mb-10 w-full md:w-1/2 mx-auto hidden md:block">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
      </div>
    </div>
  );
};

export default Header;
