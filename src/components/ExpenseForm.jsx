import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_EXPENSE } from "../graphql/mutations/expense.mutation";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "./CategoryForm";
const ExpenseForm = ({ toggleExpenseForm }) => {
  const navigate = useNavigate();
  const [createExpense, { loading }] = useMutation(CREATE_EXPENSE);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_EXPENSE_CATEGORIES, {
    fetchPolicy: "network-only",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    
    // Format the date to YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const expenseData = {
      description: formData.get("description"),
      paymentType: formData.get("paymentType"),
      category: formData.get("category"),
      amount: parseFloat(formData.get("amount")),
      date: formattedDate,
    };

    try {
      await createExpense({
        variables: { input: expenseData },
        refetchQueries: ["GetExpenses", "GetExpensesStatistics"],
      });

      form.reset();
      toast.success("Muvaffaqiyatli yaratildi");
      toggleExpenseForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <form
        className="w-full max-w-2xl flex flex-col gap-6 px-3 mx-auto"
        onSubmit={handleSubmit}
      >
        {/* Description */}
        <div className="flex flex-col gap-2">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold"
            htmlFor="description"
          >
            Xarajat haqida
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="description"
            name="description"
            type="text"
            required
            placeholder="Izoh yozing"
          />
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
              <select
                className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded-l leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="category"
                name="category"
                disabled={categoriesLoading}
              >
                {categoriesLoading ? (
                  <option value="">Yuklanmoqda...</option>
                ) : categoriesError ? (
                  <option value="">Xatolik yuz berdi</option>
                ) : (
                  categoriesData?.getExpenseCategories?.docs?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
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
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="amount"
              name="amount"
              type="number"
              placeholder="Summa kiriting"
            />
          </div>

          {/* Date */}
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
              htmlFor="date"
            >
              Sana
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              name="date"
              id="date"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
              placeholderText="Sanani tanlang"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3 px-4 rounded bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
      
      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm 
          onClose={() => setShowCategoryForm(false)} 
          onCategoryCreated={(newCategory) => {
            // Auto-select the newly created category
            setTimeout(() => {
              const selectElement = document.getElementById('category');
              if (selectElement) {
                selectElement.value = newCategory._id;
              }
            }, 0);
          }}
        />
      )}
      

    </>
  );
};

export default ExpenseForm;
