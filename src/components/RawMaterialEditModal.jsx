import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_RAW_MATERIAL } from "../graphql/queries/rawMaterial.query";
import { UPDATE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation";
import { GET_CUSTOMERS_DROPDOWN } from "../graphql/queries/customer.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX } from "react-icons/fi";
import CustomerForm from "./CustomerForm";

const RawMaterialEditModal = ({ isOpen, onClose, rawMaterialId }) => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const navigate = useNavigate();

  const {
    loading: loadingData,
    data,
    refetch,
  } = useQuery(GET_RAW_MATERIAL, {
    variables: { id: rawMaterialId },
    skip: !rawMaterialId,
  });

  const [updateRawMaterial, { loading: loadingUpdate }] =
    useMutation(UPDATE_RAW_MATERIAL);

  // Initialize payments as an empty array in the initial state
  const initialFormState = {
    rawMaterialName: "",
    rawMaterialDescription: "",
    rawMaterialQuantity: 0,
    customer: "", // Now using customer ID instead of name/phone
    unitOfMeasurement: "",
    rawMaterialCategory: "",
    rawMaterialPrice: 0,
    payments: [],
  };

  // Fetch customers for dropdown
  const {
    data: customersData,
    loading: customersLoading,
    refetch: refetchCustomers,
  } = useQuery(GET_CUSTOMERS_DROPDOWN);

  const [formData, setFormData] = useState(initialFormState);

  // State for new payment input
  const [newPayment, setNewPayment] = useState({
    paymentType: "naqd",
    amount: "",
    date: new Date(),
  });

  useEffect(() => {
    if (data?.getRawMaterial) {
      const { __typename, ...rawMaterial } = data.getRawMaterial; // Exclude __typename
      setFormData({
        ...rawMaterial,
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let inputData = { ...formData };

      // Clean up payments by removing __typename
      if (inputData.payments && inputData.payments.length > 0) {
        inputData.payments = inputData.payments.map((payment) => {
          const { __typename, ...rest } = payment || {}; // Exclude __typename
          return rest; // Return the rest of the payment object
        });
      }

      await updateRawMaterial({
        variables: { id: rawMaterialId, input: inputData },
        refetchQueries: ["GetRawMaterials"],
      });

      toast.success("Muvaffaqiyatli yangilandi");
      onClose();
    } catch (error) {
      console.error("Error updating raw material:", error);
      toast.error(error.message || "Xatolik yuz berdi");
    }
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
      payments: [...(formData.payments || []), paymentToAdd],
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
    const customerId = e.target.value;
    setFormData({
      ...formData,
      customer: customerId,
    });
  };

  const totalPrice = formData.rawMaterialQuantity * formData.rawMaterialPrice;

  // Calculate total payment amount
  const totalPaymentAmount =
    formData.payments?.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    ) || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">Homashyo tahrirlash</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center p-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit}>
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
                placeholder="Material nomi"
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
                rows="3"
                placeholder="Ta'rif"
                value={formData.rawMaterialDescription}
                onChange={handleChange}
              />
            </div>

            {/* Customer Info */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
                  htmlFor="customer"
                >
                  Xaridor
                </label>
                <div className="flex">
                  <div className="relative w-full">
                    <select
                      className="block appearance-none w-full bg-gray-200 border text-gray-700 py-2 px-3 rounded-l leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
                      id="customer"
                      name="customer"
                      value={formData.customer}
                      onChange={handleCustomerChange}
                      disabled={customersLoading}
                      required
                    >
                      <option value="">Tanlang</option>
                      {customersLoading ? (
                        <option value="">Yuklanmoqda...</option>
                      ) : (
                        customersData?.getCustomersDropdown?.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name}{" "}
                            {customer.phoneNumber
                              ? `(${customer.phoneNumber})`
                              : ""}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price and Quantity */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="block uppercase tracking-wide text-white text-sm font-bold mb-1"
                  htmlFor="rawMaterialQuantity"
                >
                  Miqdori
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white text-sm"
                  id="rawMaterialQuantity"
                  name="rawMaterialQuantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
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
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white text-sm"
                  id="rawMaterialPrice"
                  name="rawMaterialPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={formData.rawMaterialPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Total Price Display */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label className="block uppercase tracking-wide text-white text-sm font-bold mb-1">
                  Jami narxi
                </label>
                <div className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                  {totalPrice.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label className="block uppercase tracking-wide text-white text-sm font-bold mb-1">
                  To'langan
                </label>
                <div className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm">
                  {totalPaymentAmount.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label className="block uppercase tracking-wide text-white text-sm font-bold mb-1">
                  Qoldiq
                </label>
                <div
                  className={`px-3 py-2 rounded border text-sm font-medium ${
                    totalPrice - totalPaymentAmount > 0
                      ? "bg-red-900/50 border-red-700 text-white"
                      : "bg-green-900/50 border-green-700 text-white"
                  }`}
                >
                  {(totalPrice - totalPaymentAmount).toLocaleString("uz-UZ")}{" "}
                  so'm
                </div>
              </div>
            </div>

            {/* Payments Section */}
            <div className="mt-3">
              <h3 className="text-lg font-bold text-white mb-2">To'lovlar</h3>

              {/* Existing Payments */}
              {formData.payments && formData.payments.length > 0 && (
                <div className="bg-gray-700 p-3 rounded-lg mb-3">
                  <table className="w-full text-sm text-white">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left pb-2">Turi</th>
                        <th className="text-left pb-2">Miqdori</th>
                        <th className="text-left pb-2">Sana</th>
                        <th className="text-right pb-2">Amal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.payments.map((payment, index) => (
                        <tr key={index} className="border-b border-gray-600/50">
                          <td className="py-2">
                            {payment.paymentType === "naqd"
                              ? "Naqd"
                              : "plastik"}
                          </td>
                          <td className="py-2">
                            {payment.amount.toLocaleString("uz-UZ")} so'm
                          </td>
                          <td className="py-2">{payment.date}</td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              className="text-red-400 hover:text-red-500"
                              onClick={() => removePayment(index)}
                            >
                              <FiX />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Payment */}
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label
                      className="block text-white text-xs font-medium mb-1"
                      htmlFor="paymentType"
                    >
                      To'lov turi
                    </label>
                    <select
                      className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-500"
                      id="paymentType"
                      name="paymentType"
                      value={newPayment.paymentType}
                      onChange={handlePaymentChange}
                    >
                      <option value="naqd">Naqd</option>
                      <option value="plastik">plastik</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-white text-xs font-medium mb-1"
                      htmlFor="amount"
                    >
                      Miqdori
                    </label>
                    <input
                      className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-500"
                      id="amount"
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={newPayment.amount}
                      onChange={handlePaymentChange}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-white text-xs font-medium mb-1"
                      htmlFor="date"
                    >
                      Sana
                    </label>
                    <DatePicker
                      selected={newPayment.date}
                      onChange={handleDateChange}
                      className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-500"
                      dateFormat="yyyy/MM/dd"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 text-sm"
                      onClick={addPayment}
                    >
                      Qo'shish
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-md mr-2"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Yangilanmoqda...
                  </div>
                ) : (
                  "Yangilash"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <CustomerForm
          onClose={() => setShowCustomerForm(false)}
          onCustomerCreated={(newCustomer) => {
            // Auto-select the newly created customer
            setFormData({
              ...formData,
              customer: newCustomer._id,
            });
            refetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default RawMaterialEditModal;
