import { gql } from "@apollo/client";

export const GET_EXPENSES = gql`
  query GetExpenses($page: Int, $limit: Int, $categoryId: ID) {
    getExpenses(page: $page, limit: $limit, categoryId: $categoryId) {
      docs {
        _id
        description
        paymentType
        category {
          _id
          name
        }
        amount
        date
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
export const GET_EXPENSE = gql`
  query GetExpense($id: ID!) {
    getExpense(id: $id) {
      _id
      description
      paymentType
      category {
        _id
        name
      }
      categoryName
      amount
      date
    }
  }
`;

export const GET_EXPENSES_STATISTICS = gql`
  query GetExpensesStatistics {
    categoryStatisticsExpense {
      category {
        _id
        name
      }
      categoryName
      totalAmount
    }
  }
`;
