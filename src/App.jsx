import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ExpensePage from "./pages/ExpensePage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import DebtsPage from "./pages/DebtsPage";
import LoansPage from "./pages/LoansPage";
import NotFoundPage from "./pages/NotFoundPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrdersPage from "./pages/OrdersPage";
import OrderEditPage from "./pages/OrderEditPage";
import EditRawMaterialPage from "./pages/EditRawMaterialPage";
import CreateRawMaterialPage from "./pages/CreateRawMaterialPage";
import RawMaterialsPage from "./pages/RawMaterialPage";
import Header from "./components/ui/Header";
import Navbar from "./components/Navbar";
import { useQuery } from "@apollo/client";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.query";
import { Toaster } from "react-hot-toast";
import SharingPage from "./pages/SharingPage";
import SharingEditPage from "./pages/SharingEditPage";
import DashboardPage from "./pages/DashboardPage";
// Yangi dashboard komponentlarini import qilish
import FinancialDashboard from "./pages/FinancialDashboard";
import DebtAnalysisDashboard from "./pages/DebtAnalysisDashboard";
import LoanAnalysisDashboard from "./pages/LoanAnalysisDashboard";
import IncomeAnalysisDashboard from "./pages/IncomeAnalysisDashboard";
import ExpenseAnalysisDashboard from "./pages/ExpenseAnalysisDashboard";

function App() {
  const { loading, data } = useQuery(GET_AUTHENTICATED_USER);
  if (loading) return null;
  return (
    <>
      {data?.authUser && (
        <>
          <Header />
          <Navbar />
        </>
      )}
      <Routes>
        {/* <Route
          path="/"
          element={
            data?.authUser ? <DashboardPage /> : <Navigate to="/login" />
          }
        /> */}
        <Route
          path="/dashboard"
          element={
            data?.authUser ? <FinancialDashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/debt-analysis"
          element={
            data?.authUser ? (
              <DebtAnalysisDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/loan-analysis"
          element={
            data?.authUser ? (
              <LoanAnalysisDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/income-analysis"
          element={
            data?.authUser ? (
              <IncomeAnalysisDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/expense-analysis"
          element={
            data?.authUser ? (
              <ExpenseAnalysisDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={!data?.authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!data?.authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/expenses/:id"
          element={data?.authUser ? <ExpensePage /> : <Navigate to="/login" />}
        />
        {/* <Route
          path="/sharings"
          element={data?.authUser ? <SharingPage /> : <Navigate to="/login" />}
        /> */}
        {/* <Route
          path="/sharings/:id"
          element={
            data?.authUser ? <SharingEditPage /> : <Navigate to="/login" />
          }
        /> */}
        {/* <Route
          path="/orders"
          element={data?.authUser ? <OrdersPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/orders/create"
          element={
            data?.authUser ? <CreateOrderPage /> : <Navigate to="/login" />
          }
        /> */}
        {/* <Route
          path="/orders/:id"
          element={
            data?.authUser ? <OrderEditPage /> : <Navigate to="/login" />
          }
        /> */}
        {/* <Route
          path="/rawMaterial/:id"
          element={
            data?.authUser ? <EditRawMaterialPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/rawMaterial"
          element={
            data?.authUser ? <RawMaterialsPage /> : <Navigate to="/login" />
          }
        /> */}
        <Route
          path="/expenses"
          element={data?.authUser ? <ExpensesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/incomes"
          element={data?.authUser ? <IncomesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/debts"
          element={data?.authUser ? <DebtsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/loans"
          element={data?.authUser ? <LoansPage /> : <Navigate to="/login" />}
        />
        {/* <Route
          path="/employees"
          element={
            data?.authUser ? <EmployeesPage /> : <Navigate to="/login" />
          }
        /> */}
        {/* <Route
          path="/rawMaterial/create"
          element={
            data?.authUser ? (
              <CreateRawMaterialPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
