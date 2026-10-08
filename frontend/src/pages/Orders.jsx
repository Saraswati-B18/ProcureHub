import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Eye,
  RefreshCw,
  Package,
  UserCheck,
  CreditCard,
  CalendarDays,
  X
} from "lucide-react";
import axios from "axios";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] =
    useState(false);
  const [detailsError, setDetailsError] =
    useState("");

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setErrorMessage("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/purchase-requests/orders?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        }
      );

      setOrders(
        response.data.orders || []
      );

    } catch (error) {
      console.error(
        "Fetch employee orders error:",
        error
      );

      if (showLoader) {
        setErrorMessage(
          error.response?.data?.message ||
          "Failed to load your orders."
        );
      }

    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // INITIAL FETCH + REAL-TIME REFRESH
  // =====================================================

  useEffect(() => {
    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return orders;
    }

    return orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase() ===
        statusFilter.toLowerCase()
    );
  }, [
    orders,
    statusFilter
  ]);

  // =====================================================
  // VIEW ORDER DETAILS
  // =====================================================

  const handleViewOrder = async (order) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedOrder(null);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/purchase-requests/orders/${order.id}?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        }
      );

      setSelectedOrder(
        response.data.order
      );

    } catch (error) {
      console.error(
        "Fetch order details error:",
        error
      );

      setDetailsError(
        error.response?.data?.message ||
        "Failed to load order details."
      );

    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getOrderStatusInfo = (status) => {
    switch (status) {
        case "PENDING":
            return {
                title: "Order placed",
                message: "Waiting for supplier to accept the order."
            };

        case "ACCEPTED":
            return {
                title: "Order accepted",
                message: "Supplier has accepted your order and will begin processing it."
            };

        case "PROCESSING":
            return {
                title: "Order is being processed",
                message: "Supplier is preparing your order."
            };

        case "PACKED":
            return {
                title: "Order packed",
                message: "Your order has been packed and is awaiting dispatch."
            };

        case "SHIPPED":
            return {
                title: "Order shipped",
                message: "Your order has been shipped and is in transit."
            };

        case "DELIVERED":
            return {
                title: "Delivered",
                message: "Your order was delivered."
            };

        case "COMPLETED":
            return {
                title: "Order completed",
                message: "This order has been completed."
            };

        case "CANCELLED":
            return {
                title: "Order cancelled",
                message: "Your order has been cancelled."
            };

        default:
            return {
                title: "Order status",
                message: "Your order status has been updated."
            };
    }
};

  const getBadgeVariant = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "success";

      case "PROCESSING":
        return "warning";

      case "PACKED":
        return "warning";

      case "SHIPPED":
        return "info";

      case "DELIVERED":
        return "success";

      case "COMPLETED":
        return "success";

      case "CANCELLED":
        return "danger";

      case "PENDING":
      default:
        return "warning";
    }
  };

  return (
    <div className="orders-page">

      {/* =================================================
          PAGE HEADING
      ================================================= */}

      <div className="page-heading">
        <div>
          <h1>My Orders</h1>

          <p>
            Track your purchase orders and delivery
            status.
          </p>
        </div>
      </div>

      {/* =================================================
          ORDERS CARD
      ================================================= */}

      <Card>

        <div className="orders-header">

          <div>
            <h2>Orders</h2>

            <span>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                fetchOrders(true)
              }
              title="Refresh orders"
              style={{
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border:
                  "1px solid #dbe2ea",
                borderRadius: "8px",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={17} />
            </button>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="packed">
                Packed
              </option>

              <option value="shipped">
                Shipped
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

          </div>

        </div>

        {errorMessage && (
          <div
            style={{
              padding: "14px 20px",
              color: "#b91c1c",
              background: "#fef2f2",
              borderBottom:
                "1px solid #fecaca"
            }}
          >
            {errorMessage}
          </div>
        )}

        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="7">
                    <div className="orders-empty">

                      <Truck size={36} />

                      <h3>
                        Loading orders...
                      </h3>

                      <p>
                        Fetching your purchase
                        orders.
                      </p>

                    </div>
                  </td>
                </tr>

              ) : filteredOrders.length === 0 ? (

                <tr>
                  <td colSpan="7">

                    <div className="orders-empty">

                      <Truck size={36} />

                      <h3>
                        No orders yet
                      </h3>

                      <p>
                        Your purchase orders will
                        appear here after your
                        purchase request is approved
                        and processed by Finance.
                      </p>

                    </div>

                  </td>
                </tr>

              ) : (

                filteredOrders.map((order) => (

                  <tr key={order.id}>

                    <td>
                      <strong>
                        {order.po_number ||
                          `PO-${order.id}`}
                      </strong>
                    </td>

                    <td>
                      {formatDate(
                        order.created_at
                      )}
                    </td>

                    <td>
                      {order.supplier_name ||
                        "-"}
                    </td>

                    <td>
                      {formatAmount(
                        order.total_amount
                      )}
                    </td>

                    <td>
                      {formatStatus(
                        order.payment_method
                      )}
                    </td>

                    <td>
                      <Badge
                        variant={getBadgeVariant(
                          order.status
                        )}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </Badge>
                    </td>

                    <td>

                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() =>
                          handleViewOrder(
                            order
                          )
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

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {(detailsLoading ||
        detailsError ||
        selectedOrder) && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "24px"
          }}
          onClick={() => {
            if (!detailsLoading) {
              setSelectedOrder(null);
              setDetailsError("");
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "780px",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow:
                "0 24px 70px rgba(0,0,0,0.20)"
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              style={{
                padding:
                  "24px 28px 20px",
                borderBottom:
                  "1px solid #e5e7eb",
                display: "flex",
                alignItems: "flex-start",
                justifyContent:
                  "space-between"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "#172033"
                  }}
                >
                  Order Details
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#64748b",
                    fontSize: "14px"
                  }}
                >
                  {detailsLoading
                    ? "Loading..."
                    : selectedOrder?.po_number ||
                      ""}
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailsError("");
                }}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  cursor: "pointer"
                }}
              >
                <X size={19} />
              </button>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {detailsLoading && (

              <div
                style={{
                  padding: "70px 30px",
                  textAlign: "center"
                }}
              >

                <Truck
                  size={38}
                  style={{
                    color: "#94a3b8"
                  }}
                />

                <h3>
                  Loading order details...
                </h3>

                <p
                  style={{
                    color: "#64748b"
                  }}
                >
                  Please wait.
                </p>

              </div>

            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!detailsLoading &&
              detailsError && (

                <div
                  style={{
                    padding: "30px",
                    color: "#b91c1c"
                  }}
                >
                  {detailsError}
                </div>

              )}

            {/* =================================================
                DETAILS
            ================================================= */}

            {!detailsLoading &&
              !detailsError &&
              selectedOrder && (

                <div
                  style={{
                    padding: "26px 28px"
                  }}
                >

                  {/* =================================================
                      ORDER INFORMATION
                  ================================================= */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "18px"
                    }}
                  >
                    <Package
                      size={19}
                      style={{
                        color: "#2563eb"
                      }}
                    />

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "#172033"
                      }}
                    >
                      Order Information
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "20px",
                      paddingBottom:
                        "26px",
                      borderBottom:
                        "1px solid #e5e7eb"
                    }}
                  >

                    <div>
                      <small>Order ID</small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.po_number}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Purchase Request
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.request_number ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <small>Supplier</small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.supplier_name ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <small>Order Date</small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {formatDate(
                          selectedOrder.created_at
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>Status</small>

                      <div
                        style={{
                          marginTop:
                            "7px"
                        }}
                      >
                        <Badge
                          variant={getBadgeVariant(
                            selectedOrder.status
                          )}
                        >
                          {formatStatus(
                            selectedOrder.status
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <small>
                        Payment Method
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {formatStatus(
                          selectedOrder.payment_method
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* =================================================
                      APPROVAL + PAYMENT
                  ================================================= */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "18px",
                      marginTop: "26px",
                      marginBottom: "26px"
                    }}
                  >

                    <div
                      style={{
                        padding: "18px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "12px",
                        background:
                          "#f8fafc"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "9px",
                          marginBottom:
                            "14px"
                        }}
                      >
                        <UserCheck
                          size={18}
                          style={{
                            color:
                              "#2563eb"
                          }}
                        />

                        <strong>
                          Approval
                        </strong>
                      </div>

                      <small>
                        Approved By
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.approved_by_name ||
                          "Not approved"}
                      </strong>

                      <small
                        style={{
                          display:
                            "block",
                          marginTop:
                            "14px"
                        }}
                      >
                        Approved Date
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.approved_at
                          ? formatDateTime(
                              selectedOrder.approved_at
                            )
                          : "-"}
                      </strong>

                    </div>

                    <div
                      style={{
                        padding: "18px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "12px",
                        background:
                          "#f8fafc"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "9px",
                          marginBottom:
                            "14px"
                        }}
                      >
                        <CreditCard
                          size={18}
                          style={{
                            color:
                              "#2563eb"
                          }}
                        />

                        <strong>
                          Payment
                        </strong>
                      </div>

                      <small>
                        Payment Processed By
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.payment
                          ?.recorded_by_name ||
                          "-"}
                      </strong>

                      <small
                        style={{
                          display:
                            "block",
                          marginTop:
                            "14px"
                        }}
                      >
                        Payment Date
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px"
                        }}
                      >
                        {selectedOrder.payment
                          ?.payment_date
                          ? formatDateTime(
                              selectedOrder.payment
                                .payment_date
                            )
                          : "-"}
                      </strong>

                    </div>

                  </div>

                  {/* =================================================
                      PRODUCTS
                  ================================================= */}

                  <div
                    style={{
                      marginTop: "6px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginBottom:
                          "16px"
                      }}
                    >
                      <Package
                        size={19}
                        style={{
                          color: "#2563eb"
                        }}
                      />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px"
                        }}
                      >
                        Products
                      </h3>

                    </div>

                    <div
                      style={{
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "10px",
                        overflow:
                          "hidden"
                      }}
                    >

                      <table
                        style={{
                          width: "100%",
                          borderCollapse:
                            "collapse"
                        }}
                      >

                        <thead>
                          <tr
                            style={{
                              background:
                                "#f8fafc"
                            }}
                          >
                            <th
                              style={{
                                textAlign:
                                  "left",
                                padding:
                                  "12px 14px",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b"
                              }}
                            >
                              Product
                            </th>

                            <th
                              style={{
                                textAlign:
                                  "center",
                                padding:
                                  "12px 10px",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b"
                              }}
                            >
                              Qty
                            </th>

                            <th
                              style={{
                                textAlign:
                                  "right",
                                padding:
                                  "12px 14px",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b"
                              }}
                            >
                              Unit Price
                            </th>

                            <th
                              style={{
                                textAlign:
                                  "right",
                                padding:
                                  "12px 14px",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b"
                              }}
                            >
                              Total
                            </th>
                          </tr>
                        </thead>

                        <tbody>

                          {(selectedOrder.items ||
                            []).map(
                            (item) => (

                              <tr
                                key={
                                  item.id
                                }
                                style={{
                                  borderTop:
                                    "1px solid #e5e7eb"
                                }}
                              >

                                <td
                                  style={{
                                    padding:
                                      "14px"
                                  }}
                                >
                                  <strong>
                                    {
                                      item.product_name
                                    }
                                  </strong>

                                  {item.unit && (
                                    <small
                                      style={{
                                        display:
                                          "block",
                                        marginTop:
                                          "3px",
                                        color:
                                          "#64748b"
                                      }}
                                    >
                                      Unit:{" "}
                                      {item.unit}
                                    </small>
                                  )}
                                </td>

                                <td
                                  style={{
                                    textAlign:
                                      "center",
                                    padding:
                                      "14px"
                                  }}
                                >
                                  {
                                    item.quantity
                                  }
                                </td>

                                <td
                                  style={{
                                    textAlign:
                                      "right",
                                    padding:
                                      "14px"
                                  }}
                                >
                                  {formatAmount(
                                    item.unit_price
                                  )}
                                </td>

                                <td
                                  style={{
                                    textAlign:
                                      "right",
                                    padding:
                                      "14px",
                                    fontWeight:
                                      "600"
                                  }}
                                >
                                  {formatAmount(
                                    item.total_price
                                  )}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                  {/* =================================================
                      TOTALS
                  ================================================= */}

                  <div
                    style={{
                      marginTop: "18px",
                      marginLeft:
                        "auto",
                      width: "280px"
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        padding:
                          "6px 0",
                        color:
                          "#64748b"
                      }}
                    >
                      <span>
                        Subtotal
                      </span>

                      <span>
                        {formatAmount(
                          selectedOrder.subtotal
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        padding:
                          "6px 0",
                        color:
                          "#64748b"
                      }}
                    >
                      <span>
                        GST
                      </span>

                      <span>
                        {formatAmount(
                          selectedOrder.gst
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        padding:
                          "12px 0 0",
                        marginTop:
                          "6px",
                        borderTop:
                          "1px solid #e2e8f0",
                        fontWeight:
                          "700",
                        fontSize:
                          "16px"
                      }}
                    >
                      <span>
                        Order Total
                      </span>

                      <span>
                        {formatAmount(
                          selectedOrder.total_amount
                        )}
                      </span>
                    </div>

                  </div>

{/* =================================================
    ORDER STATUS
================================================= */}

<div
  style={{
    marginTop: "28px",
    padding: "18px",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    background: "#eff6ff"
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "9px",
      marginBottom: "10px"
    }}
  >
    <Truck
      size={19}
      style={{
        color: "#2563eb"
      }}
    />

    <strong>
      Order Status
    </strong>
  </div>

  <div
    style={{
      fontSize: "16px",
      fontWeight: "600",
      color: "#172033",
      marginBottom: "5px"
    }}
  >
    {getOrderStatusInfo(
      selectedOrder.status
    ).title}
  </div>

  <div
    style={{
      color: "#64748b",
      lineHeight: "1.5"
    }}
  >
    {getOrderStatusInfo(
      selectedOrder.status
    ).message}
  </div>

  {selectedOrder.status !== "DELIVERED" &&
    selectedOrder.status !== "COMPLETED" &&
    selectedOrder.status !== "CANCELLED" && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid #dbeafe"
        }}
      >
        <CalendarDays
          size={18}
          style={{
            color: "#2563eb"
          }}
        />

        <div>
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
              marginBottom: "2px"
            }}
          >
            Expected delivery
          </div>

          <div
            style={{
              fontWeight: "600",
              color: "#172033"
            }}
          >
            {selectedOrder.status === "SHIPPED" &&
            selectedOrder.expected_delivery_date
              ? formatDate(
                  selectedOrder.expected_delivery_date
                )
              : "Not scheduled yet"}
          </div>
        </div>
      </div>
    )}
</div>

                </div>

              )}

          </div>

        </div>

      )}

    </div>
  );
};

export default Orders;