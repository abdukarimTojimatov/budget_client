import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_RAW_MATERIALS } from "../graphql/queries/rawMaterial.query";
import RawMaterialCard from "../components/RawMaterialCard"; // Import the card component
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";

const RawMaterialsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { loading, error, data } = useQuery(GET_RAW_MATERIALS, {
    variables: { page, limit },
  });
  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching raw materials.</div>;

  return (
    <div>
      <Link
        to="/rawMaterial/create"
        className="bg-blue-800/40 text-white font-semibold py-2 px-4 ml-4 rounded shadow hover:bg-blue-600 transition duration-300 mb-4"
      >
        Homashyolar yaratish
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {data?.getRawMaterials?.docs.map((rawMaterial) => (
          <RawMaterialCard key={rawMaterial._id} rawMaterial={rawMaterial} />
        ))}
      </div>
      {data?.getRawMaterials?.docs &&
        data?.getRawMaterials?.docs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={data?.getRawMaterials?.totalPages || 1}
              hasPrevPage={data?.getRawMaterials?.hasPrevPage}
              hasNextPage={data?.getRawMaterials?.hasNextPage}
              onPageChange={setPage}
            />
          </div>
        )}
    </div>
  );
};

export default RawMaterialsPage;
