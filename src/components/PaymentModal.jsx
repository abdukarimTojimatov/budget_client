// src/components/PaymentModal.jsx
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const PaymentModal = ({
  isOpen,
  onClose,
  onAddPayment,
  existingPayment = null,
}) => {
  const [payment, setPayment] = useState({
    paymentType: "",
    amount: "",
    date: new Date().toISOString().split("T")[0], // Today's date as default
  });

  useEffect(() => {
    if (existingPayment) {
      setPayment(existingPayment);
    } else {
      // Reset form when opening for a new payment
      setPayment({
        paymentType: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [existingPayment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({
      ...prev,
      [name]: name === "amount" ? value : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!payment.paymentType || !payment.amount || !payment.date) {
      alert("Barcha maydonlarni to'ldiring");
      return;
    }

    // Convert amount to number before submitting
    const formattedPayment = {
      ...payment,
      amount: Number(payment.amount),
    };
    console.log("Formatted payment:", formattedPayment);

    onAddPayment(formattedPayment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {existingPayment ? "To'lovni tahrirlash" : "Yangi to'lov qo'shish"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">
              To'lov turi
            </label>
            <select
              name="paymentType"
              value={payment.paymentType}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Tanlang</option>
              <option value="naqd">Naqd</option>
              <option value="plastik">Plastik</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">
              Miqdor
            </label>
            <input
              type="number"
              name="amount"
              value={payment.amount}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Sana
            </label>
            <input
              type="date"
              name="date"
              value={payment.date}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {existingPayment ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
