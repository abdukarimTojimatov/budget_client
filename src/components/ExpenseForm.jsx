import React from "react";
import { useMutation } from "@apollo/client";
import { CREATE_EXPENSE } from "../graphql/mutations/expense.mutation";
import toast from "react-hot-toast";
import expenceCategories from "../constants/expenceCategories"; // Import categories

import { useNavigate } from "react-router-dom";
const ExpenseForm = ({ toggleExpenseForm }) => {
  const navigate = useNavigate();
  const [createExpense, { loading }] = useMutation(CREATE_EXPENSE);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const expenseData = {
      description: formData.get("description"),
      paymentType: formData.get("paymentType"),
      category: formData.get("category"),
      amount: parseFloat(formData.get("amount")),
      date: formData.get("date"),
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
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="category"
            name="category"
          >
            {expenceCategories?.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
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
          <input
            type="date"
            name="date"
            id="date"
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
            placeholder="Select date"
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
  );
};

export default ExpenseForm;
