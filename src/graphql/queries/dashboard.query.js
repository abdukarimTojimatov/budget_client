import { gql } from "@apollo/client";

export const GET_DASHBOARD_STATISTICS = gql`
  query GetDashboardStatistics($startDate: String, $endDate: String) {
    dashboardStatistics(startDate: $startDate, endDate: $endDate) {
      orders {
        orderCategory
        orderTotalAmount
      }
      expenses {
        category {
          _id
          name
        }
        categoryName
        totalAmount
      }
      sharings {
        category {
          _id
          name
        }
        categoryName
        totalAmount
      }
      rawMaterials {
        category {
          _id
          name
        }
        categoryName
        totalAmount
      }
      customersWithDebt {
        customerName
        phoneNumber
        totalDebt
        totalPaid
        totalAmount
      }
      suppliersWithDebt {
        customerId
        supplierName
        phoneNumber
        totalDebt
        totalPaid
        totalAmount
      }
      totalOrders
      totalExpenses
      totalSharings
      totalRawMaterials
      totalOrderExpenses
      totalExpensesAmount
      grossProfit
      netProfit
      totalClientDebt
      totalClientPaid
      totalRawMaterialDebt
      totalRawMaterialPaid
      startDate
      endDate
    }
  }
`;
