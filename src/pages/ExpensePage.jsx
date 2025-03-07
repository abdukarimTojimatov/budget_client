import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GET_EXPENSE,
  GET_EXPENSES_STATISTICS,
} from "../graphql/queries/expense.query";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import { UPDATE_EXPENSE } from "../graphql/mutations/expense.mutation";
import toast from "react-hot-toast";
import ExpenseFormSkeleton from "../skeletons/ExpenseFormSkeleton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CategoryForm from "../components/CategoryForm";

const ExpensePage = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const { loading, data } = useQuery(GET_EXPENSE, {
    variables: { id: id },
  });

  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GET_EXPENSE_CATEGORIES,
    {
      variables: { limit: 100 },
      fetchPolicy: "network-only",
    }
  );

  const [updateExpense, { loading: loadingUpdate }] =
    useMutation(UPDATE_EXPENSE);

  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [formData, setFormData] = useState({
    description: data?.getExpense?.description || "",
    paymentType: data?.getExpense?.paymentType || "",
    category: data?.getExpense?.category?._id || "",
    amount: data?.getExpense?.amount || "",
    date: data?.getExpense?.date || "",
  });

  const [selectedDate, setSelectedDate] = useState(
    data?.getExpense?.date ? new Date(data.getExpense.date) : new Date()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    // Format the date to YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split("T")[0];

    try {
      await updateExpense({
        variables: {
          input: {
            ...formData,
            date: formattedDate,
            amount,
            _id: id,
          },
        },
        refetchQueries: [{ query: GET_EXPENSES_STATISTICS }],
      });
      toast.success("Muvaffaqiyatli yangilandi");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (data) {
      setFormData({
        description: data?.getExpense?.description,
        paymentType: data?.getExpense?.paymentType,
        category: data?.getExpense?.category?._id || "",
        amount: data?.getExpense?.amount,
        date: data?.getExpense?.date,
      });

      if (data.getExpense.date) {
        setSelectedDate(new Date(data.getExpense.date));
      }
    }
  }, [data]);

  if (loading) return <ExpenseFormSkeleton />;

  return (
    <div className="h-screen max-w-4xl mx-auto flex flex-col items-center">
      <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
        Xarajatlarni o'zgartirish
      </p>
      <form
        className="w-full max-w-lg flex flex-col md:flex-col sm:flex-col  gap-5 px-3 "
        onSubmit={handleSubmit}
      >
        {/* EXpenseS */}
        <div className="flex flex-wrap gap-3">
          <div className="w-full flex-1 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="description"
            >
              Xarajat izoh
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="description"
              name="description"
              type="text"
              placeholder="Rent, Groceries, Salary, etc."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full flex-1 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="paymentType"
            >
              To'lov turi
            </label>
            <div className="relative">
              <select
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="paymentType"
                name="paymentType"
                onChange={handleInputChange}
                defaultValue={formData.paymentType}
              >
                <option value={"plastik"}>plastik</option>
                <option value={"naqd"}>naqd</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="category"
          >
            Kategoriya
          </label>
          <div className="flex">
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-l leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="category"
              name="category"
              onChange={handleInputChange}
              value={formData.category}
              disabled={categoriesLoading}
            >
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
            <button
              type="button"
              onClick={() => setShowCategoryForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* AMOUNT */}
            <div className="flex-1 mb-6 md:mb-0">
              <label
                className="block uppercase text-white text-xs font-bold mb-2"
                htmlFor="amount"
              >
                Miqdori (so'm)
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="amount"
                name="amount"
                type="number"
                placeholder="150"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* DATE */}
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="date"
            >
              Sana
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setFormData((prev) => ({
                  ...prev,
                  date: date.toISOString().split("T")[0],
                }));
              }}
              dateFormat="yyyy-MM-dd"
              name="date"
              id="date"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              placeholderText="Sanani tanlang"
            />
          </div>
        </div>
        {/* SUBMIT BUTTON */}
        <button
          className="text-white font-bold w-full rounded px-4 py-2 bg-gradient-to-br
          from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600"
          type="submit"
          disabled={loadingUpdate}
        >
          {loadingUpdate ? "Updating..." : "Update Expenses"}
        </button>
      </form>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          onClose={() => setShowCategoryForm(false)}
          onCategoryCreated={(newCategory) => {
            // Auto-select the newly created category
            setFormData((prev) => ({ ...prev, category: newCategory._id }));
          }}
        />
      )}
    </div>
  );
};
export default ExpensePage;
