import React, { useCallback, useEffect, useState } from "react";
import {
    IndianRupee,
    CheckCircle,
    Clock,
    AlertCircle,
    CreditCard,
    RefreshCw,
    BarChart3,
    TrendingUp,
    Users,
    WalletCards
} from "lucide-react";

import "./FinanceReports.css";

const API_URL = "http://localhost:5000/api/finance/reports";

function FinanceReports() {
    const token = localStorage.getItem("token");

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH REPORTS
    // =====================================================

    const fetchReports = useCallback(
        async (showRefreshing = false) => {
            try {
                if (showRefreshing) {
                    setRefreshing(true);
                }

                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch financial reports."
                    );
                }

                setReport(data);
                setError("");
            } catch (err) {
                console.error(
                    "Error fetching finance reports:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to load financial reports."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token]
    );

    // =====================================================
    // AUTO REFRESH
    // =====================================================

    useEffect(() => {
        fetchReports();

        const interval = setInterval(() => {
            fetchReports(true);
        }, 5000);

        const handleFocus = () => {
            fetchReports(true);
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener(
                "focus",
                handleFocus
            );
        };
    }, [fetchReports]);

    // =====================================================
    // HELPERS
    // =====================================================

    const formatAmount = (amount) => {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;
    };

    const formatCompactAmount = (amount) => {
        const value = Number(amount || 0);

        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(1)}Cr`;
        }

        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        }

        if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}K`;
        }

        return `₹${value.toFixed(0)}`;
    };

    const formatPaymentMethod = (method) => {
        const labels = {
            PREPAID: "Prepaid",
            POSTPAID: "Postpaid",
            NET_15: "Net 15",
            NET_30: "Net 30",
            PARTIAL: "Partial",
            COD: "COD"
        };

        return (
            labels[method] ||
            method?.replaceAll("_", " ") ||
            "Unknown"
        );
    };

    const formatStatus = (status) => {
        const labels = {
            SUCCESS: "Completed",
            PENDING: "Pending",
            FAILED: "Failed"
        };

        return labels[status] || status || "Unknown";
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="finance-reports-page">
                <div className="finance-reports-loading">
                    <RefreshCw
                        size={30}
                        className="report-spin"
                    />

                    <h3>
                        Loading financial reports...
                    </h3>

                    <p>
                        Fetching the latest financial information.
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error && !report) {
        return (
            <div className="finance-reports-page">
                <div className="finance-reports-error">
                    <AlertCircle size={34} />

                    <h3>
                        Unable to load financial reports
                    </h3>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="report-retry-btn"
                        onClick={() =>
                            fetchReports(true)
                        }
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const summary = report?.summary || {};

    const paymentMethods =
        report?.payment_methods || [];

    const paymentStatus =
        report?.payment_status || [];

    const supplierSpend =
        report?.supplier_spend || [];

    const monthlySummary =
        report?.monthly_summary || [];

    // =====================================================
    // SUMMARY VALUES
    // =====================================================

    const totalPurchase = Number(
        summary.total_purchase_value || 0
    );

    const totalPaid = Number(
        summary.total_paid_amount || 0
    );

    const outstanding = Number(
        summary.outstanding_amount || 0
    );

    const overdue = Number(
        summary.overdue_amount || 0
    );

    // =====================================================
    // CALCULATED INSIGHTS
    // =====================================================

    const paidPercentage =
        totalPurchase > 0
            ? (totalPaid / totalPurchase) * 100
            : 0;

    const outstandingPercentage =
        totalPurchase > 0
            ? (outstanding / totalPurchase) * 100
            : 0;

    const largestSupplier =
        supplierSpend.length > 0
            ? supplierSpend.reduce(
                  (largest, supplier) =>
                      Number(
                          supplier.total_spend || 0
                      ) >
                      Number(
                          largest.total_spend || 0
                      )
                          ? supplier
                          : largest
              )
            : null;

    const totalSupplierSpend =
        supplierSpend.reduce(
            (sum, supplier) =>
                sum +
                Number(
                    supplier.total_spend || 0
                ),
            0
        );

    const pendingTransactions =
        paymentStatus.find(
            (item) =>
                item.status === "PENDING"
        )?.transaction_count || 0;

    const completedTransactions =
        paymentStatus.find(
            (item) =>
                item.status === "SUCCESS"
        )?.transaction_count || 0;

    // =====================================================
    // GRAPH VALUES
    // =====================================================

    const maxMonthlyPurchase = Math.max(
        ...monthlySummary.map((item) =>
            Number(item.purchase_value || 0)
        ),
        1
    );

    const maxSupplierSpend = Math.max(
        ...supplierSpend.map((item) =>
            Number(item.total_spend || 0)
        ),
        1
    );

    const paymentTransactionTotal =
        paymentMethods.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.transaction_count || 0
                ),
            0
        );

   const paymentMix = paymentMethods.map((item) => ({
    ...item,
    percentage:
        paymentTransactionTotal > 0
            ? (Number(item.transaction_count || 0) /
                  paymentTransactionTotal) *
              100
            : 0
}));

    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="finance-reports-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="finance-reports-header">

                <div>
                    <div className="finance-title-row">
                        <h1>
                            Financial Reports
                        </h1>

                        <span className="live-report-badge">
                            <span></span>
                            Live
                        </span>
                    </div>

                    <p>
                        Financial performance, spending
                        trends and payment insights.
                    </p>
                </div>

                <button
                    type="button"
                    className="report-refresh-btn"
                    onClick={() =>
                        fetchReports(true)
                    }
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "report-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Updating..."
                        : "Refresh"}
                </button>

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="finance-report-summary">

                <div className="finance-report-card">
                    <div className="finance-report-icon blue">
                        <IndianRupee size={21} />
                    </div>

                    <div>
                        <span>
                            Total Purchase
                        </span>

                        <h2>
                            {formatAmount(
                                totalPurchase
                            )}
                        </h2>

                        <small>
                            Current procurement value
                        </small>
                    </div>
                </div>

                <div className="finance-report-card">
                    <div className="finance-report-icon green">
                        <CheckCircle size={21} />
                    </div>

                    <div>
                        <span>
                            Paid Amount
                        </span>

                        <h2>
                            {formatAmount(
                                totalPaid
                            )}
                        </h2>

                        <small>
                            Successfully settled
                        </small>
                    </div>
                </div>

                <div className="finance-report-card">
                    <div className="finance-report-icon orange">
                        <Clock size={21} />
                    </div>

                    <div>
                        <span>
                            Outstanding
                        </span>

                        <h2>
                            {formatAmount(
                                outstanding
                            )}
                        </h2>

                        <small>
                            Yet to be settled
                        </small>
                    </div>
                </div>

                <div className="finance-report-card">
                    <div className="finance-report-icon red">
                        <AlertCircle size={21} />
                    </div>

                    <div>
                        <span>
                            Overdue
                        </span>

                        <h2>
                            {formatAmount(
                                overdue
                            )}
                        </h2>

                        <small>
                            Past payment due date
                        </small>
                    </div>
                </div>

            </div>

            {/* =================================================
                MONTHLY SPEND TREND
            ================================================= */}

            <div className="finance-report-panel chart-panel">

                <div className="finance-panel-header">
                    <div>
                        <h2>
                            Monthly Spend Trend
                        </h2>

                        <p>
                            Purchase value across recent months
                        </p>
                    </div>

                    <TrendingUp size={21} />
                </div>

                <div className="monthly-chart">

                    {monthlySummary.length === 0 ? (
                        <div className="report-empty">
                            No monthly data available.
                        </div>
                    ) : (
                        <div className="chart-area">

                            <div className="chart-y-label">
                                <span>
                                    {formatCompactAmount(
                                        maxMonthlyPurchase
                                    )}
                                </span>
<span>
    {formatCompactAmount(
        maxMonthlyPurchase / 2
    )}
</span>

                                <span>
                                    ₹0
                                </span>
                            </div>

                            <div className="chart-content">

                                <div className="chart-grid-lines">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <div className="bar-chart">

                                    {monthlySummary
                                        .slice()
                                        .reverse()
                                        .map(
                                            (month) => {
                                                const value =
                                                    Number(
                                                        month.purchase_value ||
                                                            0
                                                    );

                                                const height =
                                                    Math.max(
                                                        (value /
                                                            maxMonthlyPurchase) *
                                                            100,
                                                        value > 0
                                                            ? 5
                                                            : 0
                                                    );

                                                return (
                                                    <div
                                                        className="chart-column"
                                                        key={
                                                            month.month
                                                        }
                                                    >
                                                        <div className="bar-value">
                                                            {formatCompactAmount(
                                                                value
                                                            )}
                                                        </div>

                                                        <div className="bar-track">
                                                            <div
                                                                className="bar-fill"
                                                                style={{
                                                                    height: `${height}%`
                                                                }}
                                                            ></div>
                                                        </div>

                                                        <span className="bar-label">
                                                            {month.month}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                        )}

                                </div>

                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* =================================================
                SUPPLIER + PAYMENT MIX
            ================================================= */}

            <div className="finance-report-grid">

                {/* Supplier Spend */}

                <div className="finance-report-panel">

                    <div className="finance-panel-header">
                        <div>
                            <h2>
                                Supplier Spend Analysis
                            </h2>

                            <p>
                                Share of procurement value by supplier
                            </p>
                        </div>

                        <Users size={21} />
                    </div>

                    <div className="supplier-analysis">

                        {supplierSpend.length === 0 ? (
                            <div className="report-empty">
                                No supplier data available.
                            </div>
                        ) : (
                            supplierSpend.map(
                                (supplier) => {
                                    const value =
                                        Number(
                                            supplier.total_spend ||
                                                0
                                        );

                                    const percentage =
                                        totalSupplierSpend >
                                        0
                                            ? (value /
                                                  totalSupplierSpend) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            className="supplier-analysis-row"
                                            key={
                                                supplier.supplier_id
                                            }
                                        >
                                            <div className="supplier-analysis-top">

                                                <div className="supplier-title">
                                                    <span>
                                                        {supplier
                                                            .supplier_name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "S"}
                                                    </span>

                                                    <strong>
                                                        {
                                                            supplier.supplier_name
                                                        }
                                                    </strong>
                                                </div>

                                                <strong>
                                                    {formatAmount(
                                                        value
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="supplier-progress">
                                                <div
                                                    style={{
                                                        width: `${percentage}%`
                                                    }}
                                                ></div>
                                            </div>

                                            <div className="supplier-analysis-bottom">
                                                <span>
                                                    {percentage.toFixed(
                                                        1
                                                    )}
                                                    % of total spend
                                                </span>

                                                <span>
                                                    {
                                                        supplier.purchase_orders
                                                    }{" "}
                                                    orders
                                                </span>
                                            </div>

                                        </div>
                                    );
                                }
                            )
                        )}

                    </div>

                </div>

                {/* Payment Mix */}

                <div className="finance-report-panel">

                    <div className="finance-panel-header">
                        <div>
                            <h2>
                                Payment Mix
                            </h2>

                            <p>
                                Transaction distribution by payment term
                            </p>
                        </div>

                        <WalletCards size={21} />
                    </div>

                    <div className="payment-mix">

                        <div
                            className="payment-donut"
                            style={{
                                background:
                                    paymentMix.length === 0
                                        ? "#edf1f6"
                                        : `conic-gradient(
                                            #2563eb 0% ${paymentMix[0]?.percentage || 0}%,
                                            #7c3aed ${paymentMix[0]?.percentage || 0}% ${(paymentMix[0]?.percentage || 0) + (paymentMix[1]?.percentage || 0)}%,
                                            #f59e0b ${(paymentMix[0]?.percentage || 0) + (paymentMix[1]?.percentage || 0)}% ${(paymentMix[0]?.percentage || 0) + (paymentMix[1]?.percentage || 0) + (paymentMix[2]?.percentage || 0)}%,
                                            #22c55e ${(paymentMix[0]?.percentage || 0) + (paymentMix[1]?.percentage || 0) + (paymentMix[2]?.percentage || 0)}% 100%
                                        )`
                            }}
                        >
                            <div>
                                <strong>
                                    {paymentTransactionTotal}
                                </strong>

                                <span>
                                    Transactions
                                </span>
                            </div>
                        </div>

                        <div className="payment-mix-list">

                            {paymentMix.map(
                                (item, index) => (
                                    <div
                                        className="payment-mix-row"
                                        key={
                                            item.payment_method
                                        }
                                    >
                                        <div>
                                            <span
                                                className={`mix-dot mix-${index}`}
                                            ></span>

                                            <strong>
                                                {formatPaymentMethod(
                                                    item.payment_method
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    item.transaction_count
                                                }
                                            </strong>

                                            <span>
                                                {item.percentage.toFixed(
                                                    0
                                                )}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
                PAYMENT PIPELINE
            ================================================= */}

            <div className="finance-report-panel payment-pipeline-panel">

                <div className="finance-panel-header">
                    <div>
                        <h2>
                            Payment Pipeline
                        </h2>

                        <p>
                            Current state of recorded payment transactions
                        </p>
                    </div>

                    <CreditCard size={21} />
                </div>

                <div className="pipeline">

                    {[
                        {
                            key: "SUCCESS",
                            label: "Completed",
                            icon: CheckCircle,
                            className: "completed"
                        },
                        {
                            key: "PENDING",
                            label: "Pending",
                            icon: Clock,
                            className: "pending"
                        },
                        {
                            key: "FAILED",
                            label: "Failed",
                            icon: AlertCircle,
                            className: "failed"
                        }
                    ].map((status) => {
                        const item =
                            paymentStatus.find(
                                (row) =>
                                    row.status ===
                                    status.key
                            );

                        const count = Number(
                            item?.transaction_count ||
                                0
                        );

                        const Icon = status.icon;

                        return (
                            <div
                                className={`pipeline-item ${status.className}`}
                                key={status.key}
                            >
                                <div className="pipeline-icon">
                                    <Icon size={19} />
                                </div>

                                <div className="pipeline-info">
                                    <span>
                                        {status.label}
                                    </span>

                                    <strong>
                                        {count}
                                    </strong>

                                    <small>
                                        {count === 1
                                            ? "transaction"
                                            : "transactions"}
                                    </small>
                                </div>
                            </div>
                        );
                    })}

                </div>

            </div>

            {/* =================================================
                FINANCIAL SNAPSHOT
            ================================================= */}

            <div className="finance-report-panel snapshot-panel">

                <div className="finance-panel-header">
                    <div>
                        <h2>
                            Financial Snapshot
                        </h2>

                        <p>
                            Key indicators derived from current financial data
                        </p>
                    </div>

                    <BarChart3 size={21} />
                </div>

                <div className="snapshot-grid">

                    <div className="snapshot-item">
                        <span>
                            Payment Completion
                        </span>

                        <strong>
                            {paidPercentage.toFixed(
                                1
                            )}
                            %
                        </strong>

                        <small>
                            of purchase value has been paid
                        </small>
                    </div>

                    <div className="snapshot-item">
                        <span>
                            Outstanding Exposure
                        </span>

                        <strong>
                            {outstandingPercentage.toFixed(
                                1
                            )}
                            %
                        </strong>

                        <small>
                            of purchase value remains
                        </small>
                    </div>

                    <div className="snapshot-item">
                        <span>
                            Largest Supplier
                        </span>

                        <strong className="snapshot-text">
                            {largestSupplier
                                ?.supplier_name ||
                                "No data"}
                        </strong>

                        <small>
                            Highest procurement spend
                        </small>
                    </div>

                    <div className="snapshot-item">
                        <span>
                            Pending Transactions
                        </span>

                        <strong>
                            {pendingTransactions}
                        </strong>

                        <small>
                            awaiting payment completion
                        </small>
                    </div>

                </div>

            </div>

            {/* =================================================
                MONTHLY SUMMARY
            ================================================= */}

            <div className="finance-report-panel monthly-panel">

                <div className="finance-panel-header">
                    <div>
                        <h2>
                            Monthly Financial Summary
                        </h2>

                        <p>
                            Historical financial performance
                        </p>
                    </div>

                    <BarChart3 size={21} />
                </div>

                <div className="monthly-table-wrapper">

                    <table className="monthly-table">

                        <thead>
                            <tr>
                                <th>
                                    Month
                                </th>

                                <th>
                                    Purchase Value
                                </th>

                                <th>
                                    Paid
                                </th>

                                <th>
                                    Outstanding
                                </th>

                                <th>
                                    Overdue
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {monthlySummary.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="table-empty"
                                    >
                                        No monthly data available.
                                    </td>
                                </tr>
                            ) : (
                                monthlySummary.map(
                                    (month) => (
                                        <tr
                                            key={
                                                month.month
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        month.month
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {formatAmount(
                                                    month.purchase_value
                                                )}
                                            </td>

                                            <td className="paid-text">
                                                {formatAmount(
                                                    month.paid_amount
                                                )}
                                            </td>

                                            <td className="outstanding-text">
                                                {formatAmount(
                                                    month.outstanding_amount
                                                )}
                                            </td>

                                            <td className="overdue-text">
                                                {formatAmount(
                                                    month.overdue_amount
                                                )}
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
                AUTO REFRESH
            ================================================= */}

            <div className="report-auto-refresh">

                <div>
                    <span className="refresh-status-dot"></span>

                    Reports update automatically every 5 seconds
                </div>

                <span>
                    Live financial data
                </span>

            </div>

        </div>
    );
}

export default FinanceReports;