import React from "react";
import { FiDollarSign, FiCalendar, FiInfo } from "react-icons/fi";
import { MdDescription, MdOutlinePayments } from "react-icons/md";
import { FaTrash, FaMoneyBillWave, FaRegCreditCard, FaUserTie } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { TbMoneybag } from "react-icons/tb";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_LOAN } from "../graphql/mutations/loan.mutation";
import "../styles/accordion.css"; // Accordion animations

// Define status color mapping with modern gradients
const statusColorMap = {
  true: "from-green-900/50 to-green-800/80 border-green-700/30",
  false: "from-blue-900/50 to-blue-800/80 border-blue-700/30",
  default: "from-purple-900/50 to-purple-800/80 border-purple-700/30"
};

const LoanCard = ({ loan, onEdit, onPayment }) => {
  // Debug logging
  React.useEffect(() => {
    console.log("Debug - Loan data:", loan);
    console.log("Debug - Due date:", loan?.dueDate, typeof loan?.dueDate);
    if (loan?.paidLoans?.length > 0) {
      console.log("Debug - Payment dates:", loan.paidLoans.map(p => p.paymentDate));
    }
  }, [loan]);
  
  const {
    _id,
    nameOfLoan,
    phoneNumberOfLoan,
    totalLoan,
    leftLoan,
    paidLoan,
    isPaidFull,
    dueDate,
    notes,
    paymentMethodOnGivingLoan,
    startDate,
    paidLoans = [],
  } = loan;

  // Accordion state for payment history
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = React.useState(false);

  // Get status color based on isPaidFull
  const cardClass = statusColorMap[isPaidFull ? 'true' : 'false'] || statusColorMap.default;

  // Format name for better display
  const displayName = nameOfLoan.charAt(0).toUpperCase() + nameOfLoan.slice(1);
  
  // Format date utility function to handle different date formats
  const formatDate = (dateValue) => {
    if (!dateValue) return "Ma'lumot yo'q";
    
    let date;
    // Handle string dates
    if (typeof dateValue === 'string') {
      // Check if it's an ISO string format
      if (dateValue.includes("T") || dateValue.includes("Z") || dateValue.includes("-")) {
        date = new Date(dateValue);
      } 
      // Check if it's a Unix timestamp (all digits)
      else if (/^\d+$/.test(dateValue)) {
        date = new Date(parseInt(dateValue));
      }
      // Handle MongoDB $date objects
      else if (dateValue.$date) {
        date = new Date(dateValue.$date);
      }
    } 
    // Handle Date objects
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // Handle MongoDB $date objects directly
    else if (dateValue && dateValue.$date) {
      date = new Date(dateValue.$date);
    }
    
    // If we couldn't parse the date or it's invalid
    if (!date || isNaN(date.getTime())) {
      console.error("Invalid date format:", dateValue);
      return "Ma'lumot yo'q";
    }
    
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format dates
  const formattedDueDate = formatDate(dueDate);
  const formattedStartDate = formatDate(startDate);

  // Function to format amount with UZS currency
  const formatAmount = (amount) => {
    return amount?.toLocaleString("uz-UZ") || "0";
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "cash":
        return <FaMoneyBillWave className="text-yellow-300" size={14} />;
      case "bank_transfer":
        return <FaRegCreditCard className="text-blue-300" size={14} />;
      case "credit_card":
        return <FaRegCreditCard className="text-green-300" size={14} />;
      default:
        return <FaRegCreditCard className="text-gray-300" size={14} />;
    }
  };

  // Delete mutation setup
  const [deleteLoan, { loading }] = useMutation(DELETE_LOAN);

  // Handle delete with confirmation
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;

    try {
      await deleteLoan({
        variables: { id: _id },
        refetchQueries: ["GetLoans", "GetLoanStatistics"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast.error(error.message || "O'chirishda xatolik yuz berdi");
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
            <div className="w-2 h-2 rounded-full bg-purple-400 mr-1"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {displayName}
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
              onClick={() => onEdit && onEdit(_id)}
              className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
            >
              <HiPencilAlt className="text-blue-300" size={14} />
            </button>
            {!isPaidFull && (
              <button
                onClick={() => onPayment && onPayment(_id)}
                className="p-1.5 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors duration-200 flex items-center"
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
              {phoneNumberOfLoan}
            </h3>
            <div className="flex flex-wrap gap-1">
              <div className={`flex items-center px-2 py-0.5 rounded-full text-xs ${
                isPaidFull ? "bg-green-600/30 text-green-200" : "bg-blue-600/30 text-blue-200"
              }`}>
                {isPaidFull ? "To'langan" : "Aktiv"}
              </div>
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="bg-black/10 rounded-lg p-3 space-y-2.5">
          {/* Total Amount */}
          <div className="flex items-start">
            <TbMoneybag className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-purple-200 text-xs font-medium">Umumiy summa</div>
              <div className="text-white text-sm font-semibold">
                {formatAmount(totalLoan)}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Remaining Amount */}
          <div className="flex items-start">
            <FiDollarSign className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-purple-200 text-xs font-medium">Qolgan summa</div>
              <div className="text-white text-sm font-semibold">
                {formatAmount(leftLoan)}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Paid Amount */}
          <div className="flex items-start">
            <FaMoneyBillWave className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-purple-200 text-xs font-medium">To'langan summa</div>
              <div className="text-white text-sm font-semibold">
                {formatAmount(paidLoan)}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-start">
            <FaRegCreditCard className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-purple-200 text-xs font-medium">To'lov usuli</div>
              <div className="text-white text-sm font-semibold flex items-center">
                {getPaymentMethodIcon(paymentMethodOnGivingLoan)}
                <span className="ml-1">
                  {paymentMethodOnGivingLoan === "cash" 
                    ? "Naqd pul" 
                    : paymentMethodOnGivingLoan === "bank_transfer" 
                      ? "Bank o'tkazmasi" 
                      : paymentMethodOnGivingLoan === "credit_card" 
                        ? "Kredit karta" 
                        : paymentMethodOnGivingLoan}
                </span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-start">
            <FiCalendar className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-purple-200 text-xs font-medium">To'lov kuni</div>
              <div className="text-white text-sm font-semibold">
                {formattedDueDate}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-start">
            <FiCalendar className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-purple-200 text-xs font-medium">Berilgan sana</div>
              <div className="text-white text-sm font-semibold">
                {formattedStartDate}
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="flex items-start">
              <MdDescription className="text-purple-300 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <div className="text-purple-200 text-xs font-medium">Izohlar</div>
                <div className="text-white text-sm font-medium">
                  {notes}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment History Accordion */}
        {paidLoans && paidLoans.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <button 
              onClick={() => setIsPaymentHistoryOpen(!isPaymentHistoryOpen)}
              className="w-full text-left flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 transition-colors rounded-lg p-2"
            >
              <div className="flex items-center">
                <MdOutlinePayments className="text-blue-300 mr-1" size={16} />
                <span className="text-blue-200 text-xs font-medium">To'lovlar tarixi ({paidLoans.length})</span>
              </div>
              <svg 
                className={`w-4 h-4 text-blue-300 transform transition-transform duration-200 ${isPaymentHistoryOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isPaymentHistoryOpen && (
              <div className="bg-black/20 rounded-lg p-2 mt-2 max-h-60 overflow-y-auto animate-slideDown">
                {paidLoans.map((payment, index) => (
                  <div key={payment._id || index} className="border-b border-gray-700/30 py-2 last:border-0 last:pb-0 first:pt-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {parseFloat(payment.paidAmount)?.toLocaleString("uz-UZ") || "0"} so'm
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

        {/* Add payment button */}
        {!isPaidFull && (
          <div className="mt-3">
            <button
              onClick={() => onPayment && onPayment(_id)}
              className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-100 font-medium p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <FiDollarSign className="mr-1" />
              To'lov qo'shish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCard;
