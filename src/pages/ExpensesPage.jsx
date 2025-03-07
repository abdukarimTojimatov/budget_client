import React, { useState } from "react";
import Cards from "../components/Cards";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import ExpenseForm from "../components/ExpenseForm";
import { useQuery } from "@apollo/client";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ExpensesPage = () => {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [filterState, setFilterState] = useState({
    page: 1,
    limit: 10,
    categoryId: "",
    startDate: null,
    endDate: null,
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GET_EXPENSE_CATEGORIES
  );

  const toggleExpenseForm = () => {
    setIsExpenseFormOpen(!isExpenseFormOpen);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
  };

  const handleCategoryChange = (event) => {
    setCategoryId(event.target.value);
  };

  const applyFilters = () => {
    setFilterState({
      page,
      limit,
      categoryId,
      startDate: startDate ? startDate.toISOString().split("T")[0] : null,
      endDate: endDate ? endDate.toISOString().split("T")[0] : null,
    });
  };

  const clearFilters = () => {
    setCategoryId("");
    setLimit(10);
    setPage(1);
    setDateRange([null, null]);
    setFilterState({
      page: 1,
      limit: 10,
      categoryId: "",
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
            onClick={toggleExpenseForm}
            className={`px-4 py-2 rounded-lg flex items-start gap-2 transition-colors ${
              isExpenseFormOpen
                ? "bg-red-800/30 hover:bg-red-700/40 text-white"
                : "bg-blue-800/30 hover:bg-blue-700/40 text-white"
            }`}
          >
            <span className="text-xs sm:text-sm md:text-base">
              {isExpenseFormOpen ? "Yopish" : "Yangi qo'shish"}
            </span>
            <span>
              {isExpenseFormOpen ? (
                <FiMinusCircle className="h-6 w-6" />
              ) : (
                <FiPlusCircle className="h-6 w-6 pl-2" />
              )}
            </span>
          </button>
        </div>
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700/30 overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Kategoriya
              </label>
              <select
                name="categoryId"
                value={categoryId}
                onChange={handleCategoryChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                disabled={categoriesLoading}
              >
                <option value="">Hammasi</option>
                {categoriesData?.getExpenseCategories?.docs?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
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
                onChange={(update) => {
                  setDateRange(update);
                }}
                isClearable={true}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholderText="Sanani tanlang"
                dateFormat="yyyy/MM/dd"
              />
            </div>

            {/* Limit Dropdown */}
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

            {/* Action Buttons */}
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
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpenseFormOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/30">
            <ExpenseForm toggleExpenseForm={toggleExpenseForm} />
          </div>
        </div>
        <Cards
          initialPage={filterState.page}
          initialLimit={filterState.limit}
          initialCategoryId={filterState.categoryId}
          initialStartDate={filterState.startDate}
          initialEndDate={filterState.endDate}
        />
      </div>
    </div>
  );
};

export default ExpensesPage;
