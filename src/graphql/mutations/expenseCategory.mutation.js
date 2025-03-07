import { gql } from "@apollo/client";

export const CREATE_EXPENSE_CATEGORY = gql`
  mutation CreateExpenseCategory($input: CreateExpenseCategoryInput!) {
    createExpenseCategory(input: $input) {
      _id
      name
    }
  }
`;

export const UPDATE_EXPENSE_CATEGORY = gql`
  mutation UpdateExpenseCategory($input: UpdateExpenseCategoryInput!) {
    updateExpenseCategory(input: $input) {
      _id
      name
    }
  }
`;

export const DELETE_EXPENSE_CATEGORY = gql`
  mutation DeleteExpenseCategory($id: ID!) {
    deleteExpenseCategory(id: $id) {
      _id
      name
    }
  }
`;
