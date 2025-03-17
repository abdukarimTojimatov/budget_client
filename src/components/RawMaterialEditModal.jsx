import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_RAW_MATERIAL } from "../graphql/queries/rawMaterial.query";
import { UPDATE_RAW_MATERIAL } from "../graphql/mutations/rawMaterial.mutation";
import { GET_CUSTOMERS_DROPDOWN } from "../graphql/queries/customer.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiX,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiUser,
  FiPhone,
  FiTag,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiBox,
  FiInfo,
  FiEdit,
} from "react-icons/fi";
import { FaMoneyBillWave, FaRegCreditCard, FaTrash } from "react-icons/fa";
import { MdCategory, MdDescription } from "react-icons/md";
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
  } = useQuery(GET_CUSTOMERS_DROPDOWN, {
    fetchPolicy: "network-only",
  });

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
      
      // Make sure customer property is properly set
      const customerValue = rawMaterial.customer && rawMaterial.customer._id ? 
        rawMaterial.customer._id : 
        (rawMaterial.customer || "");

      setFormData({
        ...rawMaterial,
        customer: customerValue
      });
      
      console.log("Raw material loaded:", rawMaterial);
      console.log("Customer value set to:", customerValue);
    }
  }, [data]);

  useEffect(() => {
    if (customersData?.getCustomersDropdown) {
      console.log("Customers loaded:", customersData.getCustomersDropdown);
    }
  }, [customersData]);

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
    console.log('Selected customer ID:', customerId);
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-gray-700/30">
        <div className="sticky top-0 bg-gradient-to-r from-blue-900/90 to-gray-800/90 backdrop-blur-sm p-4 border-b border-gray-700/50 flex justify-between items-center z-10">
          <div className="flex items-center">
            <FiEdit className="text-blue-400 mr-2" size={22} />
            <h2 className="text-xl font-bold text-white">
              Homashyo tahrirlash
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-gray-800/50 p-1.5 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center p-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form
            className="flex flex-col gap-5 p-6 bg-gradient-to-b from-gray-800/50 to-gray-900/70"
            onSubmit={handleSubmit}
          >
            {/* Top Row - Unit & Category */}
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Unit of Measurement */}
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="flex items-center text-blue-300 text-sm font-medium mb-2"
                  htmlFor="unitOfMeasurement"
                >
                  <FiPackage className="mr-2" size={16} />
                  O'lchov birligi
                </label>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-gray-700/50 border border-gray-600/50 text-white py-2.5 px-3 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="flex items-center text-blue-300 text-sm font-medium mb-2"
                  htmlFor="rawMaterialCategory"
                >
                  <MdCategory className="mr-2" size={16} />
                  Kategoriya
                </label>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-gray-700/50 border border-gray-600/50 text-white py-2.5 px-3 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Material Name */}
            <div className="flex flex-col gap-1">
              <label
                className="flex items-center text-blue-300 text-sm font-medium mb-2"
                htmlFor="rawMaterialName"
              >
                <FiTag className="mr-2" size={16} />
                Xom ashyo nomi
              </label>
              <input
                className="appearance-none block w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all placeholder-gray-400"
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
                className="flex items-center text-blue-300 text-sm font-medium mb-2"
                htmlFor="rawMaterialDescription"
              >
                <MdDescription className="mr-2" size={16} />
                Izoh
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all placeholder-gray-400"
                id="rawMaterialDescription"
                name="rawMaterialDescription"
                rows="3"
                placeholder="Ta'rif"
                value={formData.rawMaterialDescription}
                onChange={handleChange}
              />
            </div>

            {/* Customer Info */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="flex items-center text-blue-300 text-sm font-medium mb-2"
                  htmlFor="customer"
                >
                  <FiUser className="mr-2" size={16} />
                  Xaridor
                </label>
                <div className="flex">
                  <div className="relative w-full">
                    <select
                      className="block appearance-none w-full bg-gray-700/50 border border-gray-600/50 text-white py-2.5 px-3 rounded-l-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all"
                      id="customer"
                      name="customer"
                      value={formData.customer || ''}
                      onChange={handleCustomerChange}
                      disabled={customersLoading}
                      required
                    >
                      <option value="">Tanlang</option>
                      {customersLoading ? (
                        <option value="">Yuklanmoqda...</option>
                      ) : customersData?.getCustomersDropdown?.length > 0 ? (
                        customersData.getCustomersDropdown.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name}{" "}
                            {customer.phoneNumber
                              ? `(${customer.phoneNumber})`
                              : ""}
                          </option>
                        ))
                      ) : (
                        <option value="">Xaridorlar topilmadi</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price and Quantity */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="flex items-center text-blue-300 text-sm font-medium mb-2"
                  htmlFor="rawMaterialQuantity"
                >
                  <FiPackage className="mr-2" size={16} />
                  Miqdori
                </label>
                <div className="relative">
                  <input
                    className="appearance-none block w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all placeholder-gray-400"
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
              </div>
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label
                  className="flex items-center text-blue-300 text-sm font-medium mb-2"
                  htmlFor="rawMaterialPrice"
                >
                  <FiDollarSign className="mr-2" size={16} />
                  Narxi
                </label>
                <div className="relative">
                  <input
                    className="appearance-none block w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all placeholder-gray-400"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <span>so'm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Price Display */}
            <div className="flex flex-col sm:flex-row gap-5 bg-gray-800/50 p-4 rounded-lg border border-gray-700/30">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label className="flex items-center text-blue-300 text-sm font-medium mb-2">
                  <FiDollarSign className="mr-2" size={16} />
                  Jami narxi
                </label>
                <div className="px-4 py-2.5 bg-gray-700/70 text-white rounded-lg border border-gray-600/30 text-sm font-medium">
                  {totalPrice.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label className="flex items-center text-blue-300 text-sm font-medium mb-2">
                  <FaMoneyBillWave className="mr-2" size={16} />
                  To'langan
                </label>
                <div className="px-4 py-2.5 bg-gray-700/70 text-white rounded-lg border border-gray-600/30 text-sm font-medium">
                  {totalPaymentAmount.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
              <div className="w-full sm:flex-1 min-w-[200px]">
                <label className="flex items-center text-blue-300 text-sm font-medium mb-2">
                  <FaRegCreditCard className="mr-2" size={16} />
                  Qoldiq
                </label>
                <div
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${
                    totalPrice - totalPaymentAmount > 0
                      ? "bg-red-900/70 border-red-700/30 text-white"
                      : "bg-green-900/70 border-green-700/30 text-white"
                  }`}
                >
                  {(totalPrice - totalPaymentAmount).toLocaleString("uz-UZ")}{" "}
                  so'm
                </div>
              </div>
            </div>

            {/* Payments Section */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <FaMoneyBillWave className="text-blue-400 mr-2" size={18} />
                To'lovlar
              </h3>

              {/* Existing Payments */}
              {formData.payments && formData.payments.length > 0 && (
                <div className="bg-gray-800/70 p-4 rounded-lg mb-4 border border-gray-700/30">
                  <table className="w-full text-sm text-white">
                    <thead>
                      <tr className="border-b border-gray-600/30">
                        <th className="text-left pb-3 font-medium text-blue-300">
                          Turi
                        </th>
                        <th className="text-left pb-3 font-medium text-blue-300">
                          Miqdori
                        </th>
                        <th className="text-left pb-3 font-medium text-blue-300">
                          Sana
                        </th>
                        <th className="text-right pb-3 font-medium text-blue-300">
                          Amal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.payments.map((payment, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-600/20 hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-3 pl-2">
                            <span className="flex items-center">
                              {payment.paymentType === "naqd" ? (
                                <>
                                  <FaMoneyBillWave
                                    className="text-green-400 mr-2"
                                    size={14}
                                  />{" "}
                                  Naqd
                                </>
                              ) : (
                                <>
                                  <FaRegCreditCard
                                    className="text-blue-400 mr-2"
                                    size={14}
                                  />{" "}
                                  Plastik
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-medium">
                              {payment.amount.toLocaleString("uz-UZ")} so'm
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="flex items-center">
                              <FiCalendar
                                className="text-gray-400 mr-2"
                                size={14}
                              />
                              {payment.date}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              className="text-red-400 hover:text-red-500 bg-red-900/20 hover:bg-red-900/40 p-1.5 rounded-lg transition-colors"
                              onClick={() => removePayment(index)}
                            >
                              <FaTrash size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Payment */}
              <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/30">
                <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                  <FiPlus className="mr-2" size={16} />
                  Yangi to'lov qo'shish
                </h4>
                <div className="flex flex-col sm:flex-row gap-5">
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
