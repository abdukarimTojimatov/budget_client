import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_EXPENSE } from "../graphql/mutations/expense.mutation";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "./CategoryForm";
import { FiX } from "react-icons/fi";

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
      toast.error("Barcha maydonlarni to'ldiring");
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

      toast.success("Muvaffaqiyatli yaratildi");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">
            Yangi Xarajat qo'shish
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
              htmlFor="description"
            >
              Xarajat haqida
            </label>
            <div>
              <input
                className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.description ? "border-red-500" : ""}`}
                id="description"
                name="description"
                type="text"
                placeholder="Izoh yozing"
                value={formData.description}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.description && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.description}
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
                htmlFor="paymentType"
              >
                To'lov turi
              </label>
              <select
                className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="paymentType"
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
              >
                <option value="plastik">Plastik</option>
                <option value="naqd">Naqd</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex-1">
              <label
                className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
                htmlFor="category"
              >
                Kategoriya
              </label>
              <div className="flex">
                <div className="relative w-full">
                <select
                  className={`block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded-l leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.category ? "border-red-500" : ""}`}
                  id="category"
                  name="category"
                  disabled={categoriesLoading}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Tanlang</option>
                  {categoriesLoading ? (
                    <option value="">Yuklanmoqda...</option>
                  ) : (
                    categoriesData?.getExpenseCategories?.docs?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.category}
                  </p>
                )}
              </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Amount */}
            <div className="flex-1">
              <label
                className="block uppercase text-white text-sm font-bold mb-2"
                htmlFor="amount"
              >
                Miqdori (so'm)
              </label>
              <div>
                <input
                  className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${errors.amount ? "border-red-500" : ""}`}
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Summa kiriting"
                  value={formData.amount}
                  onChange={handleChange}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <label
                className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
                htmlFor="date"
              >
                Sana
              </label>
              <div>
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  name="date"
                  id="date"
                  className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${errors.date ? "border-red-500" : ""}`}
                  placeholderText="Sanani tanlang"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full mb-2 py-3 px-4 rounded bg-gray-600 hover:bg-gray-500 text-white font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
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
