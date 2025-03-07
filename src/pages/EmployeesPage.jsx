import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_EMPLOYEES,
  GET_ATTENDANCES,
  GET_SALARY_PAYMENTS,
} from "../graphql/queries/employee.query";
import {
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  CREATE_ATTENDANCE,
  UPDATE_ATTENDANCE,
  DELETE_ATTENDANCE,
  CREATE_SALARY_PAYMENT,
  UPDATE_SALARY_PAYMENT,
  DELETE_SALARY_PAYMENT,
} from "../graphql/mutations/employee.mutation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EmployeesPage = () => {
  // Convert date to YYYY-MM-DD format for API
  const formatDateForAPI = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "-";
      }
      return new Intl.DateTimeFormat("uz-UZ").format(date);
    } catch (error) {
      console.error(`Error formatting date: ${error}`);
      return "-";
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phoneNumber: "",
    dailyRate: 0,
    overtimeRate: 0,
    isActive: true,
  });
  const [activeTab, setActiveTab] = useState("employees");

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAttendanceDeleteModalOpen, setIsAttendanceDeleteModalOpen] =
    useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    employeeId: "",
    date: new Date(),
    status: "present",
    workHours: 8,
    overtimeHours: 0,
    note: "",
  });

  // Payment state
  const [paymentStartDate, setPaymentStartDate] = useState(new Date());
  const [paymentEndDate, setPaymentEndDate] = useState(new Date());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentDeleteModalOpen, setIsPaymentDeleteModalOpen] =
    useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    employeeId: "",
    paymentDate: new Date(),
    workDate: new Date(),
    regularHours: 8,
    overtimeHours: 0,
    regularAmount: 0,
    overtimeAmount: 0,
    totalAmount: 0,
    isAdvance: false,
    note: "",
  });

  // Queries
  const {
    data: employeeData,
    loading: employeeLoading,
    error: employeeError,
    refetch: refetchEmployees,
  } = useQuery(GET_EMPLOYEES);

  const {
    data: attendanceData,
    loading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendances,
  } = useQuery(GET_ATTENDANCES, {
    variables: {
      date: formatDateForAPI(attendanceDate),
    },
  });

  const {
    data: paymentData,
    loading: paymentLoading,
    error: paymentError,
    refetch: refetchPayments,
  } = useQuery(GET_SALARY_PAYMENTS, {
    variables: {
      startDate: formatDateForAPI(paymentStartDate),
      endDate: formatDateForAPI(paymentEndDate),
    },
  });

  // Mutations for attendance
  const [createAttendance] = useMutation(CREATE_ATTENDANCE, {
    onCompleted: () => {
      closeAttendanceModal();
      refetchAttendances();
      refetchEmployees();
    },
  });

  const [updateAttendance] = useMutation(UPDATE_ATTENDANCE, {
    onCompleted: () => {
      closeAttendanceModal();
      refetchAttendances();
      refetchEmployees();
    },
  });

  const [deleteAttendance] = useMutation(DELETE_ATTENDANCE, {
    onCompleted: () => {
      closeAttendanceDeleteModal();
      refetchAttendances();
      refetchEmployees();
    },
  });

  // Mutations for salary payments
  const [createSalaryPayment] = useMutation(CREATE_SALARY_PAYMENT, {
    onCompleted: () => {
      closePaymentModal();
      refetchPayments();
      refetchEmployees();
    },
  });

  const [updateSalaryPayment] = useMutation(UPDATE_SALARY_PAYMENT, {
    onCompleted: () => {
      closePaymentModal();
      refetchPayments();
      refetchEmployees();
    },
  });

  const [deleteSalaryPayment] = useMutation(DELETE_SALARY_PAYMENT, {
    onCompleted: () => {
      closePaymentDeleteModal();
      refetchPayments();
      refetchEmployees();
    },
  });

  // Mutations
  const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
    onCompleted: () => {
      closeModal();
      refetchEmployees();
    },
  });

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      closeModal();
      refetchEmployees();
    },
  });

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      closeDeleteModal();
      refetchEmployees();
    },
  });

  // Attendance form handlers
  const handleAttendanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAttendanceFormData({
      ...attendanceFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAttendanceNumberChange = (e) => {
    const { name, value } = e.target;
    setAttendanceFormData({
      ...attendanceFormData,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleAttendanceDateChange = (date) => {
    setAttendanceFormData({
      ...attendanceFormData,
      date: date,
    });
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...attendanceFormData,
      date: formatDateForAPI(attendanceFormData.date),
    };

    if (currentAttendance) {
      // Update existing attendance
      updateAttendance({
        variables: {
          id: currentAttendance.id,
          input: submitData,
        },
      });
    } else {
      // Create new attendance
      createAttendance({
        variables: {
          input: submitData,
        },
      });
    }
  };

  // Attendance modal handlers
  const openAttendanceCreateModal = () => {
    setCurrentAttendance(null);
    setAttendanceFormData({
      employeeId: "",
      date: attendanceDate,
      status: "present",
      workHours: 8,
      overtimeHours: 0,
      note: "",
    });
    setIsAttendanceModalOpen(true);
  };

  const openAttendanceEditModal = (attendance) => {
    setCurrentAttendance(attendance);
    setAttendanceFormData({
      employeeId: attendance.employee.id,
      date: new Date(attendance.date),
      status: attendance.status,
      workHours: attendance.workHours || 0,
      overtimeHours: attendance.overtimeHours || 0,
      note: attendance.note || "",
    });
    setIsAttendanceModalOpen(true);
  };

  const openAttendanceDeleteModal = (attendance) => {
    setCurrentAttendance(attendance);
    setIsAttendanceDeleteModalOpen(true);
  };

  const closeAttendanceModal = () => {
    setIsAttendanceModalOpen(false);
    setCurrentAttendance(null);
  };

  const closeAttendanceDeleteModal = () => {
    setIsAttendanceDeleteModalOpen(false);
    setCurrentAttendance(null);
  };

  // Payment form handlers
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newFormData = {
      ...paymentFormData,
      [name]: type === "checkbox" ? checked : value,
    };

    // Recalculate total amount if necessary
    if (["regularAmount", "overtimeAmount"].includes(name)) {
      newFormData.totalAmount =
        (parseFloat(newFormData.regularAmount) || 0) +
        (parseFloat(newFormData.overtimeAmount) || 0);
    }

    setPaymentFormData(newFormData);
  };

  const handlePaymentNumberChange = (e) => {
    const { name, value } = e.target;

    const newFormData = {
      ...paymentFormData,
      [name]: parseFloat(value) || 0,
    };

    // Recalculate total amount if necessary
    if (["regularAmount", "overtimeAmount"].includes(name)) {
      newFormData.totalAmount =
        (parseFloat(newFormData.regularAmount) || 0) +
        (parseFloat(newFormData.overtimeAmount) || 0);
    }

    setPaymentFormData(newFormData);
  };

  const handlePaymentDateChange = (date) => {
    setPaymentFormData({
      ...paymentFormData,
      paymentDate: date,
    });
  };

  const handleWorkDateChange = (date) => {
    setPaymentFormData({
      ...paymentFormData,
      workDate: date,
    });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...paymentFormData,
      paymentDate: formatDateForAPI(paymentFormData.paymentDate),
      workDate: formatDateForAPI(paymentFormData.workDate),
    };

    if (currentPayment) {
      // Update existing payment
      updateSalaryPayment({
        variables: {
          id: currentPayment.id,
          input: submitData,
        },
      });
    } else {
      // Create new payment
      createSalaryPayment({
        variables: {
          input: submitData,
        },
      });
    }
  };

  // Payment modal handlers
  const openPaymentCreateModal = () => {
    setCurrentPayment(null);
    setPaymentFormData({
      employeeId: "",
      paymentDate: new Date(),
      workDate: new Date(),
      regularHours: 8,
      overtimeHours: 0,
      regularAmount: 0,
      overtimeAmount: 0,
      totalAmount: 0,
      isAdvance: false,
      note: "",
    });
    setIsPaymentModalOpen(true);
  };

  const openPaymentEditModal = (payment) => {
    setCurrentPayment(payment);
    setPaymentFormData({
      employeeId: payment.employee.id,
      paymentDate: new Date(payment.paymentDate),
      workDate: new Date(payment.workDate),
      regularHours: payment.regularHours || 0,
      overtimeHours: payment.overtimeHours || 0,
      regularAmount: payment.regularAmount,
      overtimeAmount: payment.overtimeAmount || 0,
      totalAmount: payment.totalAmount,
      isAdvance: payment.isAdvance,
      note: payment.note || "",
    });
    setIsPaymentModalOpen(true);
  };

  const openPaymentDeleteModal = (payment) => {
    setCurrentPayment(payment);
    setIsPaymentDeleteModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setCurrentPayment(null);
  };

  const closePaymentDeleteModal = () => {
    setIsPaymentDeleteModalOpen(false);
    setCurrentPayment(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0,
    });
  };

  const openCreateModal = () => {
    setCurrentEmployee(null);
    setFormData({
      name: "",
      position: "",
      phoneNumber: "",
      dailyRate: 0,
      overtimeRate: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an employee
  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      phoneNumber: employee.phoneNumber || "",
      dailyRate: employee.dailyRate,
      overtimeRate: employee.overtimeRate || 0,
      isActive: employee.isActive,
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (employee) => {
    setCurrentEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Close the employee form modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
  };

  // Close the delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentEmployee(null);
  };

  // Submit the employee form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentEmployee) {
      // Update existing employee
      updateEmployee({
        variables: {
          id: currentEmployee.id,
          input: formData,
        },
      });
    } else {
      // Create new employee
      createEmployee({
        variables: {
          input: formData,
        },
      });
    }
  };

  // Handle employee deletion
  const handleDelete = () => {
    if (currentEmployee) {
      deleteEmployee({
        variables: {
          id: currentEmployee.id,
        },
      }).catch((error) => {
        alert(`Xatolik: ${error.message}`);
      });
    }
  };

  if (employeeLoading) return <div className="p-4">Yuklanmoqda...</div>;
  if (employeeError)
    return <div className="p-4">Xatolik: {employeeError.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ishchilar</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
        >
          + Yangi ishchi qo'shish
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === "employees"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("employees")}
            >
              Ishchilar
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === "attendance"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("attendance")}
            >
              Davomat
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === "payments"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("payments")}
            >
              To'lovlar
            </button>
          </li>
        </ul>
      </div>

      {/* Date filters for Attendance tab */}
      {activeTab === "attendance" && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">Sana:</span>
            <DatePicker
              selected={attendanceDate}
              onChange={(date) => setAttendanceDate(date)}
              dateFormat="yyyy/MM/dd"
              className="p-2 border rounded-md"
            />
          </div>
          <button
            onClick={openAttendanceCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
          >
            + Davomat qo'shish
          </button>
        </div>
      )}

      {/* Date filters for Payments tab */}
      {activeTab === "payments" && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">Boshlanish sanasi:</span>
            <DatePicker
              selected={paymentStartDate}
              onChange={(date) => setPaymentStartDate(date)}
              dateFormat="yyyy/MM/dd"
              className="p-2 border rounded-md mr-4"
            />
            <span className="mr-2">Tugash sanasi:</span>
            <DatePicker
              selected={paymentEndDate}
              onChange={(date) => setPaymentEndDate(date)}
              dateFormat="yyyy/MM/dd"
              className="p-2 border rounded-md"
            />
          </div>
          <button
            onClick={openPaymentCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
          >
            + To'lov qo'shish
          </button>
        </div>
      )}

      {/* Employee list - only show if employees tab is active */}
      {activeTab === "employees" && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  F.I.O
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Lavozim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Kunlik to'lov
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Qo'shimcha vaqt to'lovi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeData?.employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {employee.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {employee.phoneNumber || "Mavjud emas"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {employee.dailyRate.toLocaleString()} so'm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {employee.overtimeRate?.toLocaleString() || 0} so'm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.isActive ? "Faol" : "Faol emas"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(employee)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => openDeleteModal(employee)}
                      className="text-red-600 hover:text-red-900"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
              {employeeData?.employees.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-600"
                  >
                    Ishchilar ro'yxati bo'sh
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance tab content */}
      {activeTab === "attendance" && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ishchi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Sana
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ishlangan soatlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Qo'shimcha soatlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Izoh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData?.attendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendance.employee.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {attendance.employee.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(attendance.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendance.status === "present"
                          ? "bg-green-100 text-green-800"
                          : attendance.status === "absent"
                          ? "bg-red-100 text-red-800"
                          : attendance.status === "late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {attendance.status === "present"
                        ? "Keldi"
                        : attendance.status === "absent"
                        ? "Kelmadi"
                        : attendance.status === "late"
                        ? "Kechikdi"
                        : attendance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {attendance.workHours || 0} soat
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {attendance.overtimeHours || 0} soat
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {attendance.note || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openAttendanceEditModal(attendance)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => openAttendanceDeleteModal(attendance)}
                      className="text-red-600 hover:text-red-900"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
              {attendanceData?.attendances.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-600"
                  >
                    Belgilangan sanada davomat qaydlari mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments tab content */}
      {activeTab === "payments" && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ishchi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  To'lov sanasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ish davri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Asosiy summa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Qo'shimcha summa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Jami summa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentData?.salaryPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.employee.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {payment.employee.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(payment.workDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.regularAmount.toLocaleString()} so'm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.overtimeAmount?.toLocaleString() || 0} so'm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.totalAmount.toLocaleString()} so'm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.isAdvance
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {payment.isAdvance ? "Avans" : "To'lov"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openPaymentEditModal(payment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => openPaymentDeleteModal(payment)}
                      className="text-red-600 hover:text-red-900"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
              {paymentData?.salaryPayments.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-600"
                  >
                    Belgilangan davrda to'lovlar mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {currentEmployee
                ? "Ishchini tahrirlash"
                : "Yangi ishchi qo'shish"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  F.I.O
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Lavozim
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Telefon raqami
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Kunlik to'lov (so'm)
                </label>
                <input
                  type="number"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={handleNumberChange}
                  className="w-full p-2 border rounded-md"
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Qo'shimcha vaqt to'lovi (so'm)
                </label>
                <input
                  type="number"
                  name="overtimeRate"
                  value={formData.overtimeRate}
                  onChange={handleNumberChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="1000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-800">Faol</label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                >
                  {currentEmployee ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Ishchini o'chirish
            </h2>
            <p className="mb-6 text-gray-800">
              Rostdan ham{" "}
              <span className="font-bold">{currentEmployee?.name}</span> nomli
              ishchini o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Attendance Form Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {currentAttendance
                ? "Davomatni tahrirlash"
                : "Yangi davomat qo'shish"}
            </h2>
            <form onSubmit={handleAttendanceSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ishchi
                </label>
                <select
                  name="employeeId"
                  value={attendanceFormData.employeeId}
                  onChange={handleAttendanceChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Ishchini tanlang</option>
                  {employeeData?.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Sana
                </label>
                <DatePicker
                  selected={attendanceFormData.date}
                  onChange={handleAttendanceDateChange}
                  dateFormat="yyyy/MM/dd"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Holat
                </label>
                <select
                  name="status"
                  value={attendanceFormData.status}
                  onChange={handleAttendanceChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="present">Keldi</option>
                  <option value="absent">Kelmadi</option>
                  <option value="late">Kechikdi</option>
                  <option value="halfday">Yarim kun</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ishlangan soatlar
                </label>
                <input
                  type="number"
                  name="workHours"
                  value={attendanceFormData.workHours}
                  onChange={handleAttendanceNumberChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Qo'shimcha soatlar
                </label>
                <input
                  type="number"
                  name="overtimeHours"
                  value={attendanceFormData.overtimeHours}
                  onChange={handleAttendanceNumberChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Izoh
                </label>
                <textarea
                  name="note"
                  value={attendanceFormData.note}
                  onChange={handleAttendanceChange}
                  className="w-full p-2 border rounded-md"
                  rows="2"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAttendanceModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                >
                  {currentAttendance ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Delete Confirmation Modal */}
      {isAttendanceDeleteModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Davomatni o'chirish
            </h2>
            <p className="mb-6 text-gray-800">
              Haqiqatan ham ushbu davomatni o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeAttendanceDeleteModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAttendanceDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {currentPayment ? "To'lovni tahrirlash" : "Yangi to'lov qo'shish"}
            </h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ishchi
                </label>
                <select
                  name="employeeId"
                  value={paymentFormData.employeeId}
                  onChange={handlePaymentChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Ishchini tanlang</option>
                  {employeeData?.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  To'lov sanasi
                </label>
                <DatePicker
                  selected={paymentFormData.paymentDate}
                  onChange={handlePaymentDateChange}
                  dateFormat="yyyy/MM/dd"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ish davri
                </label>
                <DatePicker
                  selected={paymentFormData.workDate}
                  onChange={handleWorkDateChange}
                  dateFormat="yyyy/MM/dd"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ishlangan soatlar
                </label>
                <input
                  type="number"
                  name="regularHours"
                  value={paymentFormData.regularHours}
                  onChange={handlePaymentNumberChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Qo'shimcha soatlar
                </label>
                <input
                  type="number"
                  name="overtimeHours"
                  value={paymentFormData.overtimeHours}
                  onChange={handlePaymentNumberChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Asosiy to'lov (so'm)
                </label>
                <input
                  type="number"
                  name="regularAmount"
                  value={paymentFormData.regularAmount}
                  onChange={handlePaymentNumberChange}
                  className="w-full p-2 border rounded-md"
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Qo'shimcha to'lov (so'm)
                </label>
                <input
                  type="number"
                  name="overtimeAmount"
                  value={paymentFormData.overtimeAmount}
                  onChange={handlePaymentNumberChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="1000"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Jami to'lov (so'm)
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={paymentFormData.totalAmount}
                  onChange={handlePaymentNumberChange}
                  className="w-full p-2 border rounded-md"
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isAdvance"
                  checked={paymentFormData.isAdvance}
                  onChange={handlePaymentChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-800">Avans</label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Izoh
                </label>
                <textarea
                  name="note"
                  value={paymentFormData.note}
                  onChange={handlePaymentChange}
                  className="w-full p-2 border rounded-md"
                  rows="2"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                >
                  {currentPayment ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Delete Confirmation Modal */}
      {isPaymentDeleteModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              To'lovni o'chirish
            </h2>
            <p className="mb-6 text-gray-800">
              Haqiqatan ham ushbu to'lovni o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closePaymentDeleteModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handlePaymentDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
