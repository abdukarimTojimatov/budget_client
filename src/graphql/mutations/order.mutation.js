import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      _id
      userId
      orderAutoNumber
      orderName
      orderCustomerName
      orderCustomerPhoneNumber
      orderDescription
      orderCategory
      orderType
      orderStatus
      orderPaymentStatus
      orderTotalAmount
      orderExpensesAmount
      orderTotalPaid
      orderTotalDebt
      orderExpensesDescription
      orderLocation
      orderReadyDate
      orderPayments {
        paymentType
        amount
        date
      }
      date
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      _id
      userId
      orderAutoNumber
      orderName
      orderCustomerName
      orderCustomerPhoneNumber
      orderDescription
      orderCategory
      orderStatus
      orderType
      orderPaymentStatus
      orderTotalAmount
      orderExpensesAmount
      orderTotalPaid
      orderReadyDate
      orderTotalDebt
      orderExpensesDescription
      orderLocation
      orderPayments {
        paymentType
        amount
        date
      }
      date
    }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id) {
      _id
    }
  }
`;

export const UPLOAD_ORDER_IMAGE = gql`
  mutation UploadOrderImage($orderId: ID!, $file: Upload!) {
    uploadOrderImage(orderId: $orderId, file: $file) {
      _id
      images
    }
  }
`;
