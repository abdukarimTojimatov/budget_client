import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_STATISTICS } from "../graphql/queries/dashboard.query";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Filler,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Filler,
  PointElement,
  LineElement
);

// Format currency with commas and decimal
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DashboardPage = () => {
  // Date range state
  const [dateRange, setDateRange] = useState([null, null]);

  // State for various chart data
  const [expenseChartData, setExpenseChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Xarajatlar",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  const [sharingChartData, setSharingChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Ulushlar",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  const [orderChartData, setOrderChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Buyurtmalar",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  const [rawMaterialChartData, setRawMaterialChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Homashyolar",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalExpenses: 0,
    totalSharings: 0,
    totalOrders: 0,
    totalRawMaterials: 0,
    grossProfit: 0,
    netProfit: 0,
    totalClientPaid: 0,
    totalClientDebt: 0,
    totalRawMaterialPaid: 0,
    totalRawMaterialDebt: 0,
    totalExpensesAmount: 0,
    totalOrderExpenses: 0,
  });

  // Handle date range change
  const handleDateRangeChange = (update) => {
    setDateRange(update);
  };

  // Get formatted dates for the API
  const getFormattedStartDate = () =>
    dateRange[0] ? dateRange[0].toISOString().split("T")[0] : null;

  const getFormattedEndDate = () =>
    dateRange[1] ? dateRange[1].toISOString().split("T")[0] : null;

  // Fetch all dashboard statistics in a single query with date range
  const {
    data: dashboardData,
    loading,
    refetch,
  } = useQuery(GET_DASHBOARD_STATISTICS, {
    variables: {
      startDate: getFormattedStartDate(),
      endDate: getFormattedEndDate(),
    },
  });

  // Apply date filter
  const applyDateFilter = () => {
    refetch({
      startDate: getFormattedStartDate(),
      endDate: getFormattedEndDate(),
    });
  };

  // Reset date filter
  const resetDateFilter = () => {
    setDateRange([null, null]);
    refetch({
      startDate: null,
      endDate: null,
    });
  };

  // Process all data when it arrives
  useEffect(() => {
    if (dashboardData?.dashboardStatistics) {
      const stats = dashboardData.dashboardStatistics;

      // Process expense data
      if (stats.expenses && stats.expenses.length > 0) {
        const categories = stats.expenses.map(
          (stat) =>
            stat.categoryName ||
            (stat.category && stat.category.name) ||
            "Uncategorized"
        );
        const amounts = stats.expenses.map((stat) => stat.totalAmount);

        // Generate colors
        const backgroundColors = categories.map((_, index) => {
          const hue = (index * 137) % 360; // Golden ratio to distribute colors
          return `hsla(${hue}, 70%, 60%, 0.7)`;
        });

        const borderColors = backgroundColors.map((color) =>
          color.replace("0.7", "1")
        );

        setExpenseChartData({
          labels: categories,
          datasets: [
            {
              label: "Xarajatlar",
              data: amounts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
      }

      // Process sharing data
      if (stats.sharings && stats.sharings.length > 0) {
        const categories = stats.sharings.map(
          (stat) =>
            stat.categoryName ||
            (stat.category && stat.category.name) ||
            "Uncategorized"
        );
        const amounts = stats.sharings.map((stat) => stat.totalAmount);

        // Generate colors
        const backgroundColors = categories.map((_, index) => {
          const hue = (index * 137 + 60) % 360; // Offset for different color scheme
          return `hsla(${hue}, 70%, 60%, 0.7)`;
        });

        const borderColors = backgroundColors.map((color) =>
          color.replace("0.7", "1")
        );

        setSharingChartData({
          labels: categories,
          datasets: [
            {
              label: "Ulushlar",
              data: amounts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
      }

      // Process raw material data
      if (stats.rawMaterials && stats.rawMaterials.length > 0) {
        const categories = stats.rawMaterials.map(
          (stat) =>
            stat.categoryName ||
            (stat.category && stat.category.name) ||
            "Uncategorized"
        );
        const amounts = stats.rawMaterials.map((stat) => stat.totalAmount);

        // Generate colors
        const backgroundColors = categories.map((_, index) => {
          const hue = (index * 137 + 180) % 360; // Offset for different color scheme
          return `hsla(${hue}, 70%, 60%, 0.7)`;
        });

        const borderColors = backgroundColors.map((color) =>
          color.replace("0.7", "1")
        );

        setRawMaterialChartData({
          labels: categories,
          datasets: [
            {
              label: "Homashyolar",
              data: amounts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
      }

      // Process order data
      if (stats.orders && stats.orders.length > 0) {
        const categories = stats.orders.map((stat) => stat.orderCategory);
        const amounts = stats.orders.map((stat) => stat.orderTotalAmount);

        // Generate colors
        const backgroundColors = categories.map((_, index) => {
          const hue = (index * 137 + 120) % 360; // Offset for different color scheme
          return `hsla(${hue}, 70%, 60%, 0.7)`;
        });

        const borderColors = backgroundColors.map((color) =>
          color.replace("0.7", "1")
        );

        setOrderChartData({
          labels: categories,
          datasets: [
            {
              label: "Buyurtmalar",
              data: amounts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
      }

      // Set summary statistics directly from the response
      setSummaryStats({
        totalOrders: stats.totalOrders || 0,
        totalExpenses: stats.totalExpenses || 0,
        totalSharings: stats.totalSharings || 0,
        totalRawMaterials: stats.totalRawMaterials || 0,
        grossProfit: stats.grossProfit || 0,
        netProfit: stats.netProfit || 0,
        totalClientPaid: stats.totalClientPaid || 0,
        totalClientDebt: stats.totalClientDebt || 0,
        totalRawMaterialPaid: stats.totalRawMaterialPaid || 0,
        totalRawMaterialDebt: stats.totalRawMaterialDebt || 0,
        totalExpensesAmount: stats.totalExpensesAmount || 0,
        totalOrderExpenses: stats.totalOrderExpenses || 0,
      });
    }
  }, [dashboardData]);

  // Format currency function
  const formatCurrency = (amount) => {
    return amount.toLocaleString("uz-UZ") + " so'm";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-white text-lg">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Title */}
          <motion.h1
            className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Boshqaruv Paneli
          </motion.h1>

          {/* Date Range Filter */}
          <motion.div
            className="bg-gray-800/60 p-4 rounded-xl shadow-lg mb-6 border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-3 text-blue-300 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Vaqt Bo'yicha Saralash
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={handleDateRangeChange}
                  className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-all duration-300 w-64 cursor-pointer"
                  placeholderText="Ikki sanani tanlang"
                  dateFormat="yyyy-MM-dd"
                  popperClassName="z-[100]"
                  popperPlacement="bottom-start"
                  wrapperClassName="z-50"
                  onKeyDown={(e) => e.preventDefault()}
                  showPopperArrow={false}
                  shouldCloseOnSelect={false}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-5 py-3 rounded-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  onClick={applyDateFilter}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Qo'llash
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center border border-gray-600"
                  onClick={resetDateFilter}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Tozalash
                </button>
              </div>
            </div>
          </motion.div>

          {/* Date range indicator if filter is applied */}
          {(dateRange[0] || dateRange[1]) && (
            <motion.div
              className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-white p-3 rounded-lg mb-6 text-center shadow-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="flex items-center justify-center text-blue-200">
                {dateRange[0] && dateRange[1]
                  ? `${getFormattedStartDate()} dan ${getFormattedEndDate()} gacha`
                  : dateRange[0]
                  ? `${getFormattedStartDate()} dan keyin`
                  : `${getFormattedEndDate()} gacha`}
              </p>
            </motion.div>
          )}

          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-800/50 to-blue-600/40 p-4 rounded-xl shadow-lg border border-blue-500/30 hover:shadow-blue-500/20 hover:border-blue-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-blue-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Jami Buyurtmalar
              </h3>
              <span className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.totalOrders)}
              </span>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-red-800/50 to-red-600/40 p-4 rounded-xl shadow-lg border border-red-500/30 hover:shadow-red-500/20 hover:border-red-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-red-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Jami Xarajatlar
              </h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.totalExpenses)}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-amber-800/50 to-amber-600/40 p-4 rounded-xl shadow-lg border border-amber-500/30 hover:shadow-amber-500/20 hover:border-amber-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-amber-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2v-10M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Jami Homashyolar
              </h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.totalRawMaterials)}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-purple-800/50 to-purple-600/40 p-4 rounded-xl shadow-lg border border-purple-500/30 hover:shadow-purple-500/20 hover:border-purple-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-purple-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Jami Ulushlar
              </h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.totalSharings)}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-green-800/50 to-green-600/40 p-4 rounded-xl shadow-lg border border-green-500/30 hover:shadow-green-500/20 hover:border-green-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-green-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Yalpi Foyda
              </h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.grossProfit)}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-emerald-800/50 to-emerald-600/40 p-4 rounded-xl shadow-lg border border-emerald-500/30 hover:shadow-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-emerald-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Sof Foyda
              </h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.netProfit)}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-indigo-800/50 to-indigo-600/40 p-4 rounded-xl shadow-lg border border-indigo-500/30 hover:shadow-indigo-500/20 hover:border-indigo-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-indigo-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
                Foydalilik
              </h3>
              <p className="text-xl font-bold text-white">
                {summaryStats.totalOrders > 0
                  ? `${(
                      (summaryStats.netProfit / summaryStats.totalOrders) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-yellow-800/50 to-yellow-600/40 p-4 rounded-xl shadow-lg border border-yellow-500/30 hover:shadow-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base font-medium text-yellow-200 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Buyurtma Xarajatlari
              </h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summaryStats.totalOrderExpenses)}
              </p>
            </motion.div>
          </motion.div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-white mb-2">Xarajatlar</h3>
              <div className="h-[200px] flex items-center justify-center">
                {expenseChartData.labels.length > 0 ? (
                  <Doughnut
                    data={expenseChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: { color: "white", font: { size: 10 } },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-white mb-2">Ulushlar</h3>
              <div className="h-[200px] flex items-center justify-center">
                {sharingChartData.labels.length > 0 ? (
                  <Doughnut
                    data={sharingChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: { color: "white", font: { size: 10 } },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-white mb-2">Homashyolar</h3>
              <div className="h-[200px] flex items-center justify-center">
                {rawMaterialChartData.labels.length > 0 ? (
                  <Doughnut
                    data={rawMaterialChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: { color: "white", font: { size: 10 } },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-white mb-2">Buyurtmalar</h3>
              <div className="h-[200px] flex items-center justify-center">
                {orderChartData.labels.length > 0 ? (
                  <Bar
                    data={orderChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          ticks: { color: "white", font: { size: 10 } },
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                        },
                        x: {
                          ticks: { color: "white", font: { size: 10 } },
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md col-span-1 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-2">
                Foyda Tahlili
              </h3>
              <div className="h-[200px] flex items-center justify-center">
                <Bar
                  data={{
                    labels: [
                      "Buyurtmalar",
                      "Xarajatlar",
                      "Homashyolar",
                      "Ulushlar",
                      "Yalpi Foyda",
                      "Sof Foyda",
                    ],
                    datasets: [
                      {
                        label: "So'm",
                        data: [
                          summaryStats.totalOrders,
                          summaryStats.totalExpenses,
                          summaryStats.totalRawMaterials,
                          summaryStats.totalSharings,
                          summaryStats.grossProfit,
                          summaryStats.netProfit,
                        ],
                        backgroundColor: [
                          "rgba(54, 162, 235, 0.7)",
                          "rgba(255, 99, 132, 0.7)",
                          "rgba(255, 159, 64, 0.7)",
                          "rgba(153, 102, 255, 0.7)",
                          "rgba(75, 192, 192, 0.7)",
                          "rgba(16, 185, 129, 0.7)",
                        ],
                        borderColor: [
                          "rgba(54, 162, 235, 1)",
                          "rgba(255, 99, 132, 1)",
                          "rgba(255, 159, 64, 1)",
                          "rgba(153, 102, 255, 1)",
                          "rgba(75, 192, 192, 1)",
                          "rgba(16, 185, 129, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        ticks: {
                          color: "white",
                          font: { size: 10 },
                          callback: (value) =>
                            value >= 1000000
                              ? `${(value / 1000000).toFixed(1)}M`
                              : value >= 1000
                              ? `${(value / 1000).toFixed(1)}K`
                              : value,
                        },
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                      },
                      x: {
                        ticks: { color: "white", font: { size: 10 } },
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#0e66a4] mb-2">
                Buyurtma Statistika
              </h3>
              <div className="space-y-2">
                {orderChartData.labels.length > 0 ? (
                  orderChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md"
                    >
                      <span className="text-white text-sm">{category}</span>
                      <span className="text-white font-bold text-sm">
                        {formatCurrency(orderChartData.datasets[0].data[index])}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#0e66a4] mb-2">
                Xarajat Statistika
              </h3>
              <div className="space-y-2">
                {expenseChartData.labels.length > 0 ? (
                  expenseChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md"
                    >
                      <span className="text-white text-sm">{category}</span>
                      <span className="text-white font-bold text-sm">
                        {formatCurrency(
                          expenseChartData.datasets[0].data[index]
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#0e66a4] mb-2">
                Homashyolar
              </h3>
              <div className="space-y-2">
                {rawMaterialChartData.labels.length > 0 ? (
                  rawMaterialChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md"
                    >
                      <span className="text-white text-sm">{category}</span>
                      <span className="text-white font-bold text-sm">
                        {formatCurrency(
                          rawMaterialChartData.datasets[0].data[index]
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#0e66a4] mb-2">
                Ulushlar
              </h3>
              <div className="space-y-2">
                {sharingChartData.labels.length > 0 ? (
                  sharingChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md"
                    >
                      <span className="text-white text-sm">{category}</span>
                      <span className="text-white font-bold text-sm">
                        {formatCurrency(
                          sharingChartData.datasets[0].data[index]
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
          </div>

          {/* Debt Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#0e66a4] mb-2">
                Mijozlar Qarzi
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md">
                  <span className="text-white text-sm">Jami Buyurtmalar</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(summaryStats.totalOrders)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md">
                  <span className="text-white text-sm">To'langan</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(summaryStats.totalClientPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-700/20 rounded-md">
                  <span className="text-white text-sm">To'langan Foizi</span>
                  <span className="text-white font-bold text-sm">
                    {summaryStats.totalOrders > 0
                      ? `${(
                          (summaryStats.totalClientPaid /
                            summaryStats.totalOrders) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-700/20 rounded-md">
                  <span className="text-white text-sm">Qarzdorlik</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(summaryStats.totalClientDebt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#0e66a4] mb-2">
                Homashyo Qarzi
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md">
                  <span className="text-white text-sm">Jami Homashyolar</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(summaryStats.totalRawMaterials)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md">
                  <span className="text-white text-sm">To'langan</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(summaryStats.totalRawMaterialPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-700/20 rounded-md">
                  <span className="text-white text-sm">To'langan Foizi</span>
                  <span className="text-white font-bold text-sm">
                    {summaryStats.totalRawMaterials > 0
                      ? `${(
                          (summaryStats.totalRawMaterialPaid /
                            summaryStats.totalRawMaterials) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-700/20 rounded-md">
                  <span className="text-white text-sm">Qarzdorlik</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(summaryStats.totalRawMaterialDebt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Supplier Debt Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customers with Debt */}
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#e74c3c] mb-2">
                Qarzdor Mijozlar
              </h3>
              {dashboardData?.dashboardStatistics?.customersWithDebt?.length >
              0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full rounded-md bg-gray-700/30 text-white">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="p-2 text-left">Mijoz</th>
                        <th className="p-2 text-left">Telefon</th>
                        <th className="p-2 text-right">Qarz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.dashboardStatistics.customersWithDebt.map(
                        (customer, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-600/30"
                          >
                            <td className="p-2">{customer.customerName}</td>
                            <td className="p-2">
                              {customer.phoneNumber || "-"}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(customer.totalDebt)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-sm p-4">
                  Qarzdor mijozlar yo'q
                </p>
              )}
            </div>

            {/* Suppliers we owe money to */}
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-[#e74c3c] mb-2">
                Qarzimiz Bor Ta'minotchilar
              </h3>
              {dashboardData?.dashboardStatistics?.suppliersWithDebt?.length >
              0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full rounded-md bg-gray-700/30 text-white">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="p-2 text-left">Ta'minotchi</th>
                        <th className="p-2 text-left">Telefon</th>
                        <th className="p-2 text-right">Qarz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.dashboardStatistics.suppliersWithDebt.map(
                        (supplier, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-600/30"
                          >
                            <td className="p-2">{supplier.supplierName}</td>
                            <td className="p-2">
                              {supplier.phoneNumber || "-"}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(supplier.totalDebt)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-sm p-4">
                  Qarzimiz bor ta'minotchilar yo'q
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
