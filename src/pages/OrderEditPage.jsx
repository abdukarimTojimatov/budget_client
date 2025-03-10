import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GET_ORDER } from "../graphql/queries/order.query"; // Adjust the path as necessary
import { UPDATE_ORDER } from "../graphql/mutations/order.mutation"; // Adjust the path as necessary
import OrderFormSkeleton from "../skeletons/OrderFormSkeleton"; // Adjust the path as necessary
import ImageUploader from "../components/ImageUpload/ImageUploader";
import ImageGallery from "../components/ImageUpload/ImageGallery";
import toast from "react-hot-toast";

const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("id", id);
  const { loading, data, refetch } = useQuery(GET_ORDER, {
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
        className="w-full max-w-4xl mx-auto flex flex-wrap gap-3 px-4 sm:px-6 md:px-10"
        onSubmit={handleSubmit}
      >
        {/* Order Name */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderName"
          >
            Buyurtma nomi
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="orderName"
            name="orderName"
            type="text"
            required
            placeholder="Buyurtma nomini kiriting"
            value={formData.orderName}
            onChange={handleInputChange}
          />
        </div>

        {/* Customer Name and Phone Number */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
              htmlFor="orderCustomerName"
            >
              Mijoz ismi
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
              id="orderCustomerName"
              name="orderCustomerName"
              type="text"
              required
              placeholder="Mijoz ismini kiriting"
              value={formData.orderCustomerName}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
              htmlFor="orderCustomerPhoneNumber"
            >
              Telefon raqami
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
              id="orderCustomerPhoneNumber"
              name="orderCustomerPhoneNumber"
              type="text"
              placeholder="Telefon raqamini kiriting"
              value={formData.orderCustomerPhoneNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Category */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderCategory"
          >
            Buyurtma kategoriyasi
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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

        {/* Type */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderType"
          >
            Buyurtma turi
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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

        {/* Order Status */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderStatus"
          >
            Buyurtma holati
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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

        {/* Description */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderDescription"
          >
            Izoh
          </label>
          <textarea
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="orderDescription"
            name="orderDescription"
            required
            placeholder="Buyurtma haqida ta'rif yozing"
            value={formData.orderDescription}
            onChange={handleInputChange}
            rows={3}
            style={{ maxHeight: "150px" }}
          />
        </div>

        {/* Expenses Description */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderExpensesDescription"
          >
            Harajatlar izohi
          </label>
          <textarea
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            id="orderExpensesDescription"
            name="orderExpensesDescription"
            required
            placeholder="Harajatlar haqida ta'rif yozing"
            value={formData.orderExpensesDescription}
            onChange={handleInputChange}
            rows={3}
            style={{ maxHeight: "150px" }}
          />
        </div>

        {/* Payment Status */}
        <div className="w-full sm:flex-1 min-w-[200px]">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
            htmlFor="orderPaymentStatus"
          >
            To'lov holati
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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

        {/* Financial Fields */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
              htmlFor="orderTotalAmount"
            >
              Buyurtma summasi
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
              id="orderTotalAmount"
              name="orderTotalAmount"
              type="number"
              required
              placeholder="Summasini kiriting"
              value={formData.orderTotalAmount}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
              htmlFor="orderExpensesAmount"
            >
              Harajatlar summasi
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
              id="orderExpensesAmount"
              name="orderExpensesAmount"
              type="number"
              placeholder="Harajatlar summasini kiriting"
              value={formData.orderExpensesAmount}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
              htmlFor="orderTotalPaid"
            >
              Jami to'landi
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
              id="orderTotalPaid"
              name="orderTotalPaid"
              type="number"
              placeholder="To'langan summasini kiriting"
              value={formData.orderTotalPaid}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
              htmlFor="orderTotalDebt"
            >
              Jami qarz
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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

        {/* Payments Section */}
        <div className="w-full">
          <h3 className="text-white font-bold text-lg mb-3">To'lovlar</h3>
          {formData.orderPayments.length > 0 ? (
            formData.orderPayments.map((payment, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-3 mb-3 p-3 bg-gray-800 rounded-lg"
              >
                <div className="w-full sm:flex-1 min-w-[120px]">
                  <label
                    className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                    htmlFor={`paymentType-${index}`}
                  >
                    To'lov turi
                  </label>
                  <select
                    className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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
                <div className="w-full sm:flex-1 min-w-[120px]">
                  <label
                    className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                    htmlFor={`amount-${index}`}
                  >
                    Miqdor
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
                    id={`amount-${index}`}
                    name="amount"
                    type="number"
                    value={payment.amount}
                    onChange={(e) => handlePaymentChange(index, e)}
                  />
                </div>
                <div className="w-full sm:flex-1 min-w-[120px]">
                  <label
                    className="block uppercase tracking-wide text-white text-xs font-bold mb-1"
                    htmlFor={`date-${index}`}
                  >
                    Sana
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
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
            <p className="text-gray-400 text-sm">Hech to'lov qo'shilmagan.</p>
          )}
        </div>

        {/* Add Payment Button */}
        <button
          type="button"
          onClick={addPayment}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded transition-colors duration-200 text-sm"
        >
          To'lov qo'shish
        </button>

        {/* Images Section */}
        <div className="w-full mt-4">
          <h3 className="text-white font-bold text-lg mb-3">Rasmlar</h3>
          {id && <ImageUploader orderId={id} />}
          {data?.getOrder?.images && (
            <ImageGallery
              images={data.getOrder.images}
              orderId={id}
              onImageDeleted={(imageUrl, e) => {
                // Prevent any navigation event
                if (e) e.preventDefault();
                refetch();
              }}
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loadingUpdate}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded transition-colors duration-200 disabled:opacity-50 text-sm"
        >
          {loadingUpdate ? "Yangilanmoqda..." : "Buyurtmani yangilash"}
        </button>
      </form>
    </div>
  );
};

export default OrderEditPage;
