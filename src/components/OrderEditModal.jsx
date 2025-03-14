import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ORDER } from "../graphql/queries/order.query";
import { UPDATE_ORDER } from "../graphql/mutations/order.mutation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageUploader from "./ImageUpload/ImageUploader";
import ImageGallery from "./ImageUpload/ImageGallery";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const OrderEditModal = ({ isOpen, onClose, orderId }) => {
  const navigate = useNavigate();

  const { loading, data, refetch } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
  });

  const [updateOrder, { loading: loadingUpdate }] = useMutation(UPDATE_ORDER);

  const [formData, setFormData] = useState({
    orderName: "",
    orderCustomerName: "",
    orderCustomerPhoneNumber: "",
    orderDescription: "",
    orderCategory: "",
    orderType: "",
    orderStatus: "",
    orderPaymentStatus: "",
    orderTotalAmount: "",
    orderExpensesAmount: "",
    orderTotalPaid: "",
    orderTotalDebt: "",
    orderExpensesDescription: "",
    orderLocation: "",
    orderPayments: [],
  });

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
      const formattedDate = date.toISOString().split('T')[0];
      const updatedPayments = [...formData.orderPayments];
      updatedPayments[index].date = formattedDate;
      
      setFormData((prevData) => ({
        ...prevData,
        orderPayments: updatedPayments,
      }));
    }
  };

  const handleNewPaymentDateChange = (date) => {
    setNewPayment(prev => ({
      ...prev,
      date
    }));
  };

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value
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

  const removePayment = (index) => {
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
  const totalPaymentAmount = formData.orderPayments.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FiX size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-4">
          Buyurtmani o'zgartish
        </h2>

        {loading ? (
          <div className="text-white text-center py-8">Yuklanmoqda...</div>
        ) : (
          <form className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
            {/* ORDER NAME */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderName"
              >
                Buyurtma nomi
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderName"
                name="orderName"
                type="text"
                required
                placeholder="Buyurtma nomi"
                value={formData.orderName}
                onChange={handleInputChange}
              />
            </div>

            {/* CUSTOMER NAME */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderCustomerName"
              >
                Mijoz ismi
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderCustomerName"
                name="orderCustomerName"
                type="text"
                required
                placeholder="Mijoz ismi"
                value={formData.orderCustomerName}
                onChange={handleInputChange}
              />
            </div>

            {/* CUSTOMER PHONE NUMBER */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderCustomerPhoneNumber"
              >
                Mijoz telefon raqami
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderCustomerPhoneNumber"
                name="orderCustomerPhoneNumber"
                type="text"
                placeholder="Mijoz telefon raqami"
                value={formData.orderCustomerPhoneNumber}
                onChange={handleInputChange}
              />
            </div>

            {/* LOCATION */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderLocation"
              >
                Manzil
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderLocation"
                name="orderLocation"
                type="text"
                placeholder="Manzil"
                value={formData.orderLocation}
                onChange={handleInputChange}
              />
            </div>

            {/* CATEGORY */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderCategory"
              >
                Buyurtma kategoriyasi
              </label>
              <select
                className="block appearance-none w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 pr-8 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
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
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderType"
              >
                Buyurtma turi
              </label>
              <select
                className="block appearance-none w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 pr-8 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
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
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderStatus"
              >
                Buyurtma holati
              </label>
              <select
                className="block appearance-none w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 pr-8 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
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

            {/* PAYMENT STATUS */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderPaymentStatus"
              >
                To'lov holati
              </label>
              <select
                className="block appearance-none w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 pr-8 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
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

            {/* TOTAL AMOUNT */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderTotalAmount"
              >
                Buyurtma summasi
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderTotalAmount"
                name="orderTotalAmount"
                type="number"
                required
                placeholder="Buyurtma summasi"
                value={formData.orderTotalAmount}
                onChange={handleInputChange}
              />
            </div>

            {/* EXPENSES AMOUNT */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderExpensesAmount"
              >
                Harajatlar summasi
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderExpensesAmount"
                name="orderExpensesAmount"
                type="number"
                required
                placeholder="Harajatlar summasi"
                value={formData.orderExpensesAmount}
                onChange={handleInputChange}
              />
            </div>

            {/* TOTAL PAID */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderTotalPaid"
              >
                Jami to'landi
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderTotalPaid"
                name="orderTotalPaid"
                type="number"
                placeholder="To'langan summasini kiriting"
                value={formData.orderTotalPaid}
                onChange={handleInputChange}
                readOnly
              />
            </div>

            {/* TOTAL DEBT */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderTotalDebt"
              >
                Jami qarz
              </label>
              <input
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderTotalDebt"
                name="orderTotalDebt"
                type="number"
                placeholder="Qarz summasini kiriting"
                value={formData.orderTotalDebt}
                onChange={handleInputChange}
                readOnly
              />
            </div>

            {/* PAYMENT SECTION */}
            <div className="w-full">
              <h3 className="text-white text-base font-bold mb-2 sm:mb-4">
                To'lov ma'lumotlari
              </h3>

              {/* Payment input form */}
              <div className="flex flex-wrap gap-2 sm:gap-4 p-3 bg-gray-800 rounded-lg mb-3 sm:mb-4 border border-gray-700">
                <div className="w-full sm:flex-1 min-w-[120px]">
                  <label className="block text-white text-xs font-bold mb-1">
                    To'lov turi
                  </label>
                  <select
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
                    name="paymentType"
                    value={newPayment.paymentType}
                    onChange={handleNewPaymentChange}
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
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
                    type="number"
                    name="amount"
                    placeholder="Miqdor"
                    value={newPayment.amount}
                    onChange={handleNewPaymentChange}
                  />
                </div>
                <div className="w-full sm:flex-1 min-w-[120px]">
                  <label className="block text-white text-xs font-bold mb-1">
                    To'lov sanasi
                  </label>
                  <DatePicker
                    selected={newPayment.date}
                    onChange={handleNewPaymentDateChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>

                <div className="flex items-end w-full sm:w-auto">
                  <button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded w-full"
                    onClick={addPayment}
                  >
                    To'lov qo'shish
                  </button>
                </div>
              </div>

              {/* Payment list */}
              {formData.orderPayments.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <h4 className="text-white font-bold text-sm">
                        To'lovlar ro'yxati
                      </h4>
                      <p className="text-white text-sm">
                        Jami: {totalPaymentAmount} / {formData.orderTotalAmount} (
                        {formData.orderTotalAmount > 0
                          ? Math.round(
                              (totalPaymentAmount / formData.orderTotalAmount) * 100
                            )
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
                          {formData.orderPayments.map((payment, index) => (
                            <tr key={index} className="border-t border-gray-600">
                              <td className="p-2">
                                {payment.paymentType === "naqd" ? "Naqd" : "Plastik"}
                              </td>
                              <td className="p-2">{payment.amount}</td>
                              <td className="p-2">
                                <DatePicker
                                  selected={payment.date ? new Date(payment.date) : null}
                                  onChange={(date) => handleDateChange(date, index)}
                                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-1 px-2"
                                  dateFormat="yyyy-MM-dd"
                                />
                              </td>
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
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderDescription"
              >
                Buyurtma tavsifi
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
                id="orderDescription"
                name="orderDescription"
                required
                placeholder="Buyurtma tavsifi"
                value={formData.orderDescription}
                onChange={handleInputChange}
                rows={6}
                style={{ maxHeight: "150px", overflowY: "auto" }}
              />
            </div>

            {/* EXPENSES DESCRIPTION */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <label
                className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                htmlFor="orderExpensesDescription"
              >
                Harajatlar tavsifi
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500 resize-none overflow-auto"
                id="orderExpensesDescription"
                name="orderExpensesDescription"
                required
                placeholder="Harajatlar tavsifi"
                value={formData.orderExpensesDescription}
                onChange={handleInputChange}
                rows={6}
                style={{ maxHeight: "150px", overflowY: "auto" }}
              />
            </div>

            {/* Images Section */}
            {orderId && (
              <div className="w-full mt-4">
                <h3 className="text-white font-bold text-lg mb-3">Rasmlar</h3>
                <ImageUploader orderId={orderId} />
                {data?.getOrder?.images && (
                  <ImageGallery
                    images={data.getOrder.images}
                    orderId={orderId}
                    onImageDeleted={(imageUrl, e) => {
                      // Prevent any navigation event
                      if (e) e.preventDefault();
                      refetch();
                    }}
                  />
                )}
              </div>
            )}

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
                disabled={loadingUpdate}
              >
                {loadingUpdate ? "Yangilanmoqda..." : "Saqlash"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderEditModal;
