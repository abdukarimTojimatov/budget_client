import { gql } from "@apollo/client";

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
      position
      phoneNumber
      dailyRate
      overtimeRate
      isActive
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      name
      position
      phoneNumber
      dailyRate
      overtimeRate
      isActive
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

export const CREATE_SALARY_PAYMENT = gql`
  mutation CreateSalaryPayment($input: SalaryPaymentInput!) {
    createSalaryPayment(input: $input) {
      id
      paymentDate
      workDate
      regularHours
      overtimeHours
      regularAmount
      overtimeAmount
      totalAmount
      isAdvance
      note
      employee {
        id
        name
      }
    }
  }
`;

export const UPDATE_SALARY_PAYMENT = gql`
  mutation UpdateSalaryPayment($id: ID!, $input: SalaryPaymentInput!) {
    updateSalaryPayment(id: $id, input: $input) {
      id
      paymentDate
      workDate
      regularHours
      overtimeHours
      regularAmount
      overtimeAmount
      totalAmount
      isAdvance
      note
      employee {
        id
        name
      }
    }
  }
`;

export const DELETE_SALARY_PAYMENT = gql`
  mutation DeleteSalaryPayment($id: ID!) {
    deleteSalaryPayment(id: $id)
  }
`;

export const CREATE_ATTENDANCE = gql`
  mutation CreateAttendance($input: AttendanceInput!) {
    createAttendance(input: $input) {
      id
      date
      status
      workHours
      overtimeHours
      note
      employee {
        id
        name
        position
      }
    }
  }
`;

export const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($id: ID!, $input: AttendanceInput!) {
    updateAttendance(id: $id, input: $input) {
      id
      date
      status
      workHours
      overtimeHours
      note
      employee {
        id
        name
        position
      }
    }
  }
`;

export const DELETE_ATTENDANCE = gql`
  mutation DeleteAttendance($id: ID!) {
    deleteAttendance(id: $id)
  }
`;

export const BULK_CREATE_ATTENDANCE = gql`
  mutation BulkCreateAttendance($inputs: [AttendanceInput!]!) {
    bulkCreateAttendance(inputs: $inputs) {
      id
      date
      status
      workHours
      overtimeHours
      note
      employee {
        id
        name
        position
      }
    }
  }
`;
