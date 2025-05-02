import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_INCOME } from "../graphql/mutations/income.mutation";
import { GET_INCOME } from "../graphql/queries/income.query";
import { GET_CATEGORIES } from "../graphql/queries/category.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "./CategoryForm";
import { FiX, FiDollarSign, FiCalendar, FiPaperclip, FiRepeat } from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdCategory, MdAddCircleOutline, MdNote } from "react-icons/md";
import { FaRegCreditCard, FaMoneyBillWave, FaRegMoneyBillAlt } from "react-icons/fa";

const IncomeEditModal = ({ isOpen, onClose, incomeId }) => {
  const [updateIncome, { loading: loadingUpdate }] = useMutation(UPDATE_INCOME);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { loading: loadingData, data, error, refetch } = useQuery(GET_INCOME, {
    variables: { id: incomeId },
    skip: !incomeId,
    onError: (error) => {
      console.error("Error fetching income data:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      onClose();
    },
    fetchPolicy: "network-only", // Don't use cache for this query
  });

  const { 
    data: categoriesData, 
    loading: categoriesLoading, 
    refetch: refetchCategories 
  } = useQuery(GET_CATEGORIES, {
    variables: { type: "income" },
    fetchPolicy: "network-only",
  });

  const [formData, setFormData] = useState({
    description: "",
    receiptMethod: "bank_deposit",
    category: "",
    amount: "",
    date: new Date(),
    recurring: false,
    recurringPeriod: "none",
    notes: "",
    attachments: []
  });

  // Function to verify if category exists in our categories list
  const verifyCategoryExists = (categoryId) => {
    if (!categoryId) return false;
    if (!categoriesData?.getCategories?.docs) return false;
    
    return categoriesData.getCategories.docs.some(category => 
      category._id === categoryId
    );
  };
  
  // Function to check if a category is valid (has both _id and name)
  const isValidCategory = (category) => {
    return category && 
           typeof category === 'object' && 
           category._id;
  };

  // Load income data into form when available
  useEffect(() => {
    if (data?.getIncome) {
      const income = data.getIncome;
      
      setFormData({
        _id: income._id,
        description: income.description || "",
        receiptMethod: income.receiptMethod || "bank_deposit",
        category: isValidCategory(income.category) ? income.category._id : "",
        amount: income.amount || "",
        date: income.date ? new Date(income.date) : new Date(),
        recurring: income.recurring || false,
        recurringPeriod: income.recurringPeriod || "none",
        notes: income.notes || "",
        attachments: income.attachments || []
      });
    }
  }, [data]);

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
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
      // Reset recurringPeriod to none if recurring is being unchecked
      ...(name === 'recurring' && !checked ? { recurringPeriod: 'none' } : {})
    });
  };

  const validateForm = () => {
    let tempErrors = {};
    let formIsValid = true;
    
    if (!formData.description.trim()) {
      tempErrors.description = "Tavsif kiritilishi shart";
      formIsValid = false;
    }
    
    if (!formData.category) {
      tempErrors.category = "Kategoriya tanlanishi shart";
      formIsValid = false;
    } else if (!verifyCategoryExists(formData.category)) {
      tempErrors.category = "Mavjud bo'lmagan kategoriya";
      formIsValid = false;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      tempErrors.amount = "Miqdor 0 dan katta bo'lishi kerak";
      formIsValid = false;
    }
    
    if (!formData.date) {
      tempErrors.date = "Sana kiritilishi shart";
      formIsValid = false;
    }
    
    if (formData.recurring && (!formData.recurringPeriod || formData.recurringPeriod === 'none')) {
      tempErrors.recurringPeriod = "Takrorlanish davri tanlanishi shart";
      formIsValid = false;
    }
    
    setErrors(tempErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const incomeInput = {
      _id: formData._id,
      description: formData.description.trim(),
      category: formData.category,
      amount: formData.amount,
      date: formData.date.toISOString(),
      receiptMethod: formData.receiptMethod,
      recurring: formData.recurring,
      recurringPeriod: formData.recurring ? formData.recurringPeriod : "none",
      notes: formData.notes.trim(),
      attachments: formData.attachments
    };
    
    try {
      const { data } = await updateIncome({
        variables: { input: incomeInput },
        refetchQueries: ['GetIncomes', 'GetIncomesStatistics'],
      });
      
      toast.success("Daromad muvaffaqiyatli tahrirlandi!");
      onClose();
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  // If modal is closed, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900/90 border border-gray-700/50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Daromadni tahrirlash</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
              <span className="sr-only">Yopish</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(loadingData || !incomeId) ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          /* Modal Body - Form */
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm font-medium">
                  <MdDescription className="mr-2 text-blue-400" size={18} />
                  Tavsif
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="Daromad tavsifi"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-gray-800/50 border ${
                    errors.description ? "border-red-500" : "border-gray-600/50"
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm font-medium">
                  <FiDollarSign className="mr-2 text-green-400" size={18} />
                  Miqdor
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">UZS</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0"
                    min="0"
                    step="1000"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-2.5 bg-gray-800/50 border ${
                      errors.amount ? "border-red-500" : "border-gray-600/50"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Two columns for Category and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <div className="space-y-2">
                  <label className="flex items-center text-white text-sm font-medium">
                    <MdCategory className="mr-2 text-purple-400" size={18} />
                    Kategoriya
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-gray-800/50 border ${
                        errors.category ? "border-red-500" : "border-gray-600/50"
                      } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none`}
                    >
                      <option value="">Kategoriyani tanlang</option>
                      {categoriesData?.getCategories?.docs?.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MdCategory className="text-gray-400" size={18} />
                    </div>
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                  )}
                  {/* Add Category button */}
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(true)}
                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center mt-2"
                  >
                    <MdAddCircleOutline className="mr-1" size={14} />
                    Yangi kategoriya qo'shish
                  </button>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="flex items-center text-white text-sm font-medium">
                    <FiCalendar className="mr-2 text-yellow-400" size={18} />
                    Sana
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.date}
                      onChange={handleDateChange}
                      className={`w-full px-4 py-2.5 bg-gray-800/50 border ${
                        errors.date ? "border-red-500" : "border-gray-600/50"
                      } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      dateFormat="dd/MM/yyyy"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiCalendar className="text-gray-400" size={18} />
                    </div>
                  </div>
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm font-medium">
                  <MdOutlinePayments className="mr-2 text-orange-400" size={18} />
                  Qabul qilish usuli
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <input
                      type="radio"
                      id="cash"
                      name="receiptMethod"
                      value="cash"
                      checked={formData.receiptMethod === "cash"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="cash"
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        formData.receiptMethod === "cash"
                          ? "bg-blue-800/20 border-blue-500/50 text-blue-400"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/30"
                      } cursor-pointer transition-all duration-200`}
                    >
                      <FaMoneyBillWave size={20} className="mb-1" />
                      <span className="text-xs">Naqd</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="bank_deposit"
                      name="receiptMethod"
                      value="bank_deposit"
                      checked={formData.receiptMethod === "bank_deposit"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="bank_deposit"
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        formData.receiptMethod === "bank_deposit"
                          ? "bg-blue-800/20 border-blue-500/50 text-blue-400"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/30"
                      } cursor-pointer transition-all duration-200`}
                    >
                      <FaRegCreditCard size={20} className="mb-1" />
                      <span className="text-xs">Bank</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="check"
                      name="receiptMethod"
                      value="check"
                      checked={formData.receiptMethod === "check"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="check"
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        formData.receiptMethod === "check"
                          ? "bg-blue-800/20 border-blue-500/50 text-blue-400"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/30"
                      } cursor-pointer transition-all duration-200`}
                    >
                      <FaRegMoneyBillAlt size={20} className="mb-1" />
                      <span className="text-xs">Chek</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="digital_transfer"
                      name="receiptMethod"
                      value="digital_transfer"
                      checked={formData.receiptMethod === "digital_transfer"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="digital_transfer"
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        formData.receiptMethod === "digital_transfer"
                          ? "bg-blue-800/20 border-blue-500/50 text-blue-400"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/30"
                      } cursor-pointer transition-all duration-200`}
                    >
                      <span className="material-icons text-2xl mb-1">account_balance_wallet</span>
                      <span className="text-xs">Elektron</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="other"
                      name="receiptMethod"
                      value="other"
                      checked={formData.receiptMethod === "other"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="other"
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        formData.receiptMethod === "other"
                          ? "bg-blue-800/20 border-blue-500/50 text-blue-400"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/30"
                      } cursor-pointer transition-all duration-200`}
                    >
                      <span className="material-icons text-2xl mb-1">more_horiz</span>
                      <span className="text-xs">Boshqa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Recurring Section */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    name="recurring"
                    checked={formData.recurring}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-800"
                  />
                  <label htmlFor="recurring" className="ml-2 text-white text-sm font-medium flex items-center">
                    <FiRepeat className="mr-2 text-blue-400" size={18} />
                    Takrorlanuvchi daromad
                  </label>
                </div>
                
                {formData.recurring && (
                  <div className="pl-6 space-y-2">
                    <label className="text-white text-sm font-medium">
                      Takrorlanish davri
                    </label>
                    <select
                      name="recurringPeriod"
                      value={formData.recurringPeriod}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 bg-gray-800/50 border ${
                        errors.recurringPeriod ? "border-red-500" : "border-gray-600/50"
                      } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="none">Tanlanmagan</option>
                      <option value="daily">Kunlik</option>
                      <option value="weekly">Haftalik</option>
                      <option value="monthly">Oylik</option>
                      <option value="quarterly">Choraklik</option>
                      <option value="yearly">Yillik</option>
                    </select>
                    {errors.recurringPeriod && (
                      <p className="text-red-500 text-xs mt-1">{errors.recurringPeriod}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm font-medium">
                  <MdNote className="mr-2 text-gray-400" size={18} />
                  Qo'shimcha ma'lumot
                </label>
                <textarea
                  name="notes"
                  placeholder="Qo'shimcha ma'lumotlar..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Attachments - Placeholder for future implementation */}
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm font-medium">
                  <FiPaperclip className="mr-2 text-indigo-400" size={18} />
                  Ilovalar
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800/30 border-gray-600 hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiPaperclip className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Faylni yuklash uchun bosing</span> yoki sudrab keltiring
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG, PDF (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      disabled={true} // Temporarily disabled
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Fayl yuklash funksiyasi tez orada qo'shiladi
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700/30 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loadingUpdate}
                className="px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 flex items-center"
              >
                {loadingUpdate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Yuklanmoqda...
                  </>
                ) : (
                  "Saqlash"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60] p-4">
          <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl w-full max-w-md">
            <CategoryForm 
              onClose={() => setShowCategoryForm(false)} 
              onSuccess={() => {
                refetchCategories();
                setShowCategoryForm(false);
              }}
              categoryType="income"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeEditModal;
