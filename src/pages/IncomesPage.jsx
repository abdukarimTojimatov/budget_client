import React, { useState } from "react";
import {
  FiPlusCircle,
  FiMinusCircle,
  FiFilter,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "../graphql/queries/category.query";
import {
  GET_INCOMES,
  GET_INCOMES_STATISTICS,
} from "../graphql/queries/income.query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import IncomeModal from "../components/IncomeModal";
import IncomeEditModal from "../components/IncomeEditModal";
import IncomeCards from "../components/IncomeCards";
import { MdCategory } from "react-icons/md";
import { BiSolidData } from "react-icons/bi";
import { TbCoin } from "react-icons/tb";
import IncomeCard from "../components/IncomeCard";

const IncomesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
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

  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GET_CATEGORIES,
    {
      variables: { type: "income" },
      fetchPolicy: "network-only",
    }
  );

  // Fetch incomes data
  const { data: incomesData, loading: incomesLoading } = useQuery(GET_INCOMES, {
    variables: {
      page: filterState.page,
      limit: filterState.limit,
      categoryId: filterState.categoryId || undefined,
      startDate: filterState.startDate || undefined,
      endDate: filterState.endDate || undefined,
    },
    fetchPolicy: "network-only",
  });

  // Fetch income statistics
  const { data: statisticsData, loading: statisticsLoading } = useQuery(
    GET_INCOMES_STATISTICS
  );

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const openEditModal = (id) => {
    setSelectedIncomeId(id);
    setIsEditModalOpen(true);
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
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-green-600/70 to-emerald-600/70 hover:shadow-green-500/20 text-white shadow-md"
          >
            <span className="text-sm font-medium">Yangi daromad</span>
            <FiPlusCircle className="h-5 w-5" />
          </button>

          {/* Income Create Modal */}
          <IncomeModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          {/* Income Edit Modal */}
          <IncomeEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedIncomeId(null);
            }}
            incomeId={selectedIncomeId}
          />
        </div>
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-5 rounded-xl shadow-lg border border-blue-900/20 overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-sm`}
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
                  name="categoryId"
                  value={categoryId}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Barcha kategoriyalar</option>
                  {categoriesData?.getCategories?.docs?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <MdCategory className="text-gray-400" size={18} />
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <FiCalendar className="mr-2 text-blue-400" size={18} />
                Sana oralig'i
              </label>
              <div>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  placeholderText="Sana oralig'ini tanlang"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                  popperProps={{
                    strategy: "fixed",
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 10],
                        },
                      },
                      {
                        name: "flip",
                        options: {
                          fallbackPlacements: [
                            "top",
                            "bottom",
                            "right",
                            "left",
                          ],
                          padding: 10,
                        },
                      },
                    ],
                  }}
                  popperClassName="bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Display Limit */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <BiSolidData className="mr-2 text-blue-400" size={18} />
                Natijalar soni
              </label>
              <div className="relative">
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
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
                className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-gradient-to-r from-gray-700/70 to-gray-800/70 text-white transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/10 border border-gray-600/30"
              >
                Tozalash
              </button>
            </div>
          </div>
        </div>

        {/* Income Cards Component */}
        <IncomeCards
          initialPage={filterState.page}
          initialLimit={filterState.limit}
          initialCategoryId={filterState.categoryId}
          initialStartDate={filterState.startDate}
          initialEndDate={filterState.endDate}
          onEdit={openEditModal}
        />
      </div>
    </div>
  );
};

export default IncomesPage;
