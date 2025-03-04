import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation"; // Import the create mutation
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { customers } from "../constants/customer";

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

  const handlePaymentChange = (index, e) => {
    const { name, value } = e.target;
    const newPayments = [...formData.payments];
    newPayments[index] = {
      ...newPayments[index],
      [name]: name === "amount" ? parseFloat(value) : value,
    };
    setFormData({ ...formData, payments: newPayments });
  };

  const addPayment = () => {
    setFormData({
      ...formData,
      payments: [...formData.payments, { paymentType: "", amount: 0 }], // Ensure amount is a number
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

  return (
    <form
      className="w-full max-w-2xl flex flex-col gap-6 px-3 mx-auto"
      onSubmit={handleSubmit}
    >
      {/* Unit of Measurement */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold"
            htmlFor="unitOfMeasurement"
          >
            O'lchov birligi
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold"
            htmlFor="rawMaterialCategory"
          >
            Kategoriya
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
      <div className="flex flex-col gap-2">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold"
          htmlFor="rawMaterialName"
        >
          Xom ashyo nomi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
      <div className="flex flex-col gap-2">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold"
          htmlFor="rawMaterialDescription"
        >
          Izoh
        </label>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="rawMaterialDescription"
          name="rawMaterialDescription"
          placeholder="Xom ashyo haqida ta'rif yozing"
          value={formData.rawMaterialDescription}
          onChange={handleChange}
        />
      </div>

      {/* Quantity and Price */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
            htmlFor="rawMaterialQuantity"
          >
            Miqdori
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="rawMaterialQuantity"
            name="rawMaterialQuantity"
            type="number"
            placeholder="Miqdor kiriting"
            value={formData.rawMaterialQuantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
            htmlFor="rawMaterialPrice"
          >
            Narxi
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
      <div className="flex flex-col gap-2">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold"
          htmlFor="totalPrice"
        >
          Jami Narxi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="totalPrice"
          name="totalPrice"
          type="text"
          value={totalPrice}
          readOnly
        />
      </div>

      {/* Customer Name and Phone Number */}
      <div className="flex flex-col gap-4">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold"
          htmlFor="customerName"
        >
          Ismi
        </label>
        <select
          name="customerName"
          onChange={handleCustomerChange}
          className="block appearance-none w-full bg-gray-200 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
      <div className="flex flex-col gap-4">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold"
          htmlFor="phoneNumber"
        >
          Telefon raqami
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="phoneNumber"
          name="phoneNumber"
          type="text"
          value={formData.phoneNumber}
          readOnly
        />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-white font-bold">To'lovlar</h3>
        {formData.payments.map((payment, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4">
            <select
              name="paymentType"
              value={payment.paymentType}
              onChange={(e) => handlePaymentChange(index, e)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded"
              required
            >
              <option value="">To'lov turini tanlang</option>
              <option value="naqd">naqd</option>
              <option value="plastik">plastik</option>
            </select>
            <input
              type="number"
              name="amount"
              placeholder="Summa"
              value={payment.amount}
              onChange={(e) => handlePaymentChange(index, e)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded"
              required
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addPayment}
          className="bg-blue-500 text-white py-2 rounded"
        >
          To'lov qo'shish
        </button>
      </div>
      {/* Submit Button */}
      <button
        className="w-full py-3 px-4 mb-5 rounded bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
};

export default CreateRawMaterialPage;
