import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_EXPENSES, GET_EXPENSES_STATISTICS } from "../graphql/queries/expense.query";
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
import { FiDollarSign, FiCalendar, FiFilter, FiTrendingUp } from "react-icons/fi";
import { TbMoneybag, TbChartPie, TbCategoryPlus } from "react-icons/tb";
import { motion } from "framer-motion";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const ExpenseAnalysisDashboard = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Get expense statistics and data
  const { data: expenseStatsData, loading: statsLoading } = useQuery(GET_EXPENSES_STATISTICS);
  const { data: expensesData, loading: expensesLoading } = useQuery(GET_EXPENSES, {
    variables: { 
      limit: 100,
      categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
    },
  });

  const categoryStats = expenseStatsData?.categoryStatisticsExpense || [];
  const expenses = expensesData?.getExpenses?.docs || [];
  const totalExpenses = expensesData?.getExpenses?.totalDocs || 0;
  
  // Calculate filtered expense amount
  const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Format for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter expenses by date
  const getFilteredExpenses = () => {
    if (!expenses.length) return [];
    
    if (timeFilter === "all" && !startDate && !endDate) {
      return expenses;
    }
    
    let filtered = [...expenses];
    
    // Apply date range filter if set
    if (startDate && endDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return isWithinInterval(expenseDate, { start: startDate, end: endDate });
      });
      return filtered;
    }
    
    // Apply predefined time filters
    const today = new Date();
    
    switch (timeFilter) {
      case "month":
        const startOfThisMonth = startOfMonth(today);
        const endOfThisMonth = endOfMonth(today);
        return filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return isWithinInterval(expenseDate, {
            start: startOfThisMonth,
            end: endOfThisMonth,
          });
        });
        
      case "3months":
        const threeMonthsAgo = startOfMonth(subMonths(today, 3));
        return filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return isWithinInterval(expenseDate, {
            start: threeMonthsAgo,
            end: today,
          });
        });
        
      case "6months":
        const sixMonthsAgo = startOfMonth(subMonths(today, 6));
        return filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return isWithinInterval(expenseDate, {
            start: sixMonthsAgo,
            end: today,
          });
        });
        
      default:
        return filtered;
    }
  };

  const filteredExpenses = getFilteredExpenses();
  
  // Data for Category Pie Chart
  const categoryPieData = {
    labels: categoryStats.map(stat => stat.category.name),
    datasets: [
      {
        data: categoryStats.map(stat => stat.totalAmount),
        backgroundColor: categoryStats.map(stat => stat.category.color || '#' + Math.floor(Math.random()*16777215).toString(16)),
        borderWidth: 1,
      },
    ],
  };
  
  // Monthly expense trends data
  const getMonthlyData = () => {
    if (!expenses.length) return { labels: [], data: [] };
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), i);
      return {
        month: format(d, 'MMM yyyy'),
        date: d
      };
    }).reverse();
    
    const monthlyTotals = last6Months.map(monthObj => {
      const monthStart = startOfMonth(monthObj.date);
      const monthEnd = endOfMonth(monthObj.date);
      
      const monthTotal = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return isWithinInterval(expenseDate, {
            start: monthStart,
            end: monthEnd,
          });
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
        
      return monthTotal;
    });
    
    return {
      labels: last6Months.map(m => m.month),
      data: monthlyTotals
    };
  };

  const monthlyData = getMonthlyData();
  
  const monthlyTrendData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Oylik xarajatlar',
        data: monthlyData.data,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  // Category comparison bar chart
  const categoryBarData = {
    labels: categoryStats.map(stat => stat.category.name),
    datasets: [
      {
        label: 'Kategoriya bo\'yicha xarajatlar',
        data: categoryStats.map(stat => stat.totalAmount),
        backgroundColor: categoryStats.map(stat => stat.category.color || '#' + Math.floor(Math.random()*16777215).toString(16)),
        borderWidth: 1,
      },
    ],
  };
  
  // Top categories by amount
  const topCategories = [...categoryStats]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  // Function to get unique categories from expenses
  const getUniqueCategories = () => {
    if (!expenses.length) return [];
    
    const categories = new Map();
    
    expenses.forEach(expense => {
      if (expense.category && expense.category._id) {
        categories.set(expense.category._id, expense.category);
      }
    });
    
    return Array.from(categories.values());
  };
  
  const uniqueCategories = getUniqueCategories();

  // Get payment types distribution
  const getPaymentTypeData = () => {
    if (!expenses.length) return { labels: [], data: [] };
    
    const paymentTypes = {};
    
    expenses.forEach(expense => {
      const type = expense.paymentType || 'Boshqa';
      paymentTypes[type] = (paymentTypes[type] || 0) + expense.amount;
    });
    
    const labels = Object.keys(paymentTypes);
    const data = Object.values(paymentTypes);
    
    return { labels, data };
  };
  
  const paymentTypeData = getPaymentTypeData();
  
  const paymentPieData = {
    labels: paymentTypeData.labels,
    datasets: [
      {
        data: paymentTypeData.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Get translated payment type names
  const getPaymentTypeName = (type) => {
    switch(type) {
      case 'cash': return 'Naqd pul';
      case 'card': return 'Karta';
      case 'bank_transfer': return 'Bank o\'tkazmasi';
      case 'mobile_payment': return 'Mobil to\'lov';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Xarajatlar tahlili
          </motion.h1>
          
          <div className="flex flex-wrap gap-3">
            {/* Time Filter */}
            <select
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeFilter}
              onChange={e => {
                setTimeFilter(e.target.value);
                if (e.target.value !== "custom") {
                  setDateRange([null, null]);
                }
              }}
            >
              <option value="all">Barcha vaqt</option>
              <option value="month">Joriy oy</option>
              <option value="3months">So'nggi 3 oy</option>
              <option value="6months">So'nggi 6 oy</option>
              <option value="custom">Boshqa oraliq</option>
            </select>
            
            {/* Date Range Picker (visible when custom time filter is selected) */}
            {timeFilter === "custom" && (
              <div className="flex items-center">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Sana tanlang"
                  dateFormat="yyyy/MM/dd"
                />
              </div>
            )}
            
            {/* Category Filter */}
            <select
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">Barcha kategoriyalar</option>
              {uniqueCategories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl border border-blue-800/30 p-5 shadow-lg hover:shadow-blue-900/20 transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-300">
                  Jami xarajatlar
                </h3>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-blue-800/30 h-8 w-32 rounded inline-block"></span>
                  ) : (
                    formatCurrency(totalExpenseAmount)
                  )}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <FiDollarSign size={24} className="text-blue-500" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 rounded-xl border border-indigo-800/30 p-5 shadow-lg hover:shadow-indigo-900/20 transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-300">
                  Xarajatlar soni
                </h3>
                <p className="text-2xl font-bold text-white">
                  {expensesLoading ? (
                    <span className="animate-pulse bg-indigo-800/30 h-8 w-32 rounded inline-block"></span>
                  ) : (
                    `${filteredExpenses.length} ta`
                  )}
                </p>
              </div>
              <div className="bg-indigo-500/10 p-3 rounded-full">
                <TbMoneybag size={24} className="text-indigo-500" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 rounded-xl border border-cyan-800/30 p-5 shadow-lg hover:shadow-cyan-900/20 transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-300">
                  Kategoriyalar soni
                </h3>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-cyan-800/30 h-8 w-32 rounded inline-block"></span>
                  ) : (
                    `${categoryStats.length} ta`
                  )}
                </p>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded-full">
                <TbCategoryPlus size={24} className="text-cyan-500" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <motion.div 
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TbChartPie className="mr-2 text-blue-400" size={20} />
              Kategoriya bo'yicha xarajatlar
            </h3>
            
            <div className="h-[300px] flex items-center justify-center">
              {statsLoading || categoryStats.length === 0 ? (
                <div className="text-gray-400 text-center">
                  {statsLoading ? "Ma'lumotlar yuklanmoqda..." : "Ma'lumotlar mavjud emas"}
                </div>
              ) : (
                <Pie 
                  data={categoryPieData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: 'white',
                          usePointStyle: true,
                          padding: 15,
                          font: {
                            size: 11
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${formatCurrency(context.raw)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
          
          {/* Monthly Trend Line Chart */}
          <motion.div 
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-blue-400" size={20} />
              Oylik xarajatlar trendi
            </h3>
            
            <div className="h-[300px] flex items-center justify-center">
              {expensesLoading || monthlyData.data.length === 0 ? (
                <div className="text-gray-400 text-center">
                  {expensesLoading ? "Ma'lumotlar yuklanmoqda..." : "Ma'lumotlar mavjud emas"}
                </div>
              ) : (
                <Line 
                  data={monthlyTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                          callback: function(value) {
                            if (value >= 1000000) {
                              return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                              return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
                          }
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        }
                      },
                      x: {
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white',
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Additional Charts and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Type Pie Chart */}
          <motion.div 
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-blue-400" size={20} />
              To'lov turlari bo'yicha
            </h3>
            
            <div className="h-[300px] flex items-center justify-center">
              {expensesLoading || paymentTypeData.labels.length === 0 ? (
                <div className="text-gray-400 text-center">
                  {expensesLoading ? "Ma'lumotlar yuklanmoqda..." : "Ma'lumotlar mavjud emas"}
                </div>
              ) : (
                <Pie 
                  data={paymentPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: 'white',
                          usePointStyle: true,
                          padding: 15,
                          font: {
                            size: 11
                          },
                          generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label, i) => {
                                const meta = chart.getDatasetMeta(0);
                                const style = meta.controller.getStyle(i);
                                
                                return {
                                  text: getPaymentTypeName(label),
                                  fillStyle: style.backgroundColor,
                                  strokeStyle: style.borderColor,
                                  lineWidth: style.borderWidth,
                                  hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                                  index: i
                                };
                              });
                            }
                            return [];
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = getPaymentTypeName(context.label);
                            return `${label}: ${formatCurrency(context.raw)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
          
          {/* Top Categories */}
          <motion.div 
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TbCategoryPlus className="mr-2 text-blue-400" size={20} />
              Eng ko'p xarajat kategoriyalari
            </h3>
            
            <div className="overflow-y-auto max-h-[300px]">
              {statsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 h-14 rounded-lg"></div>
                  ))}
                </div>
              ) : topCategories.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Ma'lumotlar mavjud emas
                </div>
              ) : (
                <div className="space-y-3">
                  {topCategories.map((stat, index) => (
                    <div 
                      key={stat.category._id}
                      className="bg-gray-800/20 rounded-lg p-3 flex items-center justify-between border border-gray-700/20"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: stat.category.color || '#718096' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{stat.category.name}</h4>
                          <p className="text-xs text-gray-400">{formatCurrency(stat.totalAmount)}</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {Math.round((stat.totalAmount / totalExpenseAmount) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalysisDashboard;
