// src/components/Filters.jsx
import React from "react";

const Filters = ({
  categories,
  categoryId,
  loading,
  onCategoryChange,
  limit,
  onLimitChange,
}) => {
  return (
    <div className="flex flex-row sm:flex-row items-center sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      <div className="flex flex-col sm:flex-col sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
        <label htmlFor="category" className="text-white text-sm font-medium">
          Kategoriya:
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={onCategoryChange}
          className="w-full sm:w-auto bg-gray-700/80 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
          disabled={loading}
        >
          <option value="">Barchasi</option>
          {loading ? (
            <option value="" disabled>Yuklanmoqda...</option>
          ) : (
            Array.isArray(categories) ? categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            )) : (<option value="" disabled>Kategoriyalar mavjud emas</option>)
          )}
        </select>
      </div>

      <div className="flex flex-col sm:flex-col sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
        <label htmlFor="limit" className="text-white text-sm font-medium">
          Sahifada:
        </label>
        <select
          id="limit"
          value={limit}
          onChange={onLimitChange}
          className="w-full sm:w-auto bg-gray-700/80 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
        >
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
