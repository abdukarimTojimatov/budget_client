import { gql } from "@apollo/client";

export const GET_SHARINGS = gql`
  query GetSharings($page: Int, $limit: Int, $category: String, $startDate: String, $endDate: String) {
    getSharings(page: $page, limit: $limit, category: $category, startDate: $startDate, endDate: $endDate) {
      docs {
        _id
        sharingDescription
        sharingPaymentType
        sharingCategoryType
        sharingAmount
        sharingDate
        userId {
          _id
          username
        }
      }
      totalDocs
      limit
      totalPages
      page
      hasPrevPage
      hasNextPage
    }
  }
`;

export const GET_SHARING = gql`
  query GetSharing($id: ID!) {
    getSharing(id: $id) {
      _id
      sharingDescription
      sharingPaymentType
      sharingCategoryType
      sharingAmount
      sharingDate
    }
  }
`;

export const GET_SHARINGS_STATISTICS = gql`
  query CategoryStatisticsSharing {
    categoryStatisticsSharing {
      category
      totalAmount
    }
  }
`;
