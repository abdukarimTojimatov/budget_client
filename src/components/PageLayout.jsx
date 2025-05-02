import React from "react";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";

const PageLayout = ({
  title,
  subtitle,
  children,
  actions,
  showSearch,
  searchQuery,
  onSearchChange,
  isLoading,
}) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </motion.div>

        {/* Search Section */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white sm:text-sm transition-colors duration-200"
                placeholder="Qidirish..."
              />
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : (
          /* Main Content */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;
