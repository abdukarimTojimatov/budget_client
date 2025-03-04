import React from "react";
import { BsCardText } from "react-icons/bs";
import { MdOutlinePayments } from "react-icons/md";
import { FaSackDollar, FaCalendarDays } from "react-icons/fa6";
import { FaTrash, FaUser } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_SHARING } from "../graphql/mutations/sharing.mutation";

const categoryColorMap = {
  Rozimuhammad: "from-green-800/50 to-green-600/50",
  Elmurod: "from-pink-800/50 to-pink-600/50",
  Egamberdi: "from-blue-800/50 to-blue-600/50",
  default: "from-purple-800/50 to-purple-600/50",
};

const SharingCard = ({ sharing }) => {
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
    try {
      await deleteSharing({
        variables: { sharingId: sharing._id },
        refetchQueries: ["GetSharings", "CategoryStatisticsSharing"],
      });
      toast.success("Sharings deleted successfully");
    } catch (error) {
      console.error("Error deleting sharings:", error);
      toast.error(error.message);
    }
  };

  // Format date for better display
  const formattedDate = new Date(sharingDate).toLocaleDateString("uz-UZ", {
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
            <h2 className="text-xl font-bold text-white">
              {sharingCategoryType}
            </h2>
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
            <Link to={`/sharings/${sharing._id}`}>
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
            <span className="font-medium text-white/70">Ulush haqida:</span>
          </div>
          <div className="sm:w-2/3 pl-6 sm:pl-0">
            <span className="text-white break-words w-full block">
              {sharingDescription}
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
              {sharingPaymentType}
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
              {sharingAmount.toLocaleString("uz-UZ")}
            </span>
            <span className="text-white/70 ml-1">so'm</span>
          </div>
        </div>

        {/* User */}
        <div className="text-white flex flex-col sm:flex-row w-full py-2 border-b border-white/10">
          <div className="flex items-start gap-2 sm:w-1/3">
            <span className="flex items-center">
              <FaUser className="flex-shrink-0 text-white/70" />
            </span>
            <span className="font-medium text-white/70">Foydalanuvchi:</span>
          </div>
          <div className="sm:w-2/3 pl-6 sm:pl-0">
            <span className="text-white break-words w-full block">
              {userId?.username || "Noma'lum"}
            </span>
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
export default SharingCard;
