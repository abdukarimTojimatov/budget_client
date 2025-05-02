import React from "react";
import { FiDollarSign, FiCalendar, FiInfo, FiTag } from "react-icons/fi";
import { MdDescription, MdCategory, MdOutlinePayments } from "react-icons/md";
import { FaTrash, FaMoneyBillWave, FaRegCreditCard } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_INCOME } from "../graphql/mutations/income.mutation";

// Define category color mapping with modern gradients
const categoryColorMap = {
  "Maosh": "from-green-900/50 to-green-800/80 border-green-700/30",
  "Investitsiya": "from-purple-900/50 to-purple-800/80 border-purple-700/30",
  "Biznes": "from-blue-900/50 to-blue-800/80 border-blue-700/30",
  "Sovga": "from-emerald-800/50 to-emerald-700/80 border-emerald-600/30",
  "Sotish": "from-amber-900/50 to-amber-800/80 border-amber-700/30",
  "Ijara": "from-cyan-900/50 to-cyan-800/80 border-cyan-700/30",
  default: "from-green-900/50 to-green-800/80 border-green-700/30"
};

// Payment method icons
const receiptMethodIcons = {
  cash: <FaMoneyBillWave className="mr-1.5" size={14} />,
  bank_deposit: <FaRegCreditCard className="mr-1.5" size={14} />,
};

const IncomeCard = ({ income, onEdit }) => {
  const { category, amount, date, receiptMethod, description } = income;

  // Get category details
  const categoryName = category?.name || "Boshqa";
  const cardClass = categoryColorMap[categoryName] || categoryColorMap.default;

  // Format strings for better display
  const formattedDescription = description
    ? description.charAt(0).toUpperCase() + description.slice(1)
    : "";
  const displayCategory =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const formattedReceiptMethod =
    receiptMethod.charAt(0).toUpperCase() + receiptMethod.slice(1).replace("_", " ");

  // Format date to be more user-friendly
  const formattedDate = new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Delete mutation setup
  const [deleteIncome, { loading }] = useMutation(DELETE_INCOME);

  // Handle delete with confirmation
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;

    try {
      await deleteIncome({
        variables: { id: income._id },
        refetchQueries: ["GetIncomes", "GetIncomesStatistics"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error(error.message || "O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div
      className={`rounded-xl p-4 bg-gradient-to-br ${cardClass} shadow-lg backdrop-blur-sm border`}
    >
      <div className="flex flex-col gap-2">
        {/* Header with category and action buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {displayCategory}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!loading ? (
              <button
                onClick={handleDelete}
                className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center"
              >
                <FaTrash className="text-red-300" size={14} />
              </button>
            ) : (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white/50 rounded-full animate-spin"></div>
            )}
            <button
              onClick={() => onEdit && onEdit(income._id)}
              className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
            >
              <HiPencilAlt className="text-blue-300" size={14} />
            </button>
          </div>
        </div>

        {/* Description heading */}
        <div className="bg-black/20 rounded-lg p-2 mb-1">
          <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 mb-0.5">
            {formattedDescription}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {/* Receipt method badge */}
            <div className="flex items-center px-2 py-0.5 rounded-full text-xs bg-green-600/30 text-green-200">
              {receiptMethodIcons[receiptMethod] || (
                <MdOutlinePayments className="mr-1" />
              )}
              {formattedReceiptMethod}
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="bg-black/10 rounded-lg p-3 space-y-2.5">
          {/* Amount */}
          <div className="flex items-start">
            <FiDollarSign className="text-green-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-green-200 text-xs font-medium">Miqdori</div>
              <div className="text-white text-sm font-semibold">
                {amount.toLocaleString("uz-UZ")}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start">
            <MdCategory className="text-green-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-green-200 text-xs font-medium">
                Kategoriya
              </div>
              <div className="text-white text-sm">{displayCategory}</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start">
            <FiCalendar className="text-green-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-green-200 text-xs font-medium">Sana</div>
              <div className="text-white text-sm">{formattedDate}</div>
            </div>
          </div>

          {/* Description (if expanded view is needed) */}
          {description && description.length > 20 && (
            <div className="flex items-start">
              <MdDescription className="text-green-300 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <div className="text-green-200 text-xs font-medium">
                  Batafsil
                </div>
                <div className="text-white text-xs line-clamp-2">
                  {formattedDescription}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeCard;
