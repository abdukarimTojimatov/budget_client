import React, { useState, useEffect } from "react";
import SharingCards from "../components/SharingCards";
import SharingModal from "../components/SharingModal";
import { FiPlusCircle, FiMinusCircle, FiFilter, FiCalendar, FiX } from "react-icons/fi";
import { useQuery } from "@apollo/client";
import { GET_SHARINGS } from "../graphql/queries/sharing.query";
import sharingCategories from "../constants/sharingCategories";
import Pagination from "../components/Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdCategory } from "react-icons/md";
import { BiSolidData } from "react-icons/bi";

const SharingPage = () => {
  const [isSharingFormOpen, setIsSharingFormOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [filterState, setFilterState] = useState({
    page: 1,
    limit: 10,
    category: "",
    startDate: null,
    endDate: null,
  });

  const openSharingModal = () => {
    setIsSharingFormOpen(true);
  };

  const closeSharingModal = () => {
    setIsSharingFormOpen(false);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const applyFilters = () => {
    // Format dates correctly accounting for timezone
    const formatDate = (date) => {
      if (!date) return null;
      // Create a new date with local timezone information preserved
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFilterState({
      page,
      limit,
      category,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
  };

  const clearFilters = () => {
    setCategory("");
    setLimit(10);
    setPage(1);
    setDateRange([null, null]);
    setFilterState({
      page: 1,
      limit: 10,
      category: "",
      startDate: null,
      endDate: null,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col">
        <div className="flex justify-start gap-3 items-center mx-3 my-4">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md ${
              isFiltersOpen
                ? "bg-gradient-to-r from-red-600/70 to-red-700/70 hover:shadow-red-500/20 text-white"
                : "bg-gradient-to-r from-blue-600/70 to-indigo-600/70 hover:shadow-blue-500/20 text-white"
            }`}
          >
            <span className="text-sm font-medium">
              {isFiltersOpen ? "Filtrlarni yopish" : "Filtrlash"}
            </span>
            {isFiltersOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiFilter className="h-5 w-5" />
            )}
          </button>

          {/* Add New Button */}
          <button
            onClick={openSharingModal}
            className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-green-600/70 to-emerald-600/70 hover:shadow-green-500/20 text-white shadow-md"
          >
            <span className="text-sm font-medium">
              Yangi ulush
            </span>
            <FiPlusCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Filters Section */}
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-5 rounded-xl shadow-lg border border-blue-900/20 overflow-hidden transition-all duration-300 ease-in-out mb-1 backdrop-blur-sm`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <MdCategory className="mr-2 text-blue-400" size={18} />
                Kategoriya
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  {sharingCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <MdCategory size={16} />
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <FiCalendar className="mr-2 text-blue-400" size={18} />
                Sana oralig'i
              </label>
              <div className="relative">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                  placeholderText="Sanani tanlang"
                  dateFormat="yyyy/MM/dd"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FiCalendar size={16} />
                </div>
              </div>
            </div>

            {/* Limit Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <BiSolidData className="mr-2 text-blue-400" size={18} />
                Ma'lumotlar soni
              </label>
              <div className="relative">
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <BiSolidData size={16} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-3">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center justify-center"
              >
                Qo'llash
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2.5 bg-gray-700/80 hover:bg-gray-600/80 text-white rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-600/50"
              >
                Tozalash
              </button>
            </div>
          </div>
        </div>

        {/* Sharing Modal */}
        <SharingModal isOpen={isSharingFormOpen} onClose={closeSharingModal} />

        {/* Render the SharingCards component with filtered props */}
        <SharingCards
          initialPage={filterState.page}
          initialLimit={filterState.limit}
          initialCategory={filterState.category}
          initialStartDate={filterState.startDate}
          initialEndDate={filterState.endDate}
        />
      </div>
    </div>
  );
};

export default SharingPage;
