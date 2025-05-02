import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_DEBT_STATISTICS, GET_DEBTS } from "../graphql/queries/debt.query";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import { FiDollarSign, FiCalendar, FiUser, FiTrendingUp } from "react-icons/fi";
import { TbMoneybag, TbChartPie } from "react-icons/tb";
import { motion } from "framer-motion";
import { format } from "date-fns";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const DebtAnalysisDashboard = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get debt statistics and data
  const { data: debtStatsData, loading: statsLoading } = useQuery(GET_DEBT_STATISTICS);
  const { data: debtsData, loading: debtsLoading } = useQuery(GET_DEBTS, {
    variables: { 
      limit: 100,
      status: statusFilter !== "all" ? statusFilter : undefined
    },
  });

  const debtStats = debtStatsData?.getDebtStatistics || {};
  const debts = debtsData?.getDebts?.docs || [];

  // Format for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status distribution data for pie chart
  const statusData = {
    labels: ["To'langan", "Aktiv"],
    datasets: [
      {
        data: [
          debtStats.paidDebt || 0,
          debtStats.totalDebt ? debtStats.totalDebt - debtStats.paidDebt : 0,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 99, 132, 0.7)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Distribution by payment method
  const getPaymentMethodData = () => {
    const methodCounts = {};
    const methodColors = {
      cash: "rgba(255, 159, 64, 0.7)",
      bank_transfer: "rgba(54, 162, 235, 0.7)",
      digital_wallet: "rgba(75, 192, 192, 0.7)",
      check: "rgba(153, 102, 255, 0.7)",
      other: "rgba(201, 203, 207, 0.7)",
    };

    debts.forEach((debt) => {
      const method = debt.paymentMethodOnTakingDebt;
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const methodLabels = {
      cash: "Naqd pul",
      bank_transfer: "Bank o'tkazmasi",
      digital_wallet: "Electron hamyon",
      check: "Chek",
      other: "Boshqa",
    };

    return {
      labels: Object.keys(methodCounts).map(method => methodLabels[method] || method),
      datasets: [
        {
          data: Object.values(methodCounts),
          backgroundColor: Object.keys(methodCounts).map(
            (method) => methodColors[method] || "rgba(201, 203, 207, 0.7)"
          ),
          borderColor: Object.keys(methodCounts).map(
            (method) => methodColors[method]?.replace("0.7", "1") || "rgba(201, 203, 207, 1)"
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Monthly debt trends
  const getMonthlyDebtData = () => {
    // Group debts by month
    const debtsByMonth = {};
    const debtsPaidByMonth = {};
    
    debts.forEach((debt) => {
      // Start date for taking debt
      const startDate = new Date(debt.startDate);
      if (!isNaN(startDate.getTime())) {
        const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        debtsByMonth[monthKey] = (debtsByMonth[monthKey] || 0) + debt.totalDebt;
      }
      
      // Check for payments
      if (debt.paidDebts && debt.paidDebts.length > 0) {
        debt.paidDebts.forEach(payment => {
          const paymentDate = new Date(payment.paymentDate);
          if (!isNaN(paymentDate.getTime())) {
            const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
            debtsPaidByMonth[monthKey] = (debtsPaidByMonth[monthKey] || 0) + payment.paidAmount;
          }
        });
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(debtsByMonth).sort();
    
    const monthLabels = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, 'MMM yyyy');
    });
    
    return {
      labels: monthLabels,
      datasets: [
        {
          label: "Olingan qarzlar",
          data: sortedMonths.map(month => debtsByMonth[month] || 0),
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "To'langan qarzlar",
          data: sortedMonths.map(month => debtsPaidByMonth[month] || 0),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        }
      ],
    };
  };

  // Calculate number of paid vs. active debts
  const paidDebtsCount = debts.filter(debt => debt.isPaidFull).length;
  const activeDebtsCount = debts.length - paidDebtsCount;

  // Calculate average time to repay debts (completed ones)
  const getAvgRepaymentDays = () => {
    const paidDebts = debts.filter(debt => debt.isPaidFull);
    if (paidDebts.length === 0) return 0;
    
    const totalDays = paidDebts.reduce((sum, debt) => {
      const startDate = new Date(debt.startDate);
      const lastPaymentDate = debt.paidDebts && debt.paidDebts.length > 0 
        ? new Date(debt.paidDebts[debt.paidDebts.length - 1].paymentDate)
        : new Date(debt.updatedAt);
        
      if (isNaN(startDate.getTime()) || isNaN(lastPaymentDate.getTime())) return sum;
      
      const diffTime = Math.abs(lastPaymentDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return Math.round(totalDays / paidDebts.length);
  };

  const avgRepaymentDays = getAvgRepaymentDays();

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Qarzlar Tahlili</h1>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-gray-800 p-2 rounded-lg">
          <span className="text-gray-400 mr-2 text-sm">Vaqt:</span>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              timeFilter === "all" ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
            onClick={() => setTimeFilter("all")}
          >
            Hammasi
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              timeFilter === "year" ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
            onClick={() => setTimeFilter("year")}
          >
            Bu yil
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              timeFilter === "month" ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
            onClick={() => setTimeFilter("month")}
          >
            Bu oy
          </button>
        </div>
        
        <div className="bg-gray-800 p-2 rounded-lg">
          <span className="text-gray-400 mr-2 text-sm">Status:</span>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "all" ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            Hammasi
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "active" ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
            onClick={() => setStatusFilter("active")}
          >
            Aktiv
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "paid" ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
            onClick={() => setStatusFilter("paid")}
          >
            To'langan
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl border border-blue-800/30 p-5 shadow-lg hover:shadow-blue-900/20 transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Umumiy qarzlar</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(debtStats.totalDebt || 0)} so'm
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-full">
              <TbMoneybag className="text-blue-500" size={24} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 rounded-xl border border-indigo-800/30 p-5 shadow-lg hover:shadow-indigo-900/20 transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-300">To'langan qarzlar</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(debtStats.paidDebt || 0)} so'm
              </p>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-full">
              <FiDollarSign className="text-indigo-500" size={24} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 rounded-xl border border-cyan-800/30 p-5 shadow-lg hover:shadow-cyan-900/20 transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Aktiv qarzlar</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency((debtStats.totalDebt || 0) - (debtStats.paidDebt || 0))} so'm
              </p>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-full">
              <FiDollarSign className="text-cyan-500" size={24} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 rounded-xl border border-indigo-800/30 p-5 shadow-lg hover:shadow-indigo-900/20 transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-300">O'rtacha to'lov muddati</h3>
              <p className="text-2xl font-bold text-white">
                {avgRepaymentDays} kun
              </p>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-full">
              <FiCalendar className="text-indigo-500" size={24} />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800/30 p-5 shadow-lg"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <TbChartPie className="mr-2 text-blue-400" size={20} />
            Qarzlar holati
          </h3>
          <div className="h-64 flex items-center justify-center">
            {statsLoading ? (
              <div className="text-gray-400">Yuklanmoqda...</div>
            ) : (
              <Pie
                data={statusData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { color: 'white' }
                    }
                  }
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-2 mt-4 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg text-center">
              <h4 className="text-xs text-gray-400">Aktiv qarzlar</h4>
              <p className="text-white font-medium">{activeDebtsCount} ta</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg text-center">
              <h4 className="text-xs text-gray-400">To'langan qarzlar</h4>
              <p className="text-white font-medium">{paidDebtsCount} ta</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800/30 p-5 shadow-lg"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-blue-400" size={20} />
            To'lov usullari bo'yicha taqsimot
          </h3>
          <div className="h-64 flex items-center justify-center">
            {debtsLoading ? (
              <div className="text-gray-400">Yuklanmoqda...</div>
            ) : (
              <Pie
                data={getPaymentMethodData()}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { color: 'white' }
                    }
                  }
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Chart - Second Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Oylar bo'yicha qarzlar dinamikasi</h3>
        <div className="h-72">
          {debtsLoading ? (
            <div className="flex h-full items-center justify-center text-gray-400">Yuklanmoqda...</div>
          ) : (
            <Bar
              data={getMonthlyDebtData()}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: { 
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    title: { 
                      display: true, 
                      text: 'Summa (so\'m)', 
                      color: 'rgba(255, 255, 255, 0.7)' 
                    }
                  },
                  x: { 
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                },
                plugins: {
                  legend: { labels: { color: 'white' } }
                }
              }}
            />
          )}
        </div>
      </motion.div>
      
      {/* Top Debtors Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Eng katta qarzlar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nomi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Umumiy summa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qolgan summa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {debtsLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">Yuklanmoqda...</td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">Qarzlar mavjud emas</td>
                </tr>
              ) : (
                [...debts]
                  .sort((a, b) => b.totalDebt - a.totalDebt)
                  .slice(0, 5)
                  .map((debt) => (
                    <tr key={debt._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{debt.nameOfDebt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{debt.phoneNumberOfDebt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(debt.totalDebt)} so'm</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(debt.leftDebt)} so'm</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          debt.isPaidFull ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {debt.isPaidFull ? "To'langan" : "Aktiv"}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DebtAnalysisDashboard;
