import { gql } from "@apollo/client";

export const CREATE_INCOME = gql`
  mutation CreateIncome($input: CreateIncomeInput!) {
    createIncome(input: $input) {
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

export const UPDATE_INCOME = gql`
  mutation UpdateIncome($input: UpdateIncomeInput!) {
    updateIncome(input: $input) {
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

export const DELETE_INCOME = gql`
  mutation DeleteIncome($id: ID!) {
    deleteIncome(id: $id)
  }
`;
