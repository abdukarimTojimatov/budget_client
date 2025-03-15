import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { FaImages } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { DELETE_ORDER } from "../graphql/mutations/order.mutation";
import toast from "react-hot-toast";
import { baseURL } from "../utils/apiConfig";
import { createPortal } from "react-dom";

// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import { FaDownload } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
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
      tolandi: "from-emerald-800/50 to-emerald-800/80",
      qisman: "from-blue-800/40 to-blue-500/60",
      tolanmadi: "from-red-700/40 to-red-500/50",
    };
    return (
      statusColors[order.orderPaymentStatus.toLowerCase()] ||
      "from-blue-800/50 to-blue-600/80"
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
    <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br bg-cyan-800/80 shadow-lg backdrop-blur-sm border border-gray-700/20">
      <div className="flex flex-col gap-1">
        {/* Header with order number and action buttons */}
        <div className="flex flex-row items-center justify-between mb-0.5">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
            <h2 className="text-sm sm:text-base font-bold text-red-300 ml-2">
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
            <button
              onClick={() => onEdit && onEdit(order._id)}
              className="p-1 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors duration-200"
            >
              <HiPencilAlt className="text-white/90" size={12} />
            </button>
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
              <th className="font-medium text-white/70">Harajatlar:</th>
              <td className="p-1">
                {order.orderExpensesAmount.toLocaleString("uz-UZ")} so'm
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
              <th className="font-medium text-white/70">Muddati:</th>
              <td className="p-1">{order.orderReadyDate}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Sana:</th>
              <td className="p-1">{order.date}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Holati:</th>
              <td className="p-1">{order.orderStatus}</td>
            </tr>{" "}
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70 ">To'lov:</th>
              <td
                className={`p-1 rounded-full ${
                  order.orderPaymentStatus === "tolandi"
                    ? "bg-green-600/30"
                    : order.orderPaymentStatus === "qisman"
                    ? "bg-red-600"
                    : "bg-red-600"
                }`}
              >
                {order.orderPaymentStatus}
              </td>
            </tr>
          </tbody>
        </table>
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
