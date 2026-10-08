import { useEffect, useState } from "react";

import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  UserCheck,
  Building2,
  Truck,
  X,
  Eye
} from "lucide-react";

import axios from "axios";

import Card from "../components/Card";

import "./Users.css";


const Users = () => {

  // ==========================================
  // STATES
  // ==========================================

  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);


  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    const latestUsers = response.data.users || [];

setUsers(latestUsers);

setSelectedUser((currentUser) => {
    if (!currentUser) {
        return null;
    }

    return (
        latestUsers.find((user) => user.id === currentUser.id) ||
        currentUser
    );
});

    } catch (error) {

      console.error("Failed to fetch users:", error);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // LOAD USERS WHEN PAGE OPENS
  // ==========================================

 useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
        fetchUsers();
    }, 5000);

    const handleFocus = () => {
        fetchUsers();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
        clearInterval(interval);
        window.removeEventListener("focus", handleFocus);
    };
}, []);


  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers = users.filter((user) => {

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.company_name?.toLowerCase().includes(search) ||
      user.supplier_name?.toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      user.status === statusFilter;

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );

  });


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const companyUsers = users.filter(
    (user) =>
      user.role === "COMPANY_ADMIN" ||
      user.role === "EMPLOYEE" ||
      user.role === "MANAGER" ||
      user.role === "FINANCE"
  ).length;

  const supplierUsers = users.filter(
    (user) => user.role === "SUPPLIER"
  ).length;


  // ==========================================
  // ROLE DISPLAY
  // ==========================================

  const formatRole = (role) => {

    switch (role) {

      case "SUPER_ADMIN":
        return "Super Admin";

      case "COMPANY_ADMIN":
        return "Company Admin";

      case "EMPLOYEE":
        return "Employee";

      case "MANAGER":
        return "Manager";

      case "FINANCE":
        return "Finance";

      case "SUPPLIER":
        return "Supplier";

      default:
        return role;

    }

  };


  // ==========================================
  // ORGANIZATION DISPLAY
  // ==========================================

  const getOrganization = (user) => {

    if (user.company_name) {
      return user.company_name;
    }

    if (user.supplier_name) {
      return user.supplier_name;
    }

    return "ProcureHub";

  };


  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {

    return (
      <div className="users-page">

        <div className="users-heading">

          <div>

            <h1>Users</h1>

            <p>
              View and manage user accounts across the ProcureHub platform.
            </p>

          </div>

        </div>

        <Card>

          <div className="users-empty">

            <div className="users-empty-icon">
              <UsersIcon size={34} />
            </div>

            <h3>Loading users...</h3>

            <p>
              Please wait while user accounts are being loaded.
            </p>

          </div>

        </Card>

      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="users-page">

      {/* Page Heading */}

      <div className="users-heading">

        <div>

          <h1>Users</h1>

          <p>
            View and manage user accounts across the ProcureHub platform.
          </p>

        </div>

      </div>


      {/* Summary Cards */}

      <div className="users-stats">


        {/* Total Users */}

        <Card>

          <div className="user-stat-card">

            <div className="user-stat-icon blue">
              <UsersIcon size={22} />
            </div>

            <div>

              <span>Total Users</span>

              <strong>{totalUsers}</strong>

            </div>

          </div>

        </Card>


        {/* Active Users */}

        <Card>

          <div className="user-stat-card">

            <div className="user-stat-icon green">
              <UserCheck size={22} />
            </div>

            <div>

              <span>Active Users</span>

              <strong>{activeUsers}</strong>

            </div>

          </div>

        </Card>


        {/* Company Users */}

        <Card>

          <div className="user-stat-card">

            <div className="user-stat-icon orange">
              <Building2 size={22} />
            </div>

            <div>

              <span>Company Users</span>

              <strong>{companyUsers}</strong>

            </div>

          </div>

        </Card>


        {/* Supplier Users */}

        <Card>

          <div className="user-stat-card">

            <div className="user-stat-icon purple">
              <Truck size={22} />
            </div>

            <div>

              <span>Supplier Users</span>

              <strong>{supplierUsers}</strong>

            </div>

          </div>

        </Card>


      </div>


      {/* User List */}

      <Card className="users-list-card">


        <div className="users-list-header">


          <div>

            <h2>Platform Users</h2>

            <p>
              All user accounts registered on ProcureHub.
            </p>

          </div>


          <div className="users-filters">


            {/* Search */}

            <div className="users-search">

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


            {/* Role Filter */}

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >

              <option value="ALL">All Roles</option>

              <option value="COMPANY_ADMIN">
                Company Admin
              </option>

              <option value="EMPLOYEE">
                Employee
              </option>

              <option value="MANAGER">
                Manager
              </option>

              <option value="FINANCE">
                Finance
              </option>

              <option value="SUPPLIER">
                Supplier
              </option>

            </select>


            {/* Status Filter */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="ALL">All Status</option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>


          </div>

        </div>


        {/* Users Table */}

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>

                <th>User</th>

                <th>Email</th>

                <th>Role</th>

                <th>Organization</th>

                <th>Status</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>


              {filteredUsers.length === 0 ? (

                <tr>

                  <td colSpan="6">

                    <div className="users-empty">

                      <div className="users-empty-icon">

                        <UsersIcon size={34} />

                      </div>

                      <h3>No users found</h3>

                      <p>
                        No user accounts match your search or filters.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredUsers.map((user) => (

                  <tr key={user.id}>


                    {/* User */}

                    <td>

                      <div className="user-name-cell">

                        <div className="user-avatar">

                          {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}

                        </div>

                        <div>

                          <strong>
                            {user.name}
                          </strong>

                          <span>
                            User ID: {user.id}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* Email */}

                    <td>

                      {user.email}

                    </td>


                    {/* Role */}

                    <td>

                      <span className="user-role">

                        {formatRole(user.role)}

                      </span>

                    </td>


                    {/* Organization */}

                    <td>

                      {getOrganization(user)}

                    </td>


                    {/* Status */}

                    <td>

                      <span
  className={
    user.status === "ACTIVE"
      ? "status-badge active"
      : "status-badge inactive"
  }
>
  {user.status === "ACTIVE"
    ? "Active"
    : "Inactive"}
</span>

                    </td>


                    {/* Action */}

                    <td>

                      <button
  className="user-view-btn"
  onClick={() => setSelectedUser(user)}
  title="View User"
>
  <Eye size={18} />
</button>

                    </td>


                  </tr>

                ))

              )}


            </tbody>

          </table>

        </div>


      </Card>


      {/* Information Card */}

      <Card className="users-info-card">


        <div className="users-info-icon">

          <ShieldCheck size={22} />

        </div>


        <div>

          <h3>User Management</h3>

          <p>
            Super Admins can view platform users, monitor account status
            and manage access across companies and suppliers.
          </p>

        </div>


      </Card>

      {/* ==========================================
    VIEW USER MODAL
========================================== */}

{selectedUser && (

  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}
    onClick={() => setSelectedUser(null)}
  >

    <div
      style={{
        background: "#ffffff",
        width: "100%",
        maxWidth: "520px",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* Modal Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 24px",
          borderBottom: "1px solid #e5e7eb"
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#111827"
            }}
          >
            User Details
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#6b7280",
              fontSize: "13px"
            }}
          >
            View account information
          </p>

        </div>

        <button
          onClick={() => setSelectedUser(null)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "6px",
            color: "#6b7280"
          }}
        >
          <X size={22} />
        </button>

      </div>


      {/* User Profile */}

      <div
        style={{
          padding: "24px"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "24px"
          }}
        >

          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "600"
            }}
          >
            {selectedUser.name
              ? selectedUser.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>

            <h3
              style={{
                margin: 0,
                color: "#111827"
              }}
            >
              {selectedUser.name}
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              User ID: {selectedUser.id}
            </p>

          </div>

        </div>


        {/* Details */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px"
          }}
        >

          <div>
            <small style={{ color: "#6b7280" }}>
              Email
            </small>

            <p style={{ margin: "5px 0 0", color: "#111827" }}>
              {selectedUser.email || "—"}
            </p>
          </div>


          <div>
            <small style={{ color: "#6b7280" }}>
              Phone
            </small>

            <p style={{ margin: "5px 0 0", color: "#111827" }}>
              {selectedUser.phone || "—"}
            </p>
          </div>


          <div>
            <small style={{ color: "#6b7280" }}>
              Role
            </small>

            <p style={{ margin: "5px 0 0", color: "#111827" }}>
              {formatRole(selectedUser.role)}
            </p>
          </div>


          <div>
            <small style={{ color: "#6b7280" }}>
              Status
            </small>

            <p style={{ margin: "5px 0 0" }}>

              <span
                className={`user-status ${
                  selectedUser.status === "ACTIVE"
                    ? "active"
                    : "inactive"
                }`}
              >
                {selectedUser.status === "ACTIVE"
                  ? "✓ ACTIVE"
                  : "✕ INACTIVE"}
              </span>

            </p>

          </div>


          <div>
            <small style={{ color: "#6b7280" }}>
              Organization
            </small>

            <p style={{ margin: "5px 0 0", color: "#111827" }}>
              {getOrganization(selectedUser)}
            </p>
          </div>


          <div>
            <small style={{ color: "#6b7280" }}>
              Branch
            </small>

            <p style={{ margin: "5px 0 0", color: "#111827" }}>
              {selectedUser.branch_name || "—"}
            </p>
          </div>


          <div>
            <small style={{ color: "#6b7280" }}>
              Created Date
            </small>

            <p style={{ margin: "5px 0 0", color: "#111827" }}>
              {selectedUser.created_at
                ? new Date(selectedUser.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>

        </div>

      </div>


      {/* Modal Footer */}

      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end"
        }}
      >

        <button
          onClick={() => setSelectedUser(null)}
          style={{
            padding: "9px 20px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}


    </div>

  );

};


export default Users;