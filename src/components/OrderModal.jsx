import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { CREATE_ORDER } from "../graphql/mutations/order.mutation";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiCalendar, FiDollarSign, FiUser, FiPhone, FiMapPin, FiPlus } from "react-icons/fi";
import { FaRegCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { MdOutlineCategory, MdDescription } from "react-icons/md";
import { IoStorefront } from "react-icons/io5";

const OrderModal = ({ isOpen, onClose }) => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState("info");
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({
    orderName: "",
    orderCustomerName: "",
    orderCustomerPhoneNumber: "+998",
    orderDescription: "",
    orderCategory: "",
    orderType: "",
    orderTotalAmount: "",
    orderExpensesAmount: "",
    orderExpensesDescription: "",
    orderLocation: "",
    orderReadyDate: "",
    orderPayments: [],
  });

  // State for new payment input
  const [newPayment, setNewPayment] = useState({
    paymentType: "naqd",
    amount: "",
    date: new Date(),
  });

  const [createOrder, { loading }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      toast.success("Muvaffaqiyatli yaratildi");
      onClose();
      navigate("/orders");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const numericFields = ["orderTotalAmount", "orderExpensesAmount"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleDateChange = (date) => {
    setNewPayment((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleOrderDateChange = (date) => {
    setOrderData((prev) => ({
      ...prev,
      orderReadyDate: date ? new Date(date).toISOString().split("T")[0] : "",
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

    setOrderData((prev) => ({
      ...prev,
      orderPayments: [...prev.orderPayments, paymentToAdd],
    }));

    // Reset payment form
    setNewPayment({
      paymentType: "naqd",
      amount: "",
      date: new Date(),
    });
  };

  const removePayment = (index) => {
    setOrderData((prev) => ({
      ...prev,
      orderPayments: prev.orderPayments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderDataToSubmit = {
        ...orderData,
        orderPayments: orderData.orderPayments.length
          ? orderData.orderPayments
          : undefined,
      };

      console.log("order", orderDataToSubmit);
      await createOrder({
        variables: { input: orderDataToSubmit },
        refetchQueries: ["GetOrders"],
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message);
    }
  };

  // Calculate total payment amount
  const totalPaymentAmount = orderData.orderPayments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <FiX size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FiPlus className="mr-2 text-blue-400" /> Yangi buyurtma qo'shish
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "info" 
              ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-400" 
              : "text-gray-400 hover:text-white"}`}
          >
            Asosiy ma'lumotlar
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "payment" 
              ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-400" 
              : "text-gray-400 hover:text-white"}`}
          >
            To'lov ma'lumotlari
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "description" 
              ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-400" 
              : "text-gray-400 hover:text-white"}`}
          >
            Qo'shimcha ma'lumotlar
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tab Content */}
          <div className="mb-6">
            {/* Basic Info Tab */}
            <div className={`${activeTab === "info" ? "block" : "hidden"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ORDER NAME */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderName">
                    Buyurtma nomi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdDescription className="text-gray-400" />
                    </div>
                    <input
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="orderName"
                      name="orderName"
                      type="text"
                      required
                      placeholder="Buyurtma nomi"
                      value={orderData.orderName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* CUSTOMER NAME */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderCustomerName">
                    Mijoz ismi
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
                      value={orderData.orderCustomerName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* CUSTOMER PHONE NUMBER */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderCustomerPhoneNumber">
                    Mijoz telefon raqami
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
                      value={orderData.orderCustomerPhoneNumber || "+998"}
                      onChange={handleChange}
                      onFocus={(e) => {
                        if (e.target.value === "") {
                          e.target.value = "+998";
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "+998") {
                          e.target.value = "+998";
                        }
                      }}
                    />
                  </div>
                </div>

                {/* LOCATION */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderLocation">
                    Manzil
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
                      required
                      placeholder="Manzil"
                      value={orderData.orderLocation}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* CATEGORY */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderCategory">
                    Buyurtma kategoriyasi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdOutlineCategory className="text-gray-400" />
                    </div>
                    <select
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="orderCategory"
                      name="orderCategory"
                      required
                      value={orderData.orderCategory}
                      onChange={handleChange}
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
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderType">
                    Buyurtma turi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoStorefront className="text-gray-400" />
                    </div>
                    <select
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="orderType"
                      name="orderType"
                      required
                      value={orderData.orderType}
                      onChange={handleChange}
                    >
                      <option value="">Tanlang</option>
                      <option value="bozor">Bozor</option>
                      <option value="buyurtma">Buyurtma</option>
                      <option value="boshqa">Boshqalar</option>
                    </select>
                  </div>
                </div>
                
                {/* TOTAL AMOUNT */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderTotalAmount">
                    Buyurtma summasi
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
                      value={orderData.orderTotalAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* EXPENSES AMOUNT */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderExpensesAmount">
                    Harajatlar summasi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-400" />
                    </div>
                    <input
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="orderExpensesAmount"
                      name="orderExpensesAmount"
                      type="number"
                      required
                      placeholder="Harajatlar summasi"
                      value={orderData.orderExpensesAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* READY DATE */}
                <div className="relative">
                  <label className="block uppercase tracking-wide text-white text-xs font-bold mb-1" htmlFor="orderReadyDate">
                    Buyurtma yetkazish vaqti
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <DatePicker
                      selected={orderData.orderReadyDate ? new Date(orderData.orderReadyDate) : null}
                      onChange={handleOrderDateChange}
                      className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Sana tanlang"
                      id="orderReadyDate"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Tab */}
            <div className={`${activeTab === "payment" ? "block" : "hidden"}`}>
              {/* Payment input form */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-4 mb-5 border border-gray-700/50 shadow-lg">
                <h3 className="text-blue-400 text-lg font-bold mb-4 flex items-center">
                  <FiDollarSign className="mr-2" /> Yangi to'lov qo'shish
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <label className="block text-white text-xs font-bold mb-1">
                      To'lov turi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {newPayment.paymentType === "naqd" ? 
                          <FaMoneyBillWave className="text-gray-400" /> : 
                          <FaRegCreditCard className="text-gray-400" />}
                      </div>
                      <select
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        name="paymentType"
                        value={newPayment.paymentType}
                        onChange={handlePaymentChange}
                      >
                        <option value="naqd">Naqd</option>
                        <option value="plastik">Plastik</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-white text-xs font-bold mb-1">
                      To'lov miqdori
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400" />
                      </div>
                      <input
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        type="number"
                        name="amount"
                        placeholder="Miqdor"
                        value={newPayment.amount}
                        onChange={handlePaymentChange}
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-white text-xs font-bold mb-1">
                      To'lov sanasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <DatePicker
                        selected={newPayment.date}
                        onChange={handleDateChange}
                        className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center"
                    onClick={addPayment}
                  >
                    <FiPlus className="mr-1" /> To'lov qo'shish
                  </button>
                </div>
              </div>

              {/* Payment list */}
              {orderData.orderPayments.length > 0 ? (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-4 border border-gray-700/50 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <h4 className="text-blue-400 text-lg font-bold flex items-center">
                      <FiDollarSign className="mr-2" /> To'lovlar ro'yxati
                    </h4>
                    <div className="mt-2 sm:mt-0">
                      {/* Payment progress bar */}
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${orderData.orderTotalAmount > 0 && totalPaymentAmount >= orderData.orderTotalAmount ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${orderData.orderTotalAmount > 0 ? Math.min(100, Math.round((totalPaymentAmount / orderData.orderTotalAmount) * 100)) : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-white text-sm whitespace-nowrap">
                          {totalPaymentAmount.toLocaleString()} / {orderData.orderTotalAmount?.toLocaleString() || 0} 
                          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/30">
                            {orderData.orderTotalAmount > 0
                              ? Math.round(
                                  (totalPaymentAmount / orderData.orderTotalAmount) * 100
                                )
                              : 0}%
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700/50 text-white text-sm rounded-lg overflow-hidden">
                      <thead className="bg-gray-800/70">
                        <tr>
                          <th className="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">To'lov turi</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Miqdor</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sana</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600/30">
                        {orderData.orderPayments.map((payment, index) => (
                          <tr key={index} className="hover:bg-gray-600/30 transition-colors duration-150">
                            <td className="p-3">
                              <div className="flex items-center">
                                {payment.paymentType === "naqd" ? 
                                  <FaMoneyBillWave className="text-green-400 mr-2" /> : 
                                  <FaRegCreditCard className="text-blue-400 mr-2" />}
                                {payment.paymentType === "naqd" ? "Naqd" : "Plastik"}
                              </div>
                            </td>
                            <td className="p-3 font-medium">{payment.amount.toLocaleString()}</td>
                            <td className="p-3">{payment.date}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1.5 rounded-full transition-colors duration-200"
                                onClick={() => removePayment(index)}
                              >
                                <FiX size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <FiDollarSign className="text-gray-500 mb-2" size={40} />
                  <p className="text-gray-400 text-center">Hozircha to'lovlar yo'q. Yuqoridagi forma orqali to'lov qo'shing.</p>
                </div>
              )}
            </div>

                      {/* Description Tab */}
            <div className={`${activeTab === "description" ? "block" : "hidden"}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* DESCRIPTION */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-4 border border-gray-700/50 shadow-lg">
                  <label
                    className="uppercase tracking-wide text-blue-400 text-sm font-bold mb-2 flex items-center"
                    htmlFor="orderDescription"
                  >
                    <MdDescription className="mr-2" /> Buyurtma tavsifi
                  </label>
                  <textarea
                    className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    id="orderDescription"
                    name="orderDescription"
                    required
                    placeholder="Buyurtma tavsifi"
                    value={orderData.orderDescription}
                    onChange={handleChange}
                    rows={8}
                  />
                </div>

                {/* EXPENSES DESCRIPTION */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/90 rounded-xl p-4 border border-gray-700/50 shadow-lg">
                  <label
                    className="uppercase tracking-wide text-blue-400 text-sm font-bold mb-2 flex items-center"
                    htmlFor="orderExpensesDescription"
                  >
                    <FiDollarSign className="mr-2" /> Harajatlar tavsifi
                  </label>
                  <textarea
                    className="appearance-none block w-full bg-gray-700/80 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    id="orderExpensesDescription"
                    name="orderExpensesDescription"
                    required
                    placeholder="Harajatlar tavsifi"
                    value={orderData.orderExpensesDescription}
                    onChange={handleChange}
                    rows={8}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="w-full flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              className="text-white font-bold rounded px-4 py-2 bg-gradient-to-br from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saqlash..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
