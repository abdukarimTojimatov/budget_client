import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { DELETE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";

const RawMaterialCard = ({ rawMaterial }) => {
  const [deleteRawMaterial, { loading }] = useMutation(DELETE_RAW_MATERIAL);

  const handleDelete = async () => {
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

  // Determine card gradient based on payment status
  const getCardClass = () => {
    return rawMaterial.paymentStatus
      ? "from-emerald-800/50 to-emerald-600/50"
      : "from-orange-800/50 to-orange-600/50";
  };

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 bg-cyan-800/80 shadow-lg border border-gray-700/20`}
    >
      <div className="flex flex-col gap-1">
        {/* Header with category and action buttons */}
        <div className="flex flex-row items-center justify-between mb-0.5">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-0.5"></div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[150px]">
              {rawMaterial.rawMaterialCategory}
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
            <Link to={`/rawMaterial/${rawMaterial._id}`}>
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
              <th className="font-medium text-white/90">Nomi:</th>
              <td className="p-1">{rawMaterial.rawMaterialName}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Izoh:</th>
              <td className="p-1">
                {rawMaterial.rawMaterialDescription}
                so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Miqdori:</th>
              <td className="p-1">
                {rawMaterial.rawMaterialQuantity}{" "}
                {rawMaterial.unitOfMeasurement}
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Narxi:</th>
              <td className="p-1">
                {rawMaterial.rawMaterialPrice.toLocaleString("uz-UZ")} so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Jami narxi:</th>
              <td className="p-1">
                {rawMaterial.rawMaterialTotalPrice?.toLocaleString("uz-UZ")}{" "}
                so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">To'langan:</th>
              <td className="p-1">
                {rawMaterial.totalPaid.toLocaleString("uz-UZ")} so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Qarzimiz:</th>
              <td className="p-1">
                {rawMaterial.totalDebt.toLocaleString("uz-UZ")} so'm
              </td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Taminotchi:</th>
              <td className="p-1 truncate">{rawMaterial.customerName}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Telefoni:</th>
              <td className="p-1">{rawMaterial.phoneNumber}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="font-medium text-white/90">Sana:</th>
              <td className="p-1">{rawMaterial.date}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-white flex flex-row pt-0.5 justify-between items-center border-t border-white/10">
          <span className="font-medium text-white/70 text-[10px] mt-1">
            To'lov:
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] mt-1 ${
              rawMaterial.paymentStatus ? "bg-green-600/30" : "bg-red-600"
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
