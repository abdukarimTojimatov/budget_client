import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GET_ORDER } from "../graphql/queries/order.query"; // Adjust the path as necessary
import { UPDATE_ORDER } from "../graphql/mutations/order.mutation"; // Adjust the path as necessary
import OrderFormSkeleton from "../skeletons/OrderFormSkeleton"; // Adjust the path as necessary
import toast from "react-hot-toast";

const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("id", id);
  const { loading, data } = useQuery(GET_ORDER, {
    variables: { id: id },
  });

  const [updateOrder, { loading: loadingUpdate }] = useMutation(UPDATE_ORDER);

  const [formData, setFormData] = useState({
    orderName: data?.getOrder?.orderName || "",
    orderCustomerName: data?.getOrder?.orderCustomerName || "",
    orderCustomerPhoneNumber: data?.getOrder?.orderCustomerPhoneNumber || "",
    orderDescription: data?.getOrder?.orderDescription || "",
    orderCategory: data?.getOrder?.orderCategory || "",
    orderType: data?.getOrder?.orderType || "",
    orderStatus: data?.getOrder?.orderStatus || "",
    orderPaymentStatus: data?.getOrder?.orderPaymentStatus || "unpaid",
    orderTotalAmount: data?.getOrder?.orderTotalAmount || "",
    orderExpensesAmount: data?.getOrder?.orderExpensesAmount || "",
    orderTotalPaid: data?.getOrder?.orderTotalPaid || "",
    orderTotalDebt: data?.getOrder?.orderTotalDebt || "",
    orderExpensesDescription: data?.getOrder?.orderExpensesDescription || "",
    orderLocation: data?.getOrder?.orderLocation || "",
    orderPayments: data?.getOrder?.orderPayments || [],
  });

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
            amount: Number(payment.amount),
          })
        ),
      };
      console.log("formData", { ...formattedData, _id: id });
      await updateOrder({
        variables: {
          input: {
            ...formattedData,
            _id: id,
          },
          refetchQueries: [{ query: GET_ORDER }],
        },
      });

      toast.success("Muvaffaqiyatli yangilandi");
      navigate("/orders");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const processedValue = e.target.type === "number" ? Number(value) : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: processedValue,
    }));
  };

  const handlePaymentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPayments = [...formData.orderPayments];
    // Convert amount to number immediately when it's changed
    updatedPayments[index][name] = name === "amount" ? Number(value) : value;

    setFormData((prevData) => ({
      ...prevData,
      orderPayments: updatedPayments,
    }));
  };

  const addPayment = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      orderPayments: [
        ...prevFormData.orderPayments,
        { paymentType: "", amount: 0, date: "" },
      ],
    }));
  };

  useEffect(() => {
    if (data) {
      setFormData({
        orderName: data?.getOrder?.orderName,
        orderCustomerName: data?.getOrder?.orderCustomerName,
        orderCustomerPhoneNumber: data?.getOrder?.orderCustomerPhoneNumber,
        orderDescription: data?.getOrder?.orderDescription,
        orderCategory: data?.getOrder?.orderCategory,
        orderType: data?.getOrder?.orderType,
        orderPaymentStatus: data?.getOrder?.orderPaymentStatus,
        orderStatus: data?.getOrder?.orderStatus,
        orderTotalAmount: data?.getOrder?.orderTotalAmount,
        orderExpensesAmount: data?.getOrder?.orderExpensesAmount,
        orderTotalPaid: data?.getOrder?.orderTotalPaid,
        orderTotalDebt: data?.getOrder?.orderTotalDebt,
        orderExpensesDescription: data?.getOrder?.orderExpensesDescription,
        orderLocation: data?.getOrder?.orderLocation,
        orderPayments: data?.getOrder?.orderPayments || [],
      });
    }
  }, [data]);

  if (loading) return <OrderFormSkeleton />; // Adjust as necessary

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 px-5 pb-5">
      <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
        Buyurtmani o'zgartish
      </p>
      <form
        className="w-full max-w-4xl mx-auto flex flex-wrap gap-5 px-5"
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
            placeholder="Order Name"
            value={formData.orderName}
            onChange={handleInputChange}
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
            placeholder="Customer Name"
            value={formData.orderCustomerName}
            onChange={handleInputChange}
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
            placeholder="Customer Phone Number"
            value={formData.orderCustomerPhoneNumber}
            onChange={handleInputChange}
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
            value={formData.orderType}
            onChange={handleInputChange}
          >
            <option value="">Tanlang</option>
            <option value="bozor">Bozor</option>
            <option value="buyurtma">Buyurtma</option>
            <option value="boshqa">Boshqalar</option>
          </select>
        </div>

        {/* ORDER STATUS */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="orderStatus"
          >
            Buyurtma holati
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="orderStatus"
            name="orderStatus"
            required
            value={formData.orderStatus}
            onChange={handleInputChange}
          >
            <option value="">Tanlang</option>
            <option value="qabul qilingan">Qabul qilingan</option>
            <option value="tayyorlanayabdi">Tayyorlanayabdi</option>
            <option value="tayyor">Tayyor</option>
            <option value="ornatildi">O'rnatildi</option>
          </select>
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
            value={formData.orderDescription}
            onChange={handleInputChange}
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
            value={formData.orderExpensesDescription}
            onChange={handleInputChange}
            rows={10} // Initial number of rows
            style={{ maxHeight: "200px", overflowY: "auto" }} // Set max height and enable vertical scrolling
          />
        </div>

        {/* PAYMENT STATUS */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="orderPaymentStatus"
          >
            Tolov holati
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="orderPaymentStatus"
            name="orderPaymentStatus"
            required
            value={formData.orderPaymentStatus}
            onChange={handleInputChange}
          >
            <option value="">Tanlang</option>
            <option value="tolanmadi">To'lanmadi</option>
            <option value="qismanTolandi">Qisman to'landi Paid</option>
            <option value="tolandi">To'landi</option>
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
            type="text" // Change type to text for better compatibility
            required
            placeholder="Total Amount"
            value={formData.orderTotalAmount}
            onChange={handleInputChange} // You can keep this if you want to handle changes, but it won't affect the input
            // Add this attribute to make the input read-only
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
            placeholder="Expenses Amount"
            value={formData.orderExpensesAmount}
            onChange={handleInputChange}
          />
        </div>

        {/* TOTAL PAID */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="orderTotalPaid"
          >
            Jami to'landi
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="orderTotalPaid"
            name="orderTotalPaid"
            type="string"
            placeholder="Total Paid"
            value={formData.orderTotalPaid}
            onChange={handleInputChange}
            readOnly
          />
        </div>

        {/* TOTAL DEBT */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="orderTotalDebt"
          >
            Jami qarz
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="orderTotalDebt"
            name="orderTotalDebt"
            type="string"
            placeholder="Total Debt"
            value={formData.orderTotalDebt}
            onChange={handleInputChange}
            readOnly
          />
        </div>

        {/* PAYMENT FIELDS */}
        {formData.orderPayments.map((payment, index) => (
          <div key={index} className="flex flex-wrap gap-5">
            <div className="flex-1 min-w-[250px]">
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
                <option value="naqd">naqd</option>
                <option value="plastik">plastik</option>
              </select>
            </div>

            <div className="flex-1 min-w-[250px]">
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
                type="string"
                value={payment.amount}
                onChange={(e) => handlePaymentChange(index, e)}
              />
            </div>

            <div className="flex-1 min-w-[250px]">
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
        ))}

        {/* ADD PAYMENT BUTTON */}
        <button
          type="button"
          onClick={addPayment}
          className="flex-1 min-w-[250px] text-white font-bold w-full rounded px-4 py-2 bg-gradient-to-br from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600"
        >
          To'lov qo'shish
        </button>

        {/* SUBMIT BUTTON */}
        <button
          className="flex-1 min-w-[250px] text-white font-bold w-full rounded px-4 py-2 bg-gradient-to-br from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600"
          type="submit"
          disabled={loadingUpdate}
        >
          {loadingUpdate ? "Updating..." : "Update Order"}
        </button>
      </form>
    </div>
  );
};

export default OrderEditPage;
