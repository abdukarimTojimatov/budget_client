import React, { useState } from "react";
import {
  FiPlusCircle,
  FiFilter,
  FiCalendar,
  FiX,
  FiDollarSign,
} from "react-icons/fi";
import { useQuery } from "@apollo/client";
import { GET_DEBTS, GET_DEBT_STATISTICS } from "../graphql/queries/debt.query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DebtModal from "../components/DebtModal";
import PaidDebtModal from "../components/PaidDebtModal";
import DebtCards from "../components/DebtCards";
import { MdDescription } from "react-icons/md";
import { BiSolidData } from "react-icons/bi";
import { TbArrowsExchange } from "react-icons/tb";

const DebtsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [filterState, setFilterState] = useState({
    page: 1,
    limit: 10,
    status: "",
    startDate: null,
    endDate: null,
  });

  // Fetch debts data
  const { data: debtsData, loading: debtsLoading } = useQuery(GET_DEBTS, {
    variables: {
      page: filterState.page,
      limit: filterState.limit,
      status: filterState.status || undefined,
      startDate: filterState.startDate || undefined,
      endDate: filterState.endDate || undefined,
    },
    fetchPolicy: "network-only",
  });

  // Fetch debt statistics
  const { data: statisticsData, loading: statisticsLoading } =
    useQuery(GET_DEBT_STATISTICS);

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const openEditModal = (id) => {
    setSelectedDebtId(id);
    setIsEditModalOpen(true);
  };

  const openPaymentModal = (id) => {
    setSelectedDebtId(id);
    setIsPaymentModalOpen(true);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const applyFilters = () => {
    setFilterState({
      page,
      limit,
      status,
      startDate: startDate ? startDate.toISOString().split("T")[0] : null,
      endDate: endDate ? endDate.toISOString().split("T")[0] : null,
    });
  };

  const clearFilters = () => {
    setStatus("");
    setLimit(10);
    setPage(1);
    setDateRange([null, null]);
    setFilterState({
      page: 1,
      limit: 10,
      status: "",
      startDate: null,
      endDate: null,
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "defaulted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "paid":
        return "To'langan";
      case "late":
        return "Kechiktirilgan";
      case "defaulted":
        return "Defolt";
      default:
        return status;
    }
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
            className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-red-600/70 to-red-700/70 hover:shadow-red-500/20 text-white shadow-md"
          >
            <span className="text-sm font-medium">Yangi qarz</span>
            <FiPlusCircle className="h-5 w-5" />
          </button>

          {/* Debt Create Modal */}
          <DebtModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          {/* Debt Edit Modal - to be implemented */}
          {/* 
          <DebtEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDebtId(null);
            }}
            debtId={selectedDebtId}
          />
          */}

          {/* Debt Payment Modal */}
          <PaidDebtModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedDebtId(null);
            }}
            debtId={selectedDebtId}
          />
        </div>
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-5 rounded-xl shadow-lg border border-blue-900/20 overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-sm`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <MdDescription className="mr-2 text-red-400" size={18} />
                Holati
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  <option value="active">Aktiv</option>
                  <option value="paid">To'langan</option>
                  <option value="late">Kechiktirilgan</option>
                  <option value="defaulted">Defolt</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
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
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <FiCalendar className="mr-2 text-red-400" size={18} />
                Sana oralig'i
              </label>
              <div className="relative">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none transition-all duration-300 w-64 cursor-pointer"
                  placeholderText="Sanani tanlang"
                  dateFormat="yyyy/MM/dd"
                  popperClassName="z-[100] datepicker-small"
                  popperPlacement="auto"
                  wrapperClassName="z-50"
                  calendarClassName="responsive-calendar"
                  monthsShown={window.innerWidth < 768 ? 1 : 1}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [0, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                        padding: 40,
                        altAxis: true,
                        tether: false,
                      },
                    },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <BiSolidData className="mr-2 text-red-400" size={18} />
                Natijalar soni
              </label>
              <select
                name="limit"
                value={limit}
                onChange={handleLimitChange}
                className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 border border-gray-700 appearance-none"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-gradient-to-r from-blue-600/70 to-indigo-600/70 text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
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

        {/* Statistics Cards */}
        <div className="px-3 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-red-900/40 to-red-900/40 rounded-xl border border-red-800/30 p-5 shadow-lg hover:shadow-red-900/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">
                    Jami qarzlar
                  </h3>
                  {statisticsLoading ? (
                    <span className="text-2xl font-bold text-white block">
                      <span className="animate-pulse bg-red-800/30 h-8 w-32 rounded inline-block"></span>
                    </span>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {new Intl.NumberFormat("uz-UZ", {
                        style: "currency",
                        currency: "UZS",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(
                        statisticsData?.getDebtStatistics?.totalDebt || 0
                      )}
                    </p>
                  )}
                </div>
                <div className="bg-red-500/10 p-3 rounded-full">
                  <FiDollarSign size={24} className="text-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/40 rounded-xl border border-orange-800/30 p-5 shadow-lg hover:shadow-orange-900/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">
                    Qolgan qarzlar
                  </h3>
                  {statisticsLoading ? (
                    <span className="text-2xl font-bold text-white block">
                      <span className="animate-pulse bg-orange-800/30 h-8 w-32 rounded inline-block"></span>
                    </span>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {new Intl.NumberFormat("uz-UZ", {
                        style: "currency",
                        currency: "UZS",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(
                        statisticsData?.getDebtStatistics?.leftDebt || 0
                      )}
                    </p>
                  )}
                </div>
                <div className="bg-orange-500/10 p-3 rounded-full">
                  <TbArrowsExchange size={24} className="text-orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/40 rounded-xl border border-blue-800/30 p-5 shadow-lg hover:shadow-blue-900/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">
                    To'langan qarzlar
                  </h3>
                  {statisticsLoading ? (
                    <span className="text-2xl font-bold text-white block">
                      <span className="animate-pulse bg-blue-800/30 h-8 w-32 rounded inline-block"></span>
                    </span>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {new Intl.NumberFormat("uz-UZ", {
                        style: "currency",
                        currency: "UZS",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(
                        statisticsData?.getDebtStatistics?.paidDebt || 0
                      )}
                    </p>
                  )}
                </div>
                <div className="bg-blue-500/10 p-3 rounded-full">
                  <FiDollarSign size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debt Cards Component */}
        <DebtCards
          initialPage={filterState.page}
          initialLimit={filterState.limit}
          initialStatus={filterState.status}
          initialStartDate={filterState.startDate}
          initialEndDate={filterState.endDate}
          onEdit={openEditModal}
          onPayment={openPaymentModal}
        />
      </div>
    </div>
  );
};

export default DebtsPage;
