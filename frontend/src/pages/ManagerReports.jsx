import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  BarChart3,
  ClipboardList,
  CheckCircle,
  XCircle,
  ShoppingBag,
  TrendingUp,
  Clock,
  PackageCheck
} from "lucide-react";

import Card from "../components/Card";

import "./ManagerReports.css";

const ManagerReports = () => {
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDateRange = (selectedPeriod) => {
    const now = new Date();
    const start = new Date(now);

    if (selectedPeriod === "week") {
      start.setDate(now.getDate() - 7);
    } else if (selectedPeriod === "month") {
      start.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === "quarter") {
      start.setMonth(now.getMonth() - 3);
    } else if (selectedPeriod === "year") {
      start.setFullYear(now.getFullYear() - 1);
    }

    return { start, end: now };
  };

  const isWithinPeriod = (date, selectedPeriod) => {
    if (!date) return false;

    const { start, end } = getDateRange(selectedPeriod);
    const value = new Date(date);

    return value >= start && value <= end;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);

      setError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [pendingResponse, approvedResponse, rejectedResponse, ordersResponse] =
        await Promise.all([
          axios.get("/api/purchase-requests/manager/pending", {
            headers,
            params: { t: Date.now() }
          }),
          axios.get("/api/purchase-requests/manager/approved", {
            headers,
            params: { t: Date.now() }
          }),
          axios.get("/api/purchase-requests/manager/rejected", {
            headers,
            params: { t: Date.now() }
          }),
          axios.get("/api/purchase-requests/manager/orders", {
            headers,
            params: { t: Date.now() }
          })
        ]);

      const pending = Array.isArray(pendingResponse.data?.requests)
        ? pendingResponse.data.requests
        : [];

      const approved = Array.isArray(approvedResponse.data?.requests)
        ? approvedResponse.data.requests
        : [];

      const rejected = Array.isArray(rejectedResponse.data?.requests)
        ? rejectedResponse.data.requests
        : [];

      const managerOrders = Array.isArray(ordersResponse.data?.orders)
        ? ordersResponse.data.orders
        : [];

      setRequests([...pending, ...approved, ...rejected]);
      setOrders(managerOrders);
    } catch (err) {
      console.error("Failed to fetch manager reports:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load report data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const date = request.approved_at || request.created_at;
      return isWithinPeriod(date, period);
    });
  }, [requests, period]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      isWithinPeriod(order.created_at, period)
    );
  }, [orders, period]);

  const reportStats = useMemo(() => {
    const totalRequests = filteredRequests.length;

    const pending = filteredRequests.filter(
      (request) => request.status === "PENDING"
    ).length;

    const approved = filteredRequests.filter(
      (request) => request.status === "APPROVED"
    );

    const rejected = filteredRequests.filter(
      (request) => request.status === "REJECTED"
    );

    const approvedValue = approved.reduce(
      (total, request) => total + Number(request.total_amount || 0),
      0
    );

    const deliveredOrders = filteredOrders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const activeOrders = filteredOrders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    ).length;

    return {
      totalRequests,
      pending,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalOrders: filteredOrders.length,
      activeOrders,
      deliveredOrders,
      approvedValue
    };
  }, [filteredRequests, filteredOrders]);

  const requestChart = [
    {
      label: "Pending",
      value: reportStats.pending,
      className: "pending"
    },
    {
      label: "Approved",
      value: reportStats.approvedCount,
      className: "approved"
    },
    {
      label: "Rejected",
      value: reportStats.rejectedCount,
      className: "rejected"
    }
  ];

  const orderStatuses = [
    "PENDING",
    "ACCEPTED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
  ];

  const orderChart = orderStatuses.map((status) => ({
    label: status
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: filteredOrders.filter((order) => order.status === status).length
  }));

  const maxRequestValue = Math.max(
    ...requestChart.map((item) => item.value),
    1
  );

  const maxOrderValue = Math.max(
    ...orderChart.map((item) => item.value),
    1
  );

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const periodLabel = {
    week: "This Week",
    month: "This Month",
    quarter: "This Quarter",
    year: "This Year"
  }[period];

  return (
    <div className="manager-reports-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1>Reports</h1>
          <p>
            Analyze purchase requests, orders and procurement activity.
          </p>
        </div>

        <div className="manager-report-controls">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="manager-report-error">
          <XCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => fetchReports()}>
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="manager-report-stats">
        <Card>
          <div className="report-stat-card">
            <div className="report-stat-icon blue">
              <ClipboardList size={21} />
            </div>

            <div>
              <span>Total Requests</span>
              <strong>{loading ? "—" : reportStats.totalRequests}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="report-stat-card">
            <div className="report-stat-icon green">
              <CheckCircle size={21} />
            </div>

            <div>
              <span>Approved</span>
              <strong>{loading ? "—" : reportStats.approvedCount}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="report-stat-card">
            <div className="report-stat-icon red">
              <XCircle size={21} />
            </div>

            <div>
              <span>Rejected</span>
              <strong>{loading ? "—" : reportStats.rejectedCount}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="report-stat-card">
            <div className="report-stat-icon purple">
              <ShoppingBag size={21} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{loading ? "—" : reportStats.totalOrders}</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="manager-report-secondary-stats">
        <Card>
          <div className="report-mini-stat">
            <div className="report-mini-stat-icon orange">
              <Clock size={18} />
            </div>
            <div>
              <span>Pending Requests</span>
              <strong>{loading ? "—" : reportStats.pending}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="report-mini-stat">
            <div className="report-mini-stat-icon blue">
              <ShoppingBag size={18} />
            </div>
            <div>
              <span>Active Orders</span>
              <strong>{loading ? "—" : reportStats.activeOrders}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="report-mini-stat">
            <div className="report-mini-stat-icon green">
              <PackageCheck size={18} />
            </div>
            <div>
              <span>Delivered Orders</span>
              <strong>{loading ? "—" : reportStats.deliveredOrders}</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Purchase Value */}
      <Card className="purchase-value-card">
        <div className="report-card-header">
          <div>
            <h2>Purchase Value</h2>
            <p>
              Total value of approved purchase requests for {periodLabel.toLowerCase()}.
            </p>
          </div>

          <div className="report-header-icon">
            <TrendingUp size={19} />
          </div>
        </div>

        <div className="purchase-value">
          {loading ? "—" : formatAmount(reportStats.approvedValue)}
        </div>
      </Card>

      {/* Charts */}
      <div className="manager-report-grid">
        <Card>
          <div className="report-card-header">
            <div>
              <h2>Request Overview</h2>
              <p>
                Purchase request activity for {periodLabel.toLowerCase()}.
              </p>
            </div>

            <BarChart3 size={20} />
          </div>

          {loading ? (
            <div className="report-empty-chart">
              <div className="report-chart-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Loading report data</h3>
              <p>Please wait while the latest request information is loaded.</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="report-empty-chart">
              <div className="report-chart-icon">
                <BarChart3 size={32} />
              </div>
              <h3>No request data</h3>
              <p>
                No purchase requests were created or processed during the
                selected period.
              </p>
            </div>
          ) : (
            <div className="manager-report-bars">
              {requestChart.map((item) => (
                <div className="manager-report-bar-row" key={item.label}>
                  <div className="manager-report-bar-label">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>

                  <div className="manager-report-bar-track">
                    <div
                      className={`manager-report-bar-fill ${item.className}`}
                      style={{
                        width: `${(item.value / maxRequestValue) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="report-card-header">
            <div>
              <h2>Order Overview</h2>
              <p>
                Order activity and status distribution for the selected period.
              </p>
            </div>

            <ShoppingBag size={20} />
          </div>

          {loading ? (
            <div className="report-empty-chart">
              <div className="report-chart-icon">
                <ShoppingBag size={32} />
              </div>
              <h3>Loading report data</h3>
              <p>Please wait while the latest order information is loaded.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="report-empty-chart">
              <div className="report-chart-icon">
                <ShoppingBag size={32} />
              </div>
              <h3>No order data</h3>
              <p>
                No purchase orders were created during the selected period.
              </p>
            </div>
          ) : (
            <div className="manager-report-bars">
              {orderChart
                .filter((item) => item.value > 0)
                .map((item) => (
                  <div className="manager-report-bar-row" key={item.label}>
                    <div className="manager-report-bar-label">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>

                    <div className="manager-report-bar-track">
                      <div
                        className="manager-report-bar-fill"
                        style={{
                          width: `${(item.value / maxOrderValue) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Report Footer */}
      <div className="manager-report-footer">
        <BarChart3 size={16} />
        <span>
          Showing manager activity for <strong>{periodLabel}</strong>.
          Data is restricted to the manager's assigned company and branch.
        </span>
      </div>
    </div>
  );
};

export default ManagerReports;
