import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ClipboardList,
    Clock,
    Loader,
    CheckCircle,
    Search,
    Eye,
    RefreshCw,
    Phone,
    Mail,
    MapPin
} from "lucide-react";

import axios from "axios";

import "./SupplierOrders.css";


function SupplierOrders() {

    // ==========================================
    // STATES
    // ==========================================

    const [orders, setOrders] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [statusOrder, setStatusOrder] = useState(null);

    const [newStatus, setNewStatus] = useState("");

    const [updatingStatus, setUpdatingStatus] = useState(false);


    // ==========================================
    // FETCH ORDERS
    // ==========================================

    const fetchOrders = async () => {

        try {

            setLoading(true);

            setErrorMessage("");

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/suppliers/orders?t=${Date.now()}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
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
                "Failed to fetch supplier orders:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to load orders."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOAD ORDERS
    // ==========================================

    useEffect(() => {

        fetchOrders();

    }, []);


    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (status) => {

        if (!status) {

            return "Unknown";

        }

        return status
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );

    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

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


    // ==========================================
    // FORMAT AMOUNT
    // ==========================================

    const formatAmount = (amount) => {

        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    };


    // ==========================================
    // FILTER ORDERS
    // ==========================================

    const filteredOrders = useMemo(() => {

        const search =
            searchTerm
                .toLowerCase()
                .trim();

        return orders.filter((order) => {

            const matchesSearch =
                order.po_number
                    ?.toLowerCase()
                    .includes(search) ||

                order.company_name
                    ?.toLowerCase()
                    .includes(search) ||

                order.payment_method
                    ?.toLowerCase()
                    .includes(search) ||

                order.status
                    ?.toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                order.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        orders,
        searchTerm,
        statusFilter
    ]);


    // ==========================================
    // SUMMARY
    // ==========================================

    const totalOrders =
        orders.length;

    const newOrders =
        orders.filter(
            (order) =>
                order.status === "PENDING"
        ).length;

    const processingOrders =
        orders.filter(
            (order) =>
                order.status === "PROCESSING"
        ).length;

    const completedOrders =
        orders.filter(
            (order) =>
                order.status === "COMPLETED" ||
                order.status === "DELIVERED"
        ).length;


    // ==========================================
    // VIEW ORDER
    // ==========================================

    const handleViewOrder = (order) => {

        setSelectedOrder(order);

    };


    // ==========================================
    // OPEN STATUS MODAL
    // ==========================================

    const handleOpenStatusModal = (order) => {

        setStatusOrder(order);

        setNewStatus(
            order.status || "PENDING"
        );

    };


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    const handleUpdateStatus = async () => {

        if (!statusOrder || !newStatus) {

            return;

        }

        try {

            setUpdatingStatus(true);

            const token =
                localStorage.getItem("token");

            await axios.put(
                `http://localhost:5000/api/suppliers/orders/${statusOrder.id}/status`,
                {
                    status: newStatus
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            setOrders((currentOrders) =>
                currentOrders.map(
                    (order) =>
                        order.id ===
                        statusOrder.id
                            ? {
                                ...order,
                                status:
                                    newStatus
                            }
                            : order
                )
            );


            setStatusOrder(null);

            setNewStatus("");

            await fetchOrders();

        } catch (error) {

            console.error(
                "Failed to update order status:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to update order status."
            );

        } finally {

            setUpdatingStatus(false);

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="supplier-orders-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="supplier-orders-header">

                <div>

                    <h1>
                        Orders
                    </h1>

                    <p>
                        View and manage purchase orders received from customers.
                    </p>

                </div>

            </div>


            {/* ======================================
                SUMMARY CARDS
            ====================================== */}

            <div className="supplier-orders-summary">

                <div className="supplier-order-summary-card">

                    <div className="supplier-order-icon blue">

                        <ClipboardList size={22} />

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


                <div className="supplier-order-summary-card">

                    <div className="supplier-order-icon orange">

                        <Clock size={22} />

                    </div>

                    <div>

                        <span>
                            New Orders
                        </span>

                        <strong>
                            {newOrders}
                        </strong>

                    </div>

                </div>


                <div className="supplier-order-summary-card">

                    <div className="supplier-order-icon purple">

                        <Loader size={22} />

                    </div>

                    <div>

                        <span>
                            Processing Orders
                        </span>

                        <strong>
                            {processingOrders}
                        </strong>

                    </div>

                </div>


                <div className="supplier-order-summary-card">

                    <div className="supplier-order-icon green">

                        <CheckCircle size={22} />

                    </div>

                    <div>

                        <span>
                            Completed Orders
                        </span>

                        <strong>
                            {completedOrders}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================
                ORDERS CARD
            ====================================== */}

            <div className="supplier-orders-card">

                <div className="supplier-orders-toolbar">

                    <div>

                        <h2>
                            Purchase Orders
                        </h2>

                        <p>
                            Orders received from customer companies.
                        </p>

                    </div>


                    <div className="supplier-order-controls">

                        <div className="supplier-order-search">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            className="supplier-order-filter"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Orders
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="ACCEPTED">
                                Accepted
                            </option>

                            <option value="PROCESSING">
                                Processing
                            </option>

                            <option value="PACKED">
                                Packed
                            </option>

                            <option value="SHIPPED">
                                Shipped
                            </option>

                            <option value="DELIVERED">
                                Delivered
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>

                        </select>

                    </div>

                </div>


                {/* ERROR */}

                {errorMessage && (

                    <div
                        style={{
                            padding: "16px 20px",
                            color: "#b91c1c",
                            background: "#fef2f2",
                            borderBottom:
                                "1px solid #fecaca"
                        }}
                    >

                        {errorMessage}

                    </div>

                )}


                {/* TABLE */}

                <div className="supplier-order-table-wrapper">

                    <table className="supplier-order-table">

                        <thead>

                            <tr>

                                <th>
                                    Order ID
                                </th>

                                <th>
                                    Company
                                </th>

                                <th>
                                    Order Date
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Payment Method
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
                                        colSpan="7"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "50px"
                                        }}
                                    >
                                        Loading orders...
                                    </td>

                                </tr>

                            ) : filteredOrders.length === 0 ? (

                                <tr>

                                    <td colSpan="7">

                                        <div className="supplier-orders-empty">

                                            <div className="supplier-orders-empty-icon">

                                                <ClipboardList
                                                    size={30}
                                                />

                                            </div>

                                            <h3>
                                                No orders available
                                            </h3>

                                            <p>

                                                {orders.length === 0
                                                    ? "Purchase orders received from customers will appear here."
                                                    : "No orders match your search or selected filter."
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

                                                <strong>
                                                    {order.po_number ||
                                                        `PO-${order.id}`}
                                                </strong>

                                            </td>


                                            <td>
                                                {order.company_name ||
                                                    "-"}
                                            </td>


                                            <td>
                                                {formatDate(
                                                    order.created_at
                                                )}
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

                                                <span
                                                    className={`supplier-order-status ${String(
                                                        order.status ||
                                                        ""
                                                    ).toLowerCase()}`}
                                                >

                                                    {formatStatus(
                                                        order.status
                                                    )}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="supplier-order-actions">

                                                    <button
                                                        type="button"
                                                        className="supplier-order-action-btn view"
                                                        onClick={() =>
                                                            handleViewOrder(
                                                                order
                                                            )
                                                        }
                                                        title="View Order"
                                                    >

                                                        <Eye size={16} />

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="supplier-order-action-btn status"
                                                        onClick={() =>
                                                            handleOpenStatusModal(
                                                                order
                                                            )
                                                        }
                                                        title="Update Order Status"
                                                    >

                                                        <RefreshCw
                                                            size={16}
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ======================================
                VIEW ORDER MODAL
            ====================================== */}

            {selectedOrder && (

                <div
                    className="supplier-orders-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="supplier-orders-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="supplier-orders-modal-header">

                            <div>

                                <div className="supplier-orders-modal-title-row">

                                    <h2>
                                        Purchase Order
                                    </h2>

                                    {/* STATUS SHOWN ONLY HERE */}

                                    <span
                                        className={`supplier-orders-modal-status ${String(
                                            selectedOrder.status ||
                                            ""
                                        ).toLowerCase()}`}
                                    >

                                        {formatStatus(
                                            selectedOrder.status
                                        )}

                                    </span>

                                </div>


                                <p>
                                    {selectedOrder.po_number ||
                                        "-"}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="supplier-orders-modal-close"
                                onClick={() =>
                                    setSelectedOrder(
                                        null
                                    )
                                }
                                aria-label="Close"
                            >

                                ×

                            </button>

                        </div>


                        {/* BODY */}

                        <div className="supplier-orders-modal-body">


                            {/* ==================================
                                CUSTOMER DETAILS
                            ================================== */}

                            <div className="supplier-orders-detail-section">

                                <div className="supplier-orders-detail-section-title">

                                    Customer Details

                                </div>


                                <div className="supplier-orders-detail-grid">

                                    <div className="supplier-orders-detail-item">

                                        <span>
                                            Customer Company
                                        </span>

                                        <strong>
                                            {selectedOrder.company_name ||
                                                "-"}
                                        </strong>

                                    </div>


                                    <div className="supplier-orders-detail-item">

                                        <span>
                                            Branch
                                        </span>

                                        <strong>
                                            {selectedOrder.branch_name ||
                                                "-"}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                COMPANY CONTACT
                            ================================== */}

                            <div className="supplier-orders-detail-section">

                                <div className="supplier-orders-detail-section-title">

                                    Company Contact

                                </div>


                                <div className="supplier-orders-contact-grid">

                                    <div className="supplier-orders-contact-item">

                                        <Phone size={16} />

                                        <div>

                                            <span>
                                                Phone
                                            </span>

                                            <strong>

                                                {selectedOrder.company_phone ||
                                                    "Not available"}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="supplier-orders-contact-item">

                                        <Mail size={16} />

                                        <div>

                                            <span>
                                                Email
                                            </span>

                                            <strong>

                                                {selectedOrder.company_email ||
                                                    "Not available"}

                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                SHIPPING ADDRESS
                            ================================== */}

                            <div className="supplier-orders-detail-section">

                                <div className="supplier-orders-detail-section-title">

                                    Shipping Address

                                </div>


                                <div className="supplier-orders-address">

                                    <MapPin size={17} />


                                    <div>

                                        <strong>

                                            {selectedOrder.branch_name ||
                                                "Branch"}

                                        </strong>

                                        <p>

                                            {selectedOrder.branch_address ||
                                                ""}

                                            {selectedOrder.branch_address &&
                                                (
                                                    selectedOrder.branch_city ||
                                                    selectedOrder.branch_state
                                                )
                                                ? ", "
                                                : ""
                                            }

                                            {selectedOrder.branch_city ||
                                                ""}

                                            {selectedOrder.branch_city &&
                                                selectedOrder.branch_state
                                                ? ", "
                                                : ""
                                            }

                                            {selectedOrder.branch_state ||
                                                ""}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                ORDER INFORMATION
                            ================================== */}

                            <div className="supplier-orders-detail-section">

                                <div className="supplier-orders-detail-section-title">

                                    Order Information

                                </div>


                                <div className="supplier-orders-detail-grid">

                                    <div className="supplier-orders-detail-item">

                                        <span>
                                            Order ID
                                        </span>

                                        <strong>
                                            {selectedOrder.po_number ||
                                                "-"}
                                        </strong>

                                    </div>


                                    <div className="supplier-orders-detail-item">

                                        <span>
                                            Order Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedOrder.created_at
                                            )}
                                        </strong>

                                    </div>


                                    <div className="supplier-orders-detail-item">

                                        <span>
                                            Amount
                                        </span>

                                        <strong className="supplier-orders-amount">

                                            {formatAmount(
                                                selectedOrder.total_amount
                                            )}

                                        </strong>

                                    </div>


                                    <div className="supplier-orders-detail-item">

                                        <span>
                                            Payment Method
                                        </span>

                                        <strong>

                                            {formatStatus(
                                                selectedOrder.payment_method
                                            )}

                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                PRODUCTS
                            ================================== */}

                            <div className="supplier-orders-detail-section">

                                <div className="supplier-orders-detail-section-title">

                                    Products in this Order

                                </div>


                                {selectedOrder.items &&
                                selectedOrder.items.length > 0 ? (

                                    <div className="supplier-order-products">

                                        {selectedOrder.items.map(
                                            (item) => (

                                                <div
                                                    className="supplier-order-product"
                                                    key={item.id}
                                                >

                                                    <div className="supplier-order-product-main">

                                                        <div className="supplier-order-product-image">

                                                            {item.image ? (

                                                                <img
                                                                    src={`http://localhost:5000${item.image}`}
                                                                    alt={
                                                                        item.product_name
                                                                    }
                                                                />

                                                            ) : (

                                                                <ClipboardList
                                                                    size={20}
                                                                />

                                                            )}

                                                        </div>


                                                        <div className="supplier-order-product-info">

                                                            <strong>

                                                                {item.product_name ||
                                                                    "Product"}

                                                            </strong>

                                                            <span>

                                                                Unit:{" "}
                                                                {item.unit ||
                                                                    "-"}

                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div className="supplier-order-product-values">

                                                        <div>

                                                            <span>
                                                                Qty
                                                            </span>

                                                            <strong>
                                                                {item.quantity}
                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                Unit Price
                                                            </span>

                                                            <strong>

                                                                {formatAmount(
                                                                    item.unit_price
                                                                )}

                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                Total
                                                            </span>

                                                            <strong>

                                                                {formatAmount(
                                                                    item.total_price
                                                                )}

                                                            </strong>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div className="supplier-order-products-empty">

                                        No products found for this order.

                                    </div>

                                )}

                            </div>


                        </div>


                        {/* FOOTER */}

                        <div className="supplier-orders-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedOrder(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ======================================
                UPDATE STATUS MODAL
            ====================================== */}

            {statusOrder && (

                <div
                    className="supplier-orders-modal-overlay"
                    onClick={() => {

                        if (!updatingStatus) {

                            setStatusOrder(
                                null
                            );

                        }

                    }}
                >

                    <div
                        className="supplier-status-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="supplier-status-modal-header">

                            <div>

                                <h2>
                                    Update Order Status
                                </h2>

                                <p>
                                    {statusOrder.po_number}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="supplier-orders-modal-close"
                                onClick={() =>
                                    setStatusOrder(
                                        null
                                    )
                                }
                                disabled={
                                    updatingStatus
                                }
                            >

                                ×

                            </button>

                        </div>


                        <div className="supplier-status-modal-body">

                            <div className="supplier-status-current">

                                <span>
                                    Current Status
                                </span>

                                <strong>

                                    {formatStatus(
                                        statusOrder.status
                                    )}

                                </strong>

                            </div>


                            <div className="supplier-status-field">

                                <label>
                                    New Status
                                </label>


                                <select
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        updatingStatus
                                    }
                                >

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="ACCEPTED">
                                        Accepted
                                    </option>

                                    <option value="PROCESSING">
                                        Processing
                                    </option>

                                    <option value="PACKED">
                                        Packed
                                    </option>

                                    <option value="SHIPPED">
                                        Shipped
                                    </option>

                                    <option value="DELIVERED">
                                        Delivered
                                    </option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>

                                    <option value="CANCELLED">
                                        Cancelled
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div className="supplier-status-modal-footer">

                            <button
                                type="button"
                                className="supplier-status-cancel"
                                onClick={() =>
                                    setStatusOrder(
                                        null
                                    )
                                }
                                disabled={
                                    updatingStatus
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="supplier-status-save"
                                onClick={
                                    handleUpdateStatus
                                }
                                disabled={
                                    updatingStatus ||
                                    newStatus ===
                                    statusOrder.status
                                }
                            >

                                {updatingStatus
                                    ? "Updating..."
                                    : "Update Status"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default SupplierOrders;