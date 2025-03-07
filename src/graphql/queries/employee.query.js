import { gql } from "@apollo/client";

export const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      name
      position
      phoneNumber
      dailyRate
      overtimeRate
      isActive
      createdAt
    }
  }
`;

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      name
      position
      phoneNumber
      dailyRate
      overtimeRate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SALARY_PAYMENTS = gql`
  query GetSalaryPayments($startDate: String, $endDate: String) {
    salaryPayments(startDate: $startDate, endDate: $endDate) {
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
        position
      }
      createdAt
    }
  }
`;

export const GET_EMPLOYEE_SALARY_PAYMENTS = gql`
  query GetEmployeeSalaryPayments(
    $employeeId: ID!
    $startDate: String
    $endDate: String
  ) {
    employeeSalaryPayments(
      employeeId: $employeeId
      startDate: $startDate
      endDate: $endDate
    ) {
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
      createdAt
    }
  }
`;

export const GET_EMPLOYEE_SALARY_STATS = gql`
  query GetEmployeeSalaryStats($startDate: String, $endDate: String) {
    employeeSalaryStats(startDate: $startDate, endDate: $endDate) {
      employee {
        id
        name
        position
        dailyRate
      }
      totalPaid
      totalAdvance
      totalRegularHours
      totalOvertimeHours
      paymentCount
    }
  }
`;

export const GET_MONTHLY_SALARY_STATS = gql`
  query GetMonthlySalaryStats($year: Int) {
    monthlySalaryStats(year: $year) {
      month
      year
      totalAmount
    }
  }
`;

export const GET_ATTENDANCES = gql`
  query GetAttendances($date: String, $startDate: String, $endDate: String) {
    attendances(date: $date, startDate: $startDate, endDate: $endDate) {
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
      createdAt
    }
  }
`;

export const GET_EMPLOYEE_ATTENDANCES = gql`
  query GetEmployeeAttendances(
    $employeeId: ID!
    $startDate: String
    $endDate: String
  ) {
    employeeAttendances(
      employeeId: $employeeId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      date
      status
      workHours
      overtimeHours
      note
      createdAt
    }
  }
`;
