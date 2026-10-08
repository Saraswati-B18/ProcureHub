import {
    CheckCircle,
    Eye,
    X,
    ClipboardList,
    IndianRupee,
    User,
    Building2,
    CalendarDays,
    Package,
    Mail,
    Phone
} from "lucide-react";

import { useEffect, useState } from "react";

import axios from "axios";

import Card from "../components/Card";
import Badge from "../components/Badge";

import "./ApprovedRequests.css";


const API_BASE_URL = "http://localhost:5000";


const ApprovedRequests = () => {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // MODAL
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");


    // =====================================================
    // FETCH APPROVED REQUESTS
    // =====================================================

    const fetchApprovedRequests = async () => {

        try {

            setLoading(true);
            setErrorMessage("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/purchase-requests/manager/approved`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setRequests(
                response.data.requests || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch approved requests:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to load approved requests."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchApprovedRequests();

    }, []);


    // =====================================================
    // OPEN REQUEST DETAILS MODAL
    // =====================================================

    const handleViewRequest = async (requestId) => {

        try {

            setModalLoading(true);
            setModalError("");
            setSelectedRequest(null);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/purchase-requests/manager/${requestId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSelectedRequest(
                response.data.request
            );

        } catch (error) {

            console.error(
                "Failed to fetch request details:",
                error
            );

            setModalError(
                error.response?.data?.message ||
                "Failed to load purchase request details."
            );

        } finally {

            setModalLoading(false);

        }

    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {

        setSelectedRequest(null);
        setModalError("");
        setModalLoading(false);

    };


    // =====================================================
    // CLOSE WHEN CLICKING BACKGROUND
    // =====================================================

    const handleOverlayClick = (e) => {

        if (e.target === e.currentTarget) {
            closeModal();
        }

    };


    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {

        const handleEscape = (e) => {

            if (e.key === "Escape") {
                closeModal();
            }

        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };

    }, []);


    // =====================================================
    // TOTAL APPROVED AMOUNT
    // =====================================================

    const approvedAmount = requests.reduce(
        (sum, request) =>
            sum +
            Number(request.total_amount || 0),
        0
    );


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {

        return `₹${Number(amount || 0).toFixed(2)}`;

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="approved-requests-page">

                <div className="page-heading">

                    <div>

                        <h1>
                            Approved Requests
                        </h1>

                        <p>
                            View purchase requests that have been approved.
                        </p>

                    </div>

                </div>


                <Card>

                    <div className="approval-empty">

                        <div className="approval-empty-icon">

                            <CheckCircle size={34} />

                        </div>

                        <h3>
                            Loading approved requests...
                        </h3>

                        <p>
                            Please wait while we fetch the requests.
                        </p>

                    </div>

                </Card>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (errorMessage) {

        return (

            <div className="approved-requests-page">

                <div className="page-heading">

                    <div>

                        <h1>
                            Approved Requests
                        </h1>

                        <p>
                            View purchase requests that have been approved.
                        </p>

                    </div>

                </div>


                <Card>

                    <div className="approval-empty">

                        <div className="approval-empty-icon">

                            <CheckCircle size={34} />

                        </div>

                        <h3>
                            Unable to load requests
                        </h3>

                        <p>
                            {errorMessage}
                        </p>

                    </div>

                </Card>

            </div>

        );

    }


    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (

        <div className="approved-requests-page">


            {/* PAGE HEADING */}

            <div className="page-heading">

                <div>

                    <h1>
                        Approved Requests
                    </h1>

                    <p>
                        View purchase requests that have been approved.
                    </p>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="approval-summary">

                <Card>

                    <div className="approval-summary-card">

                        <div className="approval-summary-icon green">

                            <CheckCircle size={21} />

                        </div>

                        <div>

                            <span>
                                Approved Requests
                            </span>

                            <strong>
                                {requests.length}
                            </strong>

                        </div>

                    </div>

                </Card>


                <Card>

                    <div className="approval-summary-card">

                        <div className="approval-summary-icon green">

                            <IndianRupee size={21} />

                        </div>

                        <div>

                            <span>
                                Approved Amount
                            </span>

                            <strong>
                                ₹{approvedAmount.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </Card>

            </div>


            {/* TABLE */}

            <Card>

                <div className="approval-header">

                    <div>

                        <h2>
                            Approved Purchase Requests
                        </h2>

                        <p>
                            Purchase requests approved by you.
                        </p>

                    </div>

                </div>


                <div className="approval-table-wrapper">

                    <table className="approval-table">

                        <thead>

                            <tr>

                                <th>
                                    Request ID
                                </th>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Branch
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Amount
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

                            {requests.length === 0 ? (

                                <tr>

                                    <td colSpan="8">

                                        <div className="approval-empty">

                                            <div className="approval-empty-icon">

                                                <CheckCircle size={34} />

                                            </div>

                                            <h3>
                                                No approved requests
                                            </h3>

                                            <p>
                                                Approved purchase requests
                                                will appear here once requests
                                                are approved.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                requests.map((request) => (

                                    <tr key={request.id}>

                                        <td>
                                            {request.request_number}
                                        </td>

                                        <td>
                                            {request.employee_name || "—"}
                                        </td>

                                        <td>
                                            {request.branch_name || "—"}
                                        </td>

                                        <td>
                                            {formatDate(
                                                request.approved_at ||
                                                request.created_at
                                            )}
                                        </td>

                                        <td>
                                            {request.item_count || 0}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                request.total_amount || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>

                                            <Badge variant="success">
                                                APPROVED
                                            </Badge>

                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                title="View Request"
                                                onClick={() =>
                                                    handleViewRequest(
                                                        request.id
                                                    )
                                                }
                                                style={{
                                                    width: "42px",
                                                    height: "42px",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    background: "#2563eb",
                                                    color: "#fff",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer"
                                                }}
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


            {/* =====================================================
                REQUEST DETAILS MODAL
            ===================================================== */}

            {(modalLoading || modalError || selectedRequest) && (

                <div
                    className="request-details-overlay"
                    onClick={handleOverlayClick}
                >

                    <div className="request-details-modal">


                        {/* MODAL HEADER */}

                        <div className="request-modal-header">

                            <div>

                                <h2>
                                    Purchase Request Details
                                </h2>

                                <p>
                                    View purchase request information.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="request-modal-close"
                                onClick={closeModal}
                                title="Close"
                            >

                                <X size={22} />

                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div className="request-modal-body">


                            {modalLoading && (

                                <div className="request-modal-loading">

                                    <CheckCircle size={30} />

                                    <h3>
                                        Loading request details...
                                    </h3>

                                    <p>
                                        Please wait.
                                    </p>

                                </div>

                            )}


                            {modalError && !modalLoading && (

                                <div className="request-modal-error">

                                    <h3>
                                        Unable to load request
                                    </h3>

                                    <p>
                                        {modalError}
                                    </p>

                                </div>

                            )}


                            {selectedRequest && !modalLoading && !modalError && (

                                <>

                                    {/* REQUEST INFORMATION */}

                                    <div className="request-modal-section">

                                        <h3>
                                            Request Information
                                        </h3>


                                        <div className="request-info-grid">


                                            <div className="request-info-item">

                                                <User size={19} />

                                                <div>

                                                    <span>
                                                        Requested By
                                                    </span>

                                                    <strong>
                                                        {selectedRequest.requested_by_name || "—"}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="request-info-item">

                                                <Building2 size={19} />

                                                <div>

                                                    <span>
                                                        Branch
                                                    </span>

                                                    <strong>
                                                        {selectedRequest.branch_name || "—"}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="request-info-item">

                                                <ClipboardList size={19} />

                                                <div>

                                                    <span>
                                                        Request ID
                                                    </span>

                                                    <strong>
                                                        {selectedRequest.request_number}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="request-info-item">

                                                <CalendarDays size={19} />

                                                <div>

                                                    <span>
                                                        Request Date
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            selectedRequest.created_at
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="request-info-item">

                                                <Mail size={19} />

                                                <div>

                                                    <span>
                                                        Employee Email
                                                    </span>

                                                    <strong>
                                                        {selectedRequest.requested_by_email || "—"}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="request-info-item">

                                                <Phone size={19} />

                                                <div>

                                                    <span>
                                                        Employee Phone
                                                    </span>

                                                    <strong>
                                                        {selectedRequest.requested_by_phone || "—"}
                                                    </strong>

                                                </div>

                                            </div>


                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    <div className="request-modal-status-row">

                                        <span>
                                            Status
                                        </span>

                                        <Badge variant="success">
                                            {selectedRequest.status}
                                        </Badge>

                                    </div>


                                    {/* PRODUCTS */}

                                    <div className="request-modal-section">

                                        <h3>
                                            Requested Products
                                        </h3>

                                        <p className="request-modal-description">
                                            Products included in this purchase request.
                                        </p>


                                        <div className="request-products-table-wrapper">

                                            <table className="request-products-table">

                                                <thead>

                                                    <tr>

                                                        <th>
                                                            Product
                                                        </th>

                                                        <th>
                                                            Supplier
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

                                                    {(selectedRequest.items || []).map(
                                                        (item) => (

                                                            <tr key={item.id}>

                                                                <td>

                                                                    <div className="modal-product-name">

                                                                        <Package size={16} />

                                                                        <div>

                                                                            <strong>
                                                                                {item.product_name}
                                                                            </strong>

                                                                            <span>
                                                                                Unit: {item.unit || "—"}
                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                </td>


                                                                <td>
                                                                    {item.supplier_name || "—"}
                                                                </td>


                                                                <td>
                                                                    {item.quantity}
                                                                </td>


                                                                <td>
                                                                    {formatCurrency(
                                                                        item.unit_price
                                                                    )}
                                                                </td>


                                                                <td>
                                                                    <strong>
                                                                        {formatCurrency(
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

                                    </div>


                                    {/* TOTALS */}

                                    <div className="request-modal-totals">

                                        <div>

                                            <span>
                                                Subtotal
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedRequest.subtotal
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                GST
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedRequest.gst
                                                )}
                                            </strong>

                                        </div>


                                        <div className="request-modal-grand-total">

                                            <span>
                                                Request Total
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedRequest.total_amount
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};


export default ApprovedRequests;