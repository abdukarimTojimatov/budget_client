// src/components/OrderCard.js
import React from "react";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import {
  FileText,
  AlignLeft,
  Package,
  User,
  Tag,
  Layers,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Circle,
  CreditCard,
} from "lucide-react";
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

  const getCardClass = () => {
    const statusColors = {
      tolandi: "from-emerald-800/50 to-emerald-600/50",
      qismantolandi: "from-orange-800/50 to-orange-600/50",
      tolanmadi: "from-red-700/40 to-red-500/50",
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
      className={`rounded-lg p-2 sm:p-3 bg-gradient-to-br ${getCardClass()} shadow-md backdrop-blur-sm border border-gray-700/20`}
    >
      <div className="flex flex-col gap-1">
        {/* Header with order number and action buttons */}
        <div className="flex flex-row items-center justify-between mb-0.5">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {order.orderAutoNumber}
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
            <Link to={`/orders/${order._id}`}>
              <button className="p-1 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors duration-200">
                <HiPencilAlt className="text-white/90" size={12} />
              </button>
            </Link>
          </div>
        </div>

        {/* Grid layout for key information */}
        <table className="w-full text-left border-collapse border border-gray-700/20 text-white text-[10px] sm:text-xs">
          <tbody>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Nomi:</th>
              <td className="p-1">{order.orderName}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Tavsifi:</th>
              <td className="p-1">{order.orderDescription}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Homashyo:</th>
              <td className="p-1">{order.orderExpensesDescription}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Mijoz:</th>
              <td className="p-1">{order.orderCustomerName}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Kategoriya:</th>
              <td className="p-1">{order.orderCategory}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Turi:</th>
              <td className="p-1">{order.orderType}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Jami:</th>
              <td className="p-1">
                {order.orderTotalAmount.toLocaleString("uz-UZ")} so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">To'landi:</th>
              <td className="p-1">
                {order.orderTotalPaid?.toLocaleString("uz-UZ") || "0"} so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Qarz:</th>
              <td className="p-1">
                {order.orderTotalDebt?.toLocaleString("uz-UZ") || "0"} so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Sana:</th>
              <td className="p-1">{order.date}</td>
            </tr>
          </tbody>
        </table>

        {/* Status and Payment Status */}
        <div className="flex justify-between items-center mt-0.5 pt-0.5 border-t border-white/10">
          <div className="flex items-center">
            <span className="font-medium text-white/70 text-[10px] sm:text-xs">
              Holati:
            </span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${getStatusBadgeColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-white/70 text-[10px] sm:text-xs">
              To'lov:
            </span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${
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

export default OrderCard;
