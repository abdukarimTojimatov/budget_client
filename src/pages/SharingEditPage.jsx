import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GET_SHARING,
  GET_SHARINGS_STATISTICS,
} from "../graphql/queries/sharing.query";
import { UPDATE_SHARING } from "../graphql/mutations/sharing.mutation";
import toast from "react-hot-toast";
import ExpenseFormSkeleton from "../skeletons/ExpenseFormSkeleton";

const SharingEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, data } = useQuery(GET_SHARING, {
    variables: { id: id },
  });

  const [updateSharing, { loading: loadingUpdate }] =
    useMutation(UPDATE_SHARING);

  const [formData, setFormData] = useState({
    sharingDescription: data?.getSharing?.sharingDescription || "",
    sharingPaymentType: data?.getSharing?.sharingPaymentType || "",
    sharingCategoryType: data?.getSharing?.sharingCategoryType || "",
    sharingAmount: data?.getSharing?.sharingAmount || "",
    sharingDate: data?.getSharing?.sharingDate || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sharingAmount = parseFloat(formData.sharingAmount);
    try {
      await updateSharing({
        variables: {
          input: {
            ...formData,
            sharingAmount,
            _id: id,
          },
        },
        refetchQueries: [{ query: GET_SHARINGS_STATISTICS }],
      });
      toast.success("Muvaffaqiyatli yangilandi");
      navigate("/sharings");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (data) {
      setFormData({
        sharingDescription: data?.getSharing?.sharingDescription,
        sharingPaymentType: data?.getSharing?.sharingPaymentType,
        sharingCategoryType: data?.getSharing?.sharingCategoryType,
        sharingAmount: parseFloat(data?.getSharing?.sharingAmount),
        sharingDate: data?.getSharing?.sharingDate,
      });
    }
  }, [data]);

  if (loading) return <ExpenseFormSkeleton />;

  return (
    <div className="h-screen max-w-4xl mx-auto flex flex-col items-center">
      <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
        Ulushlarni o'zgartirish
      </p>
      <form
        className="w-full max-w-lg flex flex-col md:flex-col sm:flex-col  gap-5 px-3 "
        onSubmit={handleSubmit}
      >
        {/* SHARINGS */}
        <div className="flex flex-wrap gap-3">
          <div className="w-full flex-1 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="sharingDescription"
            >
              Xarajat izoh
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="sharingDescription"
              name="sharingDescription"
              type="text"
              placeholder="Rent, Groceries, Salary, etc."
              value={formData.sharingDescription}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full flex-1 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="sharingPaymentType"
            >
              To'lov turi
            </label>
            <div className="relative">
              <select
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="sharingPaymentType"
                name="sharingPaymentType"
                onChange={handleInputChange}
                defaultValue={formData.sharingPaymentType}
              >
                <option value={"plastik"}>plastik</option>
                <option value={"naqd"}>naqd</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* PAYMENT TYPE */}
        <div className="flex-1 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
            htmlFor="sharingCategoryType"
          >
            Kategoriya
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="sharingCategoryType"
              name="sharingCategoryType"
              onChange={handleInputChange}
              defaultValue={formData.sharingCategoryType}
            >
              <option value="Egamberdi">Egamberdi</option>
              <option value="Elmurod">Elmurod</option>
              <option value="Rozimuhammad">Rozimuhammad</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* CATEGORY */}

          {/* LOCATION */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* AMOUNT */}
            <div className="flex-1 mb-6 md:mb-0">
              <label
                className="block uppercase text-white text-xs font-bold mb-2"
                htmlFor="sharingAmount"
              >
                Miqdori (so'm)
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="sharingAmount"
                name="sharingAmount"
                type="number"
                placeholder="150"
                value={formData.sharingAmount}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* DATE */}
          <div className="flex-1">
            <label
              className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
              htmlFor="sharingDate"
            >
              Sana
            </label>
            <input
              type="date"
              name="sharingDate"
              id="sharingDate"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-[11px] px-4 mb-3 leading-tight focus:outline-none
						 focus:bg-white"
              placeholder="Sanani tanlang"
              value={formData.sharingDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* SUBMIT BUTTON */}
        <button
          className="text-white font-bold w-full rounded px-4 py-2 bg-gradient-to-br
          from-pink-500 to-pink-500 hover:from-pink-600 hover:to-pink-600"
          type="submit"
          disabled={loadingUpdate}
        >
          {loadingUpdate ? "Saqlanayabdi..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
};
export default SharingEditPage;
