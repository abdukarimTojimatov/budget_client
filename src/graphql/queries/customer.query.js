import { gql } from "@apollo/client";

export const GET_CUSTOMERS = gql`
  query GetCustomers($page: Int, $limit: Int, $search: String) {
    getCustomers(page: $page, limit: $limit, search: $search) {
      docs {
        _id
        name
        phoneNumber
        createdAt
        updatedAt
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

export const GET_CUSTOMER = gql`
  query GetCustomer($id: ID!) {
    getCustomer(id: $id) {
      _id
      name
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

export const GET_CUSTOMERS_DROPDOWN = gql`
  query GetCustomersDropdown {
    getCustomersDropdown {
      _id
      name
      phoneNumber
    }
  }
`;
