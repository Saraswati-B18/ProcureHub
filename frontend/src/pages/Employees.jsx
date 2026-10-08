import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Pencil,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";

import "./Employees.css";


const Employees = () => {

  const token = localStorage.getItem("token");

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "EMPLOYEE",
    branch_id: ""
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
    branch_id: ""
  });


  /* =====================================================
     NOTIFICATION
  ===================================================== */

  const showNotification = (type, message) => {

    setNotification({
      show: true,
      type,
      message
    });

    setTimeout(() => {

      setNotification({
        show: false,
        type: "",
        message: ""
      });

    }, 3000);
  };


  /* =====================================================
     FETCH USERS
  ===================================================== */

  const fetchEmployees = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/employees/my-employees",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setEmployees(response.data.employees || []);

    } catch (error) {

      console.error(
        "Fetch employees error:",
        error
      );

      showNotification(
        "error",
        error.response?.data?.message ||
          "Failed to fetch users."
      );

    }
  };


  /* =====================================================
     FETCH BRANCHES
  ===================================================== */

  const fetchBranches = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/branches/my-branches",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBranches(response.data.branches || []);

    } catch (error) {

      console.error(
        "Fetch branches error:",
        error
      );

      showNotification(
        "error",
        error.response?.data?.message ||
          "Failed to fetch branches."
      );

    }
  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    const loadData = async () => {

      setLoading(true);

      await Promise.all([
        fetchEmployees(),
        fetchBranches()
      ]);

      setLoading(false);
    };

    loadData();

  }, []);


  /* =====================================================
     RESET ADD FORM
  ===================================================== */

  const resetForm = () => {

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "EMPLOYEE",
      branch_id: ""
    });
  };


  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {

    resetForm();
    setShowAddModal(true);
  };


  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (employee) => {

    setSelectedEmployee(employee);

    setEditForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role || "EMPLOYEE",
      branch_id: employee.branch_id || ""
    });

    setShowEditModal(true);
  };


  /* =====================================================
     FORM HANDLERS
  ===================================================== */

  const handleFormChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  const handleEditFormChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  /* =====================================================
     CREATE USER
  ===================================================== */

  const handleCreateEmployee = async (e) => {

    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.role ||
      !form.branch_id
    ) {

      showNotification(
        "error",
        "Please fill all required fields."
      );

      return;
    }
    const phone = form.phone.trim();

if (phone && !/^[6-9]\d{9}$/.test(phone)) {

  showNotification(
    "error",
    "Please enter a valid 10-digit Indian mobile number."
  );

  return;
}


    try {

      const response = await axios.post(
        "http://localhost:5000/api/employees",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
          branch_id: Number(form.branch_id)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      showNotification(
        "success",
        response.data.message ||
          "User created successfully."
      );


      setShowAddModal(false);

      resetForm();

      await fetchEmployees();

    } catch (error) {

      console.error(
        "Create employee error:",
        error
      );

      showNotification(
        "error",
        error.response?.data?.message ||
          "Failed to create user."
      );
    }
  };


  /* =====================================================
     UPDATE USER
  ===================================================== */

  const handleUpdateEmployee = async (e) => {

    e.preventDefault();

    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.role ||
      !editForm.branch_id
    ) {

      showNotification(
        "error",
        "Please fill all required fields."
      );

      return;
    }


    try {

      const response = await axios.put(
        `http://localhost:5000/api/employees/${selectedEmployee.id}`,
        {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          role: editForm.role,
          branch_id: Number(editForm.branch_id)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      showNotification(
        "success",
        response.data.message ||
          "User updated successfully."
      );


      setShowEditModal(false);

      setSelectedEmployee(null);

      await fetchEmployees();

    } catch (error) {

      console.error(
        "Update employee error:",
        error
      );

      showNotification(
        "error",
        error.response?.data?.message ||
          "Failed to update user."
      );
    }
  };


  /* =====================================================
     ACTIVATE / DEACTIVATE
  ===================================================== */

  const toggleStatus = async (employee) => {

    const endpoint =
      employee.status === "ACTIVE"
        ? "deactivate"
        : "activate";


    try {

      const response = await axios.put(
        `http://localhost:5000/api/employees/${employee.id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      showNotification(
        "success",
        response.data.message
      );


      await fetchEmployees();

    } catch (error) {

      console.error(
        "Toggle employee status error:",
        error
      );

      showNotification(
        "error",
        error.response?.data?.message ||
          "Failed to update user status."
      );
    }
  };


  /* =====================================================
     FILTERED USERS
  ===================================================== */

  const filteredEmployees = useMemo(() => {

    return employees.filter((employee) => {

      const search =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        employee.name
          ?.toLowerCase()
          .includes(search) ||
        employee.email
          ?.toLowerCase()
          .includes(search) ||
        employee.phone
          ?.toLowerCase()
          .includes(search);

      const matchesRole =
        roleFilter === "ALL" ||
        employee.role === roleFilter;

      const matchesBranch =
        branchFilter === "ALL" ||
        String(employee.branch_id) ===
          String(branchFilter);

      const matchesStatus =
        statusFilter === "ALL" ||
        employee.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesBranch &&
        matchesStatus
      );
    });

  }, [
    employees,
    searchTerm,
    roleFilter,
    branchFilter,
    statusFilter
  ]);


  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalUsers = employees.length;

  const activeUsers =
    employees.filter(
      (employee) =>
        employee.status === "ACTIVE"
    ).length;

  const inactiveUsers =
    employees.filter(
      (employee) =>
        employee.status === "INACTIVE"
    ).length;


  /* =====================================================
     ROLE LABEL
  ===================================================== */

  const getRoleLabel = (role) => {

    if (role === "MANAGER") {
      return "Manager";
    }

    if (role === "FINANCE") {
      return "Finance";
    }

    return "Employee";
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <div className="employees-loading">
        Loading users...
      </div>
    );
  }


  return (
    <div className="employees-page">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (

        <div
          className={`employees-notification ${notification.type}`}
        >

          {notification.type === "success" ? (
            <CheckCircle size={19} />
          ) : (
            <AlertCircle size={19} />
          )}

          <span>
            {notification.message}
          </span>

          <button
            onClick={() =>
              setNotification({
                show: false,
                type: "",
                message: ""
              })
            }
          >
            <X size={18} />
          </button>

        </div>
      )}


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="employees-header">

        <div>

          <h1>Employees</h1>

          <p>
            Manage employees, managers and finance users.
          </p>

        </div>


        <Button
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add User
        </Button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="employees-stats">

        <Card>

          <div className="employees-stat-card">

            <div className="employees-stat-icon blue">
              <Users size={22} />
            </div>

            <div>
              <span>Total Users</span>
              <strong>{totalUsers}</strong>
            </div>

          </div>

        </Card>


        <Card>

          <div className="employees-stat-card">

            <div className="employees-stat-icon green">
              <UserCheck size={22} />
            </div>

            <div>
              <span>Active Users</span>
              <strong>{activeUsers}</strong>
            </div>

          </div>

        </Card>


        <Card>

          <div className="employees-stat-card">

            <div className="employees-stat-icon orange">
              <UserX size={22} />
            </div>

            <div>
              <span>Inactive Users</span>
              <strong>{inactiveUsers}</strong>
            </div>

          </div>

        </Card>

      </div>


      {/* =================================================
          USER LIST
      ================================================= */}

      <Card>

        <div className="employees-list-card">

          <div className="employees-list-header">

            <div>

              <h2>Company Users</h2>

              <p>
                Employees and branch-level responsible users.
              </p>

            </div>


            <div className="employees-filters">

              <div className="employees-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>


              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
              >

                <option value="ALL">
                  All Roles
                </option>

                <option value="EMPLOYEE">
                  Employees
                </option>

                <option value="MANAGER">
                  Managers
                </option>

                <option value="FINANCE">
                  Finance
                </option>

              </select>


              <select
                value={branchFilter}
                onChange={(e) =>
                  setBranchFilter(e.target.value)
                }
              >

                <option value="ALL">
                  All Branches
                </option>

                {branches.map((branch) => (

                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.branch_name}
                  </option>

                ))}

              </select>


              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="employees-table-wrapper">

            <table className="employees-table">

              <thead>

                <tr>

                  <th>User</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>

                </tr>

              </thead>


              <tbody>

                {filteredEmployees.length === 0 ? (

                  <tr>

                    <td colSpan="6">

                      <div className="employees-empty">

                        <div className="employees-empty-icon">
                          <Users size={34} />
                        </div>

                        <h3>
                          No users found
                        </h3>

                        <p>
                          Add employees, managers or finance users to your company.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredEmployees.map((employee) => (

                    <tr key={employee.id}>

                      <td>

                        <div className="employee-user">

                          <div className="employee-avatar">
                            {employee.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {employee.name}
                            </strong>

                            <span>
                              {employee.email}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <span
                          className={`employee-role ${employee.role.toLowerCase()}`}
                        >
                          {getRoleLabel(employee.role)}
                        </span>

                      </td>


                      <td>

                        <span className="employee-branch">
                          {employee.branch_name ||
                            "Not assigned"}
                        </span>

                      </td>


                      <td>

                        {employee.phone || "—"}

                      </td>


                      <td>

                        <span
                          className={`employee-status ${employee.status.toLowerCase()}`}
                        >

                          {employee.status === "ACTIVE" ? (
                            <CheckCircle size={15} />
                          ) : (
                            <UserX size={15} />
                          )}

                          {employee.status}

                        </span>

                      </td>


                      <td>

                        <div className="employee-actions">

                          <button
                            className="employee-action edit"
                            onClick={() =>
                              openEditModal(employee)
                            }
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>


                          <button
                            className={`employee-action ${
                              employee.status === "ACTIVE"
                                ? "deactivate"
                                : "activate"
                            }`}
                            onClick={() =>
                              toggleStatus(employee)
                            }
                            title={
                              employee.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >

                            {employee.status === "ACTIVE" ? (
                              <X size={17} />
                            ) : (
                              <CheckCircle size={17} />
                            )}

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </Card>


      {/* =================================================
          ADD USER MODAL
      ================================================= */}

      {showAddModal && (

        <div className="employees-modal-overlay">

          <div className="employees-modal">

            <div className="employees-modal-header">

              <div>

                <h2>Add User</h2>

                <p>
                  Create an employee, manager or finance account.
                </p>

              </div>

              <button
                className="employees-modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={handleCreateEmployee}
              className="employees-form"
            >

              <div className="employees-form-group">

                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleFormChange}
                />

              </div>


              <div className="employees-form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleFormChange}
                />

              </div>


              <div className="employees-form-row">

                <div className="employees-form-group">

                  <label>Phone</label>

                  <input
  type="tel"
  name="phone"
  placeholder="Enter 10-digit mobile number"
  value={form.phone}
  onChange={handleFormChange}
  maxLength="10"
/>

                </div>


                <div className="employees-form-group">

                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleFormChange}
                  />

                </div>

              </div>


              <div className="employees-form-row">

                <div className="employees-form-group">

                  <label>Role</label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                  >

                    <option value="EMPLOYEE">
                      Employee
                    </option>

                    <option value="MANAGER">
                      Manager
                    </option>

                    <option value="FINANCE">
                      Finance
                    </option>

                  </select>

                </div>


                <div className="employees-form-group">

                  <label>Branch</label>

                  <select
                    name="branch_id"
                    value={form.branch_id}
                    onChange={handleFormChange}
                  >

                    <option value="">
                      Select branch
                    </option>

                    {branches
                      .filter(
                        (branch) =>
                          branch.status === "ACTIVE"
                      )
                      .map((branch) => (

                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.branch_name}
                        </option>

                      ))}

                  </select>

                </div>

              </div>


              <div className="employees-modal-footer">

                <button
                  type="button"
                  className="employees-cancel-btn"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <Button type="submit">
                  Create User
                </Button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =================================================
          EDIT USER MODAL
      ================================================= */}

      {showEditModal && (

        <div className="employees-modal-overlay">

          <div className="employees-modal">

            <div className="employees-modal-header">

              <div>

                <h2>Edit User</h2>

                <p>
                  Update user role and branch assignment.
                </p>

              </div>

              <button
                className="employees-modal-close"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={handleUpdateEmployee}
              className="employees-form"
            >

              <div className="employees-form-group">

                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                />

              </div>


              <div className="employees-form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                />

              </div>


              <div className="employees-form-group">

                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                />

              </div>


              <div className="employees-form-row">

                <div className="employees-form-group">

                  <label>Role</label>

                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditFormChange}
                  >

                    <option value="EMPLOYEE">
                      Employee
                    </option>

                    <option value="MANAGER">
                      Manager
                    </option>

                    <option value="FINANCE">
                      Finance
                    </option>

                  </select>

                </div>


                <div className="employees-form-group">

                  <label>Branch</label>

                  <select
                    name="branch_id"
                    value={editForm.branch_id}
                    onChange={handleEditFormChange}
                  >

                    <option value="">
                      Select branch
                    </option>

                    {branches
                      .filter(
                        (branch) =>
                          branch.status === "ACTIVE"
                      )
                      .map((branch) => (

                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.branch_name}
                        </option>

                      ))}

                  </select>

                </div>

              </div>


              <div className="employees-modal-footer">

                <button
                  type="button"
                  className="employees-cancel-btn"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <Button type="submit">
                  Save Changes
                </Button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};


export default Employees;