import { gql } from "@apollo/client";

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      _id
      name
      phoneNumber
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      _id
      name
      phoneNumber
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      _id
    }
  }
`;
