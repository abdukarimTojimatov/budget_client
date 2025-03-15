import { gql } from "@apollo/client";

export const CREATE_RAW_MATERIAL = gql`
  mutation CreateRawMaterial($input: CreateRawMaterialInput!) {
    createRawMaterial(input: $input) {
      _id
      customer {
        _id
        name
        phoneNumber
      }
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
  }
`;

export const UPDATE_RAW_MATERIAL = gql`
  mutation UpdateRawMaterial($input: UpdateRawMaterialInput!) {
    updateRawMaterial(input: $input) {
      _id
      customer {
        _id
        name
        phoneNumber
      }
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
  }
`;

export const DELETE_RAW_MATERIAL = gql`
  mutation DeleteRawMaterial($id: ID!) {
    deleteRawMaterial(id: $id) {
      _id
    }
  }
`;
