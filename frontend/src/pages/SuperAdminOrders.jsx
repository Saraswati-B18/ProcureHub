import { useState } from "react";
import {
  ClipboardList,
  Clock,
  Loader,
  CheckCircle,
  Search,
  MoreVertical
} from "lucide-react";

import Card from "../components/Card";
import Badge from "../components/Badge";
import "./SuperAdminOrders.css";

const SuperAdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Orders will come from the backend later.
  const orders = [];

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(search) ||
      order.company?.toLowerCase().includes(search) ||
      order.supplier?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "PROCESSING"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED"
  ).length;

  return (
    <div className="super-admin-orders-page">

      {/* Header */}
      <div className="super-admin-orders-header">
        <div>
          <h1>Orders</h1>
          <p>
            View and monitor purchase orders across the ProcureHub
            platform.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="super-admin-orders-summary">

        <Card className="super-admin-orders-summary-card">
          <div className="super-admin-orders-card-content">
            <div>
              <p>Total Orders</p>
              <h2>{totalOrders}</h2>
            </div>

            <div className="super-admin-orders-icon blue">
              <ClipboardList size={22} />
            </div>
          </div>
        </Card>

        <Card className="super-admin-orders-summary-card">
          <div className="super-admin-orders-card-content">
            <div>
              <p>Pending Orders</p>
              <h2>{pendingOrders}</h2>
            </div>

            <div className="super-admin-orders-icon orange">
              <Clock size={22} />
            </div>
          </div>
        </Card>

        <Card className="super-admin-orders-summary-card">
          <div className="super-admin-orders-card-content">
            <div>
              <p>Processing Orders</p>
              <h2>{processingOrders}</h2>
            </div>

            <div className="super-admin-orders-icon purple">
              <Loader size={22} />
            </div>
          </div>
        </Card>

        <Card className="super-admin-orders-summary-card">
          <div className="super-admin-orders-card-content">
            <div>
              <p>Completed Orders</p>
              <h2>{completedOrders}</h2>
            </div>

            <div className="super-admin-orders-icon green">
              <CheckCircle size={22} />
            </div>
          </div>
        </Card>

      </div>

      {/* Orders List */}
      <Card className="super-admin-orders-table-card">

        <div className="super-admin-orders-section-header">
          <div>
            <h2>Purchase Orders</h2>
            <p>
              Monitor purchase orders created across the platform.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="super-admin-orders-toolbar">

          <div className="super-admin-orders-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search order, company or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="super-admin-orders-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">
              Out for Delivery
            </option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

        </div>

        {/* Table */}
        <div className="super-admin-orders-table-wrapper">

          <table className="super-admin-orders-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Company</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>

                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>

                    <td>{order.company}</td>
                    <td>{order.supplier}</td>
                    <td>{order.orderDate}</td>
                    <td>₹{order.amount}</td>

                    <td>
                      <Badge variant="success">
                        {order.status}
                      </Badge>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="super-admin-orders-action"
                        aria-label={`Actions for ${order.orderNumber}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="super-admin-orders-empty-cell"
                  >
                    <div className="super-admin-orders-empty">

                      <ClipboardList size={34} />

                      <h3>No orders found</h3>

                      <p>
                        Purchase orders will appear here once they are
                        created.
                      </p>

                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* Information */}
      <Card className="super-admin-orders-info">

        <div className="super-admin-orders-info-icon">
          <ClipboardList size={20} />
        </div>

        <div>
          <h3>About Purchase Orders</h3>

          <p>
            Purchase orders are automatically created when a manager
            approves a purchase request. The Super Admin can monitor
            orders across all companies and suppliers.
          </p>
        </div>

      </Card>

    </div>
  );
};

export default SuperAdminOrders;