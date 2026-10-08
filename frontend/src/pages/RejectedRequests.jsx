import {
    XCircle,
    Eye,
    X,
    User,
    Building2,
    ClipboardList,
    CalendarDays,
    Mail,
    Phone,
    Package,
    IndianRupee
} from "lucide-react";

import { useEffect, useState } from "react";

import axios from "axios";

import Card from "../components/Card";
import Badge from "../components/Badge";

import "./RejectedRequests.css";


const API_BASE_URL = "http://localhost:5000";


const RejectedRequests = () => {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Modal
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");


    // =====================================================
    // FETCH REJECTED REQUESTS
    // =====================================================

    const fetchRejectedRequests = async () => {

        try {

            setLoading(true);
            setErrorMessage("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/purchase-requests/manager/rejected`,
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
                "Failed to fetch rejected requests:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to load rejected requests."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchRejectedRequests();

    }, []);


    // =====================================================
    // FETCH REQUEST DETAILS
    // =====================================================

    const handleViewRequest = async (requestId) => {

        try {

            setDetailsLoading(true);
            setDetailsError("");
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

            const details =
                response.data.request ||
                response.data.purchaseRequest ||
                response.data;

            setSelectedRequest(details);

        } catch (error) {

            console.error(
                "Failed to fetch request details:",
                error
            );

            setDetailsError(
                error.response?.data?.message ||
                "Failed to load request details."
            );

        } finally {

            setDetailsLoading(false);

        }
    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeDetailsModal = () => {

        setSelectedRequest(null);
        setDetailsError("");

    };


    // =====================================================
    // TOTAL REJECTED AMOUNT
    // =====================================================

    const rejectedAmount = requests.reduce(
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

    const formatCurrency = (value) => {

        return `₹${Number(value || 0).toFixed(2)}`;

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="rejected-requests-page">

                <div className="page-heading">

                    <div>

                        <h1>
                            Rejected Requests
                        </h1>

                        <p>
                            View purchase requests that have been rejected.
                        </p>

                    </div>

                </div>

                <Card>

                    <div className="approval-empty">

                        <div className="approval-empty-icon">
                            <XCircle size={34} />
                        </div>

                        <h3>
                            Loading rejected requests...
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
            <div className="rejected-requests-page">

                <div className="page-heading">

                    <div>

                        <h1>
                            Rejected Requests
                        </h1>

                        <p>
                            View purchase requests that have been rejected.
                        </p>

                    </div>

                </div>

                <Card>

                    <div className="approval-empty">

                        <div className="approval-empty-icon">
                            <XCircle size={34} />
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
    // DETAILS DATA
    // =====================================================

    const items =
        selectedRequest?.items ||
        selectedRequest?.products ||
        selectedRequest?.request_items ||
        [];

    const subtotal = Number(
        selectedRequest?.subtotal ||
        selectedRequest?.sub_total ||
        (
            items.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.total ||
                        item.total_price ||
                        (
                            Number(item.quantity || 0) *
                            Number(item.unit_price || 0)
                        )
                    ),
                0
            )
        )
    );

    const gst = Number(
        selectedRequest?.gst ||
        selectedRequest?.gst_amount ||
        0
    );

    const requestTotal = Number(
        selectedRequest?.total_amount ||
        subtotal + gst
    );


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="rejected-requests-page">

            {/* PAGE HEADING */}

            <div className="page-heading">

                <div>

                    <h1>
                        Rejected Requests
                    </h1>

                    <p>
                        View purchase requests that have been rejected.
                    </p>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="approval-summary">

                <Card>

                    <div className="approval-summary-card">

                        <div className="approval-summary-icon red">
                            <XCircle size={21} />
                        </div>

                        <div>

                            <span>
                                Rejected Requests
                            </span>

                            <strong>
                                {requests.length}
                            </strong>

                        </div>

                    </div>

                </Card>


                <Card>

                    <div className="approval-summary-card">

                        <div className="approval-summary-icon red">
                            <IndianRupee size={21} />
                        </div>

                        <div>

                            <span>
                                Rejected Amount
                            </span>

                            <strong>
                                ₹{rejectedAmount.toFixed(2)}
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
                            Rejected Purchase Requests
                        </h2>

                        <p>
                            Purchase requests that were rejected by you.
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
                                                <XCircle size={34} />
                                            </div>

                                            <h3>
                                                No rejected requests
                                            </h3>

                                            <p>
                                                Rejected purchase requests
                                                will appear here once a request
                                                is rejected.
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

                                            <Badge variant="danger">
                                                REJECTED
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

            {(detailsLoading || selectedRequest || detailsError) && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "20px"
                    }}
                    onClick={closeDetailsModal}
                >

                    <div
                        style={{
                            width: "min(1000px, 95vw)",
                            maxHeight: "90vh",
                            background: "#ffffff",
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.2)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* MODAL HEADER */}

                        <div
                            style={{
                                padding: "28px 36px",
                                borderBottom: "1px solid #e5e7eb",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start"
                            }}
                        >

                            <div>

                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "28px",
                                        color: "#111827"
                                    }}
                                >
                                    Purchase Request Details
                                </h2>

                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        color: "#64748b"
                                    }}
                                >
                                    View purchase request information.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeDetailsModal}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "#64748b"
                                }}
                            >
                                <X size={26} />
                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div
                            style={{
                                maxHeight: "calc(90vh - 105px)",
                                overflowY: "auto",
                                padding: "30px 36px 36px"
                            }}
                        >

                            {detailsLoading && (

                                <div
                                    style={{
                                        padding: "60px",
                                        textAlign: "center",
                                        color: "#64748b"
                                    }}
                                >
                                    Loading request details...
                                </div>

                            )}


                            {detailsError && (

                                <div
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "#dc2626"
                                    }}
                                >
                                    {detailsError}
                                </div>

                            )}


                            {selectedRequest && !detailsLoading && (

                                <>

                                    {/* REQUEST INFORMATION */}

                                    <h3
                                        style={{
                                            fontSize: "21px",
                                            margin: "0 0 18px",
                                            color: "#111827"
                                        }}
                                    >
                                        Request Information
                                    </h3>


                                    <div
                                        style={{
                                            border: "1px solid #dbe3ee",
                                            background: "#f8fafc",
                                            borderRadius: "14px",
                                            padding: "14px",
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(2, minmax(0, 1fr))",
                                            gap: "14px"
                                        }}
                                    >

                                        {/* REQUESTED BY */}

                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                display: "flex",
                                                gap: "16px"
                                            }}
                                        >

                                            <User
                                                size={24}
                                                color="#64748b"
                                            />

                                            <div>

                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase"
                                                }}>
                                                    Requested By
                                                </div>

                                                <strong>
                                                    {selectedRequest.employee_name ||
                                                        selectedRequest.requested_by_name ||
                                                        selectedRequest.requester_name ||
                                                        "—"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* BRANCH */}

                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                display: "flex",
                                                gap: "16px"
                                            }}
                                        >

                                            <Building2
                                                size={24}
                                                color="#64748b"
                                            />

                                            <div>

                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase"
                                                }}>
                                                    Branch
                                                </div>

                                                <strong>
                                                    {selectedRequest.branch_name ||
                                                        "—"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* REQUEST ID */}

                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                display: "flex",
                                                gap: "16px"
                                            }}
                                        >

                                            <ClipboardList
                                                size={24}
                                                color="#64748b"
                                            />

                                            <div>

                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase"
                                                }}>
                                                    Request ID
                                                </div>

                                                <strong>
                                                    {selectedRequest.request_number ||
                                                        "—"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* REQUEST DATE */}

                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                display: "flex",
                                                gap: "16px"
                                            }}
                                        >

                                            <CalendarDays
                                                size={24}
                                                color="#64748b"
                                            />

                                            <div>

                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase"
                                                }}>
                                                    Request Date
                                                </div>

                                                <strong>
                                                    {formatDate(
                                                        selectedRequest.created_at
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* EMAIL */}

                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                display: "flex",
                                                gap: "16px"
                                            }}
                                        >

                                            <Mail
                                                size={24}
                                                color="#64748b"
                                            />

                                            <div>

                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase"
                                                }}>
                                                    Employee Email
                                                </div>

                                                <strong>
                                                    {selectedRequest.requested_by_email || "—"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* PHONE */}

                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                display: "flex",
                                                gap: "16px"
                                            }}
                                        >

                                            <Phone
                                                size={24}
                                                color="#64748b"
                                            />

                                            <div>

                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    fontWeight: 600,
                                                    textTransform: "uppercase"
                                                }}>
                                                    Employee Phone
                                                </div>

                                                <strong>
                                                    {selectedRequest.requested_by_phone || "—"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    <div
                                        style={{
                                            marginTop: "18px",
                                            border: "1px solid #fecaca",
                                            background: "#fff7f7",
                                            borderRadius: "12px",
                                            padding: "18px 22px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        }}
                                    >

                                        <strong>
                                            Status
                                        </strong>

                                        <Badge variant="danger">
                                            REJECTED
                                        </Badge>

                                    </div>


                                    {/* REJECTION REASON */}

                                    <div
                                        style={{
                                            marginTop: "18px",
                                            border: "1px solid #fecaca",
                                            background: "#fff7f7",
                                            borderRadius: "12px",
                                            padding: "20px"
                                        }}
                                    >

                                        <h3
                                            style={{
                                                margin: "0 0 10px",
                                                fontSize: "17px",
                                                color: "#991b1b"
                                            }}
                                        >
                                            Rejection Reason
                                        </h3>

                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#7f1d1d",
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {selectedRequest.rejection_reason ||
                                                "No rejection reason provided."}
                                        </p>

                                    </div>


                                    {/* REQUESTED PRODUCTS */}

                                    <div style={{ marginTop: "30px" }}>

                                        <h3
                                            style={{
                                                margin: "0 0 6px",
                                                fontSize: "21px",
                                                color: "#111827"
                                            }}
                                        >
                                            Requested Products
                                        </h3>

                                        <p
                                            style={{
                                                margin: "0 0 16px",
                                                color: "#64748b"
                                            }}
                                        >
                                            Products included in this purchase request.
                                        </p>


                                        <div
                                            style={{
                                                border: "1px solid #dbe3ee",
                                                borderRadius: "12px",
                                                overflow: "hidden"
                                            }}
                                        >

                                            <table
                                                style={{
                                                    width: "100%",
                                                    borderCollapse: "collapse"
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f8fafc"
                                                        }}
                                                    >

                                                        <th style={{
                                                            padding: "14px 18px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            PRODUCT
                                                        </th>

                                                        <th style={{
                                                            padding: "14px 18px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            SUPPLIER
                                                        </th>

                                                        <th style={{
                                                            padding: "14px 18px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            QUANTITY
                                                        </th>

                                                        <th style={{
                                                            padding: "14px 18px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            UNIT PRICE
                                                        </th>

                                                        <th style={{
                                                            padding: "14px 18px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            TOTAL
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {items.map(
                                                        (item, index) => {

                                                            const quantity =
                                                                Number(
                                                                    item.quantity ||
                                                                    0
                                                                );

                                                            const unitPrice =
                                                                Number(
                                                                    item.unit_price ||
                                                                    item.price ||
                                                                    0
                                                                );

                                                            const itemTotal =
                                                                Number(
                                                                    item.total ||
                                                                    item.total_price ||
                                                                    quantity *
                                                                    unitPrice
                                                                );

                                                            return (

                                                                <tr
                                                                    key={
                                                                        item.id ||
                                                                        index
                                                                    }
                                                                    style={{
                                                                        borderTop:
                                                                            "1px solid #e5e7eb"
                                                                    }}
                                                                >

                                                                    <td
                                                                        style={{
                                                                            padding: "18px"
                                                                        }}
                                                                    >

                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                gap: "12px"
                                                                            }}
                                                                        >

                                                                            <Package
                                                                                size={20}
                                                                                color="#64748b"
                                                                            />

                                                                            <div>

                                                                                <strong>
                                                                                    {item.product_name ||
                                                                                        item.name ||
                                                                                        "—"}
                                                                                </strong>

                                                                                <div
                                                                                    style={{
                                                                                        fontSize: "12px",
                                                                                        color: "#94a3b8",
                                                                                        marginTop: "3px"
                                                                                    }}
                                                                                >
                                                                                    Unit:{" "}
                                                                                    {item.unit ||
                                                                                        item.unit_name ||
                                                                                        "Piece"}
                                                                                </div>

                                                                            </div>

                                                                        </div>

                                                                    </td>


                                                                    <td
                                                                        style={{
                                                                            padding: "18px"
                                                                        }}
                                                                    >
                                                                        {item.supplier_name ||
                                                                            item.supplier ||
                                                                            "—"}
                                                                    </td>


                                                                    <td
                                                                        style={{
                                                                            padding: "18px"
                                                                        }}
                                                                    >
                                                                        {quantity}
                                                                    </td>


                                                                    <td
                                                                        style={{
                                                                            padding: "18px"
                                                                        }}
                                                                    >
                                                                        {formatCurrency(
                                                                            unitPrice
                                                                        )}
                                                                    </td>


                                                                    <td
                                                                        style={{
                                                                            padding: "18px",
                                                                            fontWeight: 600
                                                                        }}
                                                                    >
                                                                        {formatCurrency(
                                                                            itemTotal
                                                                        )}
                                                                    </td>

                                                                </tr>

                                                            );

                                                        }
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>


                                    {/* TOTALS */}

                                    <div
                                        style={{
                                            marginTop: "22px",
                                            marginLeft: "auto",
                                            width: "min(100%, 460px)",
                                            border: "1px solid #dbe3ee",
                                            borderRadius: "12px",
                                            padding: "24px"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: "14px"
                                            }}
                                        >

                                            <span>
                                                Subtotal
                                            </span>

                                            <strong>
                                                {formatCurrency(subtotal)}
                                            </strong>

                                        </div>


                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                paddingBottom: "18px",
                                                borderBottom:
                                                    "1px solid #e5e7eb"
                                            }}
                                        >

                                            <span>
                                                GST
                                            </span>

                                            <strong>
                                                {formatCurrency(gst)}
                                            </strong>

                                        </div>


                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: "18px",
                                                alignItems: "center"
                                            }}
                                        >

                                            <strong
                                                style={{
                                                    fontSize: "18px"
                                                }}
                                            >
                                                Request Total
                                            </strong>

                                            <strong
                                                style={{
                                                    fontSize: "28px",
                                                    color: "#2563eb"
                                                }}
                                            >
                                                {formatCurrency(
                                                    requestTotal
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


export default RejectedRequests;