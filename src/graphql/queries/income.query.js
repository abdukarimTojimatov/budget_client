import { gql } from "@apollo/client";

export const GET_INCOMES = gql`
  query GetIncomes(
    $page: Int, 
    $limit: Int, 
    $categoryId: ID, 
    $startDate: String, 
    $endDate: String,
    $recurring: Boolean
  ) {
    getIncomes(
      page: $page, 
      limit: $limit, 
      categoryId: $categoryId, 
      startDate: $startDate, 
      endDate: $endDate,
      recurring: $recurring
    ) {
      docs {
        _id
        description
        category {
          _id
          name
          icon
          color
        }
        amount
        date
        recurring
        recurringPeriod
        receiptMethod
        notes
        attachments
        createdAt
        updatedAt
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

export const GET_INCOME = gql`
  query GetIncome($id: ID!) {
    getIncome(id: $id) {
      _id
      description
      category {
        _id
        name
        icon
        color
      }
      amount
      date
      recurring
      recurringPeriod
      receiptMethod
      notes
      attachments
      createdAt
      updatedAt
    }
  }
`;

export const GET_INCOMES_STATISTICS = gql`
  query GetIncomesStatistics {
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

export const GET_RECURRING_INCOMES = gql`
  query GetRecurringIncomes {
    getRecurringIncomes {
      _id
      description
      category {
        _id
        name
        icon
        color
      }
      amount
      date
      recurring
      recurringPeriod
      receiptMethod
      notes
      createdAt
    }
  }
`;
