import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_DEBT, UPDATE_DEBT, ADD_DEBT_PAYMENT, DELETE_DEBT_PAYMENT } from "../graphql/mutations/debt.mutation";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiPlus, FiDollarSign, FiCalendar, FiPaperclip } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdNote, MdPerson } from "react-icons/md";
import { TbPercentage } from "react-icons/tb";

const DebtModal = ({ isOpen, onClose, debt = null, isEditing = false }) => {
  const [createDebt, { loading: createLoading }] = useMutation(CREATE_DEBT);
  const [updateDebt, { loading: updateLoading }] = useMutation(UPDATE_DEBT);
  const [addDebtPayment, { loading: addPaymentLoading }] = useMutation(ADD_DEBT_PAYMENT);
  const [deleteDebtPayment, { loading: deletePaymentLoading }] = useMutation(DELETE_DEBT_PAYMENT);
  
  // Combined loading state
  const loading = createLoading || updateLoading || addPaymentLoading || deletePaymentLoading;
  
  // Toggle between debt form and payment form in edit mode
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // State for payment form
  const [paymentFormData, setPaymentFormData] = useState({
    paidAmount: "",
    paymentDate: new Date(),
    paymentMethod: "cash",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nameOfDebt: "",
    phoneNumberOfDebt: "",
    totalDebt: "",
    paymentMethodOnTakingDebt: "cash",
    startDate: new Date(),
    dueDate: null,
    notes: "",
    attachments: []
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["totalAmount", "interestRate", "minimumPayment"].includes(name) 
        ? (value ? parseFloat(value) : "") 
        : value,
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

    if (!formData.nameOfDebt.trim()) {
      newErrors.nameOfDebt = "Qarz nomini kiriting";
    }

    if (!formData.phoneNumberOfDebt.trim()) {
      newErrors.phoneNumberOfDebt = "Qarzdor telefon raqamini kiriting";
    }

    if (!formData.totalDebt || isNaN(formData.totalDebt) || parseFloat(formData.totalDebt) <= 0) {
      newErrors.totalDebt = "To'g'ri qarz miqdorini kiriting";
    }

    if (!formData.paymentMethodOnTakingDebt) {
      newErrors.paymentMethodOnTakingDebt = "To'lov usulini tanlang";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Qarz olgan sanani tanlash majburiy";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Qarz to'lash sanasini kiriting";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Effect to initialize form with debt data when in edit mode
  useEffect(() => {
    if (isEditing && debt) {
      // Convert string dates to Date objects
      const startDate = debt.startDate ? new Date(debt.startDate) : new Date();
      const dueDate = debt.dueDate ? new Date(debt.dueDate) : null;
      
      setFormData({
        nameOfDebt: debt.nameOfDebt || "",
        phoneNumberOfDebt: debt.phoneNumberOfDebt || "",
        totalDebt: debt.totalDebt?.toString() || "",
        paymentMethodOnTakingDebt: debt.paymentMethodOnTakingDebt || "cash",
        startDate,
        dueDate,
        notes: debt.notes || "",
        attachments: debt.attachments || []
      });
    }
  }, [debt, isEditing]);

  // Format the dates to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    
    // Prepare common debt data
    const debtData = {
      nameOfDebt: formData.nameOfDebt,
      phoneNumberOfDebt: formData.phoneNumberOfDebt,
      totalDebt: parseFloat(formData.totalDebt),
      paymentMethodOnTakingDebt: formData.paymentMethodOnTakingDebt,
      startDate: formatDate(formData.startDate),
      dueDate: formatDate(formData.dueDate),
      notes: formData.notes,
      attachments: formData.attachments
    };

    try {
      if (isEditing) {
        // Add _id for updating
        const updateData = {
          _id: debt._id,
          ...debtData
        };
        
        await updateDebt({
          variables: { input: updateData },
          refetchQueries: ["GetDebts", "GetDebtStatistics"],
        });
        
        toast.success("Qarz muvaffaqiyatli yangilandi");
      } else {
        // Create new debt
        await createDebt({
          variables: { input: debtData },
          refetchQueries: ["GetDebts", "GetDebtStatistics"],
        });
        
        toast.success("Qarz muvaffaqiyatli yaratildi");
      }
      
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };
  
  // Handle adding a new payment to a debt
  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentFormData.paidAmount || isNaN(paymentFormData.paidAmount) || parseFloat(paymentFormData.paidAmount) <= 0) {
      toast.error("To'g'ri to'lov miqdorini kiriting");
      return;
    }
    
    const paymentData = {
      debtId: debt._id,
      paidAmount: parseFloat(paymentFormData.paidAmount),
      paymentDate: formatDate(paymentFormData.paymentDate),
      paymentMethod: paymentFormData.paymentMethod,
      notes: paymentFormData.notes,
      attachments: []
    };
    
    try {
      await addDebtPayment({
        variables: { input: paymentData },
        refetchQueries: ["GetDebts", "GetDebtStatistics", "GetDebt"],
      });
      
      // Reset payment form
      setPaymentFormData({
        paidAmount: "",
        paymentDate: new Date(),
        paymentMethod: "cash",
        notes: ""
      });
      
      toast.success("To'lov muvaffaqiyatli qo'shildi");
    } catch (error) {
      toast.error(error.message || "To'lov qo'shishda xatolik yuz berdi");
    }
  };
  
  // Function to delete a payment
  const handleDeletePayment = async (paymentIndex) => {
    if (!debt || !debt._id) return;
    
    try {
      await deleteDebtPayment({
        variables: { 
          debtId: debt._id, 
          paymentIndex: paymentIndex 
        },
        refetchQueries: ["GetDebts", "GetDebtStatistics", "GetDebt"],
      });
      
      toast.success("To'lov muvaffaqiyatli o'chirildi");
    } catch (error) {
      toast.error(error.message || "To'lovni o'chirishda xatolik yuz berdi");
    }
  };

  const resetForm = () => {
    setFormData({
      nameOfDebt: "",
      phoneNumberOfDebt: "",
      totalDebt: "",
      paymentMethodOnTakingDebt: "cash",
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
            <FiPlus className="text-red-400 mr-2" size={20} />
            Yangi Qarz qo'shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="w-full max-w-2xl p-6 mx-auto">
          {/* Main form or payment form tabs when editing */}
          {isEditing && (
            <div className="mb-6 border-b border-gray-700 pb-2">
              <div className="flex">
                <button
                  type="button"
                  className={`py-2 px-4 font-medium ${!showPaymentForm ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setShowPaymentForm(false)}
                >
                  Qarz ma'lumotlari
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 font-medium ${showPaymentForm ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setShowPaymentForm(true)}
                >
                  To'lov qo'shish
                </button>
              </div>
            </div>
          )}
          
          {isEditing && showPaymentForm ? (
            // Payment Form
            <form className="flex flex-col gap-6" onSubmit={handleAddPayment}>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MdOutlinePayments className="mr-2 text-red-400" size={20} />
                Yangi to'lov qo'shish
              </h3>
              
              {/* Payment information display */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Umumiy qarz:</span>
                  <span className="text-white font-medium">{debt?.totalDebt?.toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">To'langan:</span>
                  <span className="text-green-400 font-medium">{debt?.paidDebt?.toLocaleString() || 0} UZS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Qolgan summa:</span>
                  <span className="text-red-400 font-medium">{debt?.leftDebt?.toLocaleString() || debt?.totalDebt?.toLocaleString()} UZS</span>
                </div>
              </div>
              
              {/* Payment Amount */}
              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center text-white text-sm font-bold"
                  htmlFor="paidAmount"
                >
                  <FiDollarSign className="mr-2 text-red-400" size={18} />
                  To'lov miqdori
                </label>
                <input
                  id="paidAmount"
                  type="number"
                  name="paidAmount"
                  value={paymentFormData.paidAmount}
                  onChange={(e) => setPaymentFormData({...paymentFormData, paidAmount: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  placeholder="To'lov miqdorini kiriting"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* Payment Date */}
              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center text-white text-sm font-bold"
                  htmlFor="paymentDate"
                >
                  <FiCalendar className="mr-2 text-red-400" size={18} />
                  To'lov sanasi
                </label>
                <DatePicker
                  id="paymentDate"
                  selected={paymentFormData.paymentDate}
                  onChange={(date) => setPaymentFormData({...paymentFormData, paymentDate: date})}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              
              {/* Payment Method */}
              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center text-white text-sm font-bold"
                  htmlFor="paymentMethod"
                >
                  <MdOutlinePayments className="mr-2 text-red-400" size={18} />
                  To'lov usuli
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentFormData.paymentMethod}
                  onChange={(e) => setPaymentFormData({...paymentFormData, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  <option value="cash">Naqd pul</option>
                  <option value="bank_transfer">Bank o'tkazmasi</option>
                  <option value="credit_card">Kredit karta</option>
                </select>
              </div>
              
              {/* Notes */}
              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center text-white text-sm font-bold"
                  htmlFor="paymentNotes"
                >
                  <MdNote className="mr-2 text-red-400" size={18} />
                  Izohlar
                </label>
                <textarea
                  id="paymentNotes"
                  name="notes"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  placeholder="To'lov haqida izohlar"
                  rows="2"
                />
              </div>
              
              {/* Payment History */}
              {debt?.paidDebts && debt.paidDebts.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-white font-medium mb-2">To'lovlar tarixi</h4>
                  <div className="max-h-40 overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-700 divide-y divide-gray-700">
                    {debt.paidDebts.map((payment, index) => (
                      <div key={index} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">
                            {payment.paidAmount?.toLocaleString()} UZS
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  disabled={addPaymentLoading}
                  className="px-6 py-2 rounded bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {addPaymentLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      To'lov qo'shilmoqda...
                    </>
                  ) : (
                    "To'lovni qo'shish"
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Main Debt Form
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Debt Name */}
              <div className="flex flex-col gap-2">
                <label
                  className="flex items-center text-white text-sm font-bold"
                  htmlFor="nameOfDebt"
                >
                  <MdDescription className="mr-2 text-red-400" size={18} />
                  Qarz nomi
                </label>
                <div>
                  <input
                    id="nameOfDebt"
                    type="text"
                    name="nameOfDebt"
                    value={formData.nameOfDebt}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                    placeholder="Masalan: Ipoteka qarz"
                  />
                  {errors.nameOfDebt && (
                    <p className="text-red-400 text-xs mt-1">{errors.nameOfDebt}</p>
                  )}
                </div>
              </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="phoneNumberOfDebt"
            >
              <MdPerson className="mr-2 text-red-400" size={18} />
              Qarzdor telefon raqami
            </label>
            <div>
              <input
                id="phoneNumberOfDebt"
                type="text"
                name="phoneNumberOfDebt"
                value={formData.phoneNumberOfDebt}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                placeholder="Masalan: +998 90 123 45 67"
              />
              {errors.phoneNumberOfDebt && (
                <p className="text-red-400 text-xs mt-1">{errors.phoneNumberOfDebt}</p>
              )}
            </div>
          </div>

          {/* Amount & Payment Method Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Debt */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="totalDebt"
              >
                <FiDollarSign className="mr-2 text-red-400" size={18} />
                Qarz miqdori
              </label>
              <div>
                <input
                  id="totalDebt"
                  type="number"
                  name="totalDebt"
                  value={formData.totalDebt}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  placeholder="Miqdor"
                  min="0"
                  step="0.01"
                />
                {errors.totalDebt && (
                  <p className="text-red-400 text-xs mt-1">{errors.totalDebt}</p>
                )}
              </div>
            </div>

            {/* Payment Method When Taking Debt */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="paymentMethodOnTakingDebt"
              >
                <MdOutlinePayments className="mr-2 text-red-400" size={18} />
                To'lov usuli
              </label>
              <div>
                <select
                  id="paymentMethodOnTakingDebt"
                  name="paymentMethodOnTakingDebt"
                  value={formData.paymentMethodOnTakingDebt}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  <option value="cash">Naqd pul</option>
                  <option value="bank_transfer">Bank o'tkazmasi</option>
                  <option value="credit_card">Kredit karta</option>
                </select>
                {errors.paymentMethodOnTakingDebt && (
                  <p className="text-red-400 text-xs mt-1">{errors.paymentMethodOnTakingDebt}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="startDate"
              >
                <FiCalendar className="mr-2 text-red-400" size={18} />
                Qarz olingan sana
              </label>
              <div>
                <DatePicker
                  id="startDate"
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, "startDate")}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  dateFormat="dd/MM/yyyy"
                />
                {errors.startDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="dueDate"
              >
                <FiCalendar className="mr-2 text-red-400" size={18} />
                To'lash sanasi
              </label>
              <div>
                <DatePicker
                  id="dueDate"
                  selected={formData.dueDate}
                  onChange={(date) => handleDateChange(date, "dueDate")}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="To'lash sanasini tanlang"
                  minDate={formData.startDate}
                />
                {errors.dueDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="notes"
            >
              <MdNote className="mr-2 text-red-400" size={18} />
              Izohlar
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
              placeholder="Qo'shimcha ma'lumotlar"
              rows="2"
            />
          </div>

          {/* File Attachments - simplified version*/}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="attachments"
            >
              <FiPaperclip className="mr-2 text-red-400" size={18} />
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
                Hujjatlar va rasmlarni biriktiring
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
              className="py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtModal;
