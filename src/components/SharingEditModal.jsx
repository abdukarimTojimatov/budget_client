import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_SHARING } from "../graphql/mutations/sharing.mutation";
import {
  GET_SHARING,
  GET_SHARINGS_STATISTICS,
} from "../graphql/queries/sharing.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiDollarSign, FiCalendar, FiEdit2 } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdCategory } from "react-icons/md";
import { FaRegCreditCard, FaMoneyBillWave, FaUser } from "react-icons/fa";

const SharingEditModal = ({ isOpen, onClose, sharingId }) => {
  const [updateSharing, { loading: loadingUpdate }] =
    useMutation(UPDATE_SHARING);
  const [errors, setErrors] = useState({});

  const {
    loading: loadingData,
    data,
    error,
  } = useQuery(GET_SHARING, {
    variables: { id: sharingId },
    skip: !sharingId,
    onError: (error) => {
      console.error("Error fetching sharing data:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      onClose();
    },
    fetchPolicy: "network-only", // Don't use cache for this query
  });

  const [formData, setFormData] = useState({
    sharingDescription: "",
    sharingPaymentType: "plastik",
    sharingCategoryType: "",
    sharingAmount: "",
    sharingDate: new Date(),
  });

  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    // Only load data once when the modal opens
    if (!initialDataLoaded && data?.getSharing) {
      console.log("Loading initial sharing data...");

      // Check for data loading error
      if (error) {
        console.error("GraphQL error fetching sharing:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        return;
      }

      const sharing = data.getSharing;
      console.log("Fetched sharing:", sharing);

      try {
        const newFormData = {
          sharingDescription: sharing.sharingDescription || "",
          sharingPaymentType: sharing.sharingPaymentType || "plastik",
          sharingCategoryType: sharing.sharingCategoryType || "",
          sharingAmount: sharing.sharingAmount || 0,
          sharingDate: sharing.sharingDate
            ? new Date(sharing.sharingDate)
            : new Date(),
        };

        console.log("Setting initial form data:", newFormData);
        setFormData(newFormData);
        setInitialDataLoaded(true); // Mark that we've loaded the initial data
      } catch (err) {
        console.error("Error loading sharing data:", err);
        toast.error(
          "Ma'lumotlarni yuklashda xatolik. Iltimos, qayta urinib ko'ring"
        );
        onClose();
      }
    }
  }, [data, error, initialDataLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} from ${formData[name]} to ${value}`);

    setFormData((prevState) => {
      const newState = {
        ...prevState,
        [name]: value,
      };
      console.log("Updated form state:", newState);
      return newState;
    });

    // Clear any error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleDateChange = (date) => {
    console.log("Changing date from:", formData.sharingDate, "to:", date);

    setFormData((prevState) => {
      const newState = {
        ...prevState,
        sharingDate: date,
      };
      console.log("Updated form state (date):", newState);
      return newState;
    });

    // Clear date error if exists
    if (errors.sharingDate) {
      setErrors({
        ...errors,
        sharingDate: "",
      });
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
    } else if (
      isNaN(parseFloat(formData.sharingAmount)) ||
      parseFloat(formData.sharingAmount) <= 0
    ) {
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

  // Check if form data has changed from original
  const hasFormChanged = (originalData, currentData) => {
    // Convert original data to comparable format
    const originalFormatted = {
      sharingDescription: originalData.sharingDescription || "",
      sharingPaymentType: originalData.sharingPaymentType || "plastik",
      sharingCategoryType: originalData.sharingCategoryType || "",
      sharingAmount: parseFloat(originalData.sharingAmount) || 0,
      sharingDate: originalData.sharingDate || "",
    };

    // Check if any field is different
    return (
      originalFormatted.sharingDescription !== currentData.sharingDescription ||
      originalFormatted.sharingPaymentType !== currentData.sharingPaymentType ||
      originalFormatted.sharingCategoryType !==
        currentData.sharingCategoryType ||
      originalFormatted.sharingAmount !==
        parseFloat(currentData.sharingAmount) ||
      originalFormatted.sharingDate !== formatDate(currentData.sharingDate)
    );
  };

  // Update sharing handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submit clicked with form data:", formData);

    if (!validateForm()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    // Check if form data has actually changed from the original
    if (data?.getSharing && !hasFormChanged(data.getSharing, formData)) {
      console.log("No changes detected in form");
      toast.info("O'zgarishlar aniqlanmadi");
      return;
    }

    const formattedDate = formatDate(formData.sharingDate);

    // Ensure we have the correct structure for the update mutation
    // Convert amount to number explicitly to avoid string issues
    const amountValue =
      typeof formData.sharingAmount === "string"
        ? parseFloat(formData.sharingAmount)
        : formData.sharingAmount;

    // Force all fields to be included and properly formatted
    const sharingData = {
      _id: sharingId,
      sharingDescription: String(formData.sharingDescription || ""),
      sharingPaymentType: String(formData.sharingPaymentType || "plastik"),
      sharingCategoryType: formData.sharingCategoryType || "",
      sharingAmount: amountValue,
      sharingDate: formattedDate,
    };

    console.log("Form data being processed:", formData);
    console.log("Final update data being sent to server:", sharingData);

    try {
      console.log("Calling updateSharing mutation with data:", sharingData);
      const { data: updateData } = await updateSharing({
        variables: { input: sharingData },
        refetchQueries: [{ query: GET_SHARINGS_STATISTICS }],
        errorPolicy: "all",
      });
      console.log("Update mutation response:", updateData);

      if (updateData && updateData.updateSharing) {
        toast.success("Muvaffaqiyatli yangilandi");
        onClose();
      } else {
        toast.error("Yangilashda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error updating sharing:", error);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Noma'lum xatolik";
      toast.error(`Xatolik yuz berdi: ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700/30">
        <div className="sticky top-0 bg-gradient-to-r from-blue-900/90 to-gray-900 p-4 border-b border-gray-700/50 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiEdit2 className="text-blue-400 mr-2" size={20} />
            Sharing tahrirlash
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
          >
            <FiX size={24} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center p-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form
            className="w-full max-w-2xl flex flex-col gap-6 p-6 mx-auto bg-gray-900"
            onSubmit={handleSubmit}
          >
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
                  className={`appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-blue-500 ${
                    errors.sharingDescription ? "border-red-500" : ""
                  }`}
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
                    className={`block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-blue-500 ${
                      errors.sharingCategoryType ? "border-red-500" : ""
                    }`}
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
                    className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 pl-4 pr-10 leading-tight focus:outline-none focus:border-blue-500 ${
                      errors.sharingAmount ? "border-red-500" : ""
                    }`}
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
                    className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-blue-500 ${
                      errors.sharingDate ? "border-red-500" : ""
                    }`}
                    placeholderText="Sanani tanlang"
                    readOnly={true}
                    onFocus={(e) => (e.target.readOnly = false)}
                    onBlur={(e) => (e.target.readOnly = true)}
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
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Yangilanmoqda...
                  </>
                ) : (
                  "Yangilash"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SharingEditModal;
