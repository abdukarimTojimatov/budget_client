import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_DEBT_PAYMENT } from "../graphql/mutations/debt.mutation";
import { GET_DEBT } from "../graphql/queries/debt.query";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiX,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiPaperclip,
} from "react-icons/fi";
import { MdDescription, MdOutlinePayments, MdNote } from "react-icons/md";

const PaidDebtModal = ({ isOpen, onClose, debtId }) => {
  const [addDebtPayment, { loading: createLoading }] =
    useMutation(ADD_DEBT_PAYMENT);
  const { data: debtData, loading: debtLoading } = useQuery(GET_DEBT, {
    variables: { id: debtId },
    skip: !debtId,
    fetchPolicy: "network-only",
  });

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    paidAmount: "",
    paymentDate: new Date(),
    paymentMethod: "bank_transfer",
    notes: "",
    attachments: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "paidAmount" ? (value ? parseFloat(value) : "") : value,
    });

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
      paymentDate: date,
    });

    if (errors.paymentDate) {
      setErrors({
        ...errors,
        paymentDate: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.paidAmount ||
      isNaN(formData.paidAmount) ||
      parseFloat(formData.paidAmount) <= 0
    ) {
      newErrors.paidAmount = "To'g'ri miqdorni kiriting";
    } else if (
      debtData?.getDebt &&
      parseFloat(formData.paidAmount) > debtData.getDebt.leftDebt
    ) {
      newErrors.paidAmount =
        "To'lov miqdori qolgan qarzdan ko'p bo'lishi mumkin emas";
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Sana tanlash majburiy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    // Format the date to YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const paymentData = {
      debtId: debtId,
      paidAmount: parseFloat(formData.paidAmount),
      paymentDate: formatDate(formData.paymentDate),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      attachments: formData.attachments,
    };

    try {
      await addDebtPayment({
        variables: { input: paymentData },
        refetchQueries: ["GetDebt", "GetDebts", "GetDebtStatistics"],
      });

      toast.success("To'lov muvaffaqiyatli yaratildi");
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const resetForm = () => {
    setFormData({
      paidAmount: "",
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      notes: "",
      attachments: [],
    });
    setErrors({});
  };

  if (!isOpen) return null;

  const debt = debtData?.getDebt;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700/30">
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700/50 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiPlus className="text-red-400 mr-2" size={20} />
            Qarz to'lovi kiritish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
          >
            <FiX size={24} />
          </button>
        </div>

        {debtLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : debt ? (
          <form
            className="w-full max-w-2xl flex flex-col gap-6 p-6 mx-auto"
            onSubmit={handleSubmit}
          >
            {/* Debt Info Summary */}
            <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-white text-lg font-medium mb-2">
                {debt.nameOfDebt}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Telefon raqami:</span>
                  <span className="text-white ml-2">
                    {debt.phoneNumberOfDebt}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Umumiy qarz:</span>
                  <span className="text-white ml-2">
                    {new Intl.NumberFormat("uz-UZ", {
                      style: "currency",
                      currency: "UZS",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(debt.totalDebt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">To'langan:</span>
                  <span className="text-green-400 ml-2 font-medium">
                    {new Intl.NumberFormat("uz-UZ", {
                      style: "currency",
                      currency: "UZS",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(debt.paidDebt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Qolgan summa:</span>
                  <span className="text-red-400 ml-2 font-medium">
                    {new Intl.NumberFormat("uz-UZ", {
                      style: "currency",
                      currency: "UZS",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(debt.leftDebt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Holati:</span>
                  <span className="text-white ml-2">
                    {debt.isPaidFull ? "To'langan" : "Aktiv"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="paidAmount"
              >
                <FiDollarSign className="mr-2 text-red-400" size={18} />
                To'lov miqdori
              </label>
              <input
                id="paidAmount"
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                placeholder="To'lov miqdorini kiriting"
                min="0"
              />
              {errors.paidAmount && (
                <p className="text-red-400 text-xs mt-1">{errors.paidAmount}</p>
              )}
            </div>

            {/* Payment Date */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="paymentDate"
              >
                <FiCalendar className="mr-2 text-red-400" size={18} />
                To'lov sanasi
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.paymentDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  name="paymentDate"
                  id="paymentDate"
                  className={`appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-red-500 ${
                    errors.paymentDate ? "border-red-500" : ""
                  }`}
                  placeholderText="Sanani tanlang"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FiCalendar size={16} />
                </div>
                {errors.paymentDate && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FiX className="mr-1" /> {errors.paymentDate}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="paymentMethod"
              >
                <MdOutlinePayments className="mr-2 text-red-400" size={18} />
                To'lov usuli
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-800/50 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-red-500"
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="cash">Naqd</option>
                  <option value="bank_transfer">Bank o'tkazmasi</option>
                  <option value="check">Chek</option>
                  <option value="credit_card">Kredit karta</option>
                  <option value="digital_wallet">Elektron hamyon</option>
                  <option value="other">Boshqa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
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

            {/* Reference Number */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="referenceNumber"
              >
                <MdDescription className="mr-2 text-red-400" size={18} />
                Tranzaksiya raqami
              </label>
              <input
                className="appearance-none block w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-red-500"
                id="referenceNumber"
                name="referenceNumber"
                type="text"
                placeholder="To'lov yoki chek raqamini kiriting (ixtiyoriy)"
                value={formData.referenceNumber}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="notes"
              >
                <MdNote className="mr-2 text-red-400" size={18} />
                Qo'shimcha izohlar
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-red-500"
                id="notes"
                name="notes"
                rows="3"
                placeholder="Qo'shimcha ma'lumotlar uchun izoh"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* File Attachments - simplified version*/}
            <div className="flex flex-col gap-2">
              <label
                className="flex items-center text-white text-sm font-bold"
                htmlFor="attachments"
              >
                <FiPaperclip className="mr-2 text-red-400" size={18} />
                Fayllar biriktirish
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                  onClick={() => {
                    // In a real implementation, this would open a file picker
                    // For now, we'll just add a placeholder
                    toast.info("Fayl yuklash funksiyasi ishlab chiqilmoqda");
                  }}
                >
                  <FiPaperclip size={16} />
                  Fayl tanlash
                </button>
                <span className="ml-3 text-gray-400 text-sm">
                  {formData.attachments.length > 0
                    ? `${formData.attachments.length} ta fayl tanlangan`
                    : "Fayllar biriktirilmagan"}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium transition-colors duration-200 border border-gray-600/50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Saqlanmoqda...
                  </>
                ) : (
                  "To'lovni saqlash"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-12 text-center text-white">
            <p>Qarz ma'lumotlari topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaidDebtModal;
