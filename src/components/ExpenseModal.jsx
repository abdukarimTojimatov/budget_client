import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_EXPENSE } from "../graphql/mutations/expense.mutation";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "./CategoryForm";
import { FiX, FiPlus, FiDollarSign, FiCalendar } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdCategory, MdAddCircleOutline } from "react-icons/md";
import { FaRegCreditCard, FaMoneyBillWave } from "react-icons/fa";

const ExpenseModal = ({ isOpen, onClose }) => {
  const [createExpense, { loading }] = useMutation(CREATE_EXPENSE);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    description: "",
    paymentType: "plastik",
    category: "",
    amount: "",
    date: new Date(),
  });
  
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useQuery(
    GET_EXPENSE_CATEGORIES,
    {
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
      newErrors.description = "Xarajat haqida ma'lumot kiriting";
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

    const expenseData = {
      description: formData.description,
      paymentType: formData.paymentType,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formattedDate,
    };

    try {
      await createExpense({
        variables: { input: expenseData },
        refetchQueries: ["GetExpenses", "GetExpensesStatistics"],
      });

      toast.success("Xarajat muvaffaqiyatli yaratildi");
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      paymentType: "plastik",
      category: "",
      amount: "",
      date: new Date(),
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700/30">
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700/50 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiPlus className="text-blue-400 mr-2" size={20} />
            Yangi Xarajat qo'shish
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
              <MdDescription className="mr-2 text-blue-400" size={18} />
              Xarajat haqida
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-blue-500 ${errors.description ? "border-red-500" : ""}`}
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

          {/* Payment Type and Category */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Payment Type */}
            <div className="flex-1">
              <label
                className="flex items-center text-white text-sm font-bold mb-2"
                htmlFor="paymentType"
              >
                <MdOutlinePayments className="mr-2 text-blue-400" size={18} />
                To'lov turi
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-blue-500"
                  id="paymentType"
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                >
                  <option value="plastik">Plastik</option>
                  <option value="naqd">Naqd</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  {formData.paymentType === "plastik" ? 
                    <FaRegCreditCard className="text-blue-400" size={16} /> : 
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
                <MdCategory className="mr-2 text-blue-400" size={18} />
                Kategoriya
              </label>
              <div className="flex">
                <div className="relative w-full">
                  <select
                    className={`block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 rounded-l-lg leading-tight focus:outline-none focus:border-blue-500 ${errors.category ? "border-red-500" : ""}`}
                    id="category"
                    name="category"
                    disabled={categoriesLoading}
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">{categoriesLoading ? "Yuklanmoqda..." : "Tanlang"}</option>
                    {!categoriesLoading && categoriesData?.getExpenseCategories?.docs?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                    {!categoriesLoading && (!categoriesData?.getExpenseCategories?.docs || categoriesData.getExpenseCategories.docs.length === 0) && (
                      <option value="" disabled>Kategoriyalar topilmadi</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <MdCategory className="text-blue-400" size={16} />
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
                  className="bg-blue-600/80 hover:bg-blue-700/90 text-white font-medium flex items-center justify-center py-3 px-3 rounded-r-lg focus:outline-none transition-colors duration-200"
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
                <FiDollarSign className="mr-2 text-blue-400" size={18} />
                Miqdori (so'm)
              </label>
              <div className="relative">
                <input
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 pl-4 pr-10 leading-tight focus:outline-none focus:border-blue-500 ${errors.amount ? "border-red-500" : ""}`}
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
                <FiCalendar className="mr-2 text-blue-400" size={18} />
                Sana
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  name="date"
                  id="date"
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-blue-500 ${errors.date ? "border-red-500" : ""}`}
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
              className="py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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
        />
      )}
    </div>
  );
};

export default ExpenseModal;
