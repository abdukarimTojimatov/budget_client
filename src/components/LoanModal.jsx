import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_LOAN } from "../graphql/mutations/loan.mutation";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiPlus, FiDollarSign, FiCalendar, FiPaperclip, FiPhone, FiMail, FiTag } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdNote, MdPerson } from "react-icons/md";
import { TbPercentage } from "react-icons/tb";

const LoanModal = ({ isOpen, onClose }) => {
  const [createLoan, { loading }] = useMutation(CREATE_LOAN);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nameOfLoan: "",
    phoneNumberOfLoan: "",
    totalLoan: "",
    paymentMethodOnGivingLoan: "cash", // cash, bank_transfer, credit_card
    startDate: new Date(),
    dueDate: null,
    notes: "",
    attachments: []
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle regular properties
    setFormData({
      ...formData,
      [name]: ["totalLoan"].includes(name) 
        ? isNaN(parseFloat(value)) ? 0 : parseFloat(value)
        : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };
  
  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
    // Clear date error if exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nameOfLoan.trim()) {
      newErrors.nameOfLoan = "Kredit nomi kiritilishi shart";
    }
    
    if (!formData.phoneNumberOfLoan.trim()) {
      newErrors.phoneNumberOfLoan = "Telefon raqam kiritilishi shart";
    }
    
    if (!formData.totalLoan || formData.totalLoan <= 0) {
      newErrors.totalLoan = "Umumiy summa 0 dan katta bo'lishi kerak";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "To'lov sanasi tanlanishi kerak";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    
    try {
      const { data } = await createLoan({
        variables: {
          input: {
            nameOfLoan: formData.nameOfLoan,
            phoneNumberOfLoan: formData.phoneNumberOfLoan,
            totalLoan: parseFloat(formData.totalLoan),
            paymentMethodOnGivingLoan: formData.paymentMethodOnGivingLoan,
            startDate: formData.startDate,
            dueDate: formData.dueDate,
            notes: formData.notes,
            attachments: formData.attachments
          }
        },
        refetchQueries: ["GetLoans", "GetLoanStatistics"]
      });
      
      toast.success("Kredit muvaffaqiyatli yaratildi");
      onClose();
    } catch (error) {
      console.error("Error creating loan:", error);
      toast.error(error.message || "Kredit yaratishda xatolik yuz berdi");
    }
  };

  const resetForm = () => {
    setFormData({
      nameOfLoan: "",
      phoneNumberOfLoan: "",
      totalLoan: "",
      paymentMethodOnGivingLoan: "cash", // cash, bank_transfer, credit_card
      startDate: new Date(),
      dueDate: null,
      notes: "",
      attachments: []
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700/30">
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700/50 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiPlus className="text-green-400 mr-2" size={20} />
            Yangi Kredit qo'shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
          >
            <FiX size={24} />
          </button>
        </div>

        <form className="w-full max-w-2xl flex flex-col gap-6 p-6 mx-auto" onSubmit={handleSubmit}>
          {/* Loan Name and Phone Number */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Loan Name */}
            <div className="flex-1">
              <label className="flex items-center text-white text-sm font-bold mb-2" htmlFor="nameOfLoan">
                <FiTag className="mr-2 text-green-400" size={18} />
                Kredit nomi
              </label>
              <input
                className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500 ${errors.nameOfLoan ? "border-red-500" : ""}`}
                id="nameOfLoan"
                name="nameOfLoan"
                type="text"
                placeholder="Kredit nomini kiriting"
                value={formData.nameOfLoan}
                onChange={handleChange}
              />
              {errors.nameOfLoan && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FiX className="mr-1" /> {errors.nameOfLoan}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex-1">
              <label className="flex items-center text-white text-sm font-bold mb-2" htmlFor="phoneNumberOfLoan">
                <FiPhone className="mr-2 text-green-400" size={18} />
                Telefon raqami
              </label>
              <input
                className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500 ${errors.phoneNumberOfLoan ? "border-red-500" : ""}`}
                id="phoneNumberOfLoan"
                name="phoneNumberOfLoan"
                type="text"
                placeholder="+998901234567"
                value={formData.phoneNumberOfLoan}
                onChange={handleChange}
              />
              {errors.phoneNumberOfLoan && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FiX className="mr-1" /> {errors.phoneNumberOfLoan}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Interest Rate */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Amount */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="totalLoan"
              >
                <FiDollarSign className="mr-2 text-green-400" size={18} />
                Umumiy miqdor
              </label>
              <div className="relative">
                <input
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 pl-4 pr-10 leading-tight focus:outline-none focus:border-green-500 ${errors.totalLoan ? "border-red-500" : ""}`}
                  id="totalLoan"
                  name="totalLoan"
                  type="number"
                  placeholder="Summa kiriting"
                  value={formData.totalLoan}
                  onChange={handleChange}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <span className="text-xs">UZS</span>
                </div>
                {errors.totalLoan && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.totalLoan}
                  </p>
                )}
              </div>
            </div>

            {/* Placeholder yangi loyiha uchun, bo'sh div */}
            <div className="flex-1">
              {/* Bo'sh tursin */}
            </div>
          </div>

          {/* Start Date and Due Date */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Start Date */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="startDate"
              >
                <FiCalendar className="mr-2 text-green-400" size={18} />
                Boshlang'ich sana
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, "startDate")}
                  dateFormat="yyyy-MM-dd"
                  name="startDate"
                  id="startDate"
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500 ${errors.startDate ? "border-red-500" : ""}`}
                  placeholderText="Sanani tanlang"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FiCalendar size={16} />
                </div>
                {errors.startDate && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.startDate}
                  </p>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="dueDate"
              >
                <FiCalendar className="mr-2 text-green-400" size={18} />
                So'nggi to'lov sanasi
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.dueDate}
                  onChange={(date) => handleDateChange(date, "dueDate")}
                  dateFormat="yyyy-MM-dd"
                  name="dueDate"
                  id="dueDate"
                  className="appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500"
                  placeholderText="Sanani tanlang (ixtiyoriy)"
                  minDate={formData.startDate}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FiCalendar size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold mb-2"
              htmlFor="paymentMethodOnGivingLoan"
            >
              <MdOutlinePayments className="mr-2 text-green-400" size={18} />
              To'lov usuli
            </label>
            <div className="relative">
              <select
                className="block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-green-500"
                id="paymentMethodOnGivingLoan"
                name="paymentMethodOnGivingLoan"
                value={formData.paymentMethodOnGivingLoan}
                onChange={handleChange}
              >
                <option value="cash">Naqd pul</option>
                <option value="bank_transfer">Bank o'tkazmasi</option>
                <option value="credit_card">Kredit karta</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expected Payment */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="expectedPayment"
            >
              <FiDollarSign className="mr-2 text-green-400" size={18} />
              Kutilayotgan to'lov miqdori
            </label>
            <div className="relative">
              <input
                className="appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 pl-4 pr-10 leading-tight focus:outline-none focus:border-green-500"
                id="expectedPayment"
                name="expectedPayment"
                type="number"
                placeholder="Kutilayotgan to'lov miqdorini kiriting"
                value={formData.expectedPayment}
                onChange={handleChange}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <span className="text-xs">UZS</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="description"
            >
              <MdDescription className="mr-2 text-green-400" size={18} />
              Tavsif
            </label>
            <textarea
              className="appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500"
              id="description"
              name="description"
              rows="2"
              placeholder="Kredit haqida tavsif"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="notes"
            >
              <MdNote className="mr-2 text-green-400" size={18} />
              Qo'shimcha izohlar
            </label>
            <textarea
              className="appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500"
              id="notes"
              name="notes"
              rows="3"
              placeholder="Qo'shimcha ma'lumotlar uchun izoh"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* File Attachments - simplified version*/}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="attachments"
            >
              <FiPaperclip className="mr-2 text-green-400" size={18} />
              Fayllar biriktirish
            </label>
            <div className="flex items-center">
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                onClick={() => {
                  // In a real implementation, this would open a file picker
                  // For now, we'll just add a placeholder
                  toast.info("Fayl yuklash funksiyasi ishlab chiqilmoqda");
                }}
              >
                <FiPaperclip size={16} />
                Fayl tanlash
              </button>
              <span className="ml-3 text-gray-400 text-sm">
                {formData.attachments.length > 0 
                  ? `${formData.attachments.length} ta fayl tanlangan` 
                  : "Fayllar biriktirilmagan"}
              </span>
            </div>
          </div>
          
          {/* Submit Button */}
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
              className="py-3 px-4 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Saqlanmoqda...
                </>
              ) : (
                "Saqlash"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;
