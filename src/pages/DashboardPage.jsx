import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_EXPENSES_STATISTICS } from "../graphql/queries/expense.query";
import { GET_SHARINGS_STATISTICS } from "../graphql/queries/sharing.query";
import { GET_ORDER_STATISTICS } from "../graphql/queries/order.query";
import { GET_RAW_MATERIAL_STATISTICS } from "../graphql/queries/rawMaterial.query";

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
  });

  // Fetch statistics data
  const { data: expenseData } = useQuery(GET_EXPENSES_STATISTICS);
  const { data: sharingData } = useQuery(GET_SHARINGS_STATISTICS);
  const { data: orderData } = useQuery(GET_ORDER_STATISTICS);
  const { data: rawMaterialData } = useQuery(GET_RAW_MATERIAL_STATISTICS);

  // Process expense data
  useEffect(() => {
    if (expenseData?.categoryStatisticsExpense) {
      const categories = expenseData.categoryStatisticsExpense.map(
        (stat) => stat.category
      );
      const amounts = expenseData.categoryStatisticsExpense.map(
        (stat) => stat.totalAmount
      );
      const totalExpenses = amounts.reduce((acc, curr) => acc + curr, 0);

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

      // Update total expenses in summary
      setSummaryStats((prev) => ({
        ...prev,
        totalExpenses,
      }));
    }
  }, [expenseData]);

  // Process sharing data
  useEffect(() => {
    if (sharingData?.categoryStatisticsSharing) {
      const categories = sharingData.categoryStatisticsSharing.map(
        (stat) => stat.category
      );
      const amounts = sharingData.categoryStatisticsSharing.map(
        (stat) => stat.totalAmount
      );
      const totalSharings = amounts.reduce((acc, curr) => acc + curr, 0);

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

      // Update total sharings in summary
      setSummaryStats((prev) => ({
        ...prev,
        totalSharings,
      }));
    }
  }, [sharingData]);

  // Process raw material data
  useEffect(() => {
    if (rawMaterialData?.rawMaterialStatistics) {
      const categories = rawMaterialData.rawMaterialStatistics.map(
        (stat) => stat.category
      );
      const amounts = rawMaterialData.rawMaterialStatistics.map(
        (stat) => stat.totalAmount
      );
      const totalRawMaterials = amounts.reduce((acc, curr) => acc + curr, 0);

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

      // Update raw materials total in summary
      setSummaryStats((prev) => ({
        ...prev,
        totalRawMaterials,
      }));
    }
  }, [rawMaterialData]);

  // Process order data and calculate profits
  useEffect(() => {
    if (orderData?.orderStatistics) {
      const categories = orderData.orderStatistics.map(
        (stat) => stat.orderCategory
      );
      const amounts = orderData.orderStatistics.map(
        (stat) => stat.orderTotalAmount
      );
      const totalOrders = amounts.reduce((acc, curr) => acc + curr, 0);

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

      // Update order totals and calculate profits
      setSummaryStats((prev) => {
        const grossProfit =
          totalOrders - prev.totalExpenses - prev.totalRawMaterials;
        const netProfit = grossProfit - prev.totalSharings;

        return {
          ...prev,
          totalOrders,
          grossProfit,
          netProfit,
        };
      });
    }
  }, [
    orderData,
    summaryStats.totalExpenses,
    summaryStats.totalSharings,
    summaryStats.totalRawMaterials,
  ]);

  // Format currency function
  const formatCurrency = (amount) => {
    return amount.toLocaleString("uz-UZ") + " so'm";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Boshqaruv Paneli
      </h1>

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
          <h3 className="text-xl font-medium text-white mb-2">Jami Ulushlar</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(summaryStats.totalSharings)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-800/30 to-green-600/30 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-medium text-white mb-2">Yalpi Foyda</h3>
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
          <h3 className="text-xl font-bold text-white mb-4">Foyda Tahlili</h3>
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
                    {formatCurrency(expenseChartData.datasets[0].data[index])}
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
                    {formatCurrency(sharingChartData.datasets[0].data[index])}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Ma'lumot mavjud emas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
