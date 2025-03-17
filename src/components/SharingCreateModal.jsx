import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_SHARING } from "../graphql/mutations/sharing.mutation";
import { GET_SHARINGS_STATISTICS } from "../graphql/queries/sharing.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiDollarSign, FiCalendar, FiPlus } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdCategory } from "react-icons/md";
import { FaRegCreditCard, FaMoneyBillWave } from "react-icons/fa";

const SharingCreateModal = ({ isOpen, onClose }) => {
  const [createSharing, { loading }] = useMutation(CREATE_SHARING);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    sharingDescription: "",
    sharingPaymentType: "plastik",
    sharingCategoryType: "",
    sharingAmount: "",
    sharingDate: new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData(prevState => ({
      ...prevState,
      sharingDate: date,
    }));
    
    // Clear date error if exists
    if (errors.sharingDate) {
      setErrors({
        ...errors,
        sharingDate: "",
      });
    }
  };

  // Format the date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return null;
    }
  };

  // Validate the form before submission
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    if (!formData.sharingDescription) {
      newErrors.sharingDescription = "Izoh kiritilishi shart";
      isValid = false;
    }
    
    if (!formData.sharingCategoryType) {
      newErrors.sharingCategoryType = "Kategoriya tanlanishi shart";
      isValid = false;
    }
    
    if (!formData.sharingAmount) {
      newErrors.sharingAmount = "Miqdori kiritilishi shart";
      isValid = false;
    } else if (isNaN(parseFloat(formData.sharingAmount)) || parseFloat(formData.sharingAmount) <= 0) {
      newErrors.sharingAmount = "Noto'g'ri miqdor kiritildi";
      isValid = false;
    }
    
    if (!formData.sharingDate) {
      newErrors.sharingDate = "Sana kiritilishi shart";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Create sharing handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    
    const formattedDate = formatDate(formData.sharingDate);

    // Convert amount to number explicitly
    const amountValue = typeof formData.sharingAmount === 'string' 
      ? parseFloat(formData.sharingAmount) 
      : formData.sharingAmount;
      
    // Prepare data for the mutation
    const sharingData = {
      sharingDescription: String(formData.sharingDescription || ""),
      sharingPaymentType: String(formData.sharingPaymentType || "plastik"),
      sharingCategoryType: formData.sharingCategoryType || "",
      sharingAmount: amountValue,
      sharingDate: formattedDate
    };

    try {
      const { data: createData } = await createSharing({
        variables: { input: sharingData },
        refetchQueries: [{ query: GET_SHARINGS_STATISTICS }],
        errorPolicy: 'all'
      });

      if (createData && createData.createSharing) {
        toast.success("Ulush muvaffaqiyatli qo'shildi");
        
        // Reset the form
        setFormData({
          sharingDescription: "",
          sharingPaymentType: "plastik",
          sharingCategoryType: "",
          sharingAmount: "",
          sharingDate: new Date(),
        });
        
        onClose();
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error creating sharing:", error);
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message || "Noma'lum xatolik";
      toast.error(`Xatolik yuz berdi: ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700/30">
        <div className="sticky top-0 bg-gradient-to-r from-blue-900/90 to-gray-900 p-4 border-b border-gray-700/50 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiPlus className="text-blue-400 mr-2" size={20} />
            Yangi ulush qo'shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
          >
            <FiX size={24} />
          </button>
        </div>

        <form className="w-full max-w-2xl flex flex-col gap-6 p-6 mx-auto bg-gray-900" onSubmit={handleSubmit}>
          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-blue-300 text-sm font-bold"
              htmlFor="sharingDescription"
            >
              <MdDescription className="mr-2 text-blue-400" size={18} />
              Izoh
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-blue-500 ${errors.sharingDescription ? "border-red-500" : ""}`}
                id="sharingDescription"
                name="sharingDescription"
                type="text"
                placeholder="Izoh yozing"
                value={formData.sharingDescription}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.sharingDescription && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FiX className="mr-1" /> {errors.sharingDescription}
                </p>
              )}
            </div>
          </div>

          {/* Payment Type and Category */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Payment Type */}
            <div className="flex-1">
              <label
                className="flex items-center text-blue-300 text-sm font-bold mb-2"
                htmlFor="sharingPaymentType"
              >
                <MdOutlinePayments className="mr-2 text-blue-400" size={18} />
                To'lov turi
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-blue-500"
                  id="sharingPaymentType"
                  name="sharingPaymentType"
                  value={formData.sharingPaymentType}
                  onChange={handleChange}
                >
                  <option value="plastik">Plastik</option>
                  <option value="naqd">Naqd</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  {formData.sharingPaymentType === "plastik" ? 
                    <FaRegCreditCard className="text-blue-400" size={16} /> : 
                    <FaMoneyBillWave className="text-green-400" size={16} />}
                </div>
              </div>
              {errors.sharingPaymentType && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FiX className="mr-1" /> {errors.sharingPaymentType}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="flex-1">
              <label
                className="flex items-center text-blue-300 text-sm font-bold mb-2"
                htmlFor="sharingCategoryType"
              >
                <MdCategory className="mr-2 text-blue-400" size={18} />
                Kategoriya
              </label>
              <div className="relative">
                <select
                  className={`block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-blue-500 ${errors.sharingCategoryType ? "border-red-500" : ""}`}
                  id="sharingCategoryType"
                  name="sharingCategoryType"
                  value={formData.sharingCategoryType}
                  onChange={handleChange}
                >
                  <option value="">Kategoriya tanlang</option>
                  <option value="Egamberdi">Egamberdi</option>
                  <option value="Elmurod">Elmurod</option>
                  <option value="Rozimuhammad">Rozimuhammad</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <MdCategory className="text-blue-400" size={16} />
                </div>
              </div>
              {errors.sharingCategoryType && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FiX className="mr-1" /> {errors.sharingCategoryType}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Date */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Amount */}
            <div className="flex-1">
              <label
                className="flex items-center text-blue-300 text-sm font-bold mb-2"
                htmlFor="sharingAmount"
              >
                <FiDollarSign className="mr-2 text-blue-400" size={18} />
                Miqdori (so'm)
              </label>
              <div className="relative">
                <input
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 pl-4 pr-10 leading-tight focus:outline-none focus:border-blue-500 ${errors.sharingAmount ? "border-red-500" : ""}`}
                  id="sharingAmount"
                  name="sharingAmount"
                  type="number"
                  placeholder="Summa kiriting"
                  value={formData.sharingAmount}
                  onChange={handleChange}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <span className="text-xs">UZS</span>
                </div>
                {errors.sharingAmount && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.sharingAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <label
                className="flex items-center text-blue-300 text-sm font-bold mb-2"
                htmlFor="sharingDate"
              >
                <FiCalendar className="mr-2 text-blue-400" size={18} />
                Sana
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.sharingDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  name="sharingDate"
                  id="sharingDate"
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-blue-500 ${errors.sharingDate ? "border-red-500" : ""}`}
                  placeholderText="Sanani tanlang"
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
                  inline={false}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FiCalendar size={16} />
                </div>
                {errors.sharingDate && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.sharingDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium transition-colors duration-200 border border-gray-600/50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Qo'shilmoqda...
                </>
              ) : (
                "Qo'shish"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharingCreateModal;
