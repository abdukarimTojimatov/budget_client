import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import DebtCard from "./DebtCard";
import { GET_DEBTS } from "../graphql/queries/debt.query";
import { GET_CATEGORIES } from "../graphql/queries/category.query";
import Pagination from "./Pagination";
import Filters from "./Filters";

const DebtCards = ({
  initialPage = 1,
  initialLimit = 10,
  initialStatus = "",
  initialStartDate = null,
  initialEndDate = null,
  onEdit,
  onPayment,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Update local state when props change
  useEffect(() => {
    setStatus(initialStatus);
    setPage(initialPage);
    setLimit(initialLimit);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [
    initialStatus,
    initialPage,
    initialLimit,
    initialStartDate,
    initialEndDate,
  ]);
  
  // Format dates properly for GraphQL if they exist
  const formattedStartDate = startDate || null;
  const formattedEndDate = endDate || null;

  const { data, loading } = useQuery(GET_DEBTS, {
    variables: {
      page,
      limit,
      status: status || undefined,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    },
    fetchPolicy: "network-only",
  });

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const hasNoDebts =
    !loading &&
    (!data?.getDebts?.docs || data?.getDebts?.docs.length === 0);

  return (
    <div className="w-full px-3 min-h-[40vh]">
      {hasNoDebts ? (
        <div className="flex items-center justify-center min-h-[200px] bg-gray-800/50 rounded-xl p-8 shadow-lg">
          <p className="text-xl sm:text-xl font-bold text-white/80">
            Qarzlar mavjud emas
          </p>
        </div>
      ) : (
        <div className="">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-64 bg-gray-800/30 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data?.getDebts?.docs.map((debt) => (
                <DebtCard 
                  debt={debt} 
                  key={debt._id} 
                  onEdit={onEdit} 
                  onPayment={onPayment} 
                />
              ))}
            </div>
          )}

          {data?.getDebts?.docs && data?.getDebts?.docs.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data?.getDebts?.totalPages || 1}
                hasPrevPage={data?.getDebts?.hasPrevPage}
                hasNextPage={data?.getDebts?.hasNextPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebtCards;
