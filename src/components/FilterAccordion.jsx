import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FilterAccordion = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleDateRangeChange = (update) => {
    setDateRange(update);
  };

  const applyFilter = () => {
    onFilterChange({
      startDate: startDate ? startDate.toISOString().split("T")[0] : null,
      endDate: endDate ? endDate.toISOString().split("T")[0] : null,
    });
    setIsOpen(false);
  };

  const resetFilter = () => {
    setDateRange([null, null]);
    onFilterChange({
      startDate: null,
      endDate: null,
    });
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800/60 rounded-xl shadow-lg border border-gray-700/50 hover:bg-gray-800/80 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <FiFilter className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Filtrlar</span>
        </div>
        {isOpen ? (
          <FiChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-800/40 rounded-b-xl border border-t-0 border-gray-700/50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sana oralig'i
                  </label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateRangeChange}
                    isClearable={true}
                    className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Sana oralig'ini tanlang"
                    dateFormat="yyyy/MM/dd"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetFilter}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/80 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Tozalash
                  </button>
                  <button
                    onClick={applyFilter}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Qo'llash
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterAccordion;
