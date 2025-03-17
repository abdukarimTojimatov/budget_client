import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "../graphql/queries/order.query";
import { truncateText } from "../utils/formatDate";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import OrderCard from "../components/OrderCard";
import Pagination from "../components/Pagination";
import Filters from "../components/Filters";
import {
  FiPlusCircle,
  FiMinusCircle,
  FiFilter,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import OrderModal from "../components/OrderModal";
import OrderEditModal from "../components/OrderEditModal";
import { MdCategory } from "react-icons/md";
import { BiSolidData } from "react-icons/bi";
import { FaMoneyBillAlt, FaBoxes } from "react-icons/fa";
import { GiCardboardBox } from "react-icons/gi";

const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderEditModalOpen, setIsOrderEditModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col">
        <div className="flex justify-start gap-3 items-center mx-3 my-4">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ml-1 duration-200 shadow-md ${
              isFiltersOpen
                ? "bg-gradient-to-r from-red-600/70 to-red-700/70 hover:shadow-red-500/20 text-white"
                : "bg-gradient-to-r from-blue-600/70 to-indigo-600/70 hover:shadow-blue-500/20 text-white"
            }`}
          >
            <span className="text-sm font-medium">
              {isFiltersOpen ? "Filtrlarni yopish" : "Filtrlash"}
            </span>
            {isFiltersOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiFilter className="h-5 w-5" />
            )}
          </button>

          {/* Add New Button */}
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-green-600/70 to-emerald-600/70 hover:shadow-green-500/20 text-white shadow-md"
          >
            <span className="text-sm font-medium">Yangi buyurtma</span>
            <FiPlusCircle className="h-5 w-5" />
          </button>

          {/* Order Modal */}
          <OrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
          />

          {/* Order Edit Modal */}
          <OrderEditModal
            isOpen={isOrderEditModalOpen}
            onClose={() => {
              setIsOrderEditModalOpen(false);
              setSelectedOrderId(null);
            }}
            orderId={selectedOrderId}
          />
        </div>

        {/* Filters Section */}
        <div
          className={`${
            isFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } bg-gray-800/50 p-5 rounded-xl shadow-lg border border-blue-900/20 overflow-hidden transition-all duration-300 ease-in-out my-4 backdrop-blur-sm mx-4`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <MdCategory className="mr-2 text-blue-400" size={18} />
                Kategoriya
              </label>
              <div className="relative">
                <select
                  name="orderCategory"
                  value={filters.orderCategory}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  <option value="oshxona">oshxona</option>
                  <option value="yotoqxona">yotoqxona</option>
                  <option value="yumshoq mebel">yumshoq mebel</option>
                  <option value="boshqa">boshqa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <MdCategory size={16} />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <GiCardboardBox className="mr-2 text-blue-400" size={18} />
                Holati
              </label>
              <div className="relative">
                <select
                  name="orderStatus"
                  value={filters.orderStatus}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  <option value="yangi">yangi</option>
                  <option value="tayyorlanayabdi">tayyorlanayabdi</option>
                  <option value="tayyor">tayyor</option>
                  <option value="ornatildi">ornatildi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <GiCardboardBox size={16} />
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <FaBoxes className="mr-2 text-blue-400" size={16} />
                Turi
              </label>
              <div className="relative">
                <select
                  name="orderType"
                  value={filters.orderType}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  <option value="bozor">bozor</option>
                  <option value="buyurtma">buyurtma</option>
                  <option value="boshqa">boshqa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FaBoxes size={14} />
                </div>
              </div>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <FaMoneyBillAlt className="mr-2 text-blue-400" size={16} />
                To'lov holati
              </label>
              <div className="relative">
                <select
                  name="orderPaymentStatus"
                  value={filters.orderPaymentStatus}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value="">Hammasi</option>
                  <option value="tolanmadi">tolanmadi</option>
                  <option value="qisman">qisman</option>
                  <option value="tolandi">tolandi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <FaMoneyBillAlt size={14} />
                </div>
              </div>
            </div>

            {/* Limit Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center text-white text-sm font-medium">
                <BiSolidData className="mr-2 text-blue-400" size={18} />
                Ma'lumotlar soni
              </label>
              <div className="relative">
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="w-full bg-gray-800/80 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 border border-gray-700 appearance-none"
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <BiSolidData size={16} />
                </div>
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
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
                  + Yangi qo'shish
                </Link>
              </div>
            ) : (
              data?.getOrders?.docs.map((order) => (
                <div key={order._id} className="">
                  <OrderCard
                    order={order}
                    onEdit={() => {
                      setSelectedOrderId(order._id);
                      setIsOrderEditModalOpen(true);
                    }}
                  />
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
