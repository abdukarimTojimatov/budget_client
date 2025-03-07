import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import SharingCard from "./SharingCard";
import { GET_SHARINGS } from "../graphql/queries/sharing.query";
import sharingCategories from "../constants/sharingCategories";
import Pagination from "./Pagination";
import Filters from "./Filters";

const SharingCards = ({
  initialPage = 1,
  initialLimit = 10,
  initialCategory = "",
  initialStartDate = null,
  initialEndDate = null,
}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [category, setCategory] = useState(initialCategory);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Update local state when props change
  useEffect(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setCategory(initialCategory);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [
    initialPage,
    initialLimit,
    initialCategory,
    initialStartDate,
    initialEndDate,
  ]);
  // Format dates properly for GraphQL if they exist
  const formattedStartDate = startDate || null;
  const formattedEndDate = endDate || null;

  const { data, loading } = useQuery(GET_SHARINGS, {
    variables: {
      page,
      limit,
      category,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
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

  const hasNoSharings =
    !loading &&
    (!data?.getSharings?.docs || data?.getSharings?.docs.length === 0);

  return (
    <div className="w-full px-3 min-h-[40vh]">
      {hasNoSharings ? (
        <div className="flex items-center justify-center min-h-[200px] bg-gray-800/50 rounded-xlshadow-lg">
          <p className="text-xl font-bold text-white/80">
            Taqsimotlar mavjud emas
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
              {data?.getSharings?.docs.map((sharing) => (
                <SharingCard sharing={sharing} key={sharing._id} />
              ))}
            </div>
          )}

          {data?.getSharings?.docs && data?.getSharings?.docs.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data?.getSharings?.totalPages || 1}
                hasPrevPage={data?.getSharings?.hasPrevPage}
                hasNextPage={data?.getSharings?.hasNextPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SharingCards;
