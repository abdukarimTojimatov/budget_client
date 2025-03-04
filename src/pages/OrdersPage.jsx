import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "../graphql/queries/order.query";
import { truncateText } from "../utils/formatDate";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import OrderCard from "../components/OrderCard";
import Pagination from "../components/Pagination";
import Filters from "../components/Filters";

const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    orderCategory: "",
    orderStatus: "",
    orderType: "",
    orderPaymentStatus: "",
  });

  const { loading, error, data } = useQuery(GET_ORDERS, {
    variables: {
      page,
      limit,
      ...filters,
    },
  });

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Buyurtmalar</h1>
          <Link
            to="/orders/create"
            className="bg-blue-800/30 hover:bg-blue-700/40 px-4 py-2 rounded-lg text-white transition-colors duration-200"
          >
            + Yangi buyurtma
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700/30 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Kategoriya
              </label>
              <select
                name="orderCategory"
                value={filters.orderCategory}
                onChange={handleFilterChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="">Hammasi</option>
                <option value="Shkaf">Shkaf</option>
                <option value="Parda">Parda</option>
                <option value="Boshqa">Boshqa</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Holati
              </label>
              <select
                name="orderStatus"
                value={filters.orderStatus}
                onChange={handleFilterChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="">Hammasi</option>
                <option value="Tayyorlanmoqda">Tayyorlanmoqda</option>
                <option value="Topshirildi">Topshirildi</option>
                <option value="Bekor qilindi">Bekor qilindi</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Turi
              </label>
              <select
                name="orderType"
                value={filters.orderType}
                onChange={handleFilterChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="">Hammasi</option>
                <option value="Shaxsiy">Shaxsiy</option>
                <option value="Firma">Firma</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-1">
                To'lov holati
              </label>
              <select
                name="orderPaymentStatus"
                value={filters.orderPaymentStatus}
                onChange={handleFilterChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="">Hammasi</option>
                <option value="Tolandi">To'landi</option>
                <option value="QismanTolandi">Qisman to'landi</option>
                <option value="Tolanmadi">To'lanmadi</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Sahifada
              </label>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="w-full bg-gray-700/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 bg-red-800/20 rounded-xl text-white text-center">
            Error fetching orders. Please try again later.
          </div>
        )}

        {/* Grid View of Orders */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.getOrders?.docs.length === 0 ? (
              <div className="col-span-full bg-gray-800/50 rounded-xl px-6 py-12 flex flex-col items-center justify-center text-center">
                <svg
                  className="w-16 h-16 text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  ></path>
                </svg>
                <p className="text-lg font-medium text-white">
                  Buyurtmalar topilmadi
                </p>
                <p className="text-gray-400 mt-1 mb-6">
                  Filtrlash parametrlarini o'zgartiring yoki yangi buyurtma
                  qo'shing
                </p>
                <Link
                  to="/orders/create"
                  className="bg-blue-800/40 hover:bg-blue-700/50 px-4 py-2 rounded-lg text-white transition-colors duration-200 text-sm"
                >
                  + Yangi buyurtma qo'shish
                </Link>
              </div>
            ) : (
              data?.getOrders?.docs.map((order) => (
                <div
                  key={order._id}
                  className="transform transition-transform duration-200 hover:scale-[1.02]"
                >
                  <OrderCard order={order} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && data?.getOrders?.docs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={data?.getOrders?.totalPages || 1}
              hasPrevPage={data?.getOrders?.hasPrevPage}
              hasNextPage={data?.getOrders?.hasNextPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
