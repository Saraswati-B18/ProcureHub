import React, { useEffect, useState } from "react";

import {
    CreditCard,
    Clock,
    CheckCircle,
    IndianRupee,
    Eye,
    X,
    FileText,
    Building2,
    CalendarDays,
    Hash,
    Wallet
} from "lucide-react";

import "./FinancePayments.css";



function FinancePayments() {

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [filter, setFilter] = useState("All Payments");

    const [selectedPayment, setSelectedPayment] = useState(null);



    // =====================================================
    // FETCH PAYMENTS
    // =====================================================

    const fetchPayments = async () => {

        try {

            setLoading(true);
            setErrorMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/finance/payments",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to load payments."
                );
            }

            setPayments(data.payments || []);

        } catch (error) {

            console.error(
                "Error fetching finance payments:",
                error
            );

            setErrorMessage(
                error.message || "Failed to load payments."
            );

        } finally {

            setLoading(false);

        }
    };



    useEffect(() => {
        fetchPayments();
    }, []);



    // =====================================================
    // FILTER PAYMENTS
    // =====================================================

    const filteredPayments = payments.filter((payment) => {

        if (filter === "All Payments") {
            return true;
        }

        if (filter === "Pending") {
            return payment.status === "PENDING";
        }

        if (filter === "Completed") {
            return payment.status === "SUCCESS";
        }

        if (filter === "Failed") {
            return payment.status === "FAILED";
        }

        return true;
    });



    // =====================================================
    // SUMMARY
    // =====================================================

    const totalPayments = payments.length;

    const pendingPayments = payments.filter(
        (payment) =>
            payment.status === "PENDING"
    ).length;

    const completedPayments = payments.filter(
        (payment) =>
            payment.status === "SUCCESS"
    ).length;

    const outstandingAmount = payments.reduce(
        (total, payment) => {

            if (payment.status === "PENDING") {
                return total + Number(payment.amount || 0);
            }

            return total;
        },
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
    // FORMAT AMOUNT
    // =====================================================

    const formatAmount = (amount) => {

        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    };



    // =====================================================
    // PAYMENT METHOD DETAILS
    // =====================================================

    const getPaymentMethodLabel = (paymentMethod) => {

        if (paymentMethod === "NET_15") {
            return "NET 15";
        }

        if (paymentMethod === "NET_30") {
            return "NET 30";
        }

        if (paymentMethod === "POSTPAID") {
            return "POSTPAID";
        }

        if (paymentMethod === "PREPAID") {
            return "PREPAID";
        }

        if (paymentMethod === "PARTIAL") {
            return "PARTIAL";
        }

        return paymentMethod || "—";
    };



    const getPaymentTermDescription = (paymentMethod) => {

        if (paymentMethod === "PREPAID") {
            return "Payment made in full at the time of processing.";
        }

        if (paymentMethod === "PARTIAL") {
            return "Only part of the invoice amount has been paid. The remaining amount is outstanding.";
        }

        if (paymentMethod === "POSTPAID") {
            return "Payment is scheduled after the postpaid period. The current system uses a 30-day due period.";
        }

        if (paymentMethod === "NET_15") {
            return "Payment is due within 15 days from the invoice date.";
        }

        if (paymentMethod === "NET_30") {
            return "Payment is due within 30 days from the invoice date.";
        }

        return "Payment terms recorded for this transaction.";
    };



const getFallbackDueDate = (payment) => {
    if (
        payment.payment_method !== "POSTPAID" &&
        payment.payment_method !== "NET_15" &&
        payment.payment_method !== "NET_30"
    ) {
        return null;
    }

    if (payment.due_date) {
        return payment.due_date;
    }

    if (!payment.payment_date) {
        return null;
    }

    const dueDate = new Date(
        payment.payment_date
    );

    if (payment.payment_method === "NET_15") {
        dueDate.setDate(
            dueDate.getDate() + 15
        );
    } else {
        dueDate.setDate(
            dueDate.getDate() + 30
        );
    }

    return dueDate;
};


    // =====================================================
    // STATUS
    // =====================================================

    const getStatusLabel = (
        status,
        paymentMethod
    ) => {

        if (paymentMethod === "PARTIAL") {
            return "PARTIALLY PAID";
        }

        if (status === "SUCCESS") {
            return "COMPLETED";
        }

        if (status === "PENDING") {
            return "PENDING";
        }

        if (status === "FAILED") {
            return "FAILED";
        }

        return status || "—";
    };



    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="finance-payments-page">

                <div className="page-heading">

                    <div>

                        <h1>
                            Payments
                        </h1>

                        <p>
                            Manage and track supplier payments
                        </p>

                    </div>

                </div>

                <div className="payment-loading-card">

                    <div className="payment-loading-icon">
                        <CreditCard size={34} />
                    </div>

                    <h3>
                        Loading payments...
                    </h3>

                    <p>
                        Please wait while payment transactions
                        are being loaded.
                    </p>

                </div>

            </div>
        );
    }



    // =====================================================
    // ERROR
    // =====================================================

    if (errorMessage) {

        return (
            <div className="finance-payments-page">

                <div className="page-heading">

                    <div>

                        <h1>
                            Payments
                        </h1>

                        <p>
                            Manage and track supplier payments
                        </p>

                    </div>

                </div>

                <div className="payment-loading-card">

                    <div className="payment-loading-icon">
                        <CreditCard size={34} />
                    </div>

                    <h3>
                        Unable to load payments
                    </h3>

                    <p>
                        {errorMessage}
                    </p>

                    <button
                        className="payment-retry-btn"
                        type="button"
                        onClick={fetchPayments}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }



    return (

        <div className="finance-payments-page">

            {/* =================================================
                PAGE HEADING
            ================================================= */}

            <div className="page-heading">

                <div>

                    <h1>
                        Payments
                    </h1>

                    <p>
                        Manage and track supplier payments
                    </p>

                </div>

            </div>



            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="payment-summary">

                {/* Total Payments */}

                <div className="payment-summary-card">

                    <div className="payment-summary-icon blue">
                        <CreditCard size={21} />
                    </div>

                    <div>

                        <span>
                            Total Payments
                        </span>

                        <strong>
                            {totalPayments}
                        </strong>

                    </div>

                </div>



                {/* Pending Payments */}

                <div className="payment-summary-card">

                    <div className="payment-summary-icon orange">
                        <Clock size={21} />
                    </div>

                    <div>

                        <span>
                            Pending Payments
                        </span>

                        <strong>
                            {pendingPayments}
                        </strong>

                    </div>

                </div>



                {/* Completed Payments */}

                <div className="payment-summary-card">

                    <div className="payment-summary-icon green">
                        <CheckCircle size={21} />
                    </div>

                    <div>

                        <span>
                            Completed Payments
                        </span>

                        <strong>
                            {completedPayments}
                        </strong>

                    </div>

                </div>



                {/* Outstanding Amount */}

                <div className="payment-summary-card">

                    <div className="payment-summary-icon purple">
                        <IndianRupee size={21} />
                    </div>

                    <div>

                        <span>
                            Outstanding Amount
                        </span>

                        <strong>
                            ₹{formatAmount(outstandingAmount)}
                        </strong>

                    </div>

                </div>

            </div>



            {/* =================================================
                PAYMENT HISTORY
            ================================================= */}

            <div className="payment-history-card">

                <div className="payment-history-header">

                    <div>

                        <h2>
                            Payment History
                        </h2>

                        <p>
                            View all supplier payment transactions.
                        </p>

                    </div>



                    <select
                        className="payment-filter"
                        value={filter}
                        onChange={(e) =>
                            setFilter(e.target.value)
                        }
                    >

                        <option>
                            All Payments
                        </option>

                        <option>
                            Pending
                        </option>

                        <option>
                            Completed
                        </option>

                        <option>
                            Failed
                        </option>

                    </select>

                </div>



                <div className="payment-table-wrapper">

                    <table className="payment-table">

                        <thead>

                            <tr>

                                <th>
                                    Payment ID
                                </th>

                                <th>
                                    Invoice ID
                                </th>

                                <th>
                                    Supplier
                                </th>

                                <th>
                                    Payment Date
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

                            {filteredPayments.length === 0 ? (

                                <tr>

                                    <td colSpan="8">

                                        <div className="payment-empty">

                                            <div className="payment-empty-icon">
                                                <CreditCard size={34} />
                                            </div>

                                            <h3>
                                                No payments available
                                            </h3>

                                            <p>
                                                Payment transactions will
                                                appear here once payments
                                                are processed.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredPayments.map(
                                    (payment) => (

                                        <tr key={payment.id}>

                                            <td>
                                                {payment.id}
                                            </td>

                                            <td>
                                                {payment.invoice_number ||
                                                    payment.invoice_id ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {payment.supplier_name ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    payment.payment_date
                                                )}
                                            </td>

                                            <td>
                                                ₹
                                                {formatAmount(
                                                    payment.amount
                                                )}
                                            </td>

                                            <td>
                                                {getPaymentMethodLabel(
                                                    payment.payment_method
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={`payment-status ${
                                                        payment.status ===
                                                        "SUCCESS"
                                                            ? "success"
                                                            : payment.status ===
                                                              "PENDING"
                                                                ? "pending"
                                                                : "failed"
                                                    }`}
                                                >

                                                    {getStatusLabel(
                                                        payment.status,
                                                        payment.payment_method
                                                    )}

                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="payment-view-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedPayment(
                                                            payment
                                                        )
                                                    }
                                                    title="View payment details"
                                                >

                                                    <Eye size={18} />

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>



            {/* =================================================
                PAYMENT INFORMATION
            ================================================= */}

            <div className="payment-info-card">

                <div className="payment-info-icon">
                    <Wallet size={22} />
                </div>

                <div>

                    <h3>
                        Payment Processing
                    </h3>

                    <p>
                        Payments are processed according to the
                        payment method selected for each purchase
                        order. Finance can track prepaid, postpaid,
                        partial, Net 15 and Net 30 payments from
                        this section.
                    </p>

                </div>

            </div>



            {/* =================================================
                PAYMENT DETAILS MODAL
            ================================================= */}

            {selectedPayment && (

                <div
                    className="payment-modal-overlay"
                    onClick={() =>
                        setSelectedPayment(null)
                    }
                >

                    <div
                        className="payment-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="payment-modal-header">

                            <div>

                                <h2>
                                    Payment Details
                                </h2>

                                <p>
                                    Transaction information
                                </p>

                            </div>

                            <button
                                className="payment-modal-close"
                                type="button"
                                onClick={() =>
                                    setSelectedPayment(null)
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>



                        <div className="payment-modal-body">

                            {/* Payment ID */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <Hash size={18} />
                                </div>

                                <div>

                                    <span>
                                        Payment ID
                                    </span>

                                    <strong>
                                        {selectedPayment.id}
                                    </strong>

                                </div>

                            </div>



                            {/* Invoice */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <FileText size={18} />
                                </div>

                                <div>

                                    <span>
                                        Invoice ID
                                    </span>

                                    <strong>
                                        {selectedPayment.invoice_number ||
                                            selectedPayment.invoice_id ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>



                            {/* Supplier */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <Building2 size={18} />
                                </div>

                                <div>

                                    <span>
                                        Supplier
                                    </span>

                                    <strong>
                                        {selectedPayment.supplier_name ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>



                            {/* Payment Date */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <CalendarDays size={18} />
                                </div>

                                <div>

                                    <span>
                                        Payment Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedPayment.payment_date
                                        )}
                                    </strong>

                                </div>

                            </div>



                           {/* Amount Paid / Amount Due */}
<div className="payment-detail-item">
    <div className="payment-detail-icon">
        <IndianRupee size={18} />
    </div>

    <div>
        <span>
            {selectedPayment.status === "PENDING"
                ? "Amount Due"
                : "Amount Paid"}
        </span>

        <strong>
            ₹{formatAmount(
                selectedPayment.amount
            )}
        </strong>
    </div>
</div>



                            {/* Invoice Total */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <IndianRupee size={18} />
                                </div>

                                <div>

                                    <span>
                                        Invoice Total
                                    </span>

                                    <strong>
                                        {selectedPayment.invoice_total !==
                                            undefined &&
                                        selectedPayment.invoice_total !==
                                            null
                                            ? `₹${formatAmount(
                                                selectedPayment.invoice_total
                                            )}`
                                            : "—"}
                                    </strong>

                                </div>

                            </div>



                            {/* Remaining Amount - Partial Payment */}

                            {selectedPayment.payment_method ===
                                "PARTIAL" && (

                                <div className="payment-detail-item">

                                    <div className="payment-detail-icon">
                                        <IndianRupee size={18} />
                                    </div>

                                    <div>

                                        <span>
                                            Remaining Amount
                                        </span>

                                        <strong>
                                            {selectedPayment.invoice_total !==
                                                undefined &&
                                            selectedPayment.invoice_total !==
                                                null
                                                ? `₹${formatAmount(
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            selectedPayment.invoice_total ||
                                                                0
                                                        ) -
                                                        Number(
                                                            selectedPayment.amount ||
                                                                0
                                                        )
                                                    )
                                                )}`
                                                : "—"}
                                        </strong>

                                    </div>

                                </div>

                            )}



                            {/* Payment Terms Information */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <CreditCard size={18} />
                                </div>

                                <div>

                                    <span>
                                        Payment Terms
                                    </span>

                                    <strong>
                                        {getPaymentMethodLabel(
                                            selectedPayment.payment_method
                                        )}
                                    </strong>

                                    <small
                                        style={{
                                            display: "block",
                                            marginTop: "4px",
                                            lineHeight: "1.5"
                                        }}
                                    >
                                        {getPaymentTermDescription(
                                            selectedPayment.payment_method
                                        )}
                                    </small>

                                </div>

                            </div>



                            {/* Due Date */}

{(
    selectedPayment.payment_method === "POSTPAID" ||
    selectedPayment.payment_method === "NET_15" ||
    selectedPayment.payment_method === "NET_30"
) && (

                                <div className="payment-detail-item">

                                    <div className="payment-detail-icon">
                                        <CalendarDays size={18} />
                                    </div>

                                    <div>

                                        <span>
                                            Due Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                getFallbackDueDate(
                                                    selectedPayment
                                                )
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            )}



                            {/* Payment Method */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <CreditCard size={18} />
                                </div>

                                <div>

                                    <span>
                                        Payment Method
                                    </span>

                                    <strong>
                                        {getPaymentMethodLabel(
                                            selectedPayment.payment_method
                                        )}
                                    </strong>

                                </div>

                            </div>



                            {/* Transaction Reference */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <FileText size={18} />
                                </div>

                                <div>

                                    <span>
                                        Transaction Reference
                                    </span>

                                    <strong>
                                        {selectedPayment.transaction_reference ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>



                            {/* Status */}

                            <div className="payment-detail-item">

                                <div className="payment-detail-icon">
                                    <CheckCircle size={18} />
                                </div>

                                <div>

                                    <span>
                                        Status
                                    </span>

                                    <strong>

                                        <span
                                            className={`payment-status ${
                                                selectedPayment.status ===
                                                "SUCCESS"
                                                    ? "success"
                                                    : selectedPayment.status ===
                                                      "PENDING"
                                                        ? "pending"
                                                        : "failed"
                                            }`}
                                        >

                                            {getStatusLabel(
                                                selectedPayment.status,
                                                selectedPayment.payment_method
                                            )}

                                        </span>

                                    </strong>

                                </div>

                            </div>

                        </div>



                        <div className="payment-modal-footer">

                            <button
                                type="button"
                                className="payment-modal-done"
                                onClick={() =>
                                    setSelectedPayment(null)
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



export default FinancePayments;