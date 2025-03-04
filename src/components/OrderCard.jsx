// src/components/OrderCard.js
import React from "react";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaCalendarDays,
  FaUser,
  FaMoneyBillWave,
  FaTag,
  FaClipboardList,
  FaBuilding,
} from "react-icons/fa6";
import { useMutation } from "@apollo/client";
import { DELETE_ORDER } from "../graphql/mutations/order.mutation";
import toast from "react-hot-toast";

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const OrderCard = ({ order, onDelete }) => {
  const [deleteOrder, { loading }] = useMutation(DELETE_ORDER);

  const handleDelete = async () => {
    try {
      await deleteOrder({
        variables: { id: order._id },
        refetchQueries: ["GetOrders"],
      });
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.message);
    }
  };

  // Determine card gradient based on payment status
  const getCardClass = () => {
    const statusColors = {
      tolandi: "from-emerald-800/50 to-emerald-600/50",
      qismantolandi: "from-orange-800/50 to-orange-600/50",
      tolanmadi: "from-red-800/50 to-red-600/50",
    };
    return (
      statusColors[order.orderPaymentStatus.toLowerCase()] ||
      "from-gray-800/50 to-gray-600/50"
    );
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const badgeColors = {
      tayyorlanmoqda: "bg-blue-600/30",
      topshirildi: "bg-green-600/30",
      "bekor qilindi": "bg-red-600/30",
    };
    return badgeColors[status.toLowerCase()] || "bg-gray-600/30";
  };

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 bg-gradient-to-br ${getCardClass()} shadow-lg backdrop-blur-sm border border-gray-700/20`}
    >
      <div className="flex flex-col gap-1 sm:gap-2">
        {/* Header with order number and action buttons */}
        <div className="flex flex-row items-center justify-between mb-1">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white mr-1"></div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {order.orderAutoNumber}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!loading ? (
              <button
                onClick={handleDelete}
                className="p-1.5 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors duration-200"
              >
                <FaTrash className="text-white/90" size={14} />
              </button>
            ) : (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white/50 rounded-full animate-spin"></div>
            )}
            <Link to={`/orders/${order._id}`}>
              <button className="p-1.5 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors duration-200">
                <HiPencilAlt className="text-white/90" size={14} />
              </button>
            </Link>
          </div>
        </div>

        {/* Grid layout for key information */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 border-t border-white/10 pt-1">
          {/* Order Name */}
          <div className="text-white col-span-2">
            <div className="flex items-center gap-1 text-sm">
              <FaTag className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Nomi:</span>
              <span className="text-white text-xs ml-1 truncate">
                {order.orderName}
              </span>
            </div>
          </div>

          <div className="text-white col-span-2 border-t border-white/10 pt-1">
            <div className="flex gap-1 text-sm">
              <FaTag className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">
                Tavsifi:
              </span>
              <span className="text-white text-xs ml-1 break-words w-full block">
                {order.orderDescription}
              </span>
            </div>
          </div>

          <div className="text-white col-span-2 border-t border-white/10 pt-1">
            <div className="flex gap-1 text-sm">
              <FaTag className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">
                Homashyo:
              </span>
              <span className="text-white text-xs ml-1 break-words w-full block">
                {order.orderExpensesDescription}
              </span>
            </div>
          </div>

          {/* Customer */}
          <div className="text-white col-span-2 border-t border-white/10 pt-1">
            <div className="flex gap-1 text-sm">
              <FaUser className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Mijoz:</span>
              <span className="text-white text-xs ml-1 truncate">
                {order.orderCustomerName}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaClipboardList className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">
                Kategoriya:
              </span>
              <span className="text-white text-xs ml-1">
                {order.orderCategory}
              </span>
            </div>
          </div>

          {/* Type */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaBuilding className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Turi:</span>
              <span className="text-white text-xs ml-1">{order.orderType}</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaMoneyBillWave className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Jami:</span>
              <span className="text-white text-xs ml-1">
                {order.orderTotalAmount.toLocaleString("uz-UZ")}
              </span>
            </div>
          </div>

          {/* Total Paid */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaMoneyBillWave className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">
                To'landi:
              </span>
              <span className="text-white text-xs ml-1">
                {order.orderTotalPaid?.toLocaleString("uz-UZ") || "0"}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="text-white col-span-2">
            <div className="flex items-center gap-1 text-sm">
              <FaCalendarDays className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Sana:</span>
              <span className="text-white text-xs ml-1">{order.date}</span>
            </div>
          </div>
        </div>

        {/* Status and Payment Status */}
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/10">
          <div className="flex items-center">
            <span className="font-medium text-white/70 text-xs">Holati:</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-white/70 text-xs">To'lov:</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                order.orderPaymentStatus.toLowerCase() === "tolandi"
                  ? "bg-green-600/30"
                  : order.orderPaymentStatus.toLowerCase() === "qismantolandi"
                  ? "bg-orange-600/30"
                  : "bg-red-600/30"
              }`}
            >
              {order.orderPaymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderCard.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    orderAutoNumber: PropTypes.string,
    orderName: PropTypes.string.isRequired,
    orderCustomerName: PropTypes.string.isRequired,
    orderTotalAmount: PropTypes.number.isRequired,
    orderTotalPaid: PropTypes.number,
    orderStatus: PropTypes.string.isRequired,
    orderPaymentStatus: PropTypes.string.isRequired,
    orderCategory: PropTypes.string,
    orderType: PropTypes.string,
    date: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default OrderCard;
