import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_EXPENSE_CATEGORY } from "../graphql/mutations/expenseCategory.mutation";
import toast from "react-hot-toast";

const CategoryForm = ({ onClose, onCategoryCreated }) => {
  const [name, setName] = useState("");
  const [createCategory, { loading }] = useMutation(CREATE_EXPENSE_CATEGORY);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Kategoriya nomi kiritilishi shart");
      return;
    }

    try {
      const { data } = await createCategory({
        variables: {
          input: { name: name.trim() },
        },
        refetchQueries: ["GetExpenseCategories"],
      });

      toast.success("Kategoriya muvaffaqiyatli yaratildi");

      if (onCategoryCreated) {
        onCategoryCreated(data.createExpenseCategory);
      }

      onClose();
    } catch (error) {
      toast.error(error.message || "Kategoriya yaratishda xatolik yuz berdi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white font-bold">Yangi kategoriya</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-white text-sm font-bold mb-2"
            >
              Kategoriya nomi
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Kategoriya nomini kiriting"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-70"
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
