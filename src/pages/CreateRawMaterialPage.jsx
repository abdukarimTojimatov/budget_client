import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation"; // Import the create mutation
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { customers } from "../constants/customer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateRawMaterialPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rawMaterialName: "",
    rawMaterialDescription: "",
    rawMaterialQuantity: 0,
    customerName: "",
    phoneNumber: "",
    unitOfMeasurement: "",
    rawMaterialCategory: "",
    rawMaterialPrice: 0,
    payments: [], // Initialize payments array
  });

  // State for new payment input
  const [newPayment, setNewPayment] = useState({
    paymentType: "naqd",
    amount: "",
    date: new Date(),
  });

  const [createRawMaterial, { loading }] = useMutation(CREATE_RAW_MATERIAL, {
    onCompleted: () => {
      toast.success("Muvaffaqiyatli yangilandi");

      navigate("/rawMaterial");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("input", formData);
    await createRawMaterial({
      variables: { input: formData },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "rawMaterialQuantity" || name === "rawMaterialPrice") {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({
      ...prev,
      [name]: name === "amount" ? (value ? parseFloat(value) : "") : value,
    }));
  };

  const handleDateChange = (date) => {
    setNewPayment((prev) => ({
      ...prev,
      date,
    }));
  };

  const addPayment = () => {
    if (!newPayment.amount) {
      toast.error("To'lov miqdorini kiriting");
      return;
    }

    const formattedDate = newPayment.date
      ? new Date(newPayment.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const paymentToAdd = {
      ...newPayment,
      date: formattedDate,
    };

    setFormData({
      ...formData,
      payments: [...formData.payments, paymentToAdd],
    });

    // Reset payment form
    setNewPayment({
      paymentType: "naqd",
      amount: "",
      date: new Date(),
    });
  };

  const removePayment = (index) => {
    setFormData({
      ...formData,
      payments: formData.payments.filter((_, i) => i !== index),
    });
  };

  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find(
      (customer) => customer.name === e.target.value
    );
    if (selectedCustomer) {
      setFormData({
        ...formData,
        customerName: selectedCustomer.name,
        phoneNumber: selectedCustomer.phoneNumber,
      });
    }
  };

  const totalPrice = formData.rawMaterialQuantity * formData.rawMaterialPrice;

  // Calculate total payment amount
  const totalPaymentAmount = formData.payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  return (
    <form
      className="w-full max-w-2xl flex flex-col gap-3 px-4 sm:px-6 md:px-10 mx-auto"
      onSubmit={handleSubmit}
    >
      {/* Unit of Measurement */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
            htmlFor="unitOfMeasurement"
          >
            O'lchov birligi
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="unitOfMeasurement"
            name="unitOfMeasurement"
            value={formData.unitOfMeasurement}
            onChange={handleChange}
            required
          >
            <option value="">Tanlang</option>
            <option value="kg">Kilogram</option>
            <option value="gr">Gramm</option>
            <option value="meter">Metr</option>
            <option value="dona">Dona</option>
            <option value="liter">Liter</option>
            <option value="qop">Qop</option>
            <option value="metrkv">Metr kvadrat</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
            htmlFor="rawMaterialCategory"
          >
            Kategoriya
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="rawMaterialCategory"
            name="rawMaterialCategory"
            value={formData.rawMaterialCategory}
            onChange={handleChange}
            required
          >
            <option value="">Tanlang</option>
            <option value="Machalka">Machalka</option>
            <option value="Mehanizm">Mehanizm</option>
            <option value="Kraska">Kraska</option>
            <option value="Temir">Temir</option>
            <option value="Material">Material</option>
          </select>
        </div>
      </div>

      {/* Raw Material Name */}
      <div className="flex flex-col gap-1">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
          htmlFor="rawMaterialName"
        >
          Xom ashyo nomi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
          id="rawMaterialName"
          name="rawMaterialName"
          type="text"
          placeholder="Xom ashyo nomini kiriting"
          value={formData.rawMaterialName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
          htmlFor="rawMaterialDescription"
        >
          Izoh
        </label>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
          id="rawMaterialDescription"
          name="rawMaterialDescription"
          placeholder="Xom ashyo haqida ta'rif yozing"
          value={formData.rawMaterialDescription}
          onChange={handleChange}
          rows={8}
          style={{ maxHeight: "150px" }}
        />
      </div>

      {/* Quantity and Price */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
            htmlFor="rawMaterialQuantity"
          >
            Miqdori
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="rawMaterialQuantity"
            name="rawMaterialQuantity"
            type="number"
            placeholder="Miqdor kiriting"
            value={formData.rawMaterialQuantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
            htmlFor="rawMaterialPrice"
          >
            Narxi
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="rawMaterialPrice"
            name="rawMaterialPrice"
            type="number"
            placeholder="Narx kiriting"
            value={formData.rawMaterialPrice}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Total Price */}
      <div className="flex flex-col gap-1">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
          htmlFor="totalPrice"
        >
          Jami Narxi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
          id="totalPrice"
          name="totalPrice"
          type="text"
          value={totalPrice}
          readOnly
        />
      </div>

      {/* Customer Name and Phone Number */}
      <div className="flex flex-col gap-3">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
          htmlFor="customerName"
        >
          Ismi
        </label>
        <select
          name="customerName"
          onChange={handleCustomerChange}
          className="block appearance-none w-full bg-gray-200 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
          required
        >
          <option value="">Ismni tanlang</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer.name}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-3">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
          htmlFor="phoneNumber"
        >
          Telefon raqami
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
          id="phoneNumber"
          name="phoneNumber"
          type="text"
          value={formData.phoneNumber}
          readOnly
        />
      </div>

      {/* PAYMENT SECTION */}
      <div className="w-full">
        <h3 className="text-white text-lg font-bold mb-3">
          To'lov ma'lumotlari
        </h3>

        {/* Payment input form */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 p-3 bg-gray-800 rounded-lg mb-3 sm:mb-4">
          <div className="w-full sm:flex-1 min-w-[120px]">
            <label className="block text-white text-xs font-bold mb-1">
              To'lov turi
            </label>
            <select
              className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 text-sm"
              name="paymentType"
              value={newPayment.paymentType}
              onChange={handlePaymentChange}
            >
              <option value="naqd">Naqd</option>
              <option value="plastik">Plastik</option>
            </select>
          </div>

          <div className="w-full sm:flex-1 min-w-[120px]">
            <label className="block text-white text-xs font-bold mb-1">
              To'lov miqdori
            </label>
            <input
              className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 text-sm"
              type="number"
              name="amount"
              placeholder="Miqdor"
              value={newPayment.amount}
              onChange={handlePaymentChange}
            />
          </div>

          <div className="w-full sm:flex-1 min-w-[120px]">
            <label className="block text-white text-xs font-bold mb-1">
              To'lov sanasi
            </label>
            <DatePicker
              selected={newPayment.date}
              onChange={handleDateChange}
              className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 text-sm"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex items-end w-full sm:w-auto mt-2 sm:mt-0">
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded w-full sm:w-auto text-sm"
              onClick={addPayment}
            >
              To'lov qo'shish
            </button>
          </div>
        </div>

        {/* Payment list */}
        {formData.payments.length > 0 && (
          <div className="mb-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                <h4 className="text-white font-bold text-sm">
                  To'lovlar ro'yxati
                </h4>
                <p className="text-white text-sm">
                  Jami: {totalPaymentAmount} / {totalPrice} (
                  {totalPrice > 0
                    ? Math.round((totalPaymentAmount / totalPrice) * 100)
                    : 0}
                  %)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 text-white text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">To'lov turi</th>
                      <th className="p-2 text-left">Miqdor</th>
                      <th className="p-2 text-left">Sana</th>
                      <th className="p-2 text-left">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.payments.map((payment, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="p-2">
                          {payment.paymentType === "naqd" ? "Naqd" : "Plastik"}
                        </td>
                        <td className="p-2">{payment.amount}</td>
                        <td className="p-2">{payment.date}</td>
                        <td className="p-2">
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removePayment(index)}
                          >
                            O'chirish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        className="w-full py-2 px-3 mb-3 rounded bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
};

export default CreateRawMaterialPage;
