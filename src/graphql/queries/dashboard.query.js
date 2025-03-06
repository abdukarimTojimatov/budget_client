import { gql } from "@apollo/client";

export const GET_DASHBOARD_STATISTICS = gql`
  query GetDashboardStatistics($startDate: String, $endDate: String) {
    dashboardStatistics(startDate: $startDate, endDate: $endDate) {
      orders {
        orderCategory
        orderTotalAmount
      }
      expenses {
        category
        totalAmount
      }
      sharings {
        category
        totalAmount
      }
      rawMaterials {
        category
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
