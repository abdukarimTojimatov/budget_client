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
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting sharings:", error);
      toast.error("Sharings o'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div
      className={`rounded-xl p-6 bg-gradient-to-br ${cardClass} shadow-lg backdrop-blur-sm border border-gray-700/20`}
    >
      <div className="flex flex-col gap-1">
        {/* Header with category and action buttons */}
        <div className="flex flex-row items-center justify-between mb-0.5">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[150px]">
              {sharingCategoryType}
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
            <Link to={`/sharings/${sharing._id}`}>
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
              <th className="font-medium text-white/70">Ulush haqida:</th>
              <td className="p-1 break-words">{sharingDescription}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">To'lov turi:</th>
              <td className="p-1 break-words">{sharingPaymentType}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Miqdori:</th>
              <td className="p-1">
                {sharingAmount.toLocaleString("uz-UZ")}{" "}
                <span className="text-white/70">so'm</span>
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/70">Sana:</th>
              <td className="p-1 text-white/90">{sharingDate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SharingCard;
