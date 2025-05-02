import { gql } from "@apollo/client";

export const CREATE_LOAN = gql`
  mutation CreateLoan($input: CreateLoanInput!) {
    createLoan(input: $input) {
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

export const UPDATE_LOAN = gql`
  mutation UpdateLoan($input: UpdateLoanInput!) {
    updateLoan(input: $input) {
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

export const DELETE_LOAN = gql`
  mutation DeleteLoan($id: ID!) {
    deleteLoan(id: $id)
  }
`;

export const ADD_LOAN_PAYMENT = gql`
  mutation AddLoanPayment($loanId: ID!, $paymentInput: LoanPaymentInput!) {
    addLoanPayment(loanId: $loanId, paymentInput: $paymentInput) {
      _id
      nameOfLoan
      paidLoan
      leftLoan
      isPaidFull
      paidLoans {
        _id
        paidAmount
        paymentDate
        paymentMethod
        notes
        attachments
      }
    }
  }
`;

export const UPDATE_LOAN_PAYMENT = gql`
  mutation UpdateLoanPayment($loanId: ID!, $paymentId: ID!, $paymentInput: LoanPaymentInput!) {
    updateLoanPayment(loanId: $loanId, paymentId: $paymentId, paymentInput: $paymentInput) {
      _id
      nameOfLoan
      paidLoan
      leftLoan
      isPaidFull
      paidLoans {
        _id
        paidAmount
        paymentDate
        paymentMethod
        notes
        attachments
      }
    }
  }
`;

export const DELETE_LOAN_PAYMENT = gql`
  mutation DeleteLoanPayment($loanId: ID!, $paymentId: ID!) {
    deleteLoanPayment(loanId: $loanId, paymentId: $paymentId) {
      _id
      nameOfLoan
      paidLoan
      leftLoan
      isPaidFull
      paidLoans {
        _id
        paidAmount
        paymentDate
        paymentMethod
        notes
        attachments
      }
    }
  }
`;
