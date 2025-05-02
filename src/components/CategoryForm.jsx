import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_CATEGORY } from "../graphql/mutations/category.mutation";
import toast from "react-hot-toast";
import { MdCategory } from "react-icons/md";
import { HiOutlineColorSwatch } from "react-icons/hi";
import { TbCoin, TbCoins } from "react-icons/tb";

const CategoryForm = ({ onClose, onCategoryCreated, defaultType = "expense" }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: defaultType,
    icon: "default-category",
    color: "#6B7280",
    description: "",
    budget: 0
  });
  const [createCategory, { loading }] = useMutation(CREATE_CATEGORY);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "budget" ? (value ? parseFloat(value) : 0) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Kategoriya nomi kiritilishi shart");
      return;
    }

    try {
      const { data } = await createCategory({
        variables: {
          input: {
            name: formData.name.trim(),
            type: formData.type,
            icon: formData.icon,
            color: formData.color,
            description: formData.description,
            budget: parseFloat(formData.budget) || 0
          },
        },
        refetchQueries: ["GetCategories"],
      });

      toast.success("Kategoriya muvaffaqiyatli yaratildi");

      if (onCategoryCreated) {
        onCategoryCreated(data.createCategory);
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
          {/* Category Type Selector */}
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">Kategoriya turi</label>
            <div className="flex space-x-2">
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setFormData({...formData, type: 'expense'})}
              >
                <TbCoins className="mr-2" />
                Xarajat
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${formData.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setFormData({...formData, type: 'income'})}
              >
                <TbCoin className="mr-2" />
                Daromad
              </button>
            </div>
          </div>
          
          {/* Category Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="text-white text-sm font-bold mb-2 flex items-center"
            >
              <MdCategory className="mr-2" />
              Kategoriya nomi
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kategoriya nomini kiriting"
            />
          </div>
          
          {/* Color Picker */}
          <div className="mb-4">
            <label
              htmlFor="color"
              className="text-white text-sm font-bold mb-2 flex items-center"
            >
              <HiOutlineColorSwatch className="mr-2" />
              Rang
            </label>
            <div className="flex space-x-2 items-center">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-10 cursor-pointer rounded border-0"
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-white text-sm font-bold mb-2"
            >
              Tavsif
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kategoriya haqida qisqacha ma'lumot"
              rows="2"
            />
          </div>
          
          {/* Budget */}
          <div className="mb-4">
            <label
              htmlFor="budget"
              className="block text-white text-sm font-bold mb-2"
            >
              Rejalashtirilgan budjet
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-70 ${formData.type === 'expense' ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500' : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500'}`}
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
