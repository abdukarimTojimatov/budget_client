import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_SHARING } from "../graphql/mutations/sharing.mutation";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SharingForm = ({ toggleSharingForm }) => {
  const navigate = useNavigate();
  const [createSharing, { loading }] = useMutation(CREATE_SHARING);
  const [formData, setFormData] = useState({
    sharingDescription: "",
    sharingPaymentType: "plastik",
    sharingCategoryType: "Egamberdi",
    sharingAmount: "",
    sharingDate: new Date(),
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`);
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      sharingDate: date,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sharingDescription.trim()) {
      newErrors.sharingDescription = "Izoh kiritish majburiy";
    }

    if (
      !formData.sharingAmount ||
      isNaN(formData.sharingAmount) ||
      parseFloat(formData.sharingAmount) <= 0
    ) {
      newErrors.sharingAmount = "To'g'ri summa kiriting";
    }

    if (!formData.sharingDate) {
      newErrors.sharingDate = "Sana tanlash majburiy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const sharingData = {
      sharingDescription: formData.sharingDescription,
      sharingPaymentType: formData.sharingPaymentType,
      sharingCategoryType: formData.sharingCategoryType,
      sharingAmount: parseFloat(formData.sharingAmount),
      sharingDate: formatDate(formData.sharingDate),
    };

    try {
      await createSharing({
        variables: { input: sharingData },
        refetchQueries: ["GetSharings", "CategoryStatisticsSharing"],
      });
      toast.success("Muvaffaqiyatli yaratildi");
      toggleSharingForm();
      navigate("/sharings");
    } catch (error) {
      console.error("Error creating sharing:", error);
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  return (
    <form
      className="w-full max-w-2xl flex flex-col gap-6 px-3 mx-auto"
      onSubmit={handleSubmit}
    >
      {/* Description */}
      <div className="flex flex-col gap-2">
        <label
          className="block uppercase tracking-wide text-white text-sm font-bold"
          htmlFor="sharingDescription"
        >
          Ulush haqida
        </label>
        <div>
          <input
            className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${
              errors.sharingDescription ? "border-red-500" : ""
            }`}
            id="sharingDescription"
            name="sharingDescription"
            type="text"
            placeholder="Izoh yozing"
            value={formData.sharingDescription || ""}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.sharingDescription && (
            <p className="text-red-500 text-xs italic mt-1">
              {errors.sharingDescription}
            </p>
          )}
        </div>
      </div>

      {/* Payment Type and Category */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Payment Type */}
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
            htmlFor="sharingPaymentType"
          >
            To'lov turi
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="sharingPaymentType"
            name="sharingPaymentType"
            value={formData.sharingPaymentType}
            onChange={handleChange}
          >
            <option value="plastik">Plastik</option>
            <option value="naqd">Naqd</option>
          </select>
        </div>
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
            htmlFor="sharingCategoryType"
          >
            Kim olgan
          </label>
          <select
            className="block appearance-none w-full bg-gray-200 border text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="sharingCategoryType"
            name="sharingCategoryType"
            value={formData.sharingCategoryType}
            onChange={handleChange}
          >
            <option value="Egamberdi">Egamberdi</option>
            <option value="Elmurod">Elmurod</option>
            <option value="Rozimuhammad">Rozimuhammad</option>
          </select>
        </div>
      </div>

      {/* Amount and Date */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Amount */}
        <div className="flex-1">
          <label
            className="block uppercase text-white text-sm font-bold mb-2"
            htmlFor="sharingAmount"
          >
            Miqdori (so'm)
          </label>
          <div>
            <input
              className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${
                errors.sharingAmount ? "border-red-500" : ""
              }`}
              id="sharingAmount"
              name="sharingAmount"
              type="number"
              placeholder="Summa kiriting"
              value={formData.sharingAmount}
              onChange={handleChange}
            />
            {errors.sharingAmount && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.sharingAmount}
              </p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
            htmlFor="sharingDate"
          >
            Sana
          </label>
          <div>
            <DatePicker
              selected={formData.sharingDate}
              onChange={handleDateChange}
              className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                errors.sharingDate ? "border-red-500" : ""
              }`}
              dateFormat="yyyy-MM-dd"
              placeholderText="Sanani tanlang"
              id="sharingDate"
            />
            {errors.sharingDate && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.sharingDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="w-full py-3 px-4 rounded bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
};

export default SharingForm;
