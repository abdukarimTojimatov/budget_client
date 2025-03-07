// src/components/FilterBar.js
import React, { useState } from "react";
import PropTypes from "prop-types";

const FilterBar = ({ onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...localFilters,
      [name]: value || undefined,
    };

    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <select
        name="orderCategory"
        onChange={handleChange}
        className="p-2 border rounded"
      >
        <option value="">All Categories</option>
        <option value="oshxona">Oshxona</option>
        <option value="yotoqxona">Yotoqxona</option>
        <option value="yumshoq mebel">Yumshoq Mebel</option>
        <option value="boshqa">Boshqa</option>
      </select>

      <select
        name="orderStatus"
        onChange={handleChange}
        className="p-2 border rounded"
      >
        <option value="">All Statuses</option>
        <option value="yangi">yangi</option>
        <option value="tayyorlanayabdi">Tayyorlanayabdi</option>
        <option value="tayyor">Tayyor</option>
        <option value="ornatildi">Ornatildi</option>
      </select>

      <select
        name="orderPaymentStatus"
        onChange={handleChange}
        className="p-2 border rounded"
      >
        <option value="">Payment Status</option>
        <option value="tolanmadi">Not Paid</option>
        <option value="qisman">Partially Paid</option>
        <option value="tolandi">Fully Paid</option>
      </select>
    </div>
  );
};

FilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterBar;
