import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_INCOME } from "../graphql/mutations/income.mutation";
import { GET_CATEGORIES } from "../graphql/queries/category.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "./CategoryForm";
import { FiX, FiPlus, FiDollarSign, FiCalendar, FiPaperclip, FiRepeat } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdCategory, MdAddCircleOutline, MdNote } from "react-icons/md";
import { FaRegCreditCard, FaMoneyBillWave, FaRegMoneyBillAlt } from "react-icons/fa";

const IncomeModal = ({ isOpen, onClose }) => {
  const [createIncome, { loading }] = useMutation(CREATE_INCOME);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    description: "",
    receiptMethod: "bank_transfer",
    category: "",
    amount: "",
    date: new Date(),
    recurring: false,
    recurringPeriod: "none",
    notes: "",
    attachments: []
  });
  
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useQuery(
    GET_CATEGORIES,
    {
      variables: { type: "income" },
      fetchPolicy: "network-only",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? (value ? parseFloat(value) : "") : value,
    });
    
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
      date: date,
    });
    // Clear date error if exists
    if (errors.date) {
      setErrors({
        ...errors,
        date: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Daromad haqida ma'lumot kiriting";
    }

    if (!formData.category) {
      newErrors.category = "Kategoriyani tanlang";
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "To'g'ri miqdorni kiriting";
    }

    if (!formData.date) {
      newErrors.date = "Sana tanlash majburiy";
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
    
    // Format the date to YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    
    const formattedDate = formatDate(formData.date);

    const incomeData = {
      description: formData.description,
      receiptMethod: formData.receiptMethod,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formattedDate,
      recurring: formData.recurring,
      recurringPeriod: formData.recurring ? formData.recurringPeriod : "none",
      notes: formData.notes,
      attachments: formData.attachments
    };

    try {
      await createIncome({
        variables: { input: incomeData },
        refetchQueries: ["GetIncomes", "GetIncomesStatistics"],
      });

      toast.success("Daromad muvaffaqiyatli yaratildi");
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      receiptMethod: "bank_transfer",
      category: "",
      amount: "",
      date: new Date(),
      recurring: false,
      recurringPeriod: "none",
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
            Yangi Daromad qo'shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
          >
            <FiX size={24} />
          </button>
        </div>

        <form className="w-full max-w-2xl flex flex-col gap-6 p-6 mx-auto" onSubmit={handleSubmit}>
          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              className="flex items-center text-white text-sm font-bold"
              htmlFor="description"
            >
              <MdDescription className="mr-2 text-green-400" size={18} />
              Daromad haqida
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500 ${errors.description ? "border-red-500" : ""}`}
                id="description"
                name="description"
                type="text"
                placeholder="Izoh yozing"
                value={formData.description}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FiX className="mr-1" /> {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Receipt Method and Category */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Receipt Method */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="receiptMethod"
              >
                <MdOutlinePayments className="mr-2 text-green-400" size={18} />
                Qabul qilish usuli
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-green-500"
                  id="receiptMethod"
                  name="receiptMethod"
                  value={formData.receiptMethod}
                  onChange={handleChange}
                >
                  <option value="bank_transfer">Bank o'tkazmasi</option>
                  <option value="cash">Naqd pul</option>
                  <option value="digital_wallet">Elektron hamyon</option>
                  <option value="other">Boshqa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  {formData.receiptMethod === "bank_transfer" ? 
                    <FaRegCreditCard className="text-green-400" size={16} /> : 
                    <FaMoneyBillWave className="text-green-400" size={16} />}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="category"
              >
                <MdCategory className="mr-2 text-green-400" size={18} />
                Kategoriya
              </label>
              <div className="flex">
                <div className="relative w-full">
                  <select
                    className={`block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 rounded-l-lg leading-tight focus:outline-none focus:border-green-500 ${errors.category ? "border-red-500" : ""}`}
                    id="category"
                    name="category"
                    disabled={categoriesLoading}
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">{categoriesLoading ? "Yuklanmoqda..." : "Tanlang"}</option>
                    {!categoriesLoading && categoriesData?.getCategories?.docs?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                    {!categoriesLoading && (!categoriesData?.getCategories?.docs || categoriesData.getCategories.docs.length === 0) && (
                      <option value="" disabled>Kategoriyalar topilmadi</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <MdCategory className="text-green-400" size={16} />
                  </div>
                  {errors.category && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <FiX className="mr-1" /> {errors.category}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-green-600/80 hover:bg-green-700/90 text-white font-medium flex items-center justify-center py-3 px-3 rounded-r-lg focus:outline-none transition-colors duration-200"
                  title="Yangi kategoriya qo'shish"
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Amount */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="amount"
              >
                <FiDollarSign className="mr-2 text-green-400" size={18} />
                Miqdori (so'm)
              </label>
              <div className="relative">
                <input
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 pl-4 pr-10 leading-tight focus:outline-none focus:border-green-500 ${errors.amount ? "border-red-500" : ""}`}
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Summa kiriting"
                  value={formData.amount}
                  onChange={handleChange}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <span className="text-xs">UZS</span>
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.amount}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="date"
              >
                <FiCalendar className="mr-2 text-green-400" size={18} />
                Sana
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  name="date"
                  id="date"
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-green-500 ${errors.date ? "border-red-500" : ""}`}
                  placeholderText="Sanani tanlang"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FiCalendar size={16} />
                </div>
                {errors.date && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recurring Options */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <label htmlFor="recurring" className="flex items-center text-white text-sm font-bold mr-4">
                <FiRepeat className="mr-2 text-green-400" size={18} />
                Takrorlanuvchi daromad
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="recurring" 
                  name="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
                  className="opacity-0 absolute h-0 w-0" 
                />
                <div className={`block w-12 h-6 rounded-full ${formData.recurring ? 'bg-green-500' : 'bg-gray-600'} cursor-pointer transition-colors duration-200`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${formData.recurring ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </div>
            
            {formData.recurring && (
              <div className="ml-6 mt-2">
                <label className="text-white text-sm mb-1 block">Takrorlanish davri</label>
                <select
                  className="block appearance-none w-full max-w-xs bg-gray-800/50 border border-gray-600 text-white py-2 px-3 rounded-lg leading-tight focus:outline-none focus:border-green-500"
                  name="recurringPeriod"
                  value={formData.recurringPeriod}
                  onChange={handleChange}
                >
                  <option value="daily">Har kuni</option>
                  <option value="weekly">Har hafta</option>
                  <option value="monthly">Har oy</option>
                  <option value="quarterly">Har chorak</option>
                  <option value="yearly">Har yil</option>
                </select>
              </div>
            )}
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
              className="py-3 px-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm 
          onClose={() => setShowCategoryForm(false)} 
          onCategoryCreated={(newCategory) => {
            // Auto-select the newly created category
            setFormData({
              ...formData,
              category: newCategory._id
            });
            refetchCategories();
          }}
          defaultType="income"
        />
      )}
    </div>
  );
};

export default IncomeModal;
