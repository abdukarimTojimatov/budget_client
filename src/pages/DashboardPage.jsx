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

// Register ChartJS components
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
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

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

  // Handle date inputs change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value,
    });
  };

  // Fetch all dashboard statistics in a single query with date range
  const {
    data: dashboardData,
    loading,
    refetch,
  } = useQuery(GET_DASHBOARD_STATISTICS, {
    variables: {
      startDate: dateRange.startDate || null,
      endDate: dateRange.endDate || null,
    },
  });

  // Apply date filter
  const applyDateFilter = () => {
    refetch({
      startDate: dateRange.startDate || null,
      endDate: dateRange.endDate || null,
    });
  };

  // Reset date filter
  const resetDateFilter = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Dashboard
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-white text-xl">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Date Range Filter */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <label className="text-white mr-2">Date Range:</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="bg-gray-800/20 p-2 rounded-lg text-white"
              />
              <span className="text-white mx-2">to</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="bg-gray-800/20 p-2 rounded-lg text-white"
              />
            </div>
            <div className="flex items-center">
              <button
                className="bg-blue-600/20 p-2 rounded-lg text-white hover:bg-blue-600/30"
                onClick={applyDateFilter}
              >
                Apply
              </button>
              <button
                className="bg-red-600/20 p-2 rounded-lg text-white hover:bg-red-600/30 ml-2"
                onClick={resetDateFilter}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-800/30 to-blue-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                Jami Buyurtmalar
              </h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(summaryStats.totalOrders)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-800/30 to-red-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                Jami Xarajatlar
              </h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(summaryStats.totalExpenses)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-800/30 to-amber-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                Jami Homashyolar
              </h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(summaryStats.totalRawMaterials)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-800/30 to-purple-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                Jami Ulushlar
              </h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(summaryStats.totalSharings)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-800/30 to-green-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                Yalpi Foyda
              </h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(summaryStats.grossProfit)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-800/30 to-emerald-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">Sof Foyda</h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(summaryStats.netProfit)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-800/30 to-indigo-600/30 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                Foydalilik Darajasi
              </h3>
              <p className="text-3xl font-bold text-white">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Expenses Chart */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Xarajatlar Statistikasi
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                {expenseChartData.labels.length > 0 ? (
                  <Doughnut
                    data={expenseChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            color: "white",
                            font: {
                              size: 12,
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Sharings Chart */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Ulushlar Statistikasi
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                {sharingChartData.labels.length > 0 ? (
                  <Doughnut
                    data={sharingChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            color: "white",
                            font: {
                              size: 12,
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Raw Materials Chart */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Homashyolar Statistikasi
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                {rawMaterialChartData.labels.length > 0 ? (
                  <Doughnut
                    data={rawMaterialChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            color: "white",
                            font: {
                              size: 12,
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Orders Chart */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Buyurtmalar Statistikasi
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                {orderChartData.labels.length > 0 ? (
                  <Bar
                    data={orderChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          ticks: {
                            color: "white",
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                          },
                        },
                        x: {
                          ticks: {
                            color: "white",
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Profit Comparison */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">
                Foyda Tahlili
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                <Bar
                  data={{
                    labels: [
                      "Jami Buyurtmalar",
                      "Jami Xarajatlar",
                      "Jami Homashyolar",
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
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: "white",
                          callback: function (value) {
                            if (value >= 1000000) {
                              return (value / 1000000).toFixed(1) + "M";
                            } else if (value >= 1000) {
                              return (value / 1000).toFixed(1) + "K";
                            }
                            return value;
                          },
                        },
                        grid: {
                          color: "rgba(255, 255, 255, 0.1)",
                        },
                      },
                      x: {
                        ticks: {
                          color: "white",
                        },
                        grid: {
                          color: "rgba(255, 255, 255, 0.1)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Statistics Breakdown */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Buyurtma Statistikasi
              </h3>
              <div className="space-y-3">
                {orderChartData.labels.length > 0 ? (
                  orderChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg"
                    >
                      <span className="text-white">{category}</span>
                      <span className="text-white font-bold">
                        {formatCurrency(orderChartData.datasets[0].data[index])}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Expense Statistics Breakdown */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Xarajat Statistikasi
              </h3>
              <div className="space-y-3">
                {expenseChartData.labels.length > 0 ? (
                  expenseChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg"
                    >
                      <span className="text-white">{category}</span>
                      <span className="text-white font-bold">
                        {formatCurrency(
                          expenseChartData.datasets[0].data[index]
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Raw Material Statistics Breakdown */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Homashyolar ma'lumoti
              </h3>
              <div className="space-y-3">
                {rawMaterialChartData.labels.length > 0 ? (
                  rawMaterialChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg"
                    >
                      <span className="text-white">{category}</span>
                      <span className="text-white font-bold">
                        {formatCurrency(
                          rawMaterialChartData.datasets[0].data[index]
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>

            {/* Sharing Statistics Breakdown */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Ulushlar ma'lumoti
              </h3>
              <div className="space-y-3">
                {sharingChartData.labels.length > 0 ? (
                  sharingChartData.labels.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg"
                    >
                      <span className="text-white">{category}</span>
                      <span className="text-white font-bold">
                        {formatCurrency(
                          sharingChartData.datasets[0].data[index]
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Ma'lumot mavjud emas</p>
                )}
              </div>
            </div>
          </div>

          {/* Debt Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Client Debt Breakdown */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Mijozlar Qarzi Ma'lumoti
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg">
                  <span className="text-white">Jami Buyurtmalar</span>
                  <span className="text-white font-bold">
                    {formatCurrency(summaryStats.totalOrders)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg">
                  <span className="text-white">To'langan</span>
                  <span className="text-white font-bold">
                    {formatCurrency(summaryStats.totalClientPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-700/20 rounded-lg">
                  <span className="text-white">To'langan Foizi</span>
                  <span className="text-white font-bold">
                    {summaryStats.totalOrders > 0
                      ? `${(
                          (summaryStats.totalClientPaid /
                            summaryStats.totalOrders) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-700/20 rounded-lg">
                  <span className="text-white">Qarzdorlik</span>
                  <span className="text-white font-bold">
                    {formatCurrency(summaryStats.totalClientDebt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw Material Debt Breakdown */}
            <div className="bg-gray-800/20 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Homashyo Qarzi Ma'lumoti
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg">
                  <span className="text-white">Jami Homashyolar</span>
                  <span className="text-white font-bold">
                    {formatCurrency(summaryStats.totalRawMaterials)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/20 rounded-lg">
                  <span className="text-white">To'langan</span>
                  <span className="text-white font-bold">
                    {formatCurrency(summaryStats.totalRawMaterialPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-700/20 rounded-lg">
                  <span className="text-white">To'langan Foizi</span>
                  <span className="text-white font-bold">
                    {summaryStats.totalRawMaterials > 0
                      ? `${(
                          (summaryStats.totalRawMaterialPaid /
                            summaryStats.totalRawMaterials) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-700/20 rounded-lg">
                  <span className="text-white">Qarzdorlik</span>
                  <span className="text-white font-bold">
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
