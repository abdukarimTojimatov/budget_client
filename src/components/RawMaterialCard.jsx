import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { DELETE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation";
import toast from "react-hot-toast";
import { FaTrash, FaRegCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { FiDollarSign, FiCalendar, FiPackage, FiUser, FiPhone, FiTag, FiAlertCircle, FiCheck, FiClock, FiBox, FiInfo } from "react-icons/fi";
import { MdDescription, MdCategory } from "react-icons/md";

const RawMaterialCard = ({ rawMaterial, onEdit }) => {
  const [deleteRawMaterial, { loading }] = useMutation(DELETE_RAW_MATERIAL);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;
    try {
      await deleteRawMaterial({
        variables: { id: rawMaterial._id },
        refetchQueries: ["GetRawMaterials"],
      });
      toast.success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting raw material:", error);
      toast.error("Raw material o'chirishda xatolik yuz berdi");
    }
  };

  const getCardClass = () => {
    return rawMaterial.paymentStatus
      ? "from-emerald-800/50 to-emerald-700/80 border-emerald-600/30" 
      : "from-red-900/50 to-red-800/70 border-red-700/30";
  };

  // Get payment status info
  const getPaymentStatusInfo = () => {
    return rawMaterial.paymentStatus
      ? { color: "bg-emerald-600/30 text-emerald-200", icon: <FiCheck className="mr-1" />, text: "To'landi" }
      : { color: "bg-red-600/30 text-red-200", icon: <FiAlertCircle className="mr-1" />, text: "Qarz" };
  };

  // Format category for display with appropriate icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Machalka': <FiBox />,
      'Mehanizm': <FiPackage />,
      'Kraska': <FiTag />,
      'Temir': <FiTag />,
      'Material': <FiBox />
    };
    return icons[category] || <FiBox />;
  };

  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br ${getCardClass()} shadow-lg backdrop-blur-sm border`}>
      <div className="flex flex-col gap-2">
        {/* Header with category and action buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {rawMaterial.rawMaterialCategory}
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
              onClick={() => onEdit && onEdit(rawMaterial._id)}
              className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
            >
              <HiPencilAlt className="text-blue-300" size={14} />
            </button>
          </div>
        </div>

        {/* Material name */}
        <div className="bg-black/20 rounded-lg p-2 mb-1">
          <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 mb-0.5">{rawMaterial.rawMaterialName}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {/* Payment status badge */}
            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs ${getPaymentStatusInfo().color}`}>
              {getPaymentStatusInfo().icon}
              {getPaymentStatusInfo().text}
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="bg-black/10 rounded-lg p-3 space-y-2.5">
          {/* Supplier info */}
          <div className="flex items-start">
            <FiUser className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Taminotchi</div>
              <div className="text-white text-sm">{rawMaterial.customer?.name || 'N/A'}</div>
              {rawMaterial.customer?.phoneNumber && (
                <div className="flex items-center mt-1 text-xs text-gray-300">
                  <FiPhone className="mr-1" size={10} />
                  {rawMaterial.customer.phoneNumber}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {rawMaterial.rawMaterialDescription && (
            <div className="flex items-start">
              <MdDescription className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <div className="text-blue-200 text-xs font-medium">Tavsifi</div>
                <div className="text-white text-xs line-clamp-2">{rawMaterial.rawMaterialDescription}</div>
              </div>
            </div>
          )}

          {/* Quantity & Unit */}
          <div className="flex items-start">
            <FiPackage className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Miqdori</div>
              <div className="text-white text-sm">
                {rawMaterial.rawMaterialQuantity} {rawMaterial.unitOfMeasurement}
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="flex items-start">
            <FiDollarSign className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div className="grid grid-cols-2 gap-2 w-full">
              <div>
                <div className="text-blue-200 text-xs font-medium">Narxi</div>
                <div className="text-white text-sm font-medium">
                  {rawMaterial.rawMaterialPrice.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">Jami</div>
                <div className="text-white text-sm font-medium">
                  {rawMaterial.rawMaterialTotalPrice?.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">To'landi</div>
                <div className="text-white text-sm">
                  {rawMaterial.totalPaid.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs font-medium">Qarz</div>
                <div className="text-white text-sm">
                  {rawMaterial.totalDebt.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start">
            <FiCalendar className="text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-blue-200 text-xs font-medium">Sana</div>
              <div className="text-white text-sm">{rawMaterial.date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialCard;
