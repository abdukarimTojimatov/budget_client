import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { BsCardText } from "react-icons/bs";
import { MdOutlinePayments } from "react-icons/md";
import { FaSackDollar, FaCalendarDays } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_EXPENSE } from "../graphql/mutations/expense.mutation";

const categoryColorMap = {
  Laminad: "from-emerald-800/50 to-emerald-600/50",
  "Mashina xarajatlari": "from-pink-800/50 to-pink-600/50",
  Soliq: "from-blue-800/50 to-blue-600/50",
  Elektr: "from-purple-800/50 to-purple-600/50",
  default: "from-gray-800/50 to-gray-600/50",
};

const Card = ({ expense, authUser }) => {
  let { category, amount, date, paymentType, description, userId } = expense;
  const cardClass = categoryColorMap[category] || categoryColorMap.default;
  const [deleteExpense, { loading }] = useMutation(DELETE_EXPENSE);

  description = description[0]?.toUpperCase() + description.slice(1);
  category = category[0]?.toUpperCase() + category.slice(1);
  paymentType = paymentType[0]?.toUpperCase() + paymentType.slice(1);

  const handleDelete = async () => {
    try {
      console.log("Expense ID:", expense._id);
      await deleteExpense({
        variables: { id: expense._id },
        refetchQueries: ["GetExpenses", "GetExpensesStatistics"],
      });
      toast.success("Expenses deleted successfully");
    } catch (error) {
      console.error("Error deleting expenses:", error);
      toast.error(error.message);
    }
  };

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`rounded-xl p-6 bg-gradient-to-br ${cardClass} shadow-lg backdrop-blur-sm border border-gray-700/20`}
    >
      <div className="flex flex-col gap-3">
        {/* Header with category and action buttons */}
        <div className="flex flex-row items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white mr-2"></div>
            <h2 className="text-xl font-bold text-white">{category}</h2>
          </div>
          <div className="flex items-center gap-3">
            {!loading ? (
              <button
                onClick={handleDelete}
                className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors duration-200"
              >
                <FaTrash className="text-white/90" size={16} />
              </button>
            ) : (
              <div className="w-6 h-6 border-t-2 border-b-2 border-white/50 rounded-full animate-spin"></div>
            )}
            <Link to={`/expenses/${expense._id}`}>
              <button className="p-2 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors duration-200">
                <HiPencilAlt className="text-white/90" size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* Description */}
        <div className="text-white flex flex-col sm:flex-row w-full py-2 border-t border-b border-white/10">
          <div className="flex items-start gap-2 sm:w-1/3">
            <span className="flex items-center">
              <BsCardText className="flex-shrink-0 text-white/70" />
            </span>
            <span className="font-medium text-white/70">Xarajat haqida:</span>
          </div>
          <div className="sm:w-2/3 pl-6 sm:pl-0">
            <span className="text-white break-words w-full block">
              {description}
            </span>
          </div>
        </div>

        {/* Payment Type */}
        <div className="text-white flex flex-col sm:flex-row w-full py-2 border-b border-white/10">
          <div className="flex items-start gap-2 sm:w-1/3">
            <span className="flex items-center">
              <MdOutlinePayments className="flex-shrink-0 text-white/70" />
            </span>
            <span className="font-medium text-white/70">To'lov turi:</span>
          </div>
          <div className="sm:w-2/3 pl-6 sm:pl-0">
            <span className="text-white break-words w-full block">
              {paymentType}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-white flex flex-col sm:flex-row w-full py-2 border-b border-white/10">
          <div className="flex items-start gap-2 sm:w-1/3">
            <span className="flex items-center">
              <FaSackDollar className="flex-shrink-0 text-white/70" />
            </span>
            <span className="font-medium text-white/70">Miqdori:</span>
          </div>
          <div className="sm:w-2/3 pl-6 sm:pl-0 flex items-center">
            <span className="text-white break-words font-semibold">
              {amount.toLocaleString("uz-UZ")}
            </span>
            <span className="text-white/70 ml-1">so'm</span>
          </div>
        </div>

        {/* Date */}
        <div className="text-white flex flex-col sm:flex-row w-full py-2">
          <div className="flex items-start gap-2 sm:w-1/3">
            <span className="flex items-center">
              <FaCalendarDays className="flex-shrink-0 text-white/70" />
            </span>
            <span className="font-medium text-white/70">Sana:</span>
          </div>
          <div className="sm:w-2/3 pl-6 sm:pl-0">
            <span className="text-white/90 break-words">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
