import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Card from "./Card";
import { GET_EXPENSES } from "../graphql/queries/expense.query";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import Pagination from "./Pagination";
import Filters from "./Filters";

const Cards = ({
  initialPage = 1,
  initialLimit = 10,
  initialCategoryId = "",
  initialStartDate = null,
  initialEndDate = null,
  onEdit,
}) => {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Update local state when props change
  useEffect(() => {
    setCategoryId(initialCategoryId);
    setPage(initialPage);
    setLimit(initialLimit);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [
    initialCategoryId,
    initialPage,
    initialLimit,
    initialStartDate,
    initialEndDate,
  ]);
  // Format dates properly for GraphQL if they exist
  const formattedStartDate = startDate || null;
  const formattedEndDate = endDate || null;

  const { data, loading } = useQuery(GET_EXPENSES, {
    variables: {
      page,
      limit,
      categoryId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    },
  });

  // Fetch categories from the database
  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GET_EXPENSE_CATEGORIES
  );

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategoryId(event.target.value);
    setPage(1);
  };

  const hasNoExpenses =
    !loading &&
    (!data?.getExpenses?.docs || data?.getExpenses?.docs.length === 0);

  return (
    <div className="w-full px-3 min-h-[40vh]">
      {hasNoExpenses ? (
        <div className="flex items-center justify-center min-h-[200px] bg-gray-800/50 rounded-xl p-8 shadow-lg">
          <p className="text-xl sm:text-xl font-bold text-white/80">
            Harajatlar mavjud emas
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
              {data?.getExpenses?.docs.map((expense) => (
                <Card expense={expense} key={expense._id} onEdit={onEdit} />
              ))}
            </div>
          )}

          {data?.getExpenses?.docs && data?.getExpenses?.docs.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data?.getExpenses?.totalPages || 1}
                hasPrevPage={data?.getExpenses?.hasPrevPage}
                hasNextPage={data?.getExpenses?.hasNextPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cards;
