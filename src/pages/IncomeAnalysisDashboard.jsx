import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_INCOMES, GET_INCOMES_STATISTICS } from "../graphql/queries/income.query";
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

const IncomeAnalysisDashboard = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Get income statistics and data
  const { data: incomeStatsData, loading: statsLoading } = useQuery(GET_INCOMES_STATISTICS);
  const { data: incomesData, loading: incomesLoading } = useQuery(GET_INCOMES, {
    variables: { 
      limit: 100,
      categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
    },
  });

  const categoryStats = incomeStatsData?.categoryStatisticsIncome || [];
  const incomes = incomesData?.getIncomes?.docs || [];
  const totalIncomes = incomesData?.getIncomes?.totalDocs || 0;
  
  // Calculate filtered income amount
  const totalIncomeAmount = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Format for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter incomes by date
  const getFilteredIncomes = () => {
    if (!incomes.length) return [];
    
    if (timeFilter === "all" && !startDate && !endDate) {
      return incomes;
    }
    
    let filtered = [...incomes];
    
    // Apply date range filter if set
    if (startDate && endDate) {
      filtered = filtered.filter(income => {
        const incomeDate = new Date(income.date);
        return isWithinInterval(incomeDate, { start: startDate, end: endDate });
      });
      return filtered;
    }
    
    // Apply predefined time filters
    const today = new Date();
    
    switch (timeFilter) {
      case "month":
        const startOfThisMonth = startOfMonth(today);
        const endOfThisMonth = endOfMonth(today);
        return filtered.filter(income => {
          const incomeDate = new Date(income.date);
          return isWithinInterval(incomeDate, {
            start: startOfThisMonth,
            end: endOfThisMonth,
          });
        });
        
      case "3months":
        const threeMonthsAgo = startOfMonth(subMonths(today, 3));
        return filtered.filter(income => {
          const incomeDate = new Date(income.date);
          return isWithinInterval(incomeDate, {
            start: threeMonthsAgo,
            end: today,
          });
        });
        
      case "6months":
        const sixMonthsAgo = startOfMonth(subMonths(today, 6));
        return filtered.filter(income => {
          const incomeDate = new Date(income.date);
          return isWithinInterval(incomeDate, {
            start: sixMonthsAgo,
            end: today,
          });
        });
        
      default:
        return filtered;
    }
  };

  const filteredIncomes = getFilteredIncomes();
  
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
  
  // Monthly income trends data
  const getMonthlyData = () => {
    if (!incomes.length) return { labels: [], data: [] };
    
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
      
      const monthTotal = incomes
        .filter(income => {
          const incomeDate = new Date(income.date);
          return isWithinInterval(incomeDate, {
            start: monthStart,
            end: monthEnd,
          });
        })
        .reduce((sum, income) => sum + income.amount, 0);
        
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
        label: 'Oylik daromadlar',
        data: monthlyData.data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
        label: 'Kategoriya bo\'yicha daromadlar',
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

  // Function to get unique categories from incomes
  const getUniqueCategories = () => {
    if (!incomes.length) return [];
    
    const categories = new Map();
    
    incomes.forEach(income => {
      if (income.category && income.category._id) {
        categories.set(income.category._id, income.category);
      }
    });
    
    return Array.from(categories.values());
  };
  
  const uniqueCategories = getUniqueCategories();

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
            Daromadlar tahlili
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
                  Jami daromadlar
                </h3>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-blue-800/30 h-8 w-32 rounded inline-block"></span>
                  ) : (
                    formatCurrency(totalIncomeAmount)
                  )}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <FiDollarSign size={24} className="text-blue-500" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl border border-green-800/30 p-5 shadow-lg hover:shadow-green-900/20 transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-300">
                  Daromadlar soni
                </h3>
                <p className="text-2xl font-bold text-white">
                  {incomesLoading ? (
                    <span className="animate-pulse bg-green-800/30 h-8 w-32 rounded inline-block"></span>
                  ) : (
                    `${filteredIncomes.length} ta`
                  )}
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <TbMoneybag size={24} className="text-green-500" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl border border-purple-800/30 p-5 shadow-lg hover:shadow-purple-900/20 transition-shadow duration-300"
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
                    <span className="animate-pulse bg-purple-800/30 h-8 w-32 rounded inline-block"></span>
                  ) : (
                    `${categoryStats.length} ta`
                  )}
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <TbCategoryPlus size={24} className="text-purple-500" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <motion.div 
            className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-xl border border-gray-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TbChartPie className="mr-2 text-blue-400" size={20} />
              Kategoriya bo'yicha daromadlar
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
            className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-xl border border-gray-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-green-400" size={20} />
              Oylik daromadlar trendi
            </h3>
            
            <div className="h-[300px] flex items-center justify-center">
              {incomesLoading || monthlyData.data.length === 0 ? (
                <div className="text-gray-400 text-center">
                  {incomesLoading ? "Ma'lumotlar yuklanmoqda..." : "Ma'lumotlar mavjud emas"}
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
          {/* Category Bar Chart */}
          <motion.div 
            className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-xl border border-gray-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TbCategoryPlus className="mr-2 text-purple-400" size={20} />
              Kategoriyalar bo'yicha daromadlar
            </h3>
            
            <div className="h-[300px] flex items-center justify-center">
              {statsLoading || categoryStats.length === 0 ? (
                <div className="text-gray-400 text-center">
                  {statsLoading ? "Ma'lumotlar yuklanmoqda..." : "Ma'lumotlar mavjud emas"}
                </div>
              ) : (
                <Bar 
                  data={categoryBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      y: {
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        }
                      },
                      x: {
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
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${formatCurrency(context.raw)}`;
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
            className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-xl border border-gray-800/30 p-5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-yellow-400" size={20} />
              Eng ko'p daromad keltiruvchi kategoriyalar
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
                        {Math.round((stat.totalAmount / totalIncomeAmount) * 100)}%
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

export default IncomeAnalysisDashboard;
