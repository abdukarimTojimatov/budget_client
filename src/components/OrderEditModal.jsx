import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ORDER } from "../graphql/queries/order.query";
import { UPDATE_ORDER } from "../graphql/mutations/order.mutation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageUploader from "./ImageUpload/ImageUploader";
import ImageGallery from "./ImageUpload/ImageGallery";
import {
  FiX,
  FiCalendar,
  FiDollarSign,
  FiTrash,
  FiUser,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiTag,
  FiInfo,
  FiFileText,
  FiImage,
  FiUploadCloud,
  FiList,
  FiUpload,
  FiSave,
} from "react-icons/fi";
import { FaRegCreditCard, FaMoneyBillWave, FaImages } from "react-icons/fa";
import { MdDescription, MdCategory, MdOutlineCategory } from "react-icons/md";
import { IoStorefront } from "react-icons/io5";
import toast from "react-hot-toast";

const OrderEditModal = ({ isOpen, onClose, orderId }) => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState("info");
  const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
  const navigate = useNavigate();

  // Initialize formData state
  const [formData, setFormData] = useState({
    orderName: "",
    orderCustomerName: "",
    orderCustomerPhoneNumber: "",
    orderDescription: "",
    orderExpensesDescription: "",
    orderAddress: "",
    orderCategory: "",
    orderStartDate: new Date(),
    orderDeadlineDate: new Date(),
    orderAmount: "",
    orderPayments: [],
    orderStatus: "Aktiv",
    orderType: "Online",
  });

  // Calculate total payment amount whenever orderPayments changes
  useEffect(() => {
    if (formData.orderPayments?.length > 0) {
      const total = formData.orderPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
      );
      setTotalPaymentAmount(total);
    } else {
      setTotalPaymentAmount(0);
    }
  }, [formData.orderPayments]);

  const { loading, data, refetch } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
  });

  const [updateOrder, { loading: loadingUpdate }] = useMutation(UPDATE_ORDER);

  // New payment state for datepicker
  const [newPayment, setNewPayment] = useState({
    paymentType: "naqd",
    amount: "",
    date: new Date(),
  });

  // Initialize formData when order data is loaded
  useEffect(() => {
    if (data?.getOrder) {
      setFormData({
        orderName: data.getOrder.orderName || "",
        orderCustomerName: data.getOrder.orderCustomerName || "",
        orderCustomerPhoneNumber: data.getOrder.orderCustomerPhoneNumber || "",
        orderDescription: data.getOrder.orderDescription || "",
        orderCategory: data.getOrder.orderCategory || "",
        orderType: data.getOrder.orderType || "",
        orderStatus: data.getOrder.orderStatus || "",
        orderPaymentStatus: data.getOrder.orderPaymentStatus || "unpaid",
        orderTotalAmount: data.getOrder.orderTotalAmount || "",
        orderExpensesAmount: data.getOrder.orderExpensesAmount || "",
        orderTotalPaid: data.getOrder.orderTotalPaid || "",
        orderTotalDebt: data.getOrder.orderTotalDebt || "",
        orderExpensesDescription: data.getOrder.orderExpensesDescription || "",
        orderLocation: data.getOrder.orderLocation || "",
        orderPayments: data.getOrder.orderPayments || [],
      });
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = e.target.type === "number" ? Number(value) : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: processedValue,
    }));
  };

  const handleDateChange = (date, index) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      const updatedPayments = [...formData.orderPayments];
      updatedPayments[index].date = formattedDate;

      setFormData((prevData) => ({
        ...prevData,
        orderPayments: updatedPayments,
      }));
    }
  };

  const handleNewPaymentDateChange = (date) => {
    setNewPayment((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handlePaymentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPayments = [...formData.orderPayments];

    // Store the raw value for amount fields to allow for partial input like '.' or empty string
    if (name === "amount") {
      // Allow empty string or valid numeric input including partial numbers
      if (value === "" || !isNaN(value)) {
        updatedPayments[index][name] = value;
      }
    } else {
      updatedPayments[index][name] = value;
    }

    setFormData((prevData) => ({
      ...prevData,
      orderPayments: updatedPayments,
    }));
  };

  const handleAddPayment = () => {
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

    setFormData((prevData) => ({
      ...prevData,
      orderPayments: [...prevData.orderPayments, paymentToAdd],
    }));

    // Reset payment form
    setNewPayment({
      paymentType: "naqd",
      amount: "",
      date: new Date(),
    });
  };

  const handleRemovePayment = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      orderPayments: prevData.orderPayments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        orderTotalAmount: Number(formData.orderTotalAmount),
        orderExpensesAmount: Number(formData.orderExpensesAmount),
        orderTotalPaid: Number(formData.orderTotalPaid),
        orderTotalDebt: Number(formData.orderTotalDebt),
        orderPayments: formData.orderPayments.map(
          ({ __typename, ...payment }) => ({
            ...payment,
            // Convert empty string to 0 and ensure amount is a number when submitting
            amount: payment.amount === "" ? 0 : Number(payment.amount),
          })
        ),
      };

      await updateOrder({
        variables: {
          input: {
            ...formattedData,
            _id: orderId,
          },
        },
        refetchQueries: ["GetOrders", "GetOrder"],
      });

      toast.success("Muvaffaqiyatli yangilandi");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  // Calculate total payment amount
  // totalPaymentAmount is now calculated in the useEffect above

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto border border-gray-700/30 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-full transition-colors duration-200"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center">
          <FiDollarSign className="mr-2" /> Buyurtmani o'zgartish
        </h2>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-4 font-medium text-sm mr-2 flex items-center transition-all duration-200 ${
              activeTab === "info"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-600"
            }`}
          >
            <FiInfo className="mr-2" /> Asosiy Ma'lumotlar
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`py-2 px-4 font-medium text-sm mr-2 flex items-center transition-all duration-200 ${
              activeTab === "payment"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-600"
            }`}
          >
            <FiDollarSign className="mr-2" /> To'lovlar
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`py-2 px-4 font-medium text-sm mr-2 flex items-center transition-all duration-200 ${
              activeTab === "description"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-600"
            }`}
          >
            <FiFileText className="mr-2" /> Tavsif
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`py-2 px-4 font-medium text-sm flex items-center transition-all duration-200 ${
              activeTab === "images"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-600"
            }`}
          >
            <FiImage className="mr-2" /> Rasmlar
          </button>
        </div>

        {loading ? (
          <div className="text-white text-center py-8 flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
            <span>Yuklanmoqda...</span>
          </div>
        ) : (
          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Info Tab */}
            <div className={`${activeTab === "info" ? "block" : "hidden"}`}>
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-5 mb-5 border border-gray-700/50 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {/* ORDER NAME */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderName"
                    >
                      <IoStorefront className="mr-1" /> Buyurtma nomi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IoStorefront className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderName"
                        name="orderName"
                        type="text"
                        required
                        placeholder="Buyurtma nomi"
                        value={formData.orderName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* CUSTOMER NAME */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderCustomerName"
                    >
                      <FiUser className="mr-1" /> Mijoz ismi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderCustomerName"
                        name="orderCustomerName"
                        type="text"
                        required
                        placeholder="Mijoz ismi"
                        value={formData.orderCustomerName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* CUSTOMER PHONE NUMBER */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderCustomerPhoneNumber"
                    >
                      <FiPhone className="mr-1" /> Telefon
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderCustomerPhoneNumber"
                        name="orderCustomerPhoneNumber"
                        type="text"
                        placeholder="Mijoz telefon raqami"
                        value={formData.orderCustomerPhoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderLocation"
                    >
                      <FiMapPin className="mr-1" /> Manzil
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderLocation"
                        name="orderLocation"
                        type="text"
                        placeholder="Manzil"
                        value={formData.orderLocation}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderCategory"
                    >
                      <MdCategory className="mr-1" /> Kategoriyasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdCategory className="text-gray-400" />
                      </div>
                      <select
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderCategory"
                        name="orderCategory"
                        required
                        value={formData.orderCategory}
                        onChange={handleInputChange}
                      >
                        <option value="">Kategoriyani tanlang</option>
                        <option value="oshxona">Oshxona mebel</option>
                        <option value="yotoqxona">Yotoqxona mebel</option>
                        <option value="yumshoq mebel">Yumshoq mebel</option>
                        <option value="boshqa">Boshqalar</option>
                      </select>
                    </div>
                  </div>

                  {/* TYPE */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderType"
                    >
                      <FiTag className="mr-1" /> Turi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiTag className="text-gray-400" />
                      </div>
                      <select
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderType"
                        name="orderType"
                        required
                        value={formData.orderType}
                        onChange={handleInputChange}
                      >
                        <option value="">Tanlang</option>
                        <option value="bozor">Bozor</option>
                        <option value="buyurtma">Buyurtma</option>
                        <option value="boshqa">Boshqalar</option>
                      </select>
                    </div>
                  </div>

                  {/* ORDER STATUS */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderStatus"
                    >
                      <FiClock className="mr-1" /> Holati
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="text-gray-400" />
                      </div>
                      <select
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderStatus"
                        name="orderStatus"
                        required
                        value={formData.orderStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Tanlang</option>
                        <option value="yangi">yangi</option>
                        <option value="tayyorlanayabdi">Tayyorlanayabdi</option>
                        <option value="tayyor">Tayyor</option>
                        <option value="ornatildi">O'rnatildi</option>
                      </select>
                    </div>
                  </div>

                  {/* PAYMENT STATUS */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderPaymentStatus"
                    >
                      <FiDollarSign className="mr-1" /> To'lov holati
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400" />
                      </div>
                      <select
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderPaymentStatus"
                        name="orderPaymentStatus"
                        required
                        value={formData.orderPaymentStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Tanlang</option>
                        <option value="tolanmadi">To'lanmadi</option>
                        <option value="qisman">Qisman to'landi</option>
                        <option value="tolandi">To'landi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Tab */}
            <div className={`${activeTab === "payment" ? "block" : "hidden"}`}>
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-5 mb-5 border border-gray-700/50 shadow-lg">
                {/* Payment Amounts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* TOTAL AMOUNT */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderTotalAmount"
                    >
                      <FiDollarSign className="mr-1" /> Buyurtma summasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderTotalAmount"
                        name="orderTotalAmount"
                        type="number"
                        required
                        placeholder="Buyurtma summasi"
                        value={formData.orderTotalAmount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* EXPENSES AMOUNT */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderExpensesAmount"
                    >
                      <FiAlertCircle className="mr-1" /> Harajatlar summasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiAlertCircle className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderExpensesAmount"
                        name="orderExpensesAmount"
                        type="number"
                        required
                        placeholder="Harajatlar summasi"
                        value={formData.orderExpensesAmount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* TOTAL PAID */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderTotalPaid"
                    >
                      <FaMoneyBillWave className="mr-1" /> Jami to'landi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMoneyBillWave className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderTotalPaid"
                        name="orderTotalPaid"
                        type="number"
                        placeholder="To'langan summasini kiriting"
                        value={formData.orderTotalPaid}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* TOTAL DEBT */}
                  <div>
                    <label
                      className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                      htmlFor="orderTotalDebt"
                    >
                      <FaRegCreditCard className="mr-1" /> Jami qarz
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRegCreditCard className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        id="orderTotalDebt"
                        name="orderTotalDebt"
                        type="number"
                        placeholder="Qarz summasini kiriting"
                        value={formData.orderTotalDebt}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">
                      To'lov jarayoni:{" "}
                      {Number(formData.orderTotalAmount) > 0
                        ? Math.round(
                            (totalPaymentAmount /
                              Number(formData.orderTotalAmount)) *
                              100
                          )
                        : 0}
                      %
                    </span>
                    <span className="text-gray-400">
                      {(totalPaymentAmount || 0).toLocaleString()} /{" "}
                      {(
                        Number(formData.orderTotalAmount) || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          Number(formData.orderTotalAmount) > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (totalPaymentAmount /
                                    Number(formData.orderTotalAmount)) *
                                    100
                                )
                              )
                            : 0
                        }%`,
                        backgroundColor:
                          totalPaymentAmount >=
                          Number(formData.orderTotalAmount)
                            ? "#10b981"
                            : "#3b82f6",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Payment input form */}
                <div className="bg-gray-700/50 rounded-xl mb-6 border border-gray-700/90 shadow-inner p-4">
                  <h3 className="text-blue-400 text-base font-bold mb-3 flex items-center">
                    <FiPlus className="mr-2" /> Yangi to'lov qo'shish
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="uppercase tracking-wide text-gray-300 text-xs font-bold mb-1 flex items-center">
                        <FiDollarSign className="mr-1" /> To'lov turi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiDollarSign className="text-gray-400" />
                        </div>
                        <select
                          className="appearance-none block w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          name="paymentType"
                          value={newPayment.paymentType}
                          onChange={handleNewPaymentChange}
                        >
                          <option value="naqd">Naqd</option>
                          <option value="plastik">Plastik</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="uppercase tracking-wide text-gray-300 text-xs font-bold mb-1 flex items-center">
                        <FaMoneyBillWave className="mr-1" /> To'lov miqdori
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMoneyBillWave className="text-gray-400" />
                        </div>
                        <input
                          className="appearance-none block w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          type="number"
                          name="amount"
                          placeholder="Miqdor"
                          value={newPayment.amount}
                          onChange={handleNewPaymentChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="uppercase tracking-wide text-gray-300 text-xs font-bold mb-1 flex items-center">
                        <FiCalendar className="mr-1" /> To'lov sanasi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="text-gray-400" />
                        </div>
                        <DatePicker
                          selected={newPayment.date}
                          onChange={handleNewPaymentDateChange}
                          className="appearance-none block w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          dateFormat="yyyy-MM-dd"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded w-full"
                    onClick={handleAddPayment}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiPlus className="text-lg" />
                      To'lovni qo'shish
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment list */}
              {formData.orderPayments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-blue-400 text-base font-bold mb-3 flex items-center">
                    <FiList className="mr-2" /> To'lovlar ro'yxati
                  </h3>
                  <div className="bg-gray-800/80 rounded-xl border border-gray-700/90">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr className="bg-gray-800">
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                            >
                              #
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                            >
                              To'lov turi
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                            >
                              Miqdor
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                            >
                              Sana
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                            >
                              Amallar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {formData.orderPayments.map((payment, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-700/50 transition-colors duration-150"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 capitalize">
                                <div className="flex items-center">
                                  {payment.paymentType === "naqd" ? (
                                    <FaMoneyBillWave className="mr-2 text-green-400" />
                                  ) : (
                                    <FaRegCreditCard className="mr-2 text-blue-400" />
                                  )}
                                  {payment.paymentType}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {payment.amount.toLocaleString()} so'm
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {payment.date
                                  ? new Date(payment.date).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 transition-colors duration-150"
                                  onClick={() => handleRemovePayment(index)}
                                >
                                  <FiTrash />
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

            {/* Description Tab */}
            <div
              className={`${activeTab === "description" ? "block" : "hidden"}`}
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-5 mb-5 border border-gray-700/50 shadow-lg">
                <div className="mb-4">
                  <label
                    className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                    htmlFor="orderDescription"
                  >
                    <FiFileText className="mr-1" /> Buyurtma tavsifi
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-gray-400">
                      <FiFileText />
                    </div>
                    <textarea
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-3 px-10 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                      id="orderDescription"
                      name="orderDescription"
                      placeholder="Buyurtma haqida batafsil ma'lumot kiriting"
                      value={formData.orderDescription}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    className="uppercase tracking-wide text-blue-400 text-xs font-bold mb-1 flex items-center"
                    htmlFor="orderExpensesDescription"
                  >
                    <FiAlertCircle className="mr-1" /> Harajatlar tavsifi
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-gray-400">
                      <FiAlertCircle />
                    </div>
                    <textarea
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-3 px-10 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                      id="orderExpensesDescription"
                      name="orderExpensesDescription"
                      placeholder="Harajatlar haqida batafsil ma'lumot kiriting"
                      value={formData.orderExpensesDescription}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images Tab */}
            <div className={`${activeTab === "images" ? "block" : "hidden"}`}>
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-5 mb-5 border border-gray-700/50 shadow-lg">
                {orderId ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-blue-400 text-base font-bold mb-3 flex items-center">
                        <FiUploadCloud className="mr-2" /> Rasmlarni yuklash
                      </h3>
                      <ImageUploader orderId={orderId} />
                    </div>

                    {data?.getOrder?.images && (
                      <div className="mt-6">
                        <h3 className="text-blue-400 text-base font-bold mb-3 flex items-center">
                          <FiList className="mr-2" /> Yuklangan rasmlar
                        </h3>
                        <ImageGallery
                          images={data.getOrder.images}
                          orderId={orderId}
                          onImageDeleted={(imageUrl, e) => {
                            // Prevent any navigation event
                            if (e) e.preventDefault();
                            refetch();
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <FiImage className="text-4xl mx-auto mb-2" />
                    <p>
                      Buyurtmani saqlashdan keyin rasmlari bilan ishlashingiz
                      mumkin
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="w-full flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center"
              >
                <FiX className="mr-2" /> Bekor qilish
              </button>
              <button
                className="text-white font-bold rounded-lg px-4 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-lg"
                type="submit"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                    Yangilanmoqda...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderEditModal;
