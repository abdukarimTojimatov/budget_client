import { gql } from "@apollo/client";

export const GET_ORDERS = gql`
  query GetOrders(
    $page: Int
    $limit: Int
    $orderCategory: String
    $orderStatus: String
    $orderType: String
    $orderPaymentStatus: String
  ) {
    getOrders(
      page: $page
      limit: $limit
      orderCategory: $orderCategory
      orderStatus: $orderStatus
      orderType: $orderType
      orderPaymentStatus: $orderPaymentStatus
    ) {
      docs {
        _id
        userId
        orderAutoNumber
        orderName
        orderCustomerName
        orderCustomerPhoneNumber
        orderDescription
        orderCategory
        orderType
        orderPaymentStatus
        orderTotalAmount
        orderExpensesAmount
        orderTotalPaid
        orderTotalDebt
        orderStatus
        orderExpensesDescription
        orderLocation
        orderReadyDate
        date
        orderPayments {
          paymentType
          amount
          date
        }
        images
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

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      _id
      userId
      orderAutoNumber
      orderName
      orderCustomerName
      orderCustomerPhoneNumber
      orderDescription
      orderCategory
      orderType
      orderReadyDate
      orderPaymentStatus
      orderTotalAmount
      orderExpensesAmount
      orderTotalPaid
      orderStatus
      orderTotalDebt
      orderExpensesDescription
      orderLocation
      orderPayments {
        paymentType
        amount
        date
      }
      images
      date
    }
  }
`;

export const GET_ORDER_STATISTICS = gql`
  query GetOrderStatistics {
    orderStatistics {
      orderCategory
      orderTotalAmount
    }
  }
`;
