import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FileText,
    Clock,
    Send,
    CheckCircle,
    Search,
    Eye
} from "lucide-react";

import axios from "axios";

import "./SupplierInvoices.css";


function SupplierInvoices() {

    const [invoices, setInvoices] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    const [selectedInvoice, setSelectedInvoice] = useState(null);


    // ==========================================
    // FETCH INVOICES
    // ==========================================

    const fetchInvoices = async () => {

        try {

            setLoading(true);

            setErrorMessage("");

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/suppliers/invoices?t=${Date.now()}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache"
                    }
                }
            );

            setInvoices(
                response.data.invoices || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch supplier invoices:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to load invoices."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOAD
    // ==========================================

    useEffect(() => {

        fetchInvoices();

    }, []);


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
    // CHECK OVERDUE
    // ==========================================

    const getDisplayStatus = (invoice) => {

        if (
            invoice.status !== "PAID" &&
            invoice.due_date
        ) {

            const today = new Date();

            const dueDate = new Date(
                invoice.due_date
            );

            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {

                return "OVERDUE";

            }

        }

        return invoice.status;

    };


    // ==========================================
    // FILTER
    // ==========================================

    const filteredInvoices = useMemo(() => {

        const search =
            searchTerm
                .toLowerCase()
                .trim();

        return invoices.filter((invoice) => {

            const displayStatus =
                getDisplayStatus(invoice);

            const matchesSearch =
                invoice.invoice_number
                    ?.toLowerCase()
                    .includes(search) ||

                invoice.po_number
                    ?.toLowerCase()
                    .includes(search) ||

                invoice.company_name
                    ?.toLowerCase()
                    .includes(search) ||

                displayStatus
                    ?.toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                displayStatus === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        invoices,
        searchTerm,
        statusFilter
    ]);


    // ==========================================
    // SUMMARY
    // ==========================================

    const totalInvoices =
        invoices.length;

    const draftInvoices =
        invoices.filter(
            (invoice) =>
                invoice.status === "DRAFT"
        ).length;

    const issuedInvoices =
        invoices.filter(
            (invoice) =>
                invoice.status === "ISSUED" ||
                invoice.status === "PARTIALLY_PAID"
        ).length;

    const paidInvoices =
        invoices.filter(
            (invoice) =>
                invoice.status === "PAID"
        ).length;


    // ==========================================
    // VIEW INVOICE
    // ==========================================

    const handleViewInvoice = (invoice) => {

        setSelectedInvoice(invoice);

    };


    return (

        <div className="supplier-invoices-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="supplier-invoices-header">

                <div>

                    <h1>
                        Invoices
                    </h1>

                    <p>
                        View and manage invoices for customer orders.
                    </p>

                </div>

            </div>


            {/* ======================================
                SUMMARY CARDS
            ====================================== */}

            <div className="supplier-invoices-summary">

                <div className="supplier-invoice-summary-card">

                    <div className="supplier-invoice-summary-icon blue">

                        <FileText size={22} />

                    </div>

                    <div>

                        <span>
                            Total Invoices
                        </span>

                        <strong>
                            {totalInvoices}
                        </strong>

                    </div>

                </div>


                <div className="supplier-invoice-summary-card">

                    <div className="supplier-invoice-summary-icon orange">

                        <Clock size={22} />

                    </div>

                    <div>

                        <span>
                            Draft Invoices
                        </span>

                        <strong>
                            {draftInvoices}
                        </strong>

                    </div>

                </div>


                <div className="supplier-invoice-summary-card">

                    <div className="supplier-invoice-summary-icon purple">

                        <Send size={22} />

                    </div>

                    <div>

                        <span>
                            Issued Invoices
                        </span>

                        <strong>
                            {issuedInvoices}
                        </strong>

                    </div>

                </div>


                <div className="supplier-invoice-summary-card">

                    <div className="supplier-invoice-summary-icon green">

                        <CheckCircle size={22} />

                    </div>

                    <div>

                        <span>
                            Paid Invoices
                        </span>

                        <strong>
                            {paidInvoices}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================
                MAIN CARD
            ====================================== */}

            <div className="supplier-invoices-card">

                <div className="supplier-invoices-toolbar">

                    <div>

                        <h2>
                            Customer Invoices
                        </h2>

                        <p>
                            Invoices generated for customer orders.
                        </p>

                    </div>


                    <div className="supplier-invoice-controls">

                        <div className="supplier-invoice-search">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <select
    className="supplier-invoice-filter"
    value={statusFilter}
    onChange={(e) =>
        setStatusFilter(
            e.target.value
        )
    }
>
    <option value="ALL">
        All Invoices
    </option>

    <option value="ISSUED">
        Issued
    </option>

    <option value="PAID">
        Paid
    </option>

    <option value="OVERDUE">
        Overdue
    </option>
</select>
                    </div>

                </div>


                {/* ERROR */}

                {errorMessage && (

                    <div className="supplier-invoice-error">

                        {errorMessage}

                    </div>

                )}


                {/* ======================================
                    TABLE
                ====================================== */}

                <div className="supplier-invoice-table-wrapper">

                    <table className="supplier-invoice-table">

                        <thead>

                            <tr>

                                <th>
                                    Invoice ID
                                </th>

                                <th>
                                    Order ID
                                </th>

                                <th>
                                    Company
                                </th>

                                <th>
                                    Invoice Date
                                </th>

                                <th>
                                    Due Date
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

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="supplier-invoice-loading"
                                    >
                                        Loading invoices...
                                    </td>

                                </tr>

                            ) : filteredInvoices.length === 0 ? (

                                <tr>

                                    <td colSpan="8">

                                        <div className="supplier-invoice-empty">

                                            <div className="supplier-invoice-empty-icon">

                                                <FileText size={30} />

                                            </div>

                                            <h3>
                                                No invoices available
                                            </h3>

                                            <p>

                                                {invoices.length === 0
                                                    ? "Invoices generated for customer orders will appear here."
                                                    : "No invoices match your search or selected filter."
                                                }

                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredInvoices.map(
                                    (invoice) => {

                                        const displayStatus =
                                            getDisplayStatus(
                                                invoice
                                            );

                                        return (

                                            <tr
                                                key={invoice.id}
                                            >

                                                <td>

                                                    <strong>
                                                        {invoice.invoice_number}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {invoice.po_number ||
                                                            "-"}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {invoice.company_name ||
                                                        "-"}
                                                </td>


                                                <td>
                                                    {formatDate(
                                                        invoice.invoice_date
                                                    )}
                                                </td>


                                                <td>
                                                    {invoice.due_date
                                                        ? formatDate(
                                                            invoice.due_date
                                                        )
                                                        : "-"
                                                    }
                                                </td>


                                                <td>

                                                    <strong>

                                                        {formatAmount(
                                                            invoice.total_amount
                                                        )}

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`supplier-invoice-status ${displayStatus
                                                            .toLowerCase()
                                                            .replace(
                                                                /_/g,
                                                                "-"
                                                            )}`}
                                                    >

                                                        {formatStatus(
                                                            displayStatus
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="supplier-invoice-view-btn"
                                                        onClick={() =>
                                                            handleViewInvoice(
                                                                invoice
                                                            )
                                                        }
                                                        title="View Invoice"
                                                    >

                                                        <Eye size={16} />

                                                    </button>

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
                VIEW INVOICE MODAL
            ====================================== */}

            {selectedInvoice && (

                <div
                    className="supplier-invoices-modal-overlay"
                    onClick={() =>
                        setSelectedInvoice(null)
                    }
                >

                    <div
                        className="supplier-invoices-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="supplier-invoices-modal-header">

                            <div>

                                <div className="supplier-invoices-title-row">

                                    <h2>
                                        Invoice
                                    </h2>

                                    <span
                                        className={`supplier-invoice-status ${getDisplayStatus(
                                            selectedInvoice
                                        )
                                            .toLowerCase()
                                            .replace(
                                                /_/g,
                                                "-"
                                            )}`}
                                    >

                                        {formatStatus(
                                            getDisplayStatus(
                                                selectedInvoice
                                            )
                                        )}

                                    </span>

                                </div>

                                <p>
                                    {selectedInvoice.invoice_number}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="supplier-invoices-modal-close"
                                onClick={() =>
                                    setSelectedInvoice(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="supplier-invoices-modal-body">

                            {/* CUSTOMER */}

                            <div className="supplier-invoice-section">

                                <h3>
                                    Customer Details
                                </h3>

                                <div className="supplier-invoice-detail-grid">

                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Company
                                        </span>

                                        <strong>
                                            {selectedInvoice.company_name ||
                                                "-"}
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Branch
                                        </span>

                                        <strong>
                                            {selectedInvoice.branch_name ||
                                                "-"}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* INVOICE */}

                            <div className="supplier-invoice-section">

                                <h3>
                                    Invoice Information
                                </h3>

                                <div className="supplier-invoice-detail-grid">

                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Invoice ID
                                        </span>

                                        <strong>
                                            {selectedInvoice.invoice_number}
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Order ID
                                        </span>

                                        <strong>
                                            {selectedInvoice.po_number ||
                                                "-"}
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Invoice Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedInvoice.invoice_date
                                            )}
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Due Date
                                        </span>

                                        <strong>
                                            {selectedInvoice.due_date
                                                ? formatDate(
                                                    selectedInvoice.due_date
                                                )
                                                : "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Payment Method
                                        </span>

                                        <strong>
                                            {formatStatus(
                                                selectedInvoice.payment_method
                                            )}
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-detail-item">

                                        <span>
                                            Invoice Status
                                        </span>

                                        <strong>
                                            {formatStatus(
                                                getDisplayStatus(
                                                    selectedInvoice
                                                )
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* AMOUNTS */}

                            <div className="supplier-invoice-section">

                                <h3>
                                    Amount Details
                                </h3>

                                <div className="supplier-invoice-amount-box">

                                    <div>

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatAmount(
                                                selectedInvoice.subtotal
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Tax
                                        </span>

                                        <strong>
                                            {formatAmount(
                                                selectedInvoice.tax
                                            )}
                                        </strong>

                                    </div>


                                    <div className="supplier-invoice-total">

                                        <span>
                                            Total Amount
                                        </span>

                                        <strong>
                                            {formatAmount(
                                                selectedInvoice.total_amount
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="supplier-invoices-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedInvoice(
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

        </div>

    );

}

export default SupplierInvoices;