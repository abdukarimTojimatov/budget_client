import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaDownload,
  FaTimes,
  FaImages,
  FaRegCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import {
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiUser,
  FiMapPin,
  FiTag,
  FiAlertCircle,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import { MdDescription, MdCategory } from "react-icons/md";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { DELETE_ORDER } from "../graphql/mutations/order.mutation";
import toast from "react-hot-toast";
import { baseURL } from "../utils/apiConfig";
import { createPortal } from "react-dom";

// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

const OrderCard = ({ order, onEdit }) => {
  const [deleteOrder, { loading }] = useMutation(DELETE_ORDER);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;
    try {
      await deleteOrder({
        variables: { id: order._id },
        refetchQueries: ["GetOrders"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const getCardClass = () => {
    const statusColors = {
      tolandi: "from-emerald-800/50 to-emerald-700/80 border-emerald-600/30",
      qisman: "from-blue-800/50 to-blue-700/70 border-blue-600/30",
      tolanmadi: "from-pink-900/50 to-pink-800/80 border-pink-700/30",
    };
    return (
      statusColors[order.orderPaymentStatus.toLowerCase()] ||
      "from-gray-800/70 to-gray-700/90 border-gray-600/30"
    );
  };

  // Get status badge color and icon
  const getStatusInfo = (status) => {
    const statusInfo = {
      tayyorlanmoqda: {
        color: "bg-blue-600/30 text-blue-200",
        icon: <FiClock className="mr-1" />,
      },
      topshirildi: {
        color: "bg-emerald-600/30 text-emerald-200",
        icon: <FiCheck className="mr-1" />,
      },
      "bekor qilindi": {
        color: "bg-red-600/30 text-red-200",
        icon: <FiAlertCircle className="mr-1" />,
      },
    };
    return (
      statusInfo[status.toLowerCase()] || {
        color: "bg-gray-600/30 text-gray-200",
        icon: <FiClock className="mr-1" />,
      }
    );
  };

  // Get payment status info
  const getPaymentStatusInfo = (status) => {
    const paymentInfo = {
      tolandi: {
        color: "bg-emerald-600/30 text-emerald-200",
        icon: <FiCheck className="mr-1" />,
      },
      qisman: {
        color: "bg-blue-600/30 text-blue-200",
        icon: <FiDollarSign className="mr-1" />,
      },
      tolanmadi: {
        color: "bg-red-600/30 text-red-200",
        icon: <FiAlertCircle className="mr-1" />,
      },
    };
    return (
      paymentInfo[status.toLowerCase()] || {
        color: "bg-gray-600/30 text-gray-200",
        icon: <FiDollarSign className="mr-1" />,
      }
    );
  };

  return (
    <div
      className={`rounded-xl p-4 bg-gradient-to-br ${getCardClass()} shadow-lg backdrop-blur-sm border`}
    >
      <div className="flex flex-col gap-2">
        {/* Header with order number and action buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              #{order.orderAutoNumber}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {order.orderImages && order.orderImages.length > 0 && (
              <button
                onClick={() => {
                  setShowImageGallery(true);
                  setInitialSlide(0);
                }}
                className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
              >
                <FaImages className="text-blue-300" size={14} />
              </button>
            )}
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
              onClick={() => onEdit && onEdit(order._id)}
              className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
            >
              <HiPencilAlt className="text-blue-300" size={14} />
            </button>
          </div>
        </div>

        {/* Order name */}
        <div className="bg-black/20 rounded-lg p-2 mb-1">
          <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 mb-0.5">
            {order.orderName}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {/* Status badge */}
            <div
              className={`flex items-center px-2 py-0.5 rounded-full text-xs ${
                getStatusInfo(order.orderStatus).color
              }`}
            >
              {getStatusInfo(order.orderStatus).icon}
              {order.orderStatus}
            </div>
            {/* Payment status badge */}
            <div
              className={`flex items-center px-2 py-0.5 rounded-full text-xs ${
                getPaymentStatusInfo(order.orderPaymentStatus).color
              }`}
            >
              {getPaymentStatusInfo(order.orderPaymentStatus).icon}
              {order.orderPaymentStatus}
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="bg-black/10 rounded-lg p-3 space-y-2.5">
          {/* Customer info */}
          <div className="flex items-start">
            <FiUser className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Mijoz</div>
              <div className="text-white text-sm">
                {order.orderCustomerName}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start">
            <MdDescription className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Tavsifi</div>
              <div className="text-white text-xs line-clamp-2">
                {order.orderDescription}
              </div>
            </div>
          </div>

          {/* Category & Type */}
          <div className="flex items-start">
            <MdCategory className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div className="grid grid-cols-2 gap-x-2 w-full">
              <div>
                <div className="text-blue-200 text-xs font-medium">
                  Kategoriya
                </div>
                <div className="text-white text-xs">{order.orderCategory}</div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">Turi</div>
                <div className="text-white text-xs">{order.orderType}</div>
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="flex items-start">
            <FiDollarSign className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div className="grid grid-cols-2 gap-2 w-full">
              <div>
                <div className="text-blue-200 text-xs font-medium">Jami</div>
                <div className="text-white text-sm font-medium">
                  {order.orderTotalAmount.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">
                  To'landi
                </div>
                <div className="text-white text-sm font-medium">
                  {order.orderTotalPaid?.toLocaleString("uz-UZ") || "0"} so'm
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">
                  Harajatlar
                </div>
                <div className="text-white text-sm">
                  {order.orderExpensesAmount.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">Qarz</div>
                <div className="text-white text-sm">
                  {order.orderTotalDebt?.toLocaleString("uz-UZ") || "0"} so'm
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start">
            <FiCalendar className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div className="grid grid-cols-2 gap-2 w-full">
              <div>
                <div className="text-blue-200 text-xs font-medium">Sana</div>
                <div className="text-white text-xs">{order.date}</div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">Muddati</div>
                <div className="text-white text-xs">{order.orderReadyDate}</div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="flex justify-between items-center mt-0.5 pt-0.5 border-t border-white/10">
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
                  : order.orderPaymentStatus.toLowerCase() === "qisman"
                  ? "bg-orange-600/30"
                  : "bg-red-600/30"
              }`}
            >
              {order.orderPaymentStatus}
            </span>
          </div>
        </div> */}

        {/* Image thumbnail section - only visible if there are images */}
        {order.images && order.images.length > 0 && (
          <div className="border-t border-white/10 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-[10px] sm:text-xs flex items-center gap-1">
                <FaImages className="text-white/90" />
                Rasmlar: {order.images.length}
              </span>
              <div className="flex">
                {order.images.slice(0, 3).map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative h-8 w-8 cursor-pointer ml-1 rounded overflow-hidden"
                    onClick={() => {
                      setInitialSlide(index);
                      setShowImageGallery(true);
                    }}
                  >
                    <img
                      src={`${baseURL}${imageUrl}`}
                      alt={`Order ${order.orderName} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {order.images.length > 3 && (
                  <div className="h-8 w-8 bg-gray-700/50 flex items-center justify-center rounded ml-1 text-[10px]">
                    +{order.images.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Portal - rendered outside the normal DOM flow */}
      {showImageGallery &&
        order.images &&
        order.images.length > 0 &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-2 overflow-hidden"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              zIndex: 999999,
              touchAction: "none",
            }}
            onClick={() => setShowImageGallery(false)}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              style={{
                isolation: "isolate",
                touchAction: "none",
              }}
            >
              <button
                className="absolute top-4 right-4 text-white bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center z-[999999]"
                onClick={() => setShowImageGallery(false)}
                style={{ touchAction: "manipulation" }}
              >
                <FaTimes />
              </button>

              <Swiper
                modules={[Navigation, Pagination, Zoom]}
                navigation
                pagination={{ clickable: true }}
                zoom={{ maxRatio: 3, toggle: true }}
                spaceBetween={30}
                slidesPerView={1}
                initialSlide={initialSlide}
                className="h-[80vh] w-full"
                style={{ touchAction: "pan-y" }}
                preventInteractionOnTransition={true}
              >
                {order.images.map((imageUrl, index) => (
                  <SwiperSlide
                    key={index}
                    className="flex items-center justify-center"
                  >
                    <div className="swiper-zoom-container">
                      <img
                        src={`${baseURL}${imageUrl}`}
                        alt={`Order ${order.orderName} image ${index + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Download button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Extract filename from the image URL
                        const filename = imageUrl.split("/").pop();

                        // Use the dedicated download endpoint
                        window.location.href = `${baseURL}/api/download-order-image/${encodeURIComponent(
                          filename
                        )}`;
                      }}
                      className="absolute bottom-4 right-4 z-[999999] bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
                      title="Download image"
                      style={{ touchAction: "manipulation" }}
                    >
                      <FaDownload />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default OrderCard;
