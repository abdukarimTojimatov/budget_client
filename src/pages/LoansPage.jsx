import React, { useState } from "react";
import {
  FiPlusCircle,
  FiFilter,
  FiCalendar,
  FiX,
  FiDollarSign,
} from "react-icons/fi";
import { useQuery } from "@apollo/client";
import { GET_LOANS, GET_LOAN_STATISTICS } from "../graphql/queries/loan.query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoanModal from "../components/LoanModal";
import LoanRepaymentModal from "../components/LoanRepaymentModal";
import LoanCards from "../components/LoanCards";
import { MdDescription } from "react-icons/md";
import { BiSolidData } from "react-icons/bi";
import { TbArrowsExchange, TbMoneybag } from "react-icons/tb";

const LoansPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isPaidFull, setIsPaidFull] = useState(""); // ""=all, true=paid, false=active
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [filterState, setFilterState] = useState({
    page: 1,
    limit: 10,
    isPaidFull: "", // ""=all, true=paid, false=active
    startDate: null,
    endDate: null,
  });

  // Fetch loans data
  const { data: loansData, loading: loansLoading } = useQuery(GET_LOANS, {
    variables: {
      page: filterState.page,
      limit: filterState.limit,
      isPaidFull: filterState.isPaidFull === "" ? undefined : filterState.isPaidFull === "true",
      startDate: filterState.startDate || undefined,
      endDate: filterState.endDate || undefined,
    },
    fetchPolicy: "network-only",
  });

  // Fetch loan statistics
  const { data: statisticsData, loading: statisticsLoading } = useQuery(
    GET_LOAN_STATISTICS
  );

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const openEditModal = (id) => {
    setSelectedLoanId(id);
    setIsEditModalOpen(true);
  };

  const openRepaymentModal = (id) => {
    setSelectedLoanId(id);
    setIsRepaymentModalOpen(true);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
  };

  const handleIsPaidFullChange = (event) => {
    setIsPaidFull(event.target.value);
  };

  const applyFilters = () => {
    setFilterState({
      page,
      limit,
      isPaidFull,
      startDate: startDate ? startDate.toISOString().split("T")[0] : null,
      endDate: endDate ? endDate.toISOString().split("T")[0] : null,
    });
  };

  const clearFilters = () => {
    setIsPaidFull("");
    setLimit(10);
    setPage(1);
    setDateRange([null, null]);
    setFilterState({
      page: 1,
      limit: 10,
      isPaidFull: "",
      startDate: null,
      endDate: null,
    });
  };

  const getStatusBadgeClass = (isPaidFull) => {
    if (isPaidFull === true || isPaidFull === "true") {
      return "bg-green-100 text-green-800";
    } else if (isPaidFull === false || isPaidFull === "false") {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (isPaidFull) => {
    if (isPaidFull === true || isPaidFull === "true") {
      return "To'langan";
    } else if (isPaidFull === false || isPaidFull === "false") {
      return "Aktiv";
    } else {
      return "Barchasi";
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
            className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-green-600/70 to-green-700/70 hover:shadow-green-500/20 text-white shadow-md"
          >
            <span className="text-sm font-medium">Yangi kredit</span>
            <FiPlusCircle className="h-5 w-5" />
          </button>

          {/* Loan Create Modal */}
          <LoanModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          {/* Loan Edit Modal - to be implemented */}
          {/* 
          <LoanEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedLoanId(null);
            }}
            loanId={selectedLoanId}
          />
          */}

          {/* Loan Repayment Modal */}
          <LoanRepaymentModal
            isOpen={isRepaymentModalOpen}
            onClose={() => {
              setIsRepaymentModalOpen(false);
              setSelectedLoanId(null);
            }}
            loanId={selectedLoanId}
          />
        </div>
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-5 rounded-xl shadow-lg border border-blue-900/20 overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-sm`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* isPaidFull Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <MdDescription className="mr-2 text-green-400" size={18} />
                Holati
              </label>
              <div className="relative">
                <select
                  name="isPaidFull"
                  value={isPaidFull}
                  onChange={handleIsPaidFullChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  <option value="false">Aktiv</option>
                  <option value="true">To'langan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <FiCalendar className="mr-2 text-green-400" size={18} />
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
                  className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none transition-all duration-300 w-64 cursor-pointer"
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
                <BiSolidData className="mr-2 text-green-400" size={18} />
                Natijalar soni
              </label>
              <select
                name="limit"
                value={limit}
                onChange={handleLimitChange}
                className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 border border-gray-700 appearance-none"
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
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/40 rounded-xl border border-purple-800/30 p-5 shadow-lg hover:shadow-purple-900/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">
                    Jami berilgan
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {statisticsLoading ? (
                      <span className="animate-pulse bg-purple-800/30 h-8 w-32 rounded inline-block"></span>
                    ) : (
                      new Intl.NumberFormat("uz-UZ", {
                        style: "currency",
                        currency: "UZS",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(statisticsData?.getLoanStatistics?.totalLoaned || 0)
                    )}
                  </p>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-full">
                  <FiDollarSign size={24} className="text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/40 rounded-xl border border-orange-800/30 p-5 shadow-lg hover:shadow-orange-900/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">
                    Qolgan summa
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {statisticsLoading ? (
                      <span className="animate-pulse bg-orange-800/30 h-8 w-32 rounded inline-block"></span>
                    ) : (
                      new Intl.NumberFormat("uz-UZ", {
                        style: "currency",
                        currency: "UZS",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(statisticsData?.getLoanStatistics?.activeLoans || 0)
                    )}
                  </p>
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
                    Aktiv kreditlar
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {statisticsLoading ? (
                      <span className="animate-pulse bg-blue-800/30 h-8 w-32 rounded inline-block"></span>
                    ) : (
                      (loansData?.getLoans?.docs?.filter(loan => !loan.isPaidFull)?.length || 0) + " ta"
                    )}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-full">
                  <TbMoneybag size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/40 to-green-900/40 rounded-xl border border-green-800/30 p-5 shadow-lg hover:shadow-green-900/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">
                    To'langan kreditlar
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {statisticsLoading ? (
                      <span className="animate-pulse bg-green-800/30 h-8 w-32 rounded inline-block"></span>
                    ) : (
                      (loansData?.getLoans?.docs?.filter(loan => loan.isPaidFull)?.length || 0) + " ta"
                    )}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                  <TbMoneybag size={24} className="text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Cards Component */}
        <LoanCards
          initialPage={filterState.page}
          initialLimit={filterState.limit}
          initialStatus={filterState.status}
          initialStartDate={filterState.startDate}
          initialEndDate={filterState.endDate}
          onEdit={openEditModal}
          onPayment={openRepaymentModal}
        />
      </div>
    </div>
  );
};

export default LoansPage;
