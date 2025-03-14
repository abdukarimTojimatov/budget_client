import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_SHARING } from "../graphql/mutations/sharing.mutation";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX } from "react-icons/fi";

const SharingModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [createSharing, { loading }] = useMutation(CREATE_SHARING);
  const [formData, setFormData] = useState({
    sharingDescription: "",
    sharingPaymentType: "plastik",
    sharingCategoryType: "Egamberdi",
    sharingAmount: "",
    sharingDate: new Date(),
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`);
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      sharingDate: date,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sharingDescription.trim()) {
      newErrors.sharingDescription = "Izoh kiritish majburiy";
    }
    
    if (!formData.sharingAmount || isNaN(formData.sharingAmount) || parseFloat(formData.sharingAmount) <= 0) {
      newErrors.sharingAmount = "To'g'ri summa kiriting";
    }
    
    if (!formData.sharingDate) {
      newErrors.sharingDate = "Sana tanlash majburiy";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const sharingData = {
      sharingDescription: formData.sharingDescription,
      sharingPaymentType: formData.sharingPaymentType,
      sharingCategoryType: formData.sharingCategoryType,
      sharingAmount: parseFloat(formData.sharingAmount),
      sharingDate: formatDate(formData.sharingDate),
    };

    try {
      await createSharing({
        variables: { input: sharingData },
        refetchQueries: ["GetSharings", "CategoryStatisticsSharing"],
      });
      toast.success("Muvaffaqiyatli yaratildi");
      onClose();
      navigate("/sharings");
    } catch (error) {
      console.error("Error creating sharing:", error);
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FiX size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-4">
          Yangi ulush qo'shish
        </h2>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {/* Description */}
          <div className="flex flex-col gap-1">
            <label
              className="text-white text-sm font-bold"
              htmlFor="sharingDescription"
            >
              Ulush haqida
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-700 text-white border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500 ${
                  errors.sharingDescription ? "border-red-500" : "border-gray-600"
                }`}
                id="sharingDescription"
                name="sharingDescription"
                type="text"
                placeholder="Izoh yozing"
                value={formData.sharingDescription || ""}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.sharingDescription && (
                <p className="text-red-500 text-xs italic mt-1">{errors.sharingDescription}</p>
              )}
            </div>
          </div>

          {/* Payment Type */}
          <div className="flex flex-col gap-1">
            <label
              className="text-white text-sm font-bold"
              htmlFor="sharingPaymentType"
            >
              To'lov turi
            </label>
            <select
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
              id="sharingPaymentType"
              name="sharingPaymentType"
              value={formData.sharingPaymentType}
              onChange={handleChange}
            >
              <option value="plastik">Plastik</option>
              <option value="naqd">Naqd</option>
            </select>
          </div>
          
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label
              className="text-white text-sm font-bold"
              htmlFor="sharingCategoryType"
            >
              Kim olgan
            </label>
            <select
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
              id="sharingCategoryType"
              name="sharingCategoryType"
              value={formData.sharingCategoryType}
              onChange={handleChange}
            >
              <option value="Egamberdi">Egamberdi</option>
              <option value="Elmurod">Elmurod</option>
              <option value="Rozimuhammad">Rozimuhammad</option>
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label
              className="text-white text-sm font-bold"
              htmlFor="sharingAmount"
            >
              Miqdori (so'm)
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-700 text-white border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500 ${
                  errors.sharingAmount ? "border-red-500" : "border-gray-600"
                }`}
                id="sharingAmount"
                name="sharingAmount"
                type="number"
                placeholder="Summa kiriting"
                value={formData.sharingAmount}
                onChange={handleChange}
              />
              {errors.sharingAmount && (
                <p className="text-red-500 text-xs italic mt-1">{errors.sharingAmount}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label
              className="text-white text-sm font-bold"
              htmlFor="sharingDate"
            >
              Sana
            </label>
            <div>
              <DatePicker
                selected={formData.sharingDate}
                onChange={handleDateChange}
                className={`appearance-none block w-full bg-gray-700 text-white border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 ${
                  errors.sharingDate ? "border-red-500" : "border-gray-600"
                }`}
                dateFormat="yyyy-MM-dd"
                placeholderText="Sanani tanlang"
                id="sharingDate"
                readOnly={true}
                onFocus={(e) => e.target.readOnly = false}
                onBlur={(e) => e.target.readOnly = true}
                popperPlacement="bottom-start"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable={false}
                closeOnScroll={true}
                todayButton="Bugun"
              />
              {errors.sharingDate && (
                <p className="text-red-500 text-xs italic mt-1">{errors.sharingDate}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharingModal;
