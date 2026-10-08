import React, {
    useEffect,
    useState
} from "react";

import {
    Package,
    ShoppingCart,
    Truck,
    IndianRupee,
    TrendingUp,
    FileText,
    AlertTriangle,
    Users,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

import axios from "axios";

import "./SupplierReports.css";


function SupplierReports() {

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    const [lastUpdated, setLastUpdated] =
        useState(null);


    // ==========================================
    // FETCH REPORTS
    // ==========================================

    const fetchReports = async (
        showLoading = false
    ) => {

        try {

            if (showLoading) {
                setLoading(true);
            }

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/suppliers/reports?t=${Date.now()}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Cache-Control":
                            "no-cache",
                        Pragma:
                            "no-cache"
                    }
                }
            );

            setReport(
                response.data
            );

            setLastUpdated(
                new Date()
            );

            setErrorMessage("");

        } catch (error) {

            console.error(
                "Failed to fetch supplier reports:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to load supplier reports."
            );

        } finally {

            if (showLoading) {
                setLoading(false);
            }

        }

    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        fetchReports(true);

    }, []);


    // ==========================================
    // AUTO REFRESH
    // ==========================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchReports(false);

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    // ==========================================
    // HELPERS
    // ==========================================

    const formatAmount = (amount) => {

        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    };


    const formatNumber = (number) => {

        return Number(
            number || 0
        ).toLocaleString("en-IN");

    };


    const formatStatus = (status) => {

        if (!status) {
            return "-";
        }

        return status
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );

    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading && !report) {

        return (

            <div className="supplier-reports-page">

                <div className="supplier-reports-loading">

                    <div className="supplier-reports-loading-icon">

                        <RefreshCw
                            size={28}
                        />

                    </div>

                    <h2>
                        Loading Reports
                    </h2>

                    <p>
                        Preparing your latest business data...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // FALLBACK
    // ==========================================

    if (!report) {

        return (

            <div className="supplier-reports-page">

                <div className="supplier-reports-error">

                    <AlertTriangle
                        size={28}
                    />

                    <h2>
                        Unable to load reports
                    </h2>

                    <p>
                        {errorMessage}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            fetchReports(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    const summary =
        report.summary || {};

    const invoices =
        report.invoices || {};

    const monthlySales =
        report.monthly_sales || [];

    const topProducts =
        report.top_products || [];

    const customers =
        report.customers || [];

    const recentOrders =
        report.recent_orders || [];


    const maxProductSales =
        Math.max(
            ...topProducts.map(
                (product) =>
                    Number(
                        product.sales || 0
                    )
            ),
            1
        );


    const maxCustomerSales =
        Math.max(
            ...customers.map(
                (customer) =>
                    Number(
                        customer.sales || 0
                    )
            ),
            1
        );


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="supplier-reports-page">

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="supplier-reports-header">

                <div>

                    <div className="supplier-reports-title-row">

                        <h1>
                            Supplier Reports
                        </h1>

                        <span className="supplier-live-badge">

                            <span className="supplier-live-dot" />

                            Live Data

                        </span>

                    </div>

                    <p>
                        Monitor sales, orders, products, invoices and customer activity.
                    </p>

                </div>


                <div className="supplier-report-refresh">

                    <span>

                        {lastUpdated
                            ? `Updated ${lastUpdated.toLocaleTimeString(
                                "en-IN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }
                            )}`
                            : "Updating..."
                        }

                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            fetchReports(false)
                        }
                        title="Refresh reports"
                    >

                        <RefreshCw
                            size={16}
                        />

                    </button>

                </div>

            </div>


            {errorMessage && (

                <div className="supplier-reports-warning">

                    <AlertTriangle
                        size={17}
                    />

                    <span>
                        {errorMessage}
                    </span>

                </div>

            )}


            {/* ======================================
                KEY METRICS
            ====================================== */}

            <div className="supplier-report-metrics">

                <div className="supplier-report-metric-card">

                    <div className="supplier-report-metric-icon blue">

                        <IndianRupee
                            size={22}
                        />

                    </div>

                    <div>

                        <span>
                            Total Sales
                        </span>

                        <strong>
                            {formatAmount(
                                summary.total_sales
                            )}
                        </strong>

                        <small>
                            Across all orders
                        </small>

                    </div>

                </div>


                <div className="supplier-report-metric-card">

                    <div className="supplier-report-metric-icon purple">

                        <ShoppingCart
                            size={22}
                        />

                    </div>

                    <div>

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {formatNumber(
                                summary.total_orders
                            )}
                        </strong>

                        <small>
                            {formatNumber(
                                summary.customer_count
                            )} customer companies
                        </small>

                    </div>

                </div>


                <div className="supplier-report-metric-card">

                    <div className="supplier-report-metric-icon green">

                        <CheckCircle
                            size={22}
                        />

                    </div>

                    <div>

                        <span>
                            Completed Orders
                        </span>

                        <strong>
                            {formatNumber(
                                summary.completed_orders
                            )}
                        </strong>

                        <small>
                            Delivered / completed
                        </small>

                    </div>

                </div>


                <div className="supplier-report-metric-card">

                    <div className="supplier-report-metric-icon orange">

                        <AlertTriangle
                            size={22}
                        />

                    </div>

                    <div>

                        <span>
                            Outstanding
                        </span>

                        <strong>
                            {formatAmount(
                                invoices.outstanding_amount
                            )}
                        </strong>

                        <small>
                            Unpaid invoice value
                        </small>

                    </div>

                </div>

            </div>


            {/* ======================================
                SALES TREND + ORDER STATUS
            ====================================== */}

            <div className="supplier-report-two-column">


                {/* SALES TREND */}

                <div className="supplier-report-panel sales-panel">

                    <div className="supplier-report-panel-header">

                        <div>

                            <h2>
                                Sales Trend
                            </h2>

                            <p>
                                Order sales over the last 6 months
                            </p>

                        </div>

                        <TrendingUp
                            size={20}
                        />

                    </div>


                    <div className="supplier-sales-chart">

                        {monthlySales.length === 0 ? (

                            <div className="supplier-report-no-data">

                                No sales data available yet.

                            </div>

                        ) : (

                            monthlySales.map(
                                (item) => {

                                    const maxSales =
                                        Math.max(
                                            ...monthlySales.map(
                                                (entry) =>
                                                    Number(
                                                        entry.sales ||
                                                        0
                                                    )
                                            ),
                                            1
                                        );

                                    const height =
                                        (
                                            Number(
                                                item.sales ||
                                                0
                                            ) /
                                            maxSales
                                        ) *
                                        100;

                                    return (

                                        <div
                                            className="supplier-sales-column"
                                            key={
                                                item.month_key
                                            }
                                        >

                                            <div className="supplier-sales-value">

                                                {formatAmount(
                                                    item.sales
                                                )}

                                            </div>

                                            <div className="supplier-sales-bar-area">

                                                <div
                                                    className="supplier-sales-bar"
                                                    style={{
                                                        height:
                                                            `${Math.max(
                                                                height,
                                                                5
                                                            )}%`
                                                    }}
                                                />

                                            </div>

                                            <span>
                                                {item.month}
                                            </span>

                                        </div>

                                    );

                                }
                            )

                        )}

                    </div>

                </div>


                {/* ORDER STATUS */}

                <div className="supplier-report-panel">

                    <div className="supplier-report-panel-header">

                        <div>

                            <h2>
                                Order Performance
                            </h2>

                            <p>
                                Current order status distribution
                            </p>

                        </div>

                        <ShoppingCart
                            size={20}
                        />

                    </div>


                    <div className="supplier-order-performance">

                        <div>

                            <span>
                                <Clock size={15} />
                                Pending
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.pending_orders
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                <RefreshCw size={15} />
                                Processing
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.processing_orders
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                <Truck size={15} />
                                Shipped
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.shipped_orders
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                <CheckCircle size={15} />
                                Completed
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.completed_orders
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                <XCircle size={15} />
                                Cancelled
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.cancelled_orders
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* ======================================
                INVOICE + INVENTORY
            ====================================== */}

            <div className="supplier-report-two-column">


                {/* INVOICES */}

                <div className="supplier-report-panel">

                    <div className="supplier-report-panel-header">

                        <div>

                            <h2>
                                Invoice & Payment Summary
                            </h2>

                            <p>
                                Current receivables from customers
                            </p>

                        </div>

                        <FileText
                            size={20}
                        />

                    </div>


                    <div className="supplier-invoice-summary-grid">

                        <div>

                            <span>
                                Paid
                            </span>

                            <strong className="paid-value">
                                {formatAmount(
                                    invoices.paid_amount
                                )}
                            </strong>

                            <small>
                                {formatNumber(
                                    invoices.paid
                                )} invoices
                            </small>

                        </div>


                        <div>

                            <span>
                                Outstanding
                            </span>

                            <strong className="outstanding-value">
                                {formatAmount(
                                    invoices.outstanding_amount
                                )}
                            </strong>

                            <small>
                                {formatNumber(
                                    invoices.issued +
                                    invoices.partially_paid
                                )} unpaid invoices
                            </small>

                        </div>


                        <div>

                            <span>
                                Overdue
                            </span>

                            <strong className="overdue-value">
                                {formatAmount(
                                    invoices.overdue_amount
                                )}
                            </strong>

                            <small>
                                Past due date
                            </small>

                        </div>

                    </div>

                </div>


                {/* INVENTORY */}

                <div className="supplier-report-panel">

                    <div className="supplier-report-panel-header">

                        <div>

                            <h2>
                                Inventory Overview
                            </h2>

                            <p>
                                Current product availability
                            </p>

                        </div>

                        <Package
                            size={20}
                        />

                    </div>


                    <div className="supplier-inventory-grid">

                        <div className="supplier-inventory-main">

                            <span>
                                Active Products
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.active_products
                                )}
                            </strong>

                        </div>


                        <div className="supplier-inventory-warning">

                            <AlertTriangle
                                size={19}
                            />

                            <div>

                                <span>
                                    Low Stock
                                </span>

                                <strong>
                                    {formatNumber(
                                        summary.low_stock_products
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div className="supplier-inventory-products">

                            <span>
                                Total Products
                            </span>

                            <strong>
                                {formatNumber(
                                    summary.total_products
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* ======================================
                TOP PRODUCTS
            ====================================== */}

            <div className="supplier-report-panel">

                <div className="supplier-report-panel-header">

                    <div>

                        <h2>
                            Top Products
                        </h2>

                        <p>
                            Products generating the most sales
                        </p>

                    </div>

                    <Package
                        size={20}
                    />

                </div>


                {topProducts.length === 0 ? (

                    <div className="supplier-report-no-data">

                        No product sales available yet.

                    </div>

                ) : (

                    <div className="supplier-ranking-list">

                        {topProducts.map(
                            (product, index) => {

                                const sales =
                                    Number(
                                        product.sales ||
                                        0
                                    );

                                const percentage =
                                    (
                                        sales /
                                        maxProductSales
                                    ) *
                                    100;

                                return (

                                    <div
                                        className="supplier-ranking-item"
                                        key={
                                            product.product_id
                                        }
                                    >

                                        <div className="supplier-ranking-number">

                                            {index + 1}

                                        </div>


                                        <div className="supplier-ranking-content">

                                            <div className="supplier-ranking-top">

                                                <strong>
                                                    {product.product_name}
                                                </strong>

                                                <span>
                                                    {formatAmount(
                                                        sales
                                                    )}
                                                </span>

                                            </div>


                                            <div className="supplier-ranking-bar">

                                                <div
                                                    style={{
                                                        width:
                                                            `${percentage}%`
                                                    }}
                                                />

                                            </div>


                                            <small>
                                                {formatNumber(
                                                    product.quantity_sold
                                                )} units sold
                                            </small>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* ======================================
                CUSTOMER SALES
            ====================================== */}

            <div className="supplier-report-panel">

                <div className="supplier-report-panel-header">

                    <div>

                        <h2>
                            Top Customer Companies
                        </h2>

                        <p>
                            Customers generating the highest order value
                        </p>

                    </div>

                    <Users
                        size={20}
                    />

                </div>


                {customers.length === 0 ? (

                    <div className="supplier-report-no-data">

                        No customer activity available yet.

                    </div>

                ) : (

                    <div className="supplier-customer-grid">

                        {customers.map(
                            (customer) => {

                                const sales =
                                    Number(
                                        customer.sales ||
                                        0
                                    );

                                const percentage =
                                    (
                                        sales /
                                        maxCustomerSales
                                    ) *
                                    100;

                                return (

                                    <div
                                        className="supplier-customer-card"
                                        key={
                                            customer.company_name
                                        }
                                    >

                                        <div className="supplier-customer-icon">

                                            <Users
                                                size={19}
                                            />

                                        </div>


                                        <div className="supplier-customer-content">

                                            <strong>
                                                {customer.company_name}
                                            </strong>

                                            <span>
                                                {formatNumber(
                                                    customer.order_count
                                                )} orders
                                            </span>

                                            <div className="supplier-customer-bar">

                                                <div
                                                    style={{
                                                        width:
                                                            `${percentage}%`
                                                    }}
                                                />

                                            </div>

                                            <b>
                                                {formatAmount(
                                                    sales
                                                )}
                                            </b>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* ======================================
                RECENT ORDERS
            ====================================== */}

            <div className="supplier-report-panel">

                <div className="supplier-report-panel-header">

                    <div>

                        <h2>
                            Recent Orders
                        </h2>

                        <p>
                            Latest purchase orders received
                        </p>

                    </div>

                    <ShoppingCart
                        size={20}
                    />

                </div>


                <div className="supplier-report-table-wrapper">

                    <table className="supplier-report-table">

                        <thead>

                            <tr>

                                <th>
                                    Order ID
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Date
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

                            </tr>

                        </thead>


                        <tbody>

                            {recentOrders.map(
                                (order) => (

                                    <tr
                                        key={
                                            order.po_number
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {order.po_number}
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
                                            <strong>
                                                {formatAmount(
                                                    order.total_amount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            {formatStatus(
                                                order.payment_method
                                            )}
                                        </td>

                                        <td>

                                            <span
                                                className={`supplier-report-status ${String(
                                                    order.status ||
                                                    ""
                                                ).toLowerCase()}`}
                                            >

                                                {formatStatus(
                                                    order.status
                                                )}

                                            </span>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>


                    {recentOrders.length === 0 && (

                        <div className="supplier-report-no-data">

                            No orders available yet.

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default SupplierReports;