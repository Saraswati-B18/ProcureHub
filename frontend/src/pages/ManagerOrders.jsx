import { useEffect, useState } from "react";
import axios from "axios";

import {
  Truck,
  Eye,
  ShoppingBag,
  X
} from "lucide-react";

import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

import "./ManagerOrders.css";

const ManagerOrders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] =
    useState("all-payment");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // =====================================================
  // FETCH MANAGER ORDERS
  // =====================================================

  const fetchOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        "/api/purchase-requests/manager/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            t: Date.now()
          }
        }
      );

      setOrders(
        Array.isArray(response.data.orders)
          ? response.data.orders
          : []
      );

    } catch (err) {

      console.error(
        "Failed to fetch manager orders:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load orders."
      );

      setOrders([]);

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // FORMAT DATE
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

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount) => {

    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  };

  const calculateOrderSubtotal = (items) => {

    if (!Array.isArray(items)) {
        return 0;
    }

    return items.reduce(
        (sum, item) =>
            sum + Number(item.total_price || 0),
        0
    );
};

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  const formatStatus = (status) => {

    if (!status) {
      return "-";
    }

    return status
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );

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
        .replace(
          /\b\w/g,
          (char) => char.toUpperCase()
        )
    );

  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusVariant = (status) => {

    switch (status) {

      case "PENDING":
        return "warning";

      case "ACCEPTED":
        return "info";

      case "PROCESSING":
        return "info";

      case "PACKED":
        return "info";

      case "SHIPPED":
        return "primary";

      case "DELIVERED":
        return "success";

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

  const filteredOrders = orders.filter(
    (order) => {

      const statusMatch =
        statusFilter === "all" ||
        order.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      const paymentMatch =
        paymentFilter === "all-payment" ||
        order.payment_method?.toLowerCase() ===
          paymentFilter.toLowerCase();

      return statusMatch && paymentMatch;

    }
  );

  // =====================================================
  // SUMMARY COUNTS
  // =====================================================

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) =>
      ![
        "DELIVERED",
        "COMPLETED",
        "CANCELLED"
      ].includes(order.status)
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "DELIVERED"
  ).length;

  // =====================================================
  // VIEW ORDER
  // =====================================================

const handleViewOrder = async (order) => {

    try {

        const token =
            localStorage.getItem("token");

        const response = await axios.get(
            `/api/purchase-requests/manager/orders/${order.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setSelectedOrder(
            response.data.order
        );

    } catch (err) {

        console.error(
            "Failed to fetch order details:",
            err
        );

        setError(
            err.response?.data?.message ||
            "Failed to load order details."
        );

    }

};

  // =====================================================
  // CLOSE VIEW
  // =====================================================

  const closeOrderView = () => {

    setSelectedOrder(null);

  };

  return (
    <div className="manager-orders-page">

      {/* =================================================
          PAGE HEADING
      ================================================= */}

      <div className="page-heading">

        <div>

          <h1>
            Orders
          </h1>

          <p>
            View purchase orders created from approved requests.
          </p>

        </div>



      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="manager-order-summary">

        {/* TOTAL ORDERS */}

        <Card>

          <div className="manager-order-summary-card">

            <div className="manager-order-summary-icon blue">

              <ShoppingBag size={21} />

            </div>

            <div>

              <span>
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>

            </div>

          </div>

        </Card>


        {/* ACTIVE ORDERS */}

        <Card>

          <div className="manager-order-summary-card">

            <div className="manager-order-summary-icon orange">

              <Truck size={21} />

            </div>

            <div>

              <span>
                Active Orders
              </span>

              <strong>
                {activeOrders}
              </strong>

            </div>

          </div>

        </Card>


        {/* DELIVERED */}

        <Card>

          <div className="manager-order-summary-card">

            <div className="manager-order-summary-icon green">

              <Truck size={21} />

            </div>

            <div>

              <span>
                Delivered
              </span>

              <strong>
                {deliveredOrders}
              </strong>

            </div>

          </div>

        </Card>

      </div>


      {/* =================================================
          ORDERS TABLE
      ================================================= */}

      <Card>

        <div className="manager-orders-header">

          <div>

            <h2>
              Purchase Orders
            </h2>

            <p>
              Orders created after manager approval.
            </p>

          </div>


          {/* FILTERS */}

          <div className="manager-order-filters">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Status
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


            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(
                  e.target.value
                )
              }
            >

              <option value="all-payment">
                All Payments
              </option>

              <option value="prepaid">
                Prepaid
              </option>

              <option value="cod">
                COD
              </option>

              <option value="partial">
                Partial
              </option>

              <option value="net15">
                Net 15
              </option>

              <option value="net30">
                Net 30
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            style={{
              padding: "20px",
              color: "#dc2626",
              textAlign: "center"
            }}
          >
            {error}
          </div>

        )}


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="manager-orders-table-wrapper">

          <table className="manager-orders-table">

            <thead>

              <tr>

                <th>
                  Order ID
                </th>

                <th>
                  Order Date
                </th>

                <th>
                  Employee
                </th>

                <th>
                  Supplier
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "50px"
                    }}
                  >
                    Loading orders...

                  </td>

                </tr>

              ) : filteredOrders.length === 0 ? (

                <tr>

                  <td colSpan="8">

                    <div className="manager-orders-empty">

                      <div className="manager-orders-empty-icon">

                        <Truck size={34} />

                      </div>

                      <h3>
                        No orders available
                      </h3>

                      <p>
                        {orders.length === 0
                          ? "Purchase orders created from approved requests will appear here."
                          : "No orders match the selected filters."
                        }
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredOrders.map(
                  (order) => (

                    <tr
                      key={order.id}
                    >

                      <td>
                        {order.po_number}
                      </td>

                      <td>
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      <td>
                        {order.employee_name ||
                          "-"}
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
                          {formatStatus(
                            order.status
                          )}
                        </Badge>

                      </td>

                      <td>

                        <Button
                          onClick={() =>
                            handleViewOrder(
                              order
                            )
                          }
                        >
                          <Eye
                            size={16}
                          />

                          View
                        </Button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </Card>


      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {selectedOrder && (

        <div
          className="manager-order-modal-overlay"
          onClick={closeOrderView}
        >

          <div
            className="manager-order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="manager-order-modal-header">

              <div>

                <h2>
                  Order Details
                </h2>

                <p>
                  {selectedOrder.po_number}
                </p>

              </div>

              <button
                type="button"
                onClick={closeOrderView}
                className="manager-order-modal-close"
              >
                <X size={20} />
              </button>

            </div>


            <div className="manager-order-modal-content">

              <div className="manager-order-detail-grid">

                <div>
                  <span>
                    Order ID
                  </span>

                  <strong>
                    {selectedOrder.po_number}
                  </strong>
                </div>


                <div>
                  <span>
                    Request ID
                  </span>

                  <strong>
                    {selectedOrder.request_number ||
                      "-"}
                  </strong>
                </div>


                <div>
                  <span>
                    Employee
                  </span>

                  <strong>
                    {selectedOrder.employee_name ||
                      "-"}
                  </strong>
                </div>


                <div>
                  <span>
                    Supplier
                  </span>

                  <strong>
                    {selectedOrder.supplier_name ||
                      "-"}
                  </strong>
                </div>


                <div>
                  <span>
                    Order Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedOrder.created_at
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {formatPaymentMethod(
                      selectedOrder.payment_method
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {formatStatus(
                      selectedOrder.status
                    )}
                  </strong>
                </div>

              </div>


              {/* =================================================
                  ORDER ITEMS
              ================================================= */}

              <div className="manager-order-items-section">

                <div className="manager-order-items-header">

                  <h3>
                    Order Items
                  </h3>

                  <span>
                    {selectedOrder.items?.length || 0} items
                  </span>

                </div>


                {selectedOrder.items?.length > 0 ? (

                  <div className="manager-order-items-table-wrapper">

                    <table className="manager-order-items-table">

                      <thead>

                        <tr>

                          <th>
                            Product
                          </th>

                          <th>
                            Quantity
                          </th>

                          <th>
                            Unit Price
                          </th>

                          <th>
                            Total
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {selectedOrder.items.map(
                          (item) => (

                            <tr
                              key={item.id}
                            >

                              <td>
                                <strong>
                                  {item.product_name ||
                                    "-"}
                                </strong>
                              </td>


                              <td>
                                {item.quantity}

                                {item.unit
                                  ? ` ${item.unit}`
                                  : ""
                                }
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

                  <div className="manager-order-items-empty">

                    No items found for this order.

                  </div>

                )}


                {/* =================================================
                    ORDER SUMMARY
                ================================================= */}

                <div className="manager-order-summary-section">

                  <div className="manager-order-summary-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatAmount(
                        selectedOrder.subtotal ??
                        calculateOrderSubtotal(
                          selectedOrder.items
                        )
                      )}
                    </strong>

                  </div>


                  <div className="manager-order-summary-row">

                    <span>
                      GST
                    </span>

                    <strong>
                      {formatAmount(
                        selectedOrder.gst ??
                        (
                          Number(
                            selectedOrder.total_amount || 0
                          ) -
                          calculateOrderSubtotal(
                            selectedOrder.items
                          )
                        )
                      )}
                    </strong>

                  </div>


                  <div className="manager-order-summary-row total">

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      {formatAmount(
                        selectedOrder.total_amount
                      )}
                    </strong>

                  </div>

                </div>

              </div>


            </div>

          </div>

        </div>

      )}


    </div>
  );
};

export default ManagerOrders;