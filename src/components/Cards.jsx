import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import Card from "./Card";
import { GET_EXPENSES } from "../graphql/queries/expense.query";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import Pagination from "./Pagination";
import Filters from "./Filters";

const Cards = () => {
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, loading } = useQuery(GET_EXPENSES, {
    variables: { page, limit, categoryId },
  });
  
  // Fetch categories from the database
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_EXPENSE_CATEGORIES);

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
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Barcha harajatlar
            </h2> */}
            <div className="w-full sm:w-auto bg-gray-800/50 rounded-lg p-3">
              <Filters
                categories={categoriesData?.getExpenseCategories?.docs || []}
                categoryId={categoryId}
                loading={categoriesLoading}
                onCategoryChange={handleCategoryChange}
                limit={limit}
                onLimitChange={handleLimitChange}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-64 bg-gray-800/30 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              {data?.getExpenses?.docs.map((expense) => (
                <Card expense={expense} key={expense._id} />
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
