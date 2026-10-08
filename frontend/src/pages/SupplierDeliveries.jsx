import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Truck,
    Clock,
    Send,
    CheckCircle,
    Search,
    Eye,
    RefreshCw
} from "lucide-react";

import axios from "axios";

import "./SupplierDeliveries.css";


function SupplierDeliveries() {

    // ==========================================
    // STATES
    // ==========================================

    const [orders, setOrders] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    const [selectedDelivery, setSelectedDelivery] = useState(null);

    const [statusOrder, setStatusOrder] = useState(null);

    const [newStatus, setNewStatus] = useState("");

    const [updatingStatus, setUpdatingStatus] = useState(false);


    // ==========================================
    // FETCH SUPPLIER ORDERS
    // ==========================================

    const fetchOrders = async () => {

        try {

            setLoading(true);

            setErrorMessage("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/suppliers/orders?t=${Date.now()}`,
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
                "Failed to fetch supplier deliveries:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to load deliveries."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOAD WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {

        fetchOrders();

    }, []);


    // ==========================================
    // DELIVERY ORDERS
    // ==========================================

    const deliveryOrders = useMemo(() => {

        return orders.filter((order) =>
            [
                "PACKED",
                "SHIPPED",
                "DELIVERED",
                "COMPLETED"
            ].includes(order.status)
        );

    }, [orders]);


    // ==========================================
    // STATUS DISPLAY
    // ==========================================

    const formatStatus = (status) => {

        if (!status) {

            return "Unknown";

        }

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
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
    // EXPECTED DELIVERY DATE
    // ==========================================

    const getExpectedDate = (order) => {

        if (!order.created_at) {

            return "-";

        }

        const expectedDate = new Date(
            order.created_at
        );

        expectedDate.setDate(
            expectedDate.getDate() + 3
        );

        return formatDate(expectedDate);

    };


    // ==========================================
    // DELIVERY STATUS
    // ==========================================

    const getDeliveryStatus = (status) => {

        if (status === "PACKED") {

            return "PENDING";

        }

        if (status === "SHIPPED") {

            return "IN_TRANSIT";

        }

        if (
            status === "DELIVERED" ||
            status === "COMPLETED"
        ) {

            return "DELIVERED";

        }

        return status;

    };


    // ==========================================
    // FILTER DELIVERIES
    // ==========================================

    const filteredDeliveries = useMemo(() => {

        const search = searchTerm
            .toLowerCase()
            .trim();

        return deliveryOrders.filter((order) => {

            const deliveryStatus =
                getDeliveryStatus(order.status);

            const matchesSearch =
                order.po_number
                    ?.toLowerCase()
                    .includes(search) ||

                order.company_name
                    ?.toLowerCase()
                    .includes(search) ||

                order.branch_name
                    ?.toLowerCase()
                    .includes(search) ||

                deliveryStatus
                    ?.toLowerCase()
                    .includes(search);

            let matchesStatus = true;

            if (statusFilter === "PENDING") {

                matchesStatus =
                    order.status === "PACKED";

            }

            if (statusFilter === "IN_TRANSIT") {

                matchesStatus =
                    order.status === "SHIPPED";

            }

            if (statusFilter === "DELIVERED") {

                matchesStatus =
                    order.status === "DELIVERED" ||
                    order.status === "COMPLETED";

            }

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        deliveryOrders,
        searchTerm,
        statusFilter
    ]);


    // ==========================================
    // SUMMARY COUNTS
    // ==========================================

    const totalDeliveries =
        deliveryOrders.length;

    const pendingDeliveries =
        deliveryOrders.filter(
            (order) =>
                order.status === "PACKED"
        ).length;

    const inTransitDeliveries =
        deliveryOrders.filter(
            (order) =>
                order.status === "SHIPPED"
        ).length;

    const deliveredDeliveries =
        deliveryOrders.filter(
            (order) =>
                order.status === "DELIVERED" ||
                order.status === "COMPLETED"
        ).length;


    // ==========================================
    // OPEN VIEW MODAL
    // ==========================================

    const handleViewDelivery = (order) => {

        setSelectedDelivery(order);

    };


    // ==========================================
    // OPEN STATUS MODAL
    // ==========================================

    const handleOpenStatusModal = (order) => {

        setStatusOrder(order);

        setNewStatus(
            order.status || "SHIPPED"
        );

    };


    // ==========================================
    // UPDATE DELIVERY STATUS
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


            // Update local data immediately

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === statusOrder.id
                        ? {
                            ...order,
                            status: newStatus
                        }
                        : order
                )
            );


            setStatusOrder(null);

            setNewStatus("");


            // Get latest backend data

            await fetchOrders();

        } catch (error) {

            console.error(
                "Failed to update delivery status:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to update delivery status."
            );

        } finally {

            setUpdatingStatus(false);

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="supplier-deliveries-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="supplier-deliveries-header">

                <div>

                    <h1>
                        Deliveries
                    </h1>

                    <p>
                        Track and manage deliveries for customer orders.
                    </p>

                </div>

            </div>


            {/* ======================================
                SUMMARY CARDS
            ====================================== */}

            <div className="supplier-deliveries-summary">

                <div className="supplier-delivery-summary-card">

                    <div className="supplier-delivery-summary-icon blue">

                        <Truck size={22} />

                    </div>

                    <div>

                        <span>
                            Total Deliveries
                        </span>

                        <strong>
                            {totalDeliveries}
                        </strong>

                    </div>

                </div>


                <div className="supplier-delivery-summary-card">

                    <div className="supplier-delivery-summary-icon orange">

                        <Clock size={22} />

                    </div>

                    <div>

                        <span>
                            Pending Deliveries
                        </span>

                        <strong>
                            {pendingDeliveries}
                        </strong>

                    </div>

                </div>


                <div className="supplier-delivery-summary-card">

                    <div className="supplier-delivery-summary-icon purple">

                        <Send size={22} />

                    </div>

                    <div>

                        <span>
                            In Transit
                        </span>

                        <strong>
                            {inTransitDeliveries}
                        </strong>

                    </div>

                </div>


                <div className="supplier-delivery-summary-card">

                    <div className="supplier-delivery-summary-icon green">

                        <CheckCircle size={22} />

                    </div>

                    <div>

                        <span>
                            Delivered
                        </span>

                        <strong>
                            {deliveredDeliveries}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================
                DELIVERY CARD
            ====================================== */}

            <div className="supplier-deliveries-card">

                <div className="supplier-deliveries-toolbar">

                    <div>

                        <h2>
                            Delivery Tracking
                        </h2>

                        <p>
                            Monitor the delivery status of customer orders.
                        </p>

                    </div>


                    <div className="supplier-delivery-controls">

                        <div className="supplier-delivery-search">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search deliveries..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            className="supplier-delivery-filter"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Deliveries
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="IN_TRANSIT">
                                In Transit
                            </option>

                            <option value="DELIVERED">
                                Delivered
                            </option>

                        </select>

                    </div>

                </div>


                {/* ======================================
                    ERROR
                ====================================== */}

                {errorMessage && (

                    <div className="supplier-delivery-error">

                        {errorMessage}

                    </div>

                )}


                {/* ======================================
                    TABLE
                ====================================== */}

                <div className="supplier-delivery-table-wrapper">

                    <table className="supplier-delivery-table">

                        <thead>

                            <tr>

                                <th>
                                    Delivery ID
                                </th>

                                <th>
                                    Order ID
                                </th>

                                <th>
                                    Company
                                </th>

                                <th>
                                    Dispatch Date
                                </th>

                                <th>
                                    Expected Date
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
                                        className="supplier-delivery-loading"
                                    >
                                        Loading deliveries...
                                    </td>

                                </tr>

                            ) : filteredDeliveries.length === 0 ? (

                                <tr>

                                    <td colSpan="7">

                                        <div className="supplier-delivery-empty">

                                            <div className="supplier-delivery-empty-icon">

                                                <Truck size={30} />

                                            </div>

                                            <h3>
                                                No deliveries available
                                            </h3>

                                            <p>

                                                {deliveryOrders.length === 0
                                                    ? "Delivery information will appear here once customer orders are ready for shipment."
                                                    : "No deliveries match your search or selected filter."
                                                }

                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredDeliveries.map(
                                    (order) => {

                                        const deliveryStatus =
                                            getDeliveryStatus(
                                                order.status
                                            );

                                        return (

                                            <tr
                                                key={order.id}
                                            >

                                                <td>

                                                    <strong>
                                                        {`DEL-${String(
                                                            order.id
                                                        ).padStart(
                                                            6,
                                                            "0"
                                                        )}`}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {order.po_number || "-"}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {order.company_name || "-"}
                                                </td>


                                                <td>
                                                    {order.status === "PACKED"
                                                        ? "-"
                                                        : formatDate(
                                                            order.created_at
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {getExpectedDate(order)}
                                                </td>


                                                <td>

                                                    <span
                                                        className={`supplier-delivery-status ${deliveryStatus.toLowerCase()}`}
                                                    >
                                                        {formatStatus(
                                                            deliveryStatus
                                                        )}
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="supplier-delivery-actions">

                                                        <button
                                                            type="button"
                                                            className="supplier-delivery-action-btn view"
                                                            onClick={() =>
                                                                handleViewDelivery(
                                                                    order
                                                                )
                                                            }
                                                            title="View Delivery"
                                                        >

                                                            <Eye size={16} />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="supplier-delivery-action-btn status"
                                                            onClick={() =>
                                                                handleOpenStatusModal(
                                                                    order
                                                                )
                                                            }
                                                            title="Update Delivery Status"
                                                        >

                                                            <RefreshCw size={16} />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ======================================
                VIEW DELIVERY MODAL
            ====================================== */}

            {selectedDelivery && (

                <div
                    className="supplier-deliveries-modal-overlay"
                    onClick={() =>
                        setSelectedDelivery(null)
                    }
                >

                    <div
                        className="supplier-deliveries-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="supplier-deliveries-modal-header">

                            <div>

                                <h2>
                                    Delivery Details
                                </h2>

                                <p>
                                    {selectedDelivery.po_number || "-"}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="supplier-deliveries-modal-close"
                                onClick={() =>
                                    setSelectedDelivery(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="supplier-deliveries-modal-body">

                            <div className="supplier-delivery-detail-grid">

                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Delivery ID
                                    </span>

                                    <strong>

                                        {`DEL-${String(
                                            selectedDelivery.id
                                        ).padStart(
                                            6,
                                            "0"
                                        )}`}

                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Order ID
                                    </span>

                                    <strong>
                                        {selectedDelivery.po_number || "-"}
                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Customer Company
                                    </span>

                                    <strong>
                                        {selectedDelivery.company_name || "-"}
                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Branch
                                    </span>

                                    <strong>
                                        {selectedDelivery.branch_name || "-"}
                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Dispatch Date
                                    </span>

                                    <strong>
                                        {selectedDelivery.status === "PACKED"
                                            ? "-"
                                            : formatDate(
                                                selectedDelivery.created_at
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Expected Date
                                    </span>

                                    <strong>
                                        {getExpectedDate(
                                            selectedDelivery
                                        )}
                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Payment Method
                                    </span>

                                    <strong>
                                        {formatStatus(
                                            selectedDelivery.payment_method
                                        )}
                                    </strong>

                                </div>


                                <div className="supplier-delivery-detail-item">

                                    <span>
                                        Delivery Status
                                    </span>

                                    <strong
                                        className={`supplier-delivery-status ${getDeliveryStatus(
                                            selectedDelivery.status
                                        ).toLowerCase()}`}
                                    >
                                        {formatStatus(
                                            getDeliveryStatus(
                                                selectedDelivery.status
                                            )
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div className="supplier-delivery-address">

                                <span>
                                    Shipping Address
                                </span>

                                <strong>

                                    {selectedDelivery.branch_name ||
                                        "Branch"}

                                </strong>

                                <p>

                                    {selectedDelivery.branch_address ||
                                        ""}

                                    {selectedDelivery.branch_address &&
                                        (
                                            selectedDelivery.branch_city ||
                                            selectedDelivery.branch_state
                                        )
                                        ? ", "
                                        : ""
                                    }

                                    {selectedDelivery.branch_city ||
                                        ""}

                                    {selectedDelivery.branch_city &&
                                        selectedDelivery.branch_state
                                        ? ", "
                                        : ""
                                    }

                                    {selectedDelivery.branch_state ||
                                        ""}

                                </p>

                            </div>

                        </div>


                        <div className="supplier-deliveries-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedDelivery(null)
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
                    className="supplier-deliveries-modal-overlay"
                    onClick={() => {

                        if (!updatingStatus) {

                            setStatusOrder(null);

                        }

                    }}
                >

                    <div
                        className="supplier-delivery-status-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="supplier-delivery-status-header">

                            <div>

                                <h2>
                                    Update Delivery Status
                                </h2>

                                <p>
                                    {statusOrder.po_number}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="supplier-deliveries-modal-close"
                                onClick={() =>
                                    setStatusOrder(null)
                                }
                                disabled={updatingStatus}
                            >
                                ×
                            </button>

                        </div>


                        <div className="supplier-delivery-status-body">

                            <div className="supplier-delivery-current">

                                <span>
                                    Current Status
                                </span>

                                <strong
                                    className={`supplier-delivery-status ${getDeliveryStatus(
                                        statusOrder.status
                                    ).toLowerCase()}`}
                                >

                                    {formatStatus(
                                        getDeliveryStatus(
                                            statusOrder.status
                                        )
                                    )}

                                </strong>

                            </div>


                            <div className="supplier-delivery-status-field">

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
                                    disabled={updatingStatus}
                                >

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

                                </select>

                            </div>

                        </div>


                        <div className="supplier-delivery-status-footer">

                            <button
                                type="button"
                                className="supplier-delivery-cancel"
                                onClick={() =>
                                    setStatusOrder(null)
                                }
                                disabled={updatingStatus}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="supplier-delivery-save"
                                onClick={handleUpdateStatus}
                                disabled={
                                    updatingStatus ||
                                    newStatus === statusOrder.status
                                }
                            >

                                {updatingStatus
                                    ? "Updating..."
                                    : "Update Status"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default SupplierDeliveries;