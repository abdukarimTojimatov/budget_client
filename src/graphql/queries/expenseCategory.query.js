import { gql } from "@apollo/client";

export const GET_EXPENSE_CATEGORIES = gql`
  query GetExpenseCategories {
    getExpenseCategories {
      docs {
        _id
        name
      }
      totalDocs
    }
  }
`;

export const GET_EXPENSE_CATEGORY = gql`
  query GetExpenseCategory($id: ID!) {
    getExpenseCategory(id: $id) {
      _id
      name
    }
  }
`;
