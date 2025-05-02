import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_DEBT_STATISTICS } from "../graphql/queries/debt.query";
import { GET_LOAN_STATISTICS } from "../graphql/queries/loan.query";
import { GET_EXPENSES_STATS, GET_INCOMES_STATS, GET_EXPENSE_TOTAL, GET_INCOME_TOTAL } from "../graphql/queries/dashboard.statistics";
import { useNavigate } from "react-router-dom";
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
import { Pie, Doughnut } from "react-chartjs-2";
import { FiDollarSign, FiTrendingUp, FiPieChart, FiActivity } from "react-icons/fi";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { 
  IoWalletOutline, 
  IoAnalyticsOutline, 
  IoStatsChartOutline, 
  IoTimeOutline,
  IoArrowForwardOutline  
} from "react-icons/io5";
import { motion } from "framer-motion";

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

const FinancialDashboard = () => {
  const navigate = useNavigate();
  
  // Get statistics for debts, loans, expenses and incomes
  const { data: debtStatsData, loading: debtStatsLoading } = useQuery(GET_DEBT_STATISTICS);
  const { data: loanStatsData, loading: loanStatsLoading } = useQuery(GET_LOAN_STATISTICS);
  const { data: expensesStatsData, loading: expensesStatsLoading } = useQuery(GET_EXPENSES_STATS);
  const { data: incomesStatsData, loading: incomesStatsLoading } = useQuery(GET_INCOMES_STATS);
  const { data: expenseTotalData, loading: expenseTotalLoading } = useQuery(GET_EXPENSE_TOTAL, { variables: { page: 1, limit: 1 }});
  const { data: incomeTotalData, loading: incomeTotalLoading } = useQuery(GET_INCOME_TOTAL, { variables: { page: 1, limit: 1 }});
  
  const debtStats = debtStatsData?.getDebtStatistics || {};
  const loanStats = loanStatsData?.getLoanStatistics || {};
  
  // Calculate total expenses from returned data
  const expensesByCategory = expensesStatsData?.categoryStatisticsExpense || [];
  const incomesByCategory = incomesStatsData?.categoryStatisticsIncome || [];
  
  // Calculate totals
  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  const totalIncomes = incomesByCategory.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  
  // Format for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate total funds, net balance, etc.
  const totalBorrowed = debtStats.totalDebt || 0;
  const totalLoaned = loanStats.totalLoaned || 0;
  const paidDebts = debtStats.paidDebt || 0;
  const paidLoans = loanStats.paidLoans || 0;
  const netBalance = totalLoaned - totalBorrowed;
  const activeBorrowed = totalBorrowed - paidDebts;
  const activeLoaned = totalLoaned - paidLoans;
  const cashFlow = totalIncomes - totalExpenses;
  
  // Data for Debts vs Loans pie chart
  const fundsDistributionData = {
    labels: ["Berilgan qarzlar", "Olingan qarzlar"],
    datasets: [
      {
        data: [totalLoaned, totalBorrowed],
        backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 99, 132, 0.7)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };
  
  // Donut chart for repayment status
  const repaymentStatusData = {
    labels: ["To'langan qarzlar", "Qolgan qarzlar", "Qaytarilgan qarzlar", "Qaytarilishi kerak"],
    datasets: [
      {
        data: [paidDebts, activeBorrowed, paidLoans, activeLoaned],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 206, 86, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Data for Income vs Expense chart
  const incomeExpenseData = {
    labels: ["Daromadlar", "Xarajatlar"],
    datasets: [
      {
        data: [totalIncomes, totalExpenses],
        backgroundColor: ["rgba(46, 204, 113, 0.7)", "rgba(231, 76, 60, 0.7)"],
        borderColor: ["rgba(46, 204, 113, 1)", "rgba(231, 76, 60, 1)"],
        borderWidth: 1,
      },
    ],
  };
  
  // Loading states
  const isIncomeExpenseLoading = incomesStatsLoading || expensesStatsLoading;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-8">Moliyaviy Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <div className="bg-indigo-500/20 p-3 rounded-full mr-3">
              <IoWalletOutline className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Balans</h3>
          </div>
          
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Qarz balans</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netBalance)} so'm
              </p>
            </div>
            <FiTrendingUp size={24} className={`mt-6 ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs">Berilgan qarzlar</p>
              <p className="text-white font-medium">{formatCurrency(totalLoaned)} so'm</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs">Olingan qarzlar</p>
              <p className="text-white font-medium">{formatCurrency(totalBorrowed)} so'm</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <div className="bg-green-500/20 p-3 rounded-full mr-3">
              <GiReceiveMoney className="text-green-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Berilgan qarzlar</h3>
          </div>
          
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-gray-400 text-sm">Umumiy berilgan</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalLoaned)} so'm</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Qaytarilgan</p>
                <p className="text-green-400 font-medium">{formatCurrency(paidLoans)} so'm</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Qolgan</p>
                <p className="text-yellow-400 font-medium">{formatCurrency(activeLoaned)} so'm</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/loan-analysis')}
            className="flex items-center justify-center w-full mt-6 p-2 bg-blue-600/30 hover:bg-blue-600/50 transition-colors rounded-lg text-blue-200 text-sm"
          >
            Batafsil tahlil <IoArrowForwardOutline className="ml-1" />
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <div className="bg-red-500/20 p-3 rounded-full mr-3">
              <GiPayMoney className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Olingan qarzlar</h3>
          </div>
          
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-gray-400 text-sm">Umumiy olingan</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalBorrowed)} so'm</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">To'langan</p>
                <p className="text-green-400 font-medium">{formatCurrency(paidDebts)} so'm</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Qolgan</p>
                <p className="text-yellow-400 font-medium">{formatCurrency(activeBorrowed)} so'm</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/debt-analysis')}
            className="flex items-center justify-center w-full mt-6 p-2 bg-blue-600/30 hover:bg-blue-600/50 transition-colors rounded-lg text-blue-200 text-sm"
          >
            Batafsil tahlil <IoArrowForwardOutline className="ml-1" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <div className="bg-green-500/20 p-3 rounded-full mr-3">
              <FiTrendingUp className="text-green-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Daromadlar</h3>
          </div>
          
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-gray-400 text-sm">Umumiy daromad</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalIncomes)} so'm</p>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-lg mb-2">
              <p className="text-gray-400 text-xs">Oylik o'rtacha</p>
              <p className="text-green-400 font-medium">{formatCurrency(totalIncomes / 12)} so'm</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/incomes')}
            className="flex items-center justify-center w-full mt-6 p-2 bg-blue-600/30 hover:bg-blue-600/50 transition-colors rounded-lg text-blue-200 text-sm"
          >
            Ko'rish <IoArrowForwardOutline className="ml-1" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <div className="bg-red-500/20 p-3 rounded-full mr-3">
              <FiDollarSign className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Xarajatlar</h3>
          </div>
          
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-gray-400 text-sm">Umumiy xarajat</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)} so'm</p>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-lg mb-2">
              <p className="text-gray-400 text-xs">Oylik o'rtacha</p>
              <p className="text-red-400 font-medium">{formatCurrency(totalExpenses / 12)} so'm</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/expenses')}
            className="flex items-center justify-center w-full mt-6 p-2 bg-blue-600/30 hover:bg-blue-600/50 transition-colors rounded-lg text-blue-200 text-sm"
          >
            Ko'rish <IoArrowForwardOutline className="ml-1" />
          </button>
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Moliyaviy taqsimot</h3>
          <div className="h-64 flex items-center justify-center">
            {debtStatsLoading || loanStatsLoading ? (
              <div className="text-gray-400">Yuklanmoqda...</div>
            ) : (
              <Pie
                data={fundsDistributionData}
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
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">To'lov holati</h3>
          <div className="h-64 flex items-center justify-center">
            {debtStatsLoading || loanStatsLoading ? (
              <div className="text-gray-400">Yuklanmoqda...</div>
            ) : (
              <Doughnut
                data={repaymentStatusData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { color: 'white' }
                    }
                  },
                  cutout: '70%'
                }}
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Daromadlar va Xarajatlar</h3>
          <div className="h-64 flex items-center justify-center">
            {isIncomeExpenseLoading ? (
              <div className="text-gray-400">Yuklanmoqda...</div>
            ) : (
              <Pie
                data={incomeExpenseData}
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
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          onClick={() => navigate('/debt-analysis')}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg cursor-pointer hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-500/20 p-3 rounded-full mr-3">
              <IoAnalyticsOutline className="text-purple-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Qarzlar tahlili</h3>
          </div>
          <p className="text-gray-400 mb-6">Olingan qarzlar bo'yicha batafsil tahlil, to'lovlar tarixi, trendlar va statistika.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-300">Batafsil</span>
            <IoArrowForwardOutline className="text-blue-300" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={() => navigate('/loan-analysis')}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg cursor-pointer hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full mr-3">
              <IoStatsChartOutline className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Berilgan qarzlar tahlili</h3>
          </div>
          <p className="text-gray-400 mb-6">Berilgan qarzlar hisobi, to'lovlar holati, muddatlar va statistikalar.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-300">Batafsil</span>
            <IoArrowForwardOutline className="text-blue-300" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          onClick={() => navigate('/expenses')}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg cursor-pointer hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="bg-red-500/20 p-3 rounded-full mr-3">
              <FiDollarSign className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Xarajatlar tahlili</h3>
          </div>
          <p className="text-gray-400 mb-6">Xarajatlar kategoriyalari, trendlar va oylik statistikalar.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-300">Ko'rish</span>
            <IoArrowForwardOutline className="text-blue-300" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          onClick={() => navigate('/incomes')}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg cursor-pointer hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-500/20 p-3 rounded-full mr-3">
              <FiTrendingUp className="text-green-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Daromadlar tahlili</h3>
          </div>
          <p className="text-gray-400 mb-6">Daromadlar manbalari, trendlar va oylik statistikalar.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-300">Ko'rish</span>
            <IoArrowForwardOutline className="text-blue-300" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
