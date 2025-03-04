import { gql } from "@apollo/client";

export const GET_RAW_MATERIALS = gql`
  query GetRawMaterials($page: Int, $limit: Int) {
    getRawMaterials(page: $page, limit: $limit) {
      docs {
        _id
        customerName
        phoneNumber
        rawMaterialName
        rawMaterialDescription
        rawMaterialQuantity
        unitOfMeasurement
        rawMaterialPrice
        rawMaterialTotalPrice
        rawMaterialCategory
        totalPaid
        totalDebt
        date
        paymentStatus
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

export const GET_RAW_MATERIAL = gql`
  query GetRawMaterial($id: ID!) {
    getRawMaterial(id: $id) {
      _id
      customerName
      phoneNumber
      rawMaterialName
      rawMaterialDescription
      rawMaterialQuantity
      unitOfMeasurement
      rawMaterialPrice
      rawMaterialTotalPrice
      rawMaterialCategory
      totalPaid
      totalDebt
      date
      payments {
        paymentType
        amount
        date
      }
      paymentStatus
    }
  }
`;

export const GET_RAW_MATERIAL_STATISTICS = gql`
  query GetRawMaterialStatistics {
    rawMaterialStatistics {
      category
      totalAmount
    }
  }
`;
