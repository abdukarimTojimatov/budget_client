import React from "react";
import { BsCardText } from "react-icons/bs";
import { MdOutlinePayments, MdDescription } from "react-icons/md";
import { FaSackDollar, FaCalendarDays } from "react-icons/fa6";
import { FaTrash, FaUser, FaRegCreditCard } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { FiDollarSign, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_SHARING } from "../graphql/mutations/sharing.mutation";

const categoryColorMap = {
  Rozimuhammad: "from-emerald-800/50 to-emerald-700/80 border-emerald-600/30",
  Elmurod: "from-pink-900/50 to-pink-800/80 border-pink-700/30",
  Egamberdi: "from-blue-900/50 to-blue-800/80 border-blue-700/30",
  default: "from-purple-900/50 to-purple-800/80 border-purple-700/30",
};

const SharingCard = ({ sharing, onEditClick }) => {
  let {
    sharingCategoryType,
    sharingAmount,
    sharingDate,
    sharingPaymentType,
    sharingDescription,
    userId,
  } = sharing;

  const cardClass =
    categoryColorMap[sharingCategoryType] || categoryColorMap.default;
  const [deleteSharing, { loading }] = useMutation(DELETE_SHARING);

  // Capitalize the first letter of the description
  sharingDescription =
    sharingDescription[0]?.toUpperCase() + sharingDescription.slice(1);
  sharingCategoryType =
    sharingCategoryType[0]?.toUpperCase() + sharingCategoryType.slice(1);
  sharingPaymentType =
    sharingPaymentType[0]?.toUpperCase() + sharingPaymentType.slice(1);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;
    try {
      await deleteSharing({
        variables: { sharingId: sharing._id },
        refetchQueries: ["GetSharings", "CategoryStatisticsSharing"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting sharings:", error);
      toast.error("Sharings o'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div
      className={`rounded-xl p-4 bg-gradient-to-br ${cardClass} shadow-lg backdrop-blur-sm border`}
    >
      <div className="flex flex-col gap-1">
        {/* Header with category and action buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {sharingCategoryType}
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
              onClick={() => onEditClick && onEditClick(sharing._id)}
              className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
            >
              <HiPencilAlt className="text-blue-300" size={14} />
            </button>
          </div>
        </div>

        {/* Table layout for key information */}
        {/* Sharing description */}
        <div className="bg-black/20 rounded-lg p-2 mb-1">
          <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 mb-0.5">
            {sharingDescription}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {/* Payment type badge */}
            <div className="flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-600/30 text-blue-200">
              <FaRegCreditCard className="mr-1" />
              {sharingPaymentType}
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="bg-black/10 rounded-lg p-3 space-y-2.5">
          {/* Amount */}
          <div className="flex items-start">
            <FiDollarSign className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Miqdori</div>
              <div className="text-white text-sm font-semibold">
                {sharingAmount.toLocaleString("uz-UZ")}{" "}
                <span className="text-white/70 font-normal">so'm</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start">
            <FiCalendar className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Sana</div>
              <div className="text-white text-sm">
                {new Date(sharingDate).toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* User info (if available) */}
          {userId && (
            <div className="flex items-start">
              <FaUser className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <div className="text-blue-200 text-xs font-medium">
                  Foydalanuvchi
                </div>
                <div className="text-white text-sm">
                  {userId.username || "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharingCard;
