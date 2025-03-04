import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { CREATE_ORDER } from "../graphql/mutations/order.mutation"; // Adjust the path as necessary
import toast from "react-hot-toast";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("order", orderData);
      await createOrder({
        variables: { input: orderData },
        refetchQueries: ["GetOrders"],
      });
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message);
    }
  };

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
