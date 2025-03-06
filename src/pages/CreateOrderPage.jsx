import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { CREATE_ORDER } from "../graphql/mutations/order.mutation"; // Adjust the path as necessary
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({
    orderName: "",
    orderCustomerName: "",
    orderCustomerPhoneNumber: "",
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
      setOrderData({
        orderName: "",
        orderCustomerName: "",
        orderCustomerPhoneNumber: "",
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
      navigate("/orders");
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

  return (
    <form
      className="max-w-4xl mx-auto flex flex-wrap items-center gap-5 px-10 pb-5"
      onSubmit={handleSubmit}
    >
      {/* ORDER NAME */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderName"
        >
          Buyurtma nomi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderName"
          name="orderName"
          type="text"
          required
          placeholder="Buyurtma nomi"
          value={orderData.orderName}
          onChange={handleChange}
        />
      </div>

      {/* CUSTOMER NAME */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderCustomerName"
        >
          Mijoz ismi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderCustomerName"
          name="orderCustomerName"
          type="text"
          required
          placeholder="Mijoz ismi"
          value={orderData.orderCustomerName}
          onChange={handleChange}
        />
      </div>

      {/* CUSTOMER PHONE NUMBER */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderCustomerPhoneNumber"
        >
          Mijoz telefon raqami
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderCustomerPhoneNumber"
          name="orderCustomerPhoneNumber"
          type="text"
          placeholder="Mijoz telefon raqami"
          value={orderData.orderCustomerPhoneNumber || "+998"} // Set default value
          onChange={handleChange}
          onFocus={(e) => {
            if (e.target.value === "") {
              e.target.value = "+998"; // Auto-fill on focus if empty
            }
          }}
          onBlur={(e) => {
            if (e.target.value === "+998") {
              e.target.value = "+998"; // Keep it as +998 if nothing else is entered
            }
          }}
        />
      </div>

      {/* LOCATION */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderLocation"
        >
          Manzil
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderLocation"
          name="orderLocation"
          type="text"
          required
          placeholder="Manzil"
          value={orderData.orderLocation}
          onChange={handleChange}
        />
      </div>

      {/* CATEGORY */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderCategory"
        >
          Buyurtma kategoriyasi
        </label>
        <select
          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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

      {/* TYPE */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderType"
        >
          Buyurtma turi
        </label>
        <select
          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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

      {/* TOTAL AMOUNT */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderTotalAmount"
        >
          Buyurtma summasi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderTotalAmount"
          name="orderTotalAmount"
          type="string" // Change type to number for numeric input
          required
          placeholder="Buyurtma summasi"
          value={orderData.orderTotalAmount}
          onChange={handleChange}
        />
      </div>

      {/* EXPENSES AMOUNT */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderExpensesAmount"
        >
          Harajatlar summasi
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderExpensesAmount"
          name="orderExpensesAmount"
          type="string"
          required
          placeholder="Harajatlar summasi"
          value={orderData.orderExpensesAmount}
          onChange={handleChange}
        />
      </div>

      {/* READY DATE */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderReadyDate"
        >
          Buyurtma yetkazish vaqti
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          name="orderReadyDate"
          type="date"
          value={orderData.orderReadyDate}
          onChange={handleChange}
        />
      </div>

      {/* PAYMENT SECTION */}
      <div className="w-full">
        <h3 className="text-white text-lg font-bold mb-4">
          To'lov ma'lumotlari
        </h3>

        {/* Payment input form */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-lg mb-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-white text-xs font-bold mb-2">
              To'lov turi
            </label>
            <select
              className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4"
              name="paymentType"
              value={newPayment.paymentType}
              onChange={handlePaymentChange}
            >
              <option value="naqd">Naqd</option>
              <option value="plastik">Plastik</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-white text-xs font-bold mb-2">
              To'lov miqdori
            </label>
            <input
              className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4"
              type="number"
              name="amount"
              placeholder="Miqdor"
              value={newPayment.amount}
              onChange={handlePaymentChange}
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-white text-xs font-bold mb-2">
              To'lov sanasi
            </label>
            <DatePicker
              selected={newPayment.date}
              onChange={handleDateChange}
              className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex items-end w-full sm:w-auto">
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded w-full sm:w-auto"
              onClick={addPayment}
            >
              To'lov qo'shish
            </button>
          </div>
        </div>

        {/* Payment list */}
        {orderData.orderPayments.length > 0 && (
          <div className="mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-bold">To'lovlar ro'yxati</h4>
                <p className="text-white">
                  Jami: {totalPaymentAmount} / {orderData.orderTotalAmount} (
                  {orderData.orderTotalAmount > 0
                    ? Math.round(
                        (totalPaymentAmount / orderData.orderTotalAmount) * 100
                      )
                    : 0}
                  %)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 text-white">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">To'lov turi</th>
                      <th className="p-2 text-left">Miqdor</th>
                      <th className="p-2 text-left">Sana</th>
                      <th className="p-2 text-left">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.orderPayments.map((payment, index) => (
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

      {/* DESCRIPTION */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderDescription"
        >
          Buyurtma tavsifi
        </label>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="orderDescription"
          name="orderDescription"
          required
          placeholder="Buyurtma tavsifi"
          value={orderData.orderDescription}
          onChange={handleChange}
          rows={10} // Initial number of rows
          style={{ maxHeight: "200px", overflowY: "auto" }} // Set max height and enable vertical scrolling
        />
      </div>

      {/* EXPENSES DESCRIPTION */}
      <div className="flex-1 min-w-[250px]">
        <label
          className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
          htmlFor="orderExpensesDescription"
        >
          Harajatlar tavsifi
        </label>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 resize-none overflow-auto"
          id="orderExpensesDescription"
          name="orderExpensesDescription"
          required
          placeholder="Harajatlar tavsifi"
          value={orderData.orderExpensesDescription}
          onChange={handleChange}
          rows={10}
          style={{ maxHeight: "200px", overflowY: "auto" }} // Set max height and enable vertical scrolling
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        className="text-white font-bold w-full rounded px-4 py-2 bg-gradient-to-br from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saqlash..." : "Saqlash"}
      </button>
    </form>
  );
};

export default CreateOrderPage;
