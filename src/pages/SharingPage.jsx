import React, { useState, useEffect } from "react";
import SharingCards from "../components/SharingCards";
import SharingModal from "../components/SharingModal";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import { useQuery } from "@apollo/client";
import { GET_SHARINGS } from "../graphql/queries/sharing.query";
import sharingCategories from "../constants/sharingCategories";
import Pagination from "../components/Pagination";
import DatePicker from "react-datepicker";

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
        <div className="flex justify-start gap-3 items-center ml-3 mr-3">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`px-4 py-2 rounded-lg flex items-start gap-2 transition-colors ${
              isFiltersOpen
                ? "bg-red-800/30 hover:bg-red-700/40 text-white"
                : "bg-blue-800/30 hover:bg-blue-700/40 text-white"
            }`}
          >
            <span className="text-xs sm:text-sm md:text-base">
              {isFiltersOpen ? "Yopish" : "Filtrlash"}
            </span>
            <span>
              {isFiltersOpen ? (
                <FiMinusCircle className="h-6 w-6" />
              ) : (
                <FiPlusCircle className="h-6 w-6 pl-2" />
              )}
            </span>
          </button>

          {/* Add New Button */}
          <button
            onClick={openSharingModal}
            className="px-4 py-2 rounded-lg flex items-start gap-2 transition-colors bg-blue-800/30 hover:bg-blue-700/40 text-white"
          >
            <span className="text-xs sm:text-sm md:text-base">
              Yangi qo'shish
            </span>
            <span>
              <FiPlusCircle className="h-6 w-6 pl-2" />
            </span>
          </button>
        </div>

        {/* Filters Section */}
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700/30overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Kategoriya
              </label>
              <select
                name="category"
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="">Hammasi</option>
                {sharingCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Sana oralig'i
              </label>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholderText="Sana tanlang"
                dateFormat="yyyy/MM/dd"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Cheklov
              </label>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm mr-2"
              >
                Qo'llash
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm"
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
