import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_EXPENSE } from "../graphql/mutations/expense.mutation";
import { GET_EXPENSE } from "../graphql/queries/expense.query";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "./CategoryForm";
import { FiX } from "react-icons/fi";

const ExpenseEditModal = ({ isOpen, onClose, expenseId }) => {
  const [updateExpense, { loading: loadingUpdate }] = useMutation(UPDATE_EXPENSE);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { loading: loadingData, data, error, refetch } = useQuery(GET_EXPENSE, {
    variables: { id: expenseId },
    skip: !expenseId,
    onError: (error) => {
      console.error("Error fetching expense data:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      onClose();
    },
    fetchPolicy: "network-only", // Don't use cache for this query
  });

  const { 
    data: categoriesData, 
    loading: categoriesLoading, 
    refetch: refetchCategories 
  } = useQuery(GET_EXPENSE_CATEGORIES, {
    fetchPolicy: "network-only",
  });

  const [formData, setFormData] = useState({
    description: "",
    paymentType: "plastik",
    category: "",
    amount: "",
    date: new Date(),
  });

  // Function to verify if category exists in our categories list
  const verifyCategoryExists = (categoryId) => {
    if (!categoryId) return false;
    if (!categoriesData?.getExpenseCategories?.docs) return false;
    
    return categoriesData.getExpenseCategories.docs.some(category => 
      category._id === categoryId
    );
  };
  
  // Function to check if a category is valid (has both _id and name)
  const isValidCategory = (category) => {
    return category && 
           typeof category === 'object' && 
           category._id;
  };
  
  // Function to check if the form data has actually changed
  const hasFormChanged = (originalExpense, currentFormData) => {
    // Check if any fields have changed
    if (originalExpense.description !== currentFormData.description) {
      console.log('Description changed from', originalExpense.description, 'to', currentFormData.description);
      return true;
    }
    
    if (originalExpense.paymentType !== currentFormData.paymentType) {
      console.log('Payment type changed from', originalExpense.paymentType, 'to', currentFormData.paymentType);
      return true;
    }
    
    const originalCategory = originalExpense.category?._id || '';
    if (originalCategory !== currentFormData.category) {
      console.log('Category changed from', originalCategory, 'to', currentFormData.category);
      return true;
    }
    
    // Convert amount to string for comparison to handle precision issues
    const originalAmount = String(originalExpense.amount || 0);
    const currentAmount = String(currentFormData.amount || 0);
    if (originalAmount !== currentAmount) {
      console.log('Amount changed from', originalAmount, 'to', currentAmount);
      return true;
    }
    
    // For date comparison, convert to same format (YYYY-MM-DD)
    const formatDateForComparison = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    const originalDate = formatDateForComparison(originalExpense.date);
    const currentDate = formatDateForComparison(currentFormData.date);
    if (originalDate !== currentDate) {
      console.log('Date changed from', originalDate, 'to', currentDate);
      return true;
    }
    
    return false;
  };
  
  // Debug logging for categories
  useEffect(() => {
    if (categoriesData?.getExpenseCategories?.docs) {
      console.log("Available categories:", categoriesData.getExpenseCategories.docs);
    }
  }, [categoriesData]);

  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  useEffect(() => {
    // Only load data once when the modal opens
    if (!initialDataLoaded && data?.getExpense) {
      console.log("Loading initial expense data...");
      
      // Check for data loading error
      if (error) {
        console.error("GraphQL error fetching expense:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        return;
      }
      
      const expense = data.getExpense;
      console.log("Fetched expense:", expense); // Debug log
      
      try {
        // Check if category exists and has a valid _id
        let categoryId = "";
        
        // Safely extract category ID if it exists and is valid
        if (isValidCategory(expense.category)) {
          categoryId = expense.category._id;
          console.log("Found valid category ID:", categoryId);
        } else {
          console.log("No valid category found in expense data, category info:", expense.category);
          categoryId = ""; // Ensure we have a valid empty string for the form
        }
        
        // If we have categories data, verify the category exists
        if (categoriesData?.getExpenseCategories?.docs && categoryId) {
          const categoryExists = verifyCategoryExists(categoryId);
          if (!categoryExists) {
            console.warn("Category no longer exists, resetting to empty");
            categoryId = ""; // Reset category if it doesn't exist anymore
          }
        }
        
        const newFormData = {
          description: expense.description || "",
          paymentType: expense.paymentType || "plastik",
          category: categoryId,
          amount: expense.amount || 0,
          date: expense.date ? new Date(expense.date) : new Date(),
        };
        
        console.log("Setting initial form data:", newFormData);
        setFormData(newFormData);
        setInitialDataLoaded(true); // Mark that we've loaded the initial data
      } catch (err) {
        console.error("Error loading expense data:", err);
        toast.error("Ma'lumotlarni yuklashda xatolik. Iltimos, qayta urinib ko'ring");
        onClose();
      }
    }
  }, [data, error, categoriesData, onClose, verifyCategoryExists, initialDataLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Log the change to debug
    console.log(`Changing ${name} from:`, formData[name], "to:", value);
    
    // Handle different field types appropriately
    const updatedValue = name === "amount" && value ? parseFloat(value) : value;
    
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: updatedValue,
      };
      console.log("Updated form state:", newState);
      return newState;
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
    console.log("Changing date from:", formData.date, "to:", date);
    
    setFormData(prevState => {
      const newState = {
        ...prevState,
        date: date,
      };
      console.log("Updated form state (date):", newState);
      return newState;
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
    } else if (categoriesData?.getExpenseCategories?.docs) {
      // Verify the selected category still exists
      const categoryExists = verifyCategoryExists(formData.category);
      if (!categoryExists) {
        newErrors.category = "Tanlangan kategoriya mavjud emas, boshqa kategoriyani tanlang";
      }
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
    console.log("Submit clicked with form data:", formData);

    if (!validateForm()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    
    // Check if form data has actually changed from the original
    if (data?.getExpense && !hasFormChanged(data.getExpense, formData)) {
      console.log("No changes detected in form");
      toast.info("O'zgarishlar aniqlanmadi");
      return;
    }
    
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
    
    const formattedDate = formatDate(formData.date);

    // Ensure we have the correct structure for the update mutation
    // Convert amount to number explicitly to avoid string issues
    const amountValue = typeof formData.amount === 'string' 
      ? parseFloat(formData.amount) 
      : formData.amount;
      
    // Force all fields to be included and properly formatted
    // This is critical to ensure the backend detects changes
    const expenseData = {
      _id: expenseId, // Backend expects _id, not id
      description: String(formData.description || ""),
      paymentType: String(formData.paymentType || "plastik"),
      category: formData.category || "",
      amount: amountValue,
      date: formattedDate
      // No timestamp field - the GraphQL schema doesn't allow it
    };
    
    // Log the update data
    console.log("Form data being processed:", formData);
    console.log("Final update data being sent to server:", expenseData);

    console.log("Updating expense with data:", expenseData);

    try {
      // First validate if the category exists
      if (formData.category && categoriesData?.getExpenseCategories?.docs) {
        const categoryExists = verifyCategoryExists(formData.category);
        if (!categoryExists) {
          toast.error("Tanlangan kategoriya mavjud emas. Iltimos, boshqa kategoriyani tanlang");
          return;
        }
      }

      console.log("Calling updateExpense mutation with data:", expenseData);
      const { data: updateData } = await updateExpense({
        variables: { input: expenseData },
        refetchQueries: ["GetExpenses", "GetExpensesStatistics"],
        // Use errorPolicy to handle GraphQL errors gracefully
        errorPolicy: 'all'
      });
      console.log("Update mutation response:", updateData);

      if (updateData && updateData.updateExpense) {
        toast.success("Muvaffaqiyatli yangilandi");
        onClose();
      } else {
        toast.error("Yangilashda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      
      // Handle the specific category not found error
      if (error.message?.includes('Category not found')) {
        toast.error("Kategoriya topilmadi. Iltimos, boshqa kategoriyani tanlang");
      } else {
        // More detailed error handling for other errors
        const errorMessage = error.graphQLErrors?.[0]?.message || error.message || "Noma'lum xatolik";
        toast.error(`Xatolik yuz berdi: ${errorMessage}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">
            Xarajatni tahrirlash
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center p-8">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
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
                    readOnly={true}
                    onFocus={(e) => e.target.readOnly = false}
                    onBlur={(e) => e.target.readOnly = true}
                    popperPlacement="bottom-start"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs italic mt-1">
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? "Yangilanmoqda..." : "Yangilash"}
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
        )}
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

  // Handle sharing an expense
  const handleShareExpense = async () => {
    if (!selectedSharingCategory) {
      toast.error("Iltimos, sharing kategoriya tanlang");
      return;
    }
    
    try {
      // Create sharing input from current expense data
      const sharingInput = {
        sharingDescription: formData.description,
        sharingPaymentType: formData.paymentType,
        sharingCategoryType: selectedSharingCategory,
        sharingAmount: parseFloat(formData.amount),
        sharingDate: formData.date.toISOString().split('T')[0],
      };
      
      console.log("Creating sharing with data:", sharingInput);
      
      const result = await createSharing({
        variables: {
          input: sharingInput
        },
        refetchQueries: ["GetSharings", "CategoryStatisticsSharing"],
      });
      
      console.log("Sharing created:", result);
      toast.success("Sharing muvaffaqiyatli qo'shildi");
      setShowSharingOptions(false);
      setSelectedSharingCategory("");
    } catch (error) {
      console.error("Error creating sharing:", error);
      toast.error("Sharing qo'shishda xatolik: " + error.message);
    }
  };

export default ExpenseEditModal;
