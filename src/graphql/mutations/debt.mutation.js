import { gql } from "@apollo/client";

export const CREATE_DEBT = gql`
  mutation CreateDebt($input: CreateDebtInput!) {
    createDebt(input: $input) {
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
      attachments
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DEBT = gql`
  mutation UpdateDebt($input: UpdateDebtInput!) {
    updateDebt(input: $input) {
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
      attachments
      notes
      createdAt
      updatedAt
      paidDebts {
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

export const ADD_DEBT_PAYMENT = gql`
  mutation AddDebtPayment($input: AddDebtPaymentInput!) {
    addDebtPayment(input: $input) {
      _id
      nameOfDebt
      phoneNumberOfDebt
      totalDebt
      paidDebt
      leftDebt
      isPaidFull
      paidDebts {
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

export const UPDATE_DEBT_PAYMENT = gql`
  mutation UpdateDebtPayment($input: UpdateDebtPaymentInput!) {
    updateDebtPayment(input: $input) {
      _id
      nameOfDebt
      paidDebt
      leftDebt
      isPaidFull
      paidDebts {
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

export const DELETE_DEBT_PAYMENT = gql`
  mutation DeleteDebtPayment($debtId: ID!, $paymentIndex: Int!) {
    deleteDebtPayment(debtId: $debtId, paymentIndex: $paymentIndex) {
      _id
      nameOfDebt
      paidDebt
      leftDebt
      isPaidFull
      paidDebts {
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

export const DELETE_DEBT = gql`
  mutation DeleteDebt($id: ID!) {
    deleteDebt(id: $id)
  }
`;

// This is deprecated and should be replaced with ADD_DEBT_PAYMENT
// Left here for backward compatibility until all references are updated
export const CREATE_PAID_DEBT = gql`
  mutation CreatePaidDebt($input: CreatePaidDebtInput!) {
    createPaidDebt(input: $input) {
      _id
      debtId {
        _id
        nameOfDebt
        leftDebt
      }
      paidAmount
      paymentDate
      paymentMethod
      notes
      attachments
      createdAt
      updatedAt
    }
  }
`;

// This is deprecated and should be replaced with UPDATE_DEBT_PAYMENT
// Left here for backward compatibility until all references are updated
export const UPDATE_PAID_DEBT = gql`
  mutation UpdatePaidDebt($input: UpdatePaidDebtInput!) {
    updatePaidDebt(input: $input) {
      _id
      paidAmount
      paymentDate
      paymentMethod
      notes
      attachments
      createdAt
      updatedAt
    }
  }
`;
