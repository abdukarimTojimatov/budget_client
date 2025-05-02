import { gql } from "@apollo/client";

export const GET_DEBTS = gql`
  query GetDebts($page: Int, $limit: Int) {
    getDebts(page: $page, limit: $limit) {
      docs {
        _id
        nameOfDebt
        phoneNumberOfDebt
        totalDebt
        paymentMethodOnTakingDebt
        paidDebt
        leftDebt
        isPaidFull
        startDate
        dueDate
        notes
        attachments
        createdAt
        updatedAt
        paidDebts {
          _id
          paidAmount
          paymentDate
          paymentMethod
          notes
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

export const GET_DEBT = gql`
  query GetDebt($id: ID!) {
    getDebt(id: $id) {
      _id
      nameOfDebt
      phoneNumberOfDebt
      totalDebt
      paymentMethodOnTakingDebt
      paidDebt
      leftDebt
      isPaidFull
      startDate
      dueDate
      notes
      attachments
      createdAt
      updatedAt
      paidDebts {
        _id
        paidAmount
        paymentDate
        paymentMethod
        notes
      }
    }
  }
`;

// Debt payments are now embedded in the Debt document, so these queries are no longer needed
// The paidDebts field in the GET_DEBT and GET_DEBTS queries provides this data

export const GET_UPCOMING_DEBT_PAYMENTS = gql`
  query GetUpcomingDebtPayments($days: Int) {
    getUpcomingDebtPayments(days: $days) {
      _id
      nameOfDebt
      phoneNumberOfDebt
      leftDebt
      dueDate
      totalDebt
    }
  }
`;

export const GET_DEBT_STATISTICS = gql`
  query GetDebtStatistics {
    getDebtStatistics {
      totalDebt
      paidDebt
      leftDebt
      isPaidFull
    }
  }
`;
