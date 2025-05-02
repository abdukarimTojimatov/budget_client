import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_LOAN_STATISTICS, GET_LOANS } from "../graphql/queries/loan.query";
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
import { Pie, Bar, Line } from "react-chartjs-2";
import { FiDollarSign, FiCalendar, FiUsers, FiTrendingUp } from "react-icons/fi";
import { GiReceiveMoney, GiPayMoney } from "react-icons/gi";
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

const LoanAnalysisDashboard = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get loan statistics and data
  const { data: loanStatsData, loading: statsLoading } = useQuery(GET_LOAN_STATISTICS);
  const { data: loansData, loading: loansLoading } = useQuery(GET_LOANS, {
    variables: { 
      page: 1, 
      limit: 100,
      status: statusFilter !== "all" ? statusFilter : undefined 
    },
  });

  const loanStats = loanStatsData?.getLoanStatistics || {};
  const loans = loansData?.getLoans?.docs || [];

  // Format for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status distribution data for pie chart
  const getStatusData = () => {
    const statusCounts = {
      active: 0,
      paid: 0,
      defaulted: 0,
      forgiven: 0
    };
    
    loans.forEach(loan => {
      if (statusCounts[loan.status] !== undefined) {
        statusCounts[loan.status]++;
      }
    });
    
    const statusLabels = {
      active: "Aktiv",
      paid: "To'langan",
      defaulted: "Muddati o'tgan",
      forgiven: "Kechirilgan"
    };
    
    const statusColors = {
      active: "rgba(54, 162, 235, 0.7)",
      paid: "rgba(75, 192, 192, 0.7)",
      defaulted: "rgba(255, 99, 132, 0.7)",
      forgiven: "rgba(255, 206, 86, 0.7)"
    };
    
    return {
      labels: Object.keys(statusCounts).map(status => statusLabels[status]),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(status => statusColors[status]),
          borderColor: Object.keys(statusCounts).map(status => statusColors[status].replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
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

    loans.forEach((loan) => {
      // Get payment methods from repayments
      if (loan.repayments && loan.repayments.length > 0) {
        loan.repayments.forEach(repayment => {
          const method = repayment.paymentMethod;
          methodCounts[method] = (methodCounts[method] || 0) + 1;
        });
      }
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

  // Monthly loan data trends
  const getMonthlyLoanData = () => {
    // Group loans by month
    const loansByMonth = {};
    const repaymentsByMonth = {};
    
    loans.forEach((loan) => {
      // Start date for giving loan
      const startDate = new Date(loan.startDate);
      if (!isNaN(startDate.getTime())) {
        const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        loansByMonth[monthKey] = (loansByMonth[monthKey] || 0) + loan.totalAmount;
      }
      
      // Check for repayments
      if (loan.repayments && loan.repayments.length > 0) {
        loan.repayments.forEach(repayment => {
          const paymentDate = new Date(repayment.paymentDate);
          if (!isNaN(paymentDate.getTime())) {
            const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
            repaymentsByMonth[monthKey] = (repaymentsByMonth[monthKey] || 0) + repayment.repaidAmount;
          }
        });
      }
    });
    
    // Combine all months from both datasets
    const allMonths = [...new Set([...Object.keys(loansByMonth), ...Object.keys(repaymentsByMonth)])].sort();
    
    const monthLabels = allMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, 'MMM yyyy');
    });
    
    return {
      labels: monthLabels,
      datasets: [
        {
          label: "Berilgan qarzlar",
          data: allMonths.map(month => loansByMonth[month] || 0),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Qaytarilgan qarzlar",
          data: allMonths.map(month => repaymentsByMonth[month] || 0),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        }
      ],
    };
  };

  // Calculate totals and status counts
  const totalLoaned = loanStats.totalLoaned || 0;
  const paidLoans = loanStats.paidLoans || 0;
  const activeLoans = loanStats.activeLoans || 0;
  const remainingToCollect = totalLoaned - paidLoans;

  // Calculate number by status
  const activeLoanCount = loans.filter(loan => loan.status === 'active').length;
  const paidLoanCount = loans.filter(loan => loan.status === 'paid').length;
  const defaultedLoanCount = loans.filter(loan => loan.status === 'defaulted').length;
  const forgivenLoanCount = loans.filter(loan => loan.status === 'forgiven').length;

  // Calculate average time to repay loans (completed ones)
  const getAvgRepaymentDays = () => {
    const paidLoans = loans.filter(loan => loan.status === 'paid');
    if (paidLoans.length === 0) return 0;
    
    const totalDays = paidLoans.reduce((sum, loan) => {
      const startDate = new Date(loan.startDate);
      // Use the latest repayment or update date
      const lastRepaymentDate = loan.repayments && loan.repayments.length > 0 
        ? new Date(loan.repayments[loan.repayments.length - 1].paymentDate)
        : new Date(loan.updatedAt);
        
      if (isNaN(startDate.getTime()) || isNaN(lastRepaymentDate.getTime())) return sum;
      
      const diffTime = Math.abs(lastRepaymentDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return Math.round(totalDays / paidLoans.length);
  };

  const avgRepaymentDays = getAvgRepaymentDays();

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Berilgan Qarzlar Tahlili</h1>
      
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
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center">
            <div className="bg-blue-500/20 p-3 rounded-full mr-3">
              <GiReceiveMoney className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Umumiy berilgan qarzlar</h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(totalLoaned)} so'm
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center">
            <div className="bg-green-500/20 p-3 rounded-full mr-3">
              <GiPayMoney className="text-green-400" size={24} />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Qaytarilgan qarzlar</h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(paidLoans)} so'm
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center">
            <div className="bg-red-500/20 p-3 rounded-full mr-3">
              <FiTrendingUp className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Qaytarilishi kerak</h3>
              <p className="text-xl font-bold text-white">
                {formatCurrency(remainingToCollect)} so'm
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center">
            <div className="bg-yellow-500/20 p-3 rounded-full mr-3">
              <FiCalendar className="text-yellow-400" size={24} />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">O'rtacha qaytarish muddati</h3>
              <p className="text-xl font-bold text-white">
                {avgRepaymentDays} kun
              </p>
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
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Qarz holatlari</h3>
          <div className="h-64 flex items-center justify-center">
            {statsLoading ? (
              <div className="text-gray-400">Yuklanmoqda...</div>
            ) : (
              <Pie
                data={getStatusData()}
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
          <div className="grid grid-cols-4 mt-4 gap-2">
            <div className="bg-gray-800/50 p-2 rounded-lg text-center">
              <h4 className="text-xs text-gray-400">Aktiv</h4>
              <p className="text-white font-medium">{activeLoanCount} ta</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded-lg text-center">
              <h4 className="text-xs text-gray-400">To'langan</h4>
              <p className="text-white font-medium">{paidLoanCount} ta</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded-lg text-center">
              <h4 className="text-xs text-gray-400">Muddati o'tgan</h4>
              <p className="text-white font-medium">{defaultedLoanCount} ta</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded-lg text-center">
              <h4 className="text-xs text-gray-400">Kechirilgan</h4>
              <p className="text-white font-medium">{forgivenLoanCount} ta</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">To'lov usullari bo'yicha taqsimot</h3>
          <div className="h-64 flex items-center justify-center">
            {loansLoading ? (
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
          {loansLoading ? (
            <div className="flex h-full items-center justify-center text-gray-400">Yuklanmoqda...</div>
          ) : (
            <Bar
              data={getMonthlyLoanData()}
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
      
      {/* Top Borrowers Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Eng katta berilgan qarzlar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nomi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qarz oluvchi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Umumiy summa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qolgan summa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loansLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">Yuklanmoqda...</td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">Qarzlar mavjud emas</td>
                </tr>
              ) : (
                [...loans]
                  .sort((a, b) => b.totalAmount - a.totalAmount)
                  .slice(0, 5)
                  .map((loan) => {
                    // Get status style
                    let statusStyle = "";
                    switch(loan.status) {
                      case "active":
                        statusStyle = "bg-blue-100 text-blue-800";
                        break;
                      case "paid":
                        statusStyle = "bg-green-100 text-green-800";
                        break;
                      case "defaulted":
                        statusStyle = "bg-red-100 text-red-800";
                        break;
                      case "forgiven":
                        statusStyle = "bg-yellow-100 text-yellow-800";
                        break;
                      default:
                        statusStyle = "bg-gray-100 text-gray-800";
                    }
                    
                    const statusText = {
                      active: "Aktiv",
                      paid: "To'langan",
                      defaulted: "Muddati o'tgan",
                      forgiven: "Kechirilgan"
                    };

                    return (
                      <tr key={loan._id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{loan.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{loan.borrower}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(loan.totalAmount)} so'm</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(loan.remainingAmount)} so'm</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle}`}>
                            {statusText[loan.status] || loan.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default LoanAnalysisDashboard;
