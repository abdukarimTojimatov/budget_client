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
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

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
        const categories = stats.expenses.map((stat) => stat.category);
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
        const categories = stats.sharings.map((stat) => stat.category);
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
        const categories = stats.rawMaterials.map((stat) => stat.category);
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
          {/* Date Range Filter */}
          <div className="flex flex-col justify-start mb-4">
            <div className="flex items-center ml-3">
              <div className="relative z-50 ">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={handleDateRangeChange}
                  className="bg-gray-800/70 p-1.5 rounded-md text-white w-56 text-sm cursor-pointer"
                  placeholderText="Ikki sanani tanlang"
                  dateFormat="yyyy-MM-dd"
                  popperClassName="z-[100]"
                  popperPlacement="bottom-start"
                  wrapperClassName="z-50"
                  onKeyDown={(e) => e.preventDefault()}
                  showPopperArrow={false}
                  shouldCloseOnSelect={false}
                />
              </div>
            </div>
            <div className="flex items-start mt-2">
              <button
                className="bg-blue-800/30 p-1.5 rounded-md text-white hover:bg-blue-600/30 text-sm"
                onClick={applyDateFilter}
              >
                Apply
              </button>
              <button
                className="bg-red-800/30 p-1.5 rounded-md text-white hover:bg-red-600/30 ml-1 text-sm"
                onClick={resetDateFilter}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Date range indicator if filter is applied */}
          {(dateRange[0] || dateRange[1]) && (
            <div className="bg-blue-600/20 border border-blue-600/30 text-white p-2 rounded-md mb-4 text-center text-sm">
              <p>
                {dateRange[0] && dateRange[1]
                  ? `${getFormattedStartDate()} dan ${getFormattedEndDate()} gacha`
                  : dateRange[0]
                  ? `${getFormattedStartDate()} dan keyin`
                  : `${getFormattedEndDate()} gacha`}
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-800/30 to-blue-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">
                Jami Buyurtmalar
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.totalOrders)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-800/30 to-red-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">
                Jami Xarajatlar
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.totalExpenses)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-800/30 to-amber-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">
                Jami Homashyolar
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.totalRawMaterials)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-800/30 to-purple-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">
                Jami Ulushlar
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.totalSharings)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-800/30 to-green-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">
                Yalpi Foyda
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.grossProfit)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-800/30 to-emerald-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">Sof Foyda</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.netProfit)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-800/30 to-indigo-600/30 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-medium text-white mb-1">
                Foydalilik
              </h3>
              <p className="text-2xl font-bold text-white">
                {summaryStats.totalOrders > 0
                  ? `${(
                      (summaryStats.netProfit / summaryStats.totalOrders) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>

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
              <h3 className="text-lg font-bold text-white mb-2">
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
              <h3 className="text-lg font-bold text-white mb-2">
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
              <h3 className="text-lg font-bold text-white mb-2">Homashyolar</h3>
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
              <h3 className="text-lg font-bold text-white mb-2">Ulushlar</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-white mb-2">
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
              <h3 className="text-lg font-bold text-white mb-2">
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
        </>
      )}
    </div>
  );
};

export default DashboardPage;
