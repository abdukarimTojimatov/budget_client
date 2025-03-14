import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_SHARING } from "../graphql/mutations/sharing.mutation";
import { GET_SHARINGS_STATISTICS } from "../graphql/queries/sharing.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX } from "react-icons/fi";

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
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">
            Yangi ulush qo'shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form className="w-full max-w-2xl flex flex-col gap-6 p-6 mx-auto" onSubmit={handleSubmit}>
          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              className="block uppercase tracking-wide text-white text-sm font-bold"
              htmlFor="sharingDescription"
            >
              Izoh
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.sharingDescription ? "border-red-500" : ""}`}
                id="sharingDescription"
                name="sharingDescription"
                type="text"
                placeholder="Izoh yozing"
                value={formData.sharingDescription}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.sharingDescription && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.sharingDescription}
                </p>
              )}
            </div>
          </div>

          {/* Payment Type and Category */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Payment Type */}
            <div className="flex-1">
              <label
                className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
                htmlFor="sharingPaymentType"
              >
                To'lov turi
              </label>
              <div className="relative">
                <select
                  className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.sharingPaymentType ? "border-red-500" : ""}`}
                  id="sharingPaymentType"
                  name="sharingPaymentType"
                  value={formData.sharingPaymentType}
                  onChange={handleChange}
                >
                  <option value="plastik">Plastik</option>
                  <option value="naqd">Naqd</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.sharingPaymentType && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.sharingPaymentType}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="flex-1">
              <label
                className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
                htmlFor="sharingCategoryType"
              >
                Kategoriya
              </label>
              <div className="relative">
                <select
                  className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.sharingCategoryType ? "border-red-500" : ""}`}
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.sharingCategoryType && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.sharingCategoryType}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Date */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Amount */}
            <div className="flex-1">
              <label
                className="block uppercase text-white text-sm font-bold mb-2"
                htmlFor="sharingAmount"
              >
                Miqdori (so'm)
              </label>
              <div>
                <input
                  className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.sharingAmount ? "border-red-500" : ""}`}
                  id="sharingAmount"
                  name="sharingAmount"
                  type="number"
                  placeholder="Summa kiriting"
                  value={formData.sharingAmount}
                  onChange={handleChange}
                />
                {errors.sharingAmount && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.sharingAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <label
                className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
                htmlFor="sharingDate"
              >
                Sana
              </label>
              <div>
                <DatePicker
                  selected={formData.sharingDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  name="sharingDate"
                  id="sharingDate"
                  className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${errors.sharingDate ? "border-red-500" : ""}`}
                  placeholderText="Sanani tanlang"
                  readOnly={true}
                  onFocus={(e) => e.target.readOnly = false}
                  onBlur={(e) => e.target.readOnly = true}
                  popperPlacement="bottom-start"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                {errors.sharingDate && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.sharingDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Qo'shilmoqda..." : "Qo'shish"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded bg-gray-600 hover:bg-gray-500 text-white font-bold"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharingCreateModal;
