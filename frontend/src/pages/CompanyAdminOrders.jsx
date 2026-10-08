import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Eye,
  RefreshCw,
  Package,
  Building2,
  User,
  CreditCard,
  CalendarDays,
  X,
  Search
} from "lucide-react";
import axios from "axios";

import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

import "./CompanyAdminOrders.css";

const CompanyAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // =====================================================
  // FETCH COMPANY ORDERS
  // =====================================================

  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/purchase-requests/company-admin/orders?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        }
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Fetch company admin orders error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load company orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchOrders(true);
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // =====================================================
  // FORMAT PAYMENT METHOD
  // =====================================================

  const formatPaymentMethod = (payment) => {
    if (!payment) {
      return "-";
    }

    const paymentMap = {
      PREPAID: "Prepaid",
      COD: "COD",
      PARTIAL: "Partial",
      NET15: "Net 15",
      NET30: "Net 30"
    };

    return (
      paymentMap[payment] ||
      payment
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    if (status === "SHIPPED") {
      return "In Transit";
    }

    return status
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";

      case "ACCEPTED":
      case "PROCESSING":
      case "PACKED":
        return "info";

      case "SHIPPED":
        return "primary";

      case "DELIVERED":
      case "COMPLETED":
        return "success";

      case "CANCELLED":
        return "danger";

      default:
        return "default";
    }
  };

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch =
        statusFilter === "all" ||
        String(order.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      if (!statusMatch) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      return [
        order.po_number,
        order.request_number,
        order.employee_name,
        order.supplier_name,
        order.branch_name
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [orders, search, statusFilter]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) =>
      !["DELIVERED", "COMPLETED", "CANCELLED"].includes(
        order.status
      )
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

const handleViewOrder = async (order) => {
    try {
        setDetailsLoading(true);
        setDetailsError("");
        setSelectedOrder(null);

        const token = localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:5000/api/purchase-requests/company-admin/orders/${order.id}?t=${Date.now()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache"
                }
            }
        );

        const apiOrder = response.data?.order;

        if (!apiOrder) {
            throw new Error("Order details were not returned.");
        }

        const orderItems = Array.isArray(apiOrder.items)
            ? apiOrder.items
            : [];

        console.log(
            "Company Admin Order Details:",
            apiOrder
        );

        console.log(
            "Company Admin Order Items:",
            orderItems
        );

        const subtotal = orderItems.reduce(
            (sum, item) =>
                sum + Number(item.total_price || 0),
            0
        );

        const totalAmount = Number(
            apiOrder.total_amount || 0
        );

        const gst =
            apiOrder.gst !== undefined &&
            apiOrder.gst !== null
                ? Number(apiOrder.gst)
                : totalAmount - subtotal;

        setSelectedOrder({
            ...apiOrder,

            items: orderItems,

            subtotal: Number(
                subtotal.toFixed(2)
            ),

            gst: Number(
                gst.toFixed(2)
            ),

            total_amount: Number(
                totalAmount.toFixed(2)
            )
        });

    } catch (error) {
        console.error(
            "Fetch company admin order details error:",
            error
        );

        setDetailsError(
            error.response?.data?.message ||
            error.message ||
            "Failed to load order details."
        );

    } finally {
        setDetailsLoading(false);
    }
};

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeOrderView = () => {
    if (detailsLoading) {
      return;
    }

    setSelectedOrder(null);
    setDetailsError("");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="company-admin-orders-page">
        <div className="company-admin-orders-loading">
          <div className="company-admin-orders-spinner"></div>
          <p>Loading company orders...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="company-admin-orders-page">

      {/* PAGE HEADER */}

      <div className="company-admin-orders-header">
        <div>
          <h1>Orders</h1>
          <p>
            View purchase orders across all branches of your
            company.
          </p>
        </div>

        <Button
          onClick={() => fetchOrders(false)}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "company-admin-orders-spin"
                : ""
            }
          />
          Refresh
        </Button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="company-admin-order-summary">

        <Card>
          <div className="company-admin-summary-card">
            <div className="company-admin-summary-icon blue">
              <Package size={21} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{totalOrders}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="company-admin-summary-card">
            <div className="company-admin-summary-icon orange">
              <Truck size={21} />
            </div>

            <div>
              <span>Active Orders</span>
              <strong>{activeOrders}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="company-admin-summary-card">
            <div className="company-admin-summary-icon green">
              <Truck size={21} />
            </div>

            <div>
              <span>Delivered</span>
              <strong>{deliveredOrders}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <div className="company-admin-summary-card">
            <div className="company-admin-summary-icon red">
              <X size={21} />
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{cancelledOrders}</strong>
            </div>
          </div>
        </Card>

      </div>

      {/* FILTERS */}

      <Card>
        <div className="company-admin-order-filters">

          <div className="company-admin-order-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search PO, employee, supplier or branch..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

        </div>
      </Card>

      {/* ORDERS TABLE */}

      <Card>
        <div className="company-admin-orders-table-wrapper">

          <table className="company-admin-orders-table">

            <thead>
              <tr>
                <th>PO Number</th>
                <th>Branch</th>
                <th>Employee</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="company-admin-orders-empty"
                  >
                    <Package size={38} />

                    <strong>No orders found</strong>

                    <span>
                      There are no orders matching your
                      current filters.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>

                    <td>
                      <strong>
                        {order.po_number || "-"}
                      </strong>
                    </td>

                    <td>
                      <div className="company-admin-table-person">
                        <Building2 size={15} />
                        <span>
                          {order.branch_name || "-"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {order.employee_name || "-"}
                    </td>

                    <td>
                      {order.supplier_name || "-"}
                    </td>

                    <td>
                      {formatDate(order.created_at)}
                    </td>

                    <td>
                      <strong>
                        {formatAmount(order.total_amount)}
                      </strong>
                    </td>

                    <td>
                      {formatPaymentMethod(
                        order.payment_method
                      )}
                    </td>

                    <td>
                      <Badge
                        variant={getStatusVariant(
                          order.status
                        )}
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </td>

                    <td>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() =>
                          handleViewOrder(order)
                        }
                      >
                        <Eye size={15} />
                        View
                      </Button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </Card>

      {/* ORDER DETAILS MODAL */}

      {(detailsLoading || detailsError || selectedOrder) && (
        <div
          className="company-admin-order-modal-overlay"
          onClick={closeOrderView}
        >

          <div
            className="company-admin-order-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {detailsLoading && (
              <div className="company-admin-modal-loading">
                <div className="company-admin-orders-spinner"></div>
                <p>Loading order details...</p>
              </div>
            )}

            {detailsError && !detailsLoading && (
              <div className="company-admin-modal-error">
                <h3>Unable to load order</h3>
                <p>{detailsError}</p>

                <Button
                  onClick={closeOrderView}
                >
                  Close
                </Button>
              </div>
            )}

            {selectedOrder && !detailsLoading && (
              <>
                {/* MODAL HEADER */}

                <div className="company-admin-order-modal-header">

                  <div>
                    <h2>Order Details</h2>

                    <p>
                      {selectedOrder.po_number}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeOrderView}
                    className="company-admin-order-modal-close"
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="company-admin-order-modal-content">

                  {/* ORDER INFORMATION */}

                  <div className="company-admin-detail-section">

                    <h3>
                      <Package size={18} />
                      Order Information
                    </h3>

                    <div className="company-admin-detail-grid">

                      <div>
                        <span>PO Number</span>
                        <strong>
                          {selectedOrder.po_number || "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Request Number</span>
                        <strong>
                          {selectedOrder.request_number || "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Order Date</span>
                        <strong>
                          {formatDate(
                            selectedOrder.created_at
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>
                          <Badge
                            variant={getStatusVariant(
                              selectedOrder.status
                            )}
                          >
                            {formatStatus(
                              selectedOrder.status
                            )}
                          </Badge>
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* COMPANY / BRANCH */}

                  <div className="company-admin-detail-section">

                    <h3>
                      <Building2 size={18} />
                      Branch Information
                    </h3>

                    <div className="company-admin-detail-grid">

                      <div>
                        <span>Branch</span>
                        <strong>
                          {selectedOrder.branch_name || "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Branch ID</span>
                        <strong>
                          {selectedOrder.branch_id || "-"}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* REQUESTER / SUPPLIER */}

                  <div className="company-admin-detail-section">

                    <h3>
                      <User size={18} />
                      People & Supplier
                    </h3>

                    <div className="company-admin-detail-grid">

                      <div>
                        <span>Employee</span>
                        <strong>
                          {selectedOrder.employee_name || "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Employee Email</span>
                        <strong>
                          {selectedOrder.employee_email || "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Supplier</span>
                        <strong>
                          {selectedOrder.supplier_name || "-"}
                        </strong>
                      </div>

                    </div>

                  </div>

{/* PAYMENT */}

<div className="company-admin-detail-section">

    <h3>
        <CreditCard size={18} />
        Payment
    </h3>

    <div className="company-admin-detail-grid">

        <div>
            <span>Payment Method</span>

            <strong>
                {formatPaymentMethod(
                    selectedOrder.payment_method
                )}
            </strong>
        </div>

        <div>
            <span>Payment Amount</span>

            <strong>
                {selectedOrder.payment
                    ? formatAmount(
                        selectedOrder.payment.amount
                    )
                    : "-"}
            </strong>
        </div>

        <div>
            <span>Payment Date</span>

            <strong>
                {selectedOrder.payment?.payment_date
                    ? formatDate(
                        selectedOrder.payment.payment_date
                    )
                    : "-"}
            </strong>
        </div>

    </div>

</div>

{/* PRODUCTS */}

<div className="company-admin-detail-section">

    <h3>
        <Package size={18} />
        Products
    </h3>

    {selectedOrder.items &&
    selectedOrder.items.length > 0 ? (

        <div className="company-admin-items-table-wrapper">

            <table className="company-admin-items-table">

                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>

                    {selectedOrder.items.map(
                        (item) => (

                            <tr key={item.id}>

                                <td>
                                    <strong>
                                        {item.product_name ||
                                            "Product"}
                                    </strong>

                                    {item.unit && (
                                        <span>
                                            {item.unit}
                                        </span>
                                    )}
                                </td>

                                <td>
                                    {item.quantity}
                                </td>

                                <td>
                                    {formatAmount(
                                        item.unit_price
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        {formatAmount(
                                            item.total_price
                                        )}
                                    </strong>
                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>

    ) : (

        <div className="company-admin-no-products">

            <Package size={20} />

            <span>
                No products found for this order.
            </span>

        </div>

    )}

    <div className="company-admin-order-totals">

        <div>
            <span>Subtotal</span>

            <strong>
                {formatAmount(
                    selectedOrder.subtotal
                )}
            </strong>
        </div>

        <div>
            <span>GST</span>

            <strong>
                {formatAmount(
                    selectedOrder.gst
                )}
            </strong>
        </div>

        <div className="company-admin-grand-total">

            <span>Order Total</span>

            <strong>
                {formatAmount(
                    selectedOrder.total_amount
                )}
            </strong>

        </div>

    </div>

</div>

                  {/* FOOTER */}

                  <div className="company-admin-order-modal-footer">

                    <div>
                      <CalendarDays size={17} />

                      <span>
                        Last Status Update:
                      </span>

                      <strong>
                        {selectedOrder.status_updated_at
                          ? formatDate(
                              selectedOrder.status_updated_at
                            )
                          : "-"}
                      </strong>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={closeOrderView}
                    >
                      Close
                    </Button>

                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyAdminOrders;