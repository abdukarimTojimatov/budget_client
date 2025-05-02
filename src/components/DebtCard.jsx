import React from "react";
import { FiDollarSign, FiCalendar, FiInfo, FiTag } from "react-icons/fi";
import { MdDescription, MdCategory, MdOutlinePayments } from "react-icons/md";
import {
  FaTrash,
  FaMoneyBillWave,
  FaRegCreditCard,
  FaUserTie,
} from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { TbMoneybag } from "react-icons/tb";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_DEBT } from "../graphql/mutations/debt.mutation";
import "../styles/accordion.css"; // Accordion animations

// Define status color mapping with modern gradients
const statusColorMap = {
  active: "from-blue-900/50 to-blue-800/80 border-blue-700/30",
  paid: "from-green-900/50 to-green-800/80 border-green-700/30",
  default: "from-purple-900/50 to-purple-800/80 border-purple-700/30",
};

const getStatusText = (status) => {
  switch (status) {
    case "active":
      return "Aktiv";
    case "paid":
      return "To'langan";
    default:
      return status;
  }
};

const DebtCard = ({ debt, onEdit, onPayment }) => {
  // Debug logging
  React.useEffect(() => {
    console.log("Debug - Debt data:", debt);
    console.log("Debug - Due date:", debt?.dueDate, typeof debt?.dueDate);
    if (debt?.paidDebts?.length > 0) {
      console.log("Debug - Payment dates:", debt.paidDebts.map(p => p.paymentDate));
    }
  }, [debt]);
  const {
    _id,
    nameOfDebt,
    phoneNumberOfDebt,
    totalDebt,
    leftDebt,
    paidDebt,
    isPaidFull,
    dueDate,
    notes,
    paymentMethodOnTakingDebt,
    startDate,
    paidDebts = [],
  } = debt;

  // Accordion state for payment history
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = React.useState(false);

  // Get status color based on isPaidFull
  const status = isPaidFull ? "paid" : "active";
  const cardClass = statusColorMap[status] || statusColorMap.default;

  // Format strings for better display
  const formattedNotes = notes
    ? notes.charAt(0).toUpperCase() + notes.slice(1)
    : "";
  const displayName = nameOfDebt
    ? nameOfDebt.charAt(0).toUpperCase() + nameOfDebt.slice(1)
    : "";
  const formattedStatus = getStatusText(status);

  // Format dates to be more user-friendly
  // Format dates with timestamp string compatibility
  const formatDate = (dateInput) => {
    // Handle empty/undefined input
    if (!dateInput) return "Belgilanmagan";
    
    // Initialize date object as null
    let dateObj = null;
    
    try {
      // MongoDB specific: if it's an object with $date field
      if (dateInput && typeof dateInput === 'object' && dateInput.$date) {
        // Handle MongoDB date format
        dateObj = new Date(dateInput.$date);
      }
      // If it's already a JavaScript Date
      else if (dateInput instanceof Date) {
        dateObj = dateInput;
      }
      // If it's a number (timestamp)
      else if (typeof dateInput === 'number') {
        dateObj = new Date(dateInput);
      }
      // If it's a string
      else if (typeof dateInput === 'string') {
        // Check if the string is a numeric timestamp (like "1746144000000")
        if (/^\d{10,13}$/.test(dateInput)) {
          // Convert string timestamp to number and create date
          dateObj = new Date(parseInt(dateInput, 10));
        }
        // MongoDB ISODate string handling - check if has 'T'
        else if (dateInput.includes('T')) {
          dateObj = new Date(dateInput);
        } 
        // Try parsing as simple YYYY-MM-DD 
        else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateInput.split('-').map(n => parseInt(n, 10));
          dateObj = new Date(year, month - 1, day);
        }
        // Try parsing as DD.MM.YYYY
        else if (dateInput.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [day, month, year] = dateInput.split('.').map(n => parseInt(n, 10));
          dateObj = new Date(year, month - 1, day);
        }
        // Last resort - direct parsing
        else {
          dateObj = new Date(dateInput);
        }
      }
      
      // Check if we got a valid date
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.warn("Invalid date format:", dateInput);
        return "Sana formati noto'g'ri";
      }
      
      // Format the date in a user-friendly way for Uzbek locale
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}.${month}.${year}`;
      
    } catch (err) {
      console.error("Date formatting error:", err, dateInput);
      return "Sana formati noto'g'ri";
    }
  };
  
  const formattedDueDate = formatDate(dueDate);
  const formattedStartDate = formatDate(startDate);

  // Delete mutation setup
  const [deleteDebt, { loading }] = useMutation(DELETE_DEBT);

  // Handle delete with confirmation
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;

    try {
      await deleteDebt({
        variables: { id: _id },
        refetchQueries: ["GetDebts", "GetDebtStatistics"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast.error(error.message || "O'chirishda xatolik yuz berdi");
    }
  };
  
  // Function to handle edit button click
  const handleEdit = () => {
    if (onEdit && _id) {
      onEdit(_id);
    }
  };
  
  // Function to handle payment button click
  const handleAddPayment = () => {
    if (onPayment && _id) {
      onPayment(_id);
    }
  };

  return (
    <div
      className={`rounded-xl p-4 bg-gradient-to-br ${cardClass} shadow-lg backdrop-blur-sm border`}
    >
      <div className="flex flex-col gap-2">
        {/* Header with name and action buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {displayName}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!loading ? (
              <button
                onClick={handleDelete}
                className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center"
                title="O'chirish"
              >
                <FaTrash className="text-red-300" size={14} />
              </button>
            ) : (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white/50 rounded-full animate-spin"></div>
            )}
            <button
              onClick={handleEdit}
              className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
              title="Tahrirlash"
            >
              <HiPencilAlt className="text-blue-300" size={14} />
            </button>
            {status !== "paid" && (
              <button
                onClick={handleAddPayment}
                className="p-1.5 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors duration-200 flex items-center"
                title="To'lov qo'shish"
              >
                <FiDollarSign className="text-green-300" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="bg-black/20 rounded-lg p-2 mb-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 mb-0.5">
              {phoneNumberOfDebt}
            </h3>
            <div className="flex flex-wrap gap-1">
              <div
                className={`flex items-center px-2 py-0.5 rounded-full text-xs ${
                  status === "active"
                    ? "bg-blue-600/30 text-blue-200"
                    : status === "paid"
                    ? "bg-green-600/30 text-green-200"
                    : "bg-blue-600/30 text-blue-200"
                }`}
              >
                {formattedStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="bg-black/10 rounded-lg p-3 space-y-2.5">
          {/* Total Debt */}
          <div className="flex items-start">
            <TbMoneybag className="text-red-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-red-200 text-xs font-medium">Umumiy qarz</div>
              <div className="text-white text-sm font-semibold">
                {totalDebt?.toLocaleString("uz-UZ") || "0"}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Paid Debt */}
          <div className="flex items-start">
            <MdOutlinePayments className="text-green-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-green-200 text-xs font-medium">
                To'langan qarz
              </div>
              <div className="text-white text-sm font-semibold">
                {paidDebt?.toLocaleString("uz-UZ") || "0"}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Left Debt */}
          <div className="flex items-start">
            <FiDollarSign className="text-red-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-red-200 text-xs font-medium">Qolgan qarz</div>
              <div className="text-white text-sm font-semibold">
                {leftDebt?.toLocaleString("uz-UZ") || "0"}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-start">
            <FaRegCreditCard className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">
                To'lov usuli
              </div>
              <div className="text-white text-sm">
                {paymentMethodOnTakingDebt}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-start">
            <FiCalendar className="text-red-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-red-200 text-xs font-medium">
                To'lov sanasi
              </div>
              <div className="text-white text-sm">{formattedDueDate}</div>
            </div>
          </div>

          {/* Payment History Accordion */}
          {paidDebts && paidDebts.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 transition-colors rounded-lg p-2">
                <button
                  onClick={() => setIsPaymentHistoryOpen(!isPaymentHistoryOpen)}
                  className="flex-1 text-left flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <MdOutlinePayments className="text-blue-300 mr-1" size={16} />
                    <span className="text-blue-200 text-xs font-medium">
                      To'lovlar tarixi ({paidDebts.length})
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-blue-300 transform transition-transform duration-200 ${
                      isPaymentHistoryOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {/* Add payment button */}
                <button
                  onClick={handleAddPayment}
                  className="ml-2 p-1 bg-green-500/20 hover:bg-green-500/40 transition-colors rounded-md flex items-center text-xs text-green-300 font-medium"
                  title="To'lov qo'shish"
                >
                  <FiDollarSign className="mr-1" size={12} />
                  <span>To'lov</span>
                </button>
              </div>

              {/* Accordion content that shows when open */}
              {isPaymentHistoryOpen && (
                <div className="bg-black/20 rounded-lg p-2 mt-2 max-h-60 overflow-y-auto animate-slideDown">
                  {paidDebts.map((payment, index) => (
                    <div
                      key={payment._id || index}
                      className="border-b border-gray-700/30 py-2 last:border-0 last:pb-0 first:pt-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white text-sm font-medium">
                            {payment.paidAmount?.toLocaleString("uz-UZ") || "0"}{" "}
                            so'm
                          </div>
                          <div className="text-white/60 text-xs">
                            {formatDate(payment.paymentDate)}
                          </div>
                        </div>
                        <div className="bg-gray-700/30 px-2 py-0.5 rounded text-xs text-white/70">
                          {payment.paymentMethod}
                        </div>
                      </div>
                      {payment.notes && (
                        <div className="text-white/60 text-xs mt-1 line-clamp-1">
                          {payment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes (if available) */}
          {notes && (
            <div className="flex items-start">
              <MdDescription className="text-yellow-300 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <div className="text-yellow-200 text-xs font-medium">Izohlar</div>
                <div className="text-white text-sm line-clamp-2">
                  {formattedNotes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtCard;
