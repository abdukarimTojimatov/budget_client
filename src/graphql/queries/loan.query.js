import { gql } from "@apollo/client";

export const GET_LOANS = gql`
  query GetLoans($page: Int, $limit: Int, $isPaidFull: Boolean) {
    getLoans(page: $page, limit: $limit, isPaidFull: $isPaidFull) {
      docs {
        _id
        nameOfLoan
        phoneNumberOfLoan
        totalLoan
        paidLoan
        leftLoan
        isPaidFull
        paymentMethodOnGivingLoan
        startDate
        dueDate
        paidLoans {
          _id
          paidAmount
          paymentDate
          paymentMethod
          notes
          attachments
        }
        attachments
        notes
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

export const GET_LOAN = gql`
  query GetLoan($id: ID!) {
    getLoan(id: $id) {
      _id
      nameOfLoan
      phoneNumberOfLoan
      totalLoan
      paidLoan
      leftLoan
      isPaidFull
      paymentMethodOnGivingLoan
      startDate
      dueDate
      paidLoans {
        _id
        paidAmount
        paymentDate
        paymentMethod
        notes
        attachments
      }
      attachments
      notes
      createdAt
      updatedAt
    }
  }
`;

// Eskirgan repayment-ga oid so'rovlar olib tashlandi

export const GET_LOAN_STATISTICS = gql`
  query GetLoanStatistics {
    getLoanStatistics {
      totalLoaned
      activeLoans
      paidLoans
    }
  }
`;
