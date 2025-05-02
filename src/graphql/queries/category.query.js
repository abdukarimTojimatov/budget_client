import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetCategories($type: String) {
    getCategories(type: $type) {
      docs {
        _id
        name
        type
        icon
        color
        description
        isDefault
        budget
        isActive
        createdAt
        updatedAt
      }
      totalDocs
      limit
      totalPages
      page
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      _id
      name
      type
      icon
      color
      description
      isDefault
      budget
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_EXPENSE_CATEGORIES = gql`
  query GetExpenseCategories {
    getExpenseCategories {
      docs {
        _id
        name
        icon
        color
        description
        isDefault
        budget
        isActive
      }
      totalDocs
      limit
      totalPages
      page
    }
  }
`;

export const GET_INCOME_CATEGORIES = gql`
  query GetIncomeCategories {
    getIncomeCategories {
      docs {
        _id
        name
        icon
        color
        description
        isDefault
        budget
        isActive
      }
      totalDocs
      limit
      totalPages
      page
    }
  }
`;
