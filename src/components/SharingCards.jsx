import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import SharingCard from "./SharingCard";
import { GET_SHARINGS } from "../graphql/queries/sharing.query";
import sharingCategories from "../constants/sharingCategories";
import Pagination from "./Pagination";
import Filters from "./Filters";

const SharingCards = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState("");
  const { data, loading } = useQuery(GET_SHARINGS, {
    variables: { page, limit, category },
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
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Barcha taqsimotlar
            </h2> */}
            <div className="w-full sm:w-auto bg-gray-800/50 rounded-lg p-3">
              <Filters
                categories={sharingCategories}
                category={category}
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
