import { gql } from "@apollo/client";

export const GET_EXPENSES_STATS = gql`
  query CategoryStatisticsExpense {
    categoryStatisticsExpense {
      category {
        _id
        name
        icon
        color
      }
      totalAmount
    }
  }
`;

export const GET_INCOMES_STATS = gql`
  query CategoryStatisticsIncome {
    categoryStatisticsIncome {
      category {
        _id
        name
        icon
        color
      }
      totalAmount
    }
  }
`;

export const GET_EXPENSE_TOTAL = gql`
  query GetExpenses($page: Int, $limit: Int) {
    getExpenses(page: $page, limit: $limit) {
      totalDocs
    }
  }
`;

export const GET_INCOME_TOTAL = gql`
  query GetIncomes($page: Int, $limit: Int) {
    getIncomes(page: $page, limit: $limit) {
      totalDocs
    }
  }
`;
