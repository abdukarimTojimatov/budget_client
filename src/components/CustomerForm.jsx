import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_CUSTOMER } from "../graphql/mutations/customer.mutation";
import toast from "react-hot-toast";

const CustomerForm = ({ onClose, onCustomerCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: ""
  });
  const [createCustomer, { loading }] = useMutation(CREATE_CUSTOMER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Xaridor nomi kiritilishi shart");
      return;
    }

    try {
      const { data } = await createCustomer({
        variables: {
          input: { 
            name: formData.name.trim(),
            phoneNumber: formData.phoneNumber.trim() || undefined
          },
        },
        refetchQueries: ["GetCustomersDropdown"],
      });

      toast.success("Xaridor muvaffaqiyatli yaratildi");

      if (onCustomerCreated) {
        onCustomerCreated(data.createCustomer);
      }

      onClose();
    } catch (error) {
      toast.error(error.message || "Xaridor yaratishda xatolik yuz berdi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white font-bold">Yangi xaridor</h2>
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
          {/* Customer Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-white text-sm font-bold mb-2"
            >
              Xaridor nomi
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Xaridor nomini kiriting"
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-white text-sm font-bold mb-2"
            >
              Telefon raqami
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Telefon raqamini kiriting"
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

export default CustomerForm;
