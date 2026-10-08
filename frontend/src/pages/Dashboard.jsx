import {
  Package,
  ClipboardList,
  Truck,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Wallet,
  Receipt,
  Building2,
  Users,
  UserCircle
} from "lucide-react";

import Card from "../components/Card";
import axios from "axios";
import { useEffect, useState } from "react";

import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const role = user?.role || "EMPLOYEE";

  const [superAdminStats, setSuperAdminStats] = useState({
    total_companies: 0,
    total_suppliers: 0,
    total_users: 0,
    active_products: 0
  });

  useEffect(() => {

    if (role !== "SUPER_ADMIN") {
      return;
    }

    const fetchSuperAdminStats = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/companies/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSuperAdminStats(
          response.data.stats
        );

      } catch (error) {

        console.error(
          "Failed to fetch Super Admin statistics:",
          error
        );

      }

    };

    fetchSuperAdminStats();

  }, [role]);

  const dashboardData = {
    EMPLOYEE: {
      title: "Employee Dashboard",
      description: "Manage your purchases and procurement activity.",
      cards: [
        {
          title: "Total Products",
          value: "0",
          icon: Package,
          variant: "blue"
        },
        {
          title: "Purchase Requests",
          value: "0",
          icon: ClipboardList,
          variant: "orange"
        },
        {
          title: "Active Orders",
          value: "0",
          icon: Truck,
          variant: "green"
        },
        {
          title: "Pending Invoices",
          value: "0",
          icon: FileText,
          variant: "purple"
        }
      ]
    },

    MANAGER: {
      title: "Manager Dashboard",
      description: "Review purchase requests and monitor procurement activity.",
      cards: [
        {
          title: "Pending Approvals",
          value: "0",
          icon: Clock,
          variant: "orange"
        },
        {
          title: "Approved Requests",
          value: "0",
          icon: CheckCircle,
          variant: "green"
        },
        {
          title: "Rejected Requests",
          value: "0",
          icon: XCircle,
          variant: "red"
        },
        {
          title: "Active Orders",
          value: "0",
          icon: ShoppingCart,
          variant: "blue"
        }
      ]
    },

    FINANCE: {
      title: "Finance Dashboard",
      description: "Manage invoices, payments and procurement finances.",
      cards: [
        {
          title: "Pending Invoices",
          value: "0",
          icon: FileText,
          variant: "orange"
        },
        {
          title: "Due Payments",
          value: "0",
          icon: Clock,
          variant: "red"
        },
        {
          title: "Paid Invoices",
          value: "0",
          icon: CheckCircle,
          variant: "green"
        },
        {
          title: "Outstanding Amount",
          value: "₹0.00",
          icon: Wallet,
          variant: "blue"
        }
      ]
    },

    SUPPLIER: {
      title: "Supplier Dashboard",
      description: "Manage your products, orders and deliveries.",
      cards: [
        {
          title: "My Products",
          value: "0",
          icon: Package,
          variant: "blue"
        },
        {
          title: "New Orders",
          value: "0",
          icon: ClipboardList,
          variant: "orange"
        },
        {
          title: "Active Deliveries",
          value: "0",
          icon: Truck,
          variant: "green"
        },
        {
          title: "Pending Invoices",
          value: "0",
          icon: FileText,
          variant: "purple"
        }
      ]
    },

    SUPER_ADMIN: {
      title: "Super Admin Dashboard",
      description: "Manage companies, suppliers and the ProcureHub platform.",
      cards: [
        {
          title: "Total Companies",
          value: superAdminStats.total_companies,
          icon: Building2,
          variant: "blue"
        },
        {
          title: "Total Suppliers",
          value: superAdminStats.total_suppliers,
          icon: Users,
          variant: "orange"
        },
        {
          title: "Total Users",
          value: superAdminStats.total_users,
          icon: UserCircle,
          variant: "green"
        },
        {
          title: "Active Products",
          value: superAdminStats.active_products,
          icon: Package,
          variant: "purple"
        }
      ]
    },

COMPANY_ADMIN: {
  title: "Company Admin Dashboard",
  description:
    "Manage your company and monitor all procurement activities.",
  cards: [
    {
      title: "Employees",
      value: "0",
      icon: Users,
      variant: "blue"
    },
    {
      title: "Branches",
      value: "0",
      icon: Building2,
      variant: "purple"
    },
    {
      title: "Pending Requests",
      value: "0",
      icon: ClipboardList,
      variant: "orange"
    },
    {
      title: "Active Orders",
      value: "0",
      icon: ShoppingCart,
      variant: "green"
    }
  ]
},
};

  const currentDashboard =
    dashboardData[role] || dashboardData.EMPLOYEE;
    if (role === "SUPER_ADMIN") {
  currentDashboard.cards[0].value = superAdminStats.total_companies;
  currentDashboard.cards[1].value = superAdminStats.total_suppliers;
  currentDashboard.cards[2].value = superAdminStats.total_users;
  currentDashboard.cards[3].value = superAdminStats.active_products;
}

  const isManager = role === "MANAGER";
  const isFinance = role === "FINANCE";
  const isSupplier = role === "SUPPLIER";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isCompanyAdmin = role === "COMPANY_ADMIN";

  return (
    <div className="dashboard-page">

      {/* Page Heading */}
      <div className="dashboard-heading">
        <div>
          <h1>{currentDashboard.title}</h1>

          <p>
            {currentDashboard.description}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">

        {currentDashboard.cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>

              <div className="dashboard-stat-card">

                <div className={`dashboard-stat-icon ${card.variant}`}>
                  <Icon size={22} />
                </div>

                <div className="dashboard-stat-info">
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </div>

              </div>

            </Card>
          );
        })}

      </div>

      {/* Manager Section */}
      {isManager && (
        <Card className="dashboard-main-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Pending Purchase Requests</h2>

              <p>
                Requests waiting for your approval.
              </p>
            </div>

            <button
              className="dashboard-view-button"
              type="button"
            >
              View All
            </button>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td colSpan="7">

                    <div className="dashboard-empty">

                      <div className="dashboard-empty-icon">
                        <ClipboardList size={34} />
                      </div>

                      <h3>No pending requests</h3>

                      <p>
                        Purchase requests waiting for your
                        approval will appear here.
                      </p>

                    </div>

                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </Card>
      )}

      {/* Finance Section */}
      {isFinance && (
        <Card className="dashboard-main-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Pending Payments</h2>

              <p>
                Invoices that require your attention.
              </p>
            </div>

            <button
              className="dashboard-view-button"
              type="button"
            >
              View All
            </button>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Supplier</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td colSpan="7">

                    <div className="dashboard-empty">

                      <div className="dashboard-empty-icon">
                        <Receipt size={34} />
                      </div>

                      <h3>No pending payments</h3>

                      <p>
                        Invoices requiring payment will appear
                        here.
                      </p>

                    </div>

                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </Card>
      )}

      {/* Supplier Section */}
      {isSupplier && (
        <Card className="dashboard-main-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Recent Orders</h2>

              <p>
                Recent purchase orders received from customers.
              </p>
            </div>

            <button
              className="dashboard-view-button"
              type="button"
            >
              View All
            </button>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Order Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td colSpan="7">

                    <div className="dashboard-empty">

                      <div className="dashboard-empty-icon">
                        <Truck size={34} />
                      </div>

                      <h3>No recent orders</h3>

                      <p>
                        Purchase orders received from customers
                        will appear here.
                      </p>

                    </div>

                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </Card>
      )}

      {/* Super Admin Section */}
{isSuperAdmin && (
  <Card className="dashboard-main-card">

    <div className="dashboard-card-header">
      <div>
        <h2>Platform Overview</h2>
        <p>Monitor companies, suppliers and platform activity.</p>
      </div>

      <button
        className="dashboard-view-button"
        type="button"
      >
        View Reports
      </button>
    </div>

    <div className="dashboard-table-wrapper">

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td>Companies</td>
            <td>Manage registered companies</td>
            <td>Active</td>
          </tr>

          <tr>
            <td>Suppliers</td>
            <td>Manage platform suppliers</td>
            <td>Active</td>
          </tr>

          <tr>
            <td>Users</td>
            <td>Manage platform users</td>
            <td>Active</td>
          </tr>

          <tr>
            <td>Products</td>
            <td>Monitor supplier products</td>
            <td>Active</td>
          </tr>

        </tbody>
      </table>

    </div>

  </Card>
)}

{/* Company Admin Section */}
{isCompanyAdmin && (
  <>
    {/* Recent Procurement Activity */}

    <Card className="dashboard-main-card">

      <div className="dashboard-card-header">

        <div>
          <h2>Recent Procurement Activity</h2>

          <p>
            View the latest procurement activity of your company.
          </p>
        </div>

      </div>


      <div className="dashboard-table-wrapper">

        <table className="dashboard-table">

          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Employee</th>
              <th>Branch</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td colSpan="6">

                <div className="dashboard-empty">

                  <div className="dashboard-empty-icon">
                    <ClipboardList size={34} />
                  </div>

                  <h3>No procurement activity yet</h3>

                  <p>
                    Purchase requests, purchase orders and orders
                    will appear here.
                  </p>

                </div>

              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </Card>


    {/* Branch Overview */}

    <Card className="dashboard-main-card">

      <div className="dashboard-card-header">

        <div>
          <h2>Branch Overview</h2>

          <p>
            View your company's branches and assigned users.
          </p>
        </div>

      </div>


      <div className="dashboard-table-wrapper">

        <table className="dashboard-table">

          <thead>
            <tr>
              <th>Branch</th>
              <th>Employees</th>
              <th>Manager</th>
              <th>Finance / Accounts</th>
              <th>Active Orders</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td colSpan="5">

                <div className="dashboard-empty">

                  <div className="dashboard-empty-icon">
                    <Building2 size={34} />
                  </div>

                  <h3>No branches available</h3>

                  <p>
                    Branch information will appear here once
                    branches are added.
                  </p>

                </div>

              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </Card>

  </>
)}

      {/* Employee Section */}
{!isManager && !isFinance && !isSupplier && !isSuperAdmin && !isCompanyAdmin && (
        <Card className="dashboard-main-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Recent Activity</h2>

              <p>
                Your recent procurement activity.
              </p>
            </div>

          </div>

          <div className="dashboard-empty">

            <div className="dashboard-empty-icon">
              <ClipboardList size={34} />
            </div>

            <h3>No recent activity</h3>

            <p>
              Your purchase requests, orders and other
              activities will appear here.
            </p>

          </div>

        </Card>
      )}

    </div>
  );
};

export default Dashboard;