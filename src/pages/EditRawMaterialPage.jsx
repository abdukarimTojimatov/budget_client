import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { GET_RAW_MATERIAL } from "../graphql/queries/rawMaterial.query";
import { UPDATE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation";
import toast from "react-hot-toast";

const EditRawMaterialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, data } = useQuery(GET_RAW_MATERIAL, { variables: { id } });
  const [updateRawMaterial, { loading: loadingUpdate }] =
    useMutation(UPDATE_RAW_MATERIAL);

  // Initialize payments as an empty array in the initial state
  const initialFormState = {
    rawMaterialName: "",
    rawMaterialDescription: "",
    rawMaterialQuantity: 0,
    customerName: "",
    phoneNumber: "",
    unitOfMeasurement: "",
    rawMaterialCategory: "",
    rawMaterialPrice: 0,
    payments: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    console.log("data", data);
    if (data?.getRawMaterial) {
      const { __typename, ...rawMaterial } = data.getRawMaterial; // Exclude __typename
      setFormData({
        ...rawMaterial,
      });
    }
    console.log("formData", formData);
  }, [data]);

  const addPayment = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      payments: [
        ...(prevFormData.payments || []),
        { paymentType: "", amount: 0, date: "" },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let inputData = { ...formData };
      inputData.payments = inputData.payments.map((payment) => {
        const { __typename, ...rest } = payment; // Exclude __typename
        return rest; // Return the rest of the payment object
      });
      console.log("inputData", inputData);
      await updateRawMaterial({
        variables: { id, input: inputData },
      });
      toast.success("Muvaffaqiyatli yangilandi");
      navigate("/rawMaterial");
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "rawMaterialQuantity" || name === "rawMaterialPrice"
          ? parseFloat(value)
          : value,
    }));
  };

  const handlePaymentChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedPayments = [...prevData.payments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        [name]: name === "amount" ? parseFloat(value) : value,
      };
      return {
        ...prevData,
        payments: updatedPayments,
      };
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 px-5 pb-5">
      <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
        Xom ashyo o'zgartirish
      </p>
      <form
        className="w-full max-w-4xl mx-auto flex flex-wrap gap-5 px-5"
        onSubmit={handleSubmit}
      >
        {/* Raw Material Name */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="rawMaterialName"
          >
            Xom ashyo nomi
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="rawMaterialName"
            name="rawMaterialName"
            type="text"
            required
            placeholder="Xom ashyo nomini kiriting"
            value={formData.rawMaterialName}
            onChange={handleInputChange}
          />
        </div>

        {/* Description */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="rawMaterialDescription"
          >
            Izoh
          </label>
          <textarea
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="rawMaterialDescription"
            name="rawMaterialDescription"
            required
            placeholder="Xom ashyo haqida ta'rif yozing"
            value={formData.rawMaterialDescription}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        {/* Quantity and Price */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="rawMaterialQuantity"
            >
              Miqdori
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="rawMaterialQuantity"
              name="rawMaterialQuantity"
              type="number"
              required
              placeholder="Miqdor kiriting"
              value={formData.rawMaterialQuantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="rawMaterialPrice"
            >
              Narxi
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="rawMaterialPrice"
              name="rawMaterialPrice"
              type="number"
              required
              placeholder="Narx kiriting"
              value={formData.rawMaterialPrice}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Unit of Measurement */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="unitOfMeasurement"
          >
            O'lchov birligi
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="unitOfMeasurement"
            name="unitOfMeasurement"
            type="text"
            required
            placeholder="O'lchov birligini kiriting"
            value={formData.unitOfMeasurement}
            onChange={handleInputChange}
          />
        </div>

        {/* Category */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="rawMaterialCategory"
          >
            Kategoriya
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="rawMaterialCategory"
            name="rawMaterialCategory"
            type="text"
            required
            placeholder="Kategoriyani kiriting"
            value={formData.rawMaterialCategory}
            onChange={handleInputChange}
          />
        </div>

        {/* Customer Information */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="customerName"
            >
              Mijoz ismi
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="customerName"
              name="customerName"
              type="text"
              placeholder="Mijoz ismini kiriting"
              value={formData.customerName}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="phoneNumber"
            >
              Telefon raqami
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              placeholder="Telefon raqamini kiriting"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Payments Section */}
        {/* Payments Section */}
        <div className="w-full">
          <h3 className="text-white font-bold text-lg mb-4">To'lovlar</h3>
          {formData?.payments?.length > 0 ? (
            formData.payments.map((payment, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex-1 min-w-[200px]">
                  <label
                    className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                    htmlFor={`paymentType-${index}`}
                  >
                    To'lov turi
                  </label>
                  <select
                    className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id={`paymentType-${index}`}
                    name="paymentType"
                    value={payment.paymentType}
                    onChange={(e) => handlePaymentChange(index, e)}
                  >
                    <option value="">Tanlang</option>
                    <option value="naqd">Naqd</option>
                    <option value="plastik">Plastik</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label
                    className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                    htmlFor={`amount-${index}`}
                  >
                    Miqdor
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id={`amount-${index}`}
                    name="amount"
                    type="number"
                    value={payment.amount}
                    onChange={(e) => handlePaymentChange(index, e)}
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label
                    className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                    htmlFor={`date-${index}`}
                  >
                    Sana
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id={`date-${index}`}
                    name="date"
                    type="date"
                    value={payment.date}
                    onChange={(e) => handlePaymentChange(index, e)}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Hech to'lov qo'shilmagan.</p>
          )}
        </div>

        {/* Add Payment Button */}
        <button
          type="button"
          onClick={addPayment}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          To'lov qo'shish
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loadingUpdate}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50"
        >
          {loadingUpdate ? "Yangilanmoqda..." : "Xom ashyoni yangilash"}
        </button>
      </form>
    </div>
  );
};

export default EditRawMaterialPage;
