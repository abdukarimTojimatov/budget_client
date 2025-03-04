import React, { useState } from "react";
import Cards from "../components/Cards";
import ExpenseForm from "../components/ExpenseForm";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";

const HomePage = () => {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const toggleExpenseForm = () => {
    setIsExpenseFormOpen(!isExpenseFormOpen);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        {/* <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
          Xarajatlar Boshqaruvi
        </h1> */}

        <button
          onClick={toggleExpenseForm}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isExpenseFormOpen
              ? "bg-red-800/30 hover:bg-red-700/40 text-white"
              : "bg-blue-800/30 hover:bg-blue-700/40 text-white"
          }`}
        >
          {isExpenseFormOpen ? (
            <>
              <FiMinusCircle /> Xarajat formini yopish
            </>
          ) : (
            <>
              <FiPlusCircle /> Xarajat qo'shish
            </>
          )}
        </button>
      </div>

      {/* Expense Form */}
      {isExpenseFormOpen && (
        <div className="mb-8 bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/30">
          <ExpenseForm toggleExpenseForm={toggleExpenseForm} />
        </div>
      )}

      {/* Expense Cards */}
      <Cards />
    </div>
  );
};

export default HomePage;
