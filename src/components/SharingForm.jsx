import React from "react";
import { useMutation } from "@apollo/client";
import { CREATE_SHARING } from "../graphql/mutations/sharing.mutation";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const SharingForm = ({ toggleSharingForm }) => {
  const navigate = useNavigate();
  const [createSharing, { loading }] = useMutation(CREATE_SHARING);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const sharingData = {
      sharingDescription: formData.get("sharingDescription"),
      sharingPaymentType: formData.get("sharingPaymentType"),
      sharingCategoryType: formData.get("sharingCategoryType"),
      sharingAmount: parseFloat(formData.get("sharingAmount")),
      sharingDate: formData.get("sharingDate"),
    };

    try {
      await createSharing({
        variables: { input: sharingData },
        refetchQueries: ["GetSharings", "CategoryStatisticsSharing"],
      });
      form.reset();
      toast.success("Muvaffaqiyatli yaratildi");
      toggleSharingForm();
      navigate("/sharings");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
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
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="sharingDescription"
          name="sharingDescription"
          type="text"
          placeholder="Izoh yozing"
          required
        />
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
            required
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
            required
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
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="sharingAmount"
            name="sharingAmount"
            type="number"
            placeholder="Summa kiriting"
            required
          />
        </div>

        {/* Date */}
        <div className="flex-1">
          <label
            className="block uppercase tracking-wide text-white text-sm font-bold mb-2"
            htmlFor="sharingDate"
          >
            Sana
          </label>
          <input
            type="date"
            name="sharingDate"
            id="sharingDate"
            className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
            placeholder="Sanani tanlang"
            required
          />
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
