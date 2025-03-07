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
  // Extract category name for display
  const categoryName = category?.name || "Uncategorized";
  const cardClass = categoryColorMap[categoryName] || categoryColorMap.default;
  const [deleteExpense, { loading }] = useMutation(DELETE_EXPENSE);

  description = description[0]?.toUpperCase() + description.slice(1);
  // Format category name for display
  const displayCategory =
    categoryName[0]?.toUpperCase() + categoryName.slice(1);
  paymentType = paymentType[0]?.toUpperCase() + paymentType.slice(1);

  const handleDelete = async () => {
    try {
      console.log("Expense ID:", expense._id);
      await deleteExpense({
        variables: { id: expense._id },
        refetchQueries: ["GetExpenses", "GetExpensesStatistics"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
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
      className={`rounded-xl p-6 bg-gradient-to-br from-emerald-700/40 to-emerald-600/70 shadow-lg backdrop-blur-sm border border-gray-700/20`}
    >
      <div className="flex flex-col gap-1">
        {/* Header with category and action buttons */}
        <div className="flex flex-row items-center justify-between mb-0.5">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
            <h2 className="text-base sm:text-lg font-bold text-white ml-2">
              {displayCategory}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {!loading ? (
              <button
                onClick={handleDelete}
                className="p-1 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors duration-200"
              >
                <FaTrash className="text-white/90" size={12} />
              </button>
            ) : (
              <div className="w-4 h-4 border-t-2 border-b-2 border-white/50 rounded-full animate-spin"></div>
            )}
            <Link to={`/expenses/${expense._id}`}>
              <button className="p-1 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors duration-200">
                <HiPencilAlt className="text-white/90" size={12} />
              </button>
            </Link>
          </div>
        </div>

        {/* Table layout for key information */}
        <table className="w-full text-left border-collapse border border-gray-700/20 text-white text-[10px] sm:text-xs">
          <tbody>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Xarajat haqida:</th>
              <td className="p-1 break-words">{description}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">To'lov turi:</th>
              <td className="p-1 break-words">{paymentType}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Miqdori:</th>
              <td className="p-1">
                {amount.toLocaleString("uz-UZ")}{" "}
                <span className="text-white/70">so'm</span>
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Sana:</th>
              <td className="p-1 text-white/90">{date}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Card;
