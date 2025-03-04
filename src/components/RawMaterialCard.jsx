import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { DELETE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import {
  FaBoxOpen,
  FaTag,
  FaFileAlt,
  FaRulerCombined,
  FaMoneyBillWave,
  FaUser,
  FaPhone,
  FaCheckCircle,
} from "react-icons/fa";

const RawMaterialCard = ({ rawMaterial }) => {
  const [deleteRawMaterial, { loading }] = useMutation(DELETE_RAW_MATERIAL);

  const handleDelete = async () => {
    try {
      await deleteRawMaterial({
        variables: { id: rawMaterial._id },
        refetchQueries: ["GetRawMaterials"],
      });
      toast.success("Raw material deleted successfully");
    } catch (error) {
      console.error("Error deleting raw material:", error);
      toast.error(error.message);
    }
  };

  // Determine card gradient based on payment status
  const getCardClass = () => {
    return rawMaterial.paymentStatus
      ? "from-emerald-800/50 to-emerald-600/50"
      : "from-orange-800/50 to-orange-600/50";
  };

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 bg-gradient-to-br ${getCardClass()} shadow-lg backdrop-blur-sm border border-gray-700/20`}
    >
      <div className="flex flex-col gap-1 sm:gap-2">
        {/* Header with category and action buttons */}
        <div className="flex flex-row items-center justify-between mb-1">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white mr-1"></div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[180px]">
              {rawMaterial.rawMaterialCategory}
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
            <Link to={`/rawMaterial/${rawMaterial._id}`}>
              <button className="p-1.5 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors duration-200">
                <HiPencilAlt className="text-white/90" size={14} />
              </button>
            </Link>
          </div>
        </div>

        {/* Grid layout for key information */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 border-t border-white/10 pt-1">
          {/* Name */}
          <div className="text-white col-span-2">
            <div className="flex items-center gap-1 text-sm">
              <FaTag className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Nomi:</span>
              <span className="text-white text-xs ml-1 truncate">
                {rawMaterial.rawMaterialName}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaBoxOpen className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">
                Miqdori:
              </span>
              <span className="text-white text-xs ml-1">
                {rawMaterial.rawMaterialQuantity}{" "}
                {rawMaterial.unitOfMeasurement}
              </span>
            </div>
          </div>

          {/* Unit Price */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaRulerCombined className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Narxi:</span>
              <span className="text-white text-xs ml-1">
                {rawMaterial.rawMaterialPrice.toLocaleString("uz-UZ")}
              </span>
            </div>
          </div>

          {/* Total Price */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm">
              <FaMoneyBillWave className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Jami:</span>
              <span className="text-white text-xs ml-1">
                {rawMaterial.rawMaterialTotalPrice?.toLocaleString("uz-UZ")}
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
                {rawMaterial.totalPaid.toLocaleString("uz-UZ")}
              </span>
            </div>
          </div>

          {/* Supplier */}
          <div className="text-white col-span-2">
            <div className="flex items-center gap-1 text-sm">
              <FaUser className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">
                Taminotchi:
              </span>
              <span className="text-white text-xs ml-1 truncate">
                {rawMaterial.customerName}
              </span>
            </div>
          </div>

          {/* Phone */}
          <div className="text-white col-span-2">
            <div className="flex items-center gap-1 text-sm">
              <FaPhone className="text-white/70" size={12} />
              <span className="font-medium text-white/70 text-xs">Tel:</span>
              <span className="text-white text-xs ml-1">
                {rawMaterial.phoneNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="text-white flex flex-row w-full pt-1 mt-1 justify-between items-center border-t border-white/10">
          <span className="font-medium text-white/70 text-xs">To'lov:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              rawMaterial.paymentStatus ? "bg-green-600/30" : "bg-orange-600/30"
            }`}
          >
            {rawMaterial.paymentStatus ? "To'langan" : "Qarz"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialCard;
