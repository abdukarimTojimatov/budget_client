import React from "react";
import SharingCards from "../components/SharingCards";
import SharingForm from "../components/SharingForm";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import { useState } from "react";

const SharingPage = () => {
  const [isSharingFormOpen, setIsSharingFormOpen] = useState(false);
  const toggleSharingForm = () => {
    setIsSharingFormOpen(!isSharingFormOpen);
  };

  return (
    <>
      <div className="flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center">
        <div className="flex flex-wrap w-full justify-center items-center gap-6">
          <div className="w-full max-w-2xl mx-auto">
            <div className="border-rounded-lg shadow-lg overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={toggleSharingForm}
                className={`px-4 py-2 rounded-lg flex justify-between  items-center gap-2 transition-colors ${
                  isSharingFormOpen
                    ? "bg-red-800/30 hover:bg-red-700/40 text-white"
                    : "bg-blue-800/30 hover:bg-blue-700/40 text-white"
                }`}
              >
                <span className="">
                  {isSharingFormOpen ? "Yopish" : "Yangi qo'shish"}
                </span>
                <span>
                  {isSharingFormOpen ? (
                    <FiMinusCircle className="h-6 w-6" />
                  ) : (
                    <FiPlusCircle className="h-6 w-6 pl-2" />
                  )}
                </span>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isSharingFormOpen
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6">
                  <SharingForm toggleSharingForm={toggleSharingForm} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <SharingCards />
      </div>
    </>
  );
};

export default SharingPage;
