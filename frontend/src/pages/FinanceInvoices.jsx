import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  CreditCard
} from "lucide-react";

import { useEffect, useState } from "react";

import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

import "./FinanceInvoices.css";

const FinanceInvoices = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processedCount, setProcessedCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentTerm, setPaymentTerm] = useState("PREPAID");
  const [paymentError, setPaymentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  // =====================================================
  // FETCH APPROVED PURCHASE REQUESTS
  // =====================================================

  const fetchApprovedRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/finance/approved-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch approved purchase requests."
        );
      }

      setRequests(data.requests || []);

      setProcessedCount(
        Number(data.summary?.processed_count || 0)
      );

    } catch (error) {
      console.error(
        "Finance approved requests error:",
        error
      );

      setRequests([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchApprovedRequests();
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
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;
  };

  // =====================================================
  // VIEW PURCHASE REQUEST
  // =====================================================

  const viewRequest = async (requestId) => {
    try {
      setDetailsLoading(true);
      setSelectedRequest(null);

      const response = await fetch(
        `http://localhost:5000/api/finance/approved-requests/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch purchase request details."
        );
      }

      setSelectedRequest(data.request);

    } catch (error) {
      console.error(
        "Finance request details error:",
        error
      );

      setPaymentError(
        error.message ||
          "Failed to load purchase request details."
      );

    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // PROCESS PAYMENT
  // =====================================================

  const processPayment = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setProcessingPayment(true);
      setPaymentError("");

      const response = await fetch(
        `http://localhost:5000/api/finance/approved-requests/${selectedRequest.id}/process-payment`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            payment_term: paymentTerm
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to process payment."
        );
      }

      // Save request number before closing modal
      const processedRequestNumber =
        selectedRequest.request_number;

      // Close payment confirmation
      setShowPaymentConfirm(false);

      // Close request details
      setSelectedRequest(null);

      // Show success notification
      setSuccessMessage(
        `Payment for ${processedRequestNumber} was processed successfully. Purchase order(s), invoice(s), and payment record(s) have been created.`
      );

      // Refresh approved requests
      await fetchApprovedRequests();

      // Automatically hide success notification
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

    } catch (error) {
      console.error(
        "Payment processing error:",
        error
      );

      // Close confirmation modal
      setShowPaymentConfirm(false);

      // Close selected request as well
      setSelectedRequest(null);

      setPaymentError(
        error.message ||
          "Failed to process payment."
      );

    } finally {
      setProcessingPayment(false);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredRequests = requests.filter(
    (request) => {
      if (filter === "all") {
        return true;
      }

      return (
        request.status?.toLowerCase() ===
        filter
      );
    }
  );

  // =====================================================
  // SUMMARY
  // =====================================================

  const approvedCount = requests.length;

  const awaitingPaymentCount =
    requests.length;

  // =====================================================
  // OPEN PAYMENT CONFIRMATION
  // =====================================================

  const openPaymentConfirmation = (request) => {
    setPaymentError("");
    setPaymentTerm("PREPAID");
    setSelectedRequest(request);
    setShowPaymentConfirm(true);
  };

  // =====================================================
  // CLOSE PAYMENT CONFIRMATION
  // =====================================================

  const closePaymentConfirmation = () => {
    if (processingPayment) {
      return;
    }

    setShowPaymentConfirm(false);
    setSelectedRequest(null);
  };

  return (
    <div className="finance-invoices-page">

      {/* =================================================
          PAGE HEADING
      ================================================= */}

      <div className="finance-invoices-heading">

        <div>

          <h1>
            Approved Purchase Requests
          </h1>

          <p>
            Review purchase requests approved by
            your branch manager.
          </p>

        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
        >
          <option value="all">
            All Requests
          </option>

          <option value="approved">
            Approved
          </option>
        </select>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="finance-invoice-summary">

        {/* APPROVED REQUESTS */}

        <Card>

          <div className="finance-invoice-summary-card">

            <div className="finance-invoice-icon orange">
              <FileText size={21} />
            </div>

            <div>

              <span>
                Approved Requests
              </span>

              <strong>
                {approvedCount}
              </strong>

            </div>

          </div>

        </Card>

        {/* AWAITING PAYMENT */}

        <Card>

          <div className="finance-invoice-summary-card">

            <div className="finance-invoice-icon warning">
              <Clock size={21} />
            </div>

            <div>

              <span>
                Awaiting Payment
              </span>

              <strong>
                {awaitingPaymentCount}
              </strong>

            </div>

          </div>

        </Card>

        {/* PROCESSED */}

        <Card>

          <div className="finance-invoice-summary-card">

            <div className="finance-invoice-icon green">
              <CheckCircle size={21} />
            </div>

            <div>

              <span>
                Processed
              </span>

              <strong>
                {processedCount}
              </strong>

            </div>

          </div>

        </Card>

        {/* OVERDUE */}

        <Card>

          <div className="finance-invoice-summary-card">

            <div className="finance-invoice-icon red">
              <AlertCircle size={21} />
            </div>

            <div>

              <span>
                Overdue
              </span>

              <strong>
                0
              </strong>

            </div>

          </div>

        </Card>

      </div>

      {/* =================================================
          APPROVED REQUEST TABLE
      ================================================= */}

      <Card>

        <div className="finance-invoices-card-header">

          <div>

            <h2>
              Approved Purchase Requests
            </h2>

            <p>
              Purchase requests ready for Finance
              processing.
            </p>

          </div>

        </div>

        <div className="finance-invoices-table-wrapper">

          <table className="finance-invoices-table">

            <thead>

              <tr>

                <th>
                  Request ID
                </th>

                <th>
                  Requested By
                </th>

                <th>
                  Approved Date
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

              {/* LOADING */}

              {loading && (

                <tr>

                  <td colSpan="6">

                    <div className="finance-invoices-empty">

                      <div className="finance-invoices-empty-icon">
                        <Clock size={34} />
                      </div>

                      <h3>
                        Loading requests...
                      </h3>

                      <p>
                        Fetching approved purchase
                        requests.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

              {/* EMPTY */}

              {!loading &&
                filteredRequests.length === 0 && (

                  <tr>

                    <td colSpan="6">

                      <div className="finance-invoices-empty">

                        <div className="finance-invoices-empty-icon">
                          <FileText size={34} />
                        </div>

                        <h3>
                          No approved requests
                        </h3>

                        <p>
                          Manager-approved purchase
                          requests will appear here.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              {/* DATA */}

              {!loading &&
                filteredRequests.length > 0 &&
                filteredRequests.map(
                  (request) => (

                    <tr key={request.id}>

                      {/* REQUEST ID */}

                      <td>

                        <strong>
                          {request.request_number}
                        </strong>

                      </td>

                      {/* REQUESTED BY */}

                      <td>
                        {request.requested_by_name ||
                          "-"}
                      </td>

                      {/* APPROVED DATE */}

                      <td>

                        {formatDate(
                          request.approved_at
                        )}

                      </td>

                      {/* AMOUNT */}

                      <td>

                        {formatAmount(
                          request.total_amount
                        )}

                      </td>

                      {/* STATUS */}

                      <td>

                        <Badge variant="warning">
                          APPROVED
                        </Badge>

                      </td>

                      {/* ACTION */}

                      <td>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                          }}
                        >

                          {/* VIEW */}

                          <button
                            type="button"
                            title="View Details"
                            onClick={() =>
                              viewRequest(
                                request.id
                              )
                            }
                            style={{
                              width: "44px",
                              height: "44px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border:
                                "1px solid #dbe3ef",
                              borderRadius: "8px",
                              background: "#ffffff",
                              color: "#64748b",
                              cursor: "pointer"
                            }}
                          >

                            <Eye size={18} />

                          </button>

                          {/* PROCESS PAYMENT */}

                          <button
                            type="button"
                            title="Process Payment"
                            onClick={() =>
                              openPaymentConfirmation(
                                request
                              )
                            }
                            style={{
                              width: "44px",
                              height: "44px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border:
                                "1px solid #dbe3ef",
                              borderRadius: "8px",
                              background: "#ffffff",
                              color: "#16a34a",
                              cursor: "pointer"
                            }}
                          >

                            <CreditCard size={18} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* =================================================
          REQUEST DETAILS MODAL
      ================================================= */}

      {(
        detailsLoading ||
        (
          selectedRequest &&
          !showPaymentConfirm
        )
      ) && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px"
          }}
          onClick={() => {
            if (!detailsLoading) {
              setSelectedRequest(null);
            }
          }}
        >

          <div
            style={{
              width: "900px",
              maxWidth: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "14px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.18)"
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 26px",
                borderBottom:
                  "1px solid #e5e7eb"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#111827"
                  }}
                >
                  {detailsLoading
                    ? "Purchase Request"
                    : selectedRequest?.request_number}
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "14px"
                  }}
                >
                  Approved Purchase Request
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                disabled={detailsLoading}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: detailsLoading
                    ? "default"
                    : "pointer",
                  padding: "6px"
                }}
              >
                <X size={21} />
              </button>

            </div>

            {/* LOADING */}

            {detailsLoading && (

              <div
                style={{
                  padding: "60px",
                  textAlign: "center",
                  color: "#64748b"
                }}
              >

                <Clock size={30} />

                <p>
                  Loading purchase request details...
                </p>

              </div>

            )}

            {/* DETAILS */}

            {!detailsLoading &&
              selectedRequest && (

                <>

                  {/* BASIC INFORMATION */}

                  <div
                    style={{
                      padding: "24px 26px"
                    }}
                  >

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, 1fr)",
                        gap: "18px"
                      }}
                    >

                      {/* REQUESTED BY */}

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px"
                          }}
                        >
                          Requested By
                        </span>

                        <strong>
                          {selectedRequest
                            .requested_by_name ||
                            "-"}
                        </strong>

                      </div>

                      {/* EMAIL */}

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px"
                          }}
                        >
                          Email
                        </span>

                        <strong>
                          {selectedRequest
                            .requested_by_email ||
                            "-"}
                        </strong>

                      </div>

                      {/* PHONE */}

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px"
                          }}
                        >
                          Phone
                        </span>

                        <strong>
                          {selectedRequest
                            .requested_by_phone ||
                            "-"}
                        </strong>

                      </div>

                      {/* REQUEST DATE */}

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px"
                          }}
                        >
                          Request Date
                        </span>

                        <strong>
                          {formatDate(
                            selectedRequest.created_at
                          )}
                        </strong>

                      </div>

                      {/* APPROVED DATE */}

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px"
                          }}
                        >
                          Approved Date
                        </span>

                        <strong>
                          {formatDate(
                            selectedRequest.approved_at
                          )}
                        </strong>

                      </div>

                      {/* TOTAL */}

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px"
                          }}
                        >
                          Total Amount
                        </span>

                        <strong>
                          {formatAmount(
                            selectedRequest.total_amount
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* =================================================
                        REQUESTED PRODUCTS
                    ================================================= */}

                    <div
                      style={{
                        marginTop: "30px"
                      }}
                    >

                      <h3
                        style={{
                          margin: "0 0 15px",
                          fontSize: "16px"
                        }}
                      >
                        Requested Products
                      </h3>

                      <div
                        style={{
                          overflowX: "auto",
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: "10px"
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
                                  padding: "12px",
                                  textAlign: "left",
                                  fontSize: "12px"
                                }}
                              >
                                Product
                              </th>

                              <th
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  fontSize: "12px"
                                }}
                              >
                                Supplier
                              </th>

                              <th
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  fontSize: "12px"
                                }}
                              >
                                Quantity
                              </th>

                              <th
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                  fontSize: "12px"
                                }}
                              >
                                Unit Price
                              </th>

                              <th
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                  fontSize: "12px"
                                }}
                              >
                                Total
                              </th>

                            </tr>

                          </thead>

                          <tbody>

                            {(
                              selectedRequest.items ||
                              []
                            ).map(
                              (item) => (

                                <tr
                                  key={item.id}
                                >

                                  <td
                                    style={{
                                      padding: "12px",
                                      borderTop:
                                        "1px solid #e5e7eb"
                                    }}
                                  >
                                    {item.product_name ||
                                      "-"}
                                  </td>

                                  <td
                                    style={{
                                      padding: "12px",
                                      borderTop:
                                        "1px solid #e5e7eb"
                                    }}
                                  >
                                    {item.supplier_name ||
                                      "-"}
                                  </td>

                                  <td
                                    style={{
                                      padding: "12px",
                                      textAlign:
                                        "center",
                                      borderTop:
                                        "1px solid #e5e7eb"
                                    }}
                                  >
                                    {item.quantity}
                                  </td>

                                  <td
                                    style={{
                                      padding: "12px",
                                      textAlign:
                                        "right",
                                      borderTop:
                                        "1px solid #e5e7eb"
                                    }}
                                  >
                                    {formatAmount(
                                      item.unit_price
                                    )}
                                  </td>

                                  <td
                                    style={{
                                      padding: "12px",
                                      textAlign:
                                        "right",
                                      borderTop:
                                        "1px solid #e5e7eb"
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

                  </div>

                  {/* TOTAL SUMMARY */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "18px 26px 0"
                    }}
                  >

                    <div
                      style={{
                        width: "300px"
                      }}
                    >

                      {/* Subtotal */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          padding: "6px 0",
                          color: "#64748b",
                          fontSize: "14px"
                        }}
                      >

                        <span>
                          Subtotal
                        </span>

                        <strong>
                          {formatAmount(
                            (
                              selectedRequest.items ||
                              []
                            ).reduce(
                              (sum, item) =>
                                sum +
                                Number(
                                  item.total_price ||
                                    0
                                ),
                              0
                            )
                          )}
                        </strong>

                      </div>

                      {/* GST */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          padding: "6px 0",
                          color: "#64748b",
                          fontSize: "14px"
                        }}
                      >

                        <span>
                          GST (18%)
                        </span>

                        <strong>
                          {formatAmount(
                            Number(
                              selectedRequest.total_amount ||
                                0
                            ) -
                              (
                                selectedRequest.items ||
                                []
                              ).reduce(
                                (sum, item) =>
                                  sum +
                                  Number(
                                    item.total_price ||
                                      0
                                  ),
                                0
                              )
                          )}
                        </strong>

                      </div>

                      {/* Grand Total */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          marginTop: "8px",
                          paddingTop: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                          fontSize: "16px",
                          color: "#111827"
                        }}
                      >

                        <strong>
                          Grand Total
                        </strong>

                        <strong>
                          {formatAmount(
                            selectedRequest.total_amount
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      MODAL FOOTER
                  ================================================= */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      padding: "18px 26px",
                      borderTop:
                        "1px solid #e5e7eb"
                    }}
                  >

                    <Button
                      type="button"
                      onClick={() =>
                        setSelectedRequest(null)
                      }
                    >
                      Close
                    </Button>

                    {/* PROCESS PAYMENT */}

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentError("");
                        setPaymentTerm("PREPAID");
                        setShowPaymentConfirm(true);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#16a34a",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      <CreditCard size={16} />
                      Process Payment
                    </button>

                  </div>

                </>

              )}

          </div>

        </div>

      )}

      {/* =================================================
          PAYMENT CONFIRMATION MODAL
      ================================================= */}

      {showPaymentConfirm &&
        selectedRequest && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15, 23, 42, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "24px"
            }}
            onClick={closePaymentConfirmation}
          >

            <div
              style={{
                width: "520px",
                maxWidth: "100%",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "28px",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,0.20)"
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "18px"
                }}
              >

                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CreditCard
                    size={22}
                    color="#16a34a"
                  />
                </div>

                <div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: "19px",
                      color: "#111827"
                    }}
                  >
                    Process Payment
                  </h3>

                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#64748b",
                      fontSize: "13px"
                    }}
                  >
                    {selectedRequest.request_number}
                  </p>

                </div>

              </div>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#475569",
                  lineHeight: "1.6",
                  fontSize: "14px"
                }}
              >
                Select the payment terms for this approved purchase
                request. The selected terms will be saved with the
                invoice and payment records.
              </p>

              <div style={{ marginBottom: "18px" }}>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151"
                  }}
                >
                  Payment Terms
                </label>

                <select
                  value={paymentTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPaymentTerm(value);
                  }}
                  disabled={processingPayment}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "14px"
                  }}
                >

                  <option value="PREPAID">
                    Prepaid
                  </option>

                  <option value="COD">
                    Cash on Delivery (COD)
                  </option>

                  <option value="NET_15">
                    Net 15
                  </option>

                  <option value="NET_30">
                    Net 30
                  </option>

                </select>

              </div>

              <div
                style={{
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  marginBottom: "18px"
                }}
              >

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "5px"
                  }}
                >
                  Total Purchase Amount
                </span>

                <strong
                  style={{
                    fontSize: "20px",
                    color: "#111827"
                  }}
                >
                  {formatAmount(
                    selectedRequest.total_amount
                  )}
                </strong>

              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  marginBottom: "22px",
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: "1.5"
                }}
              >

                {paymentTerm === "PREPAID" && (
                  <>
                    <strong>Prepaid:</strong>{" "}
                    Full payment will be recorded immediately.
                  </>
                )}

                {paymentTerm === "COD" && (
                  <>
                    <strong>Cash on Delivery:</strong>{" "}
                    Payment will be made when the order is delivered.
                  </>
                )}

                {paymentTerm === "NET_15" && (
                  <>
                    <strong>Net 15:</strong>{" "}
                    Payment will be due 15 days after the invoice date.
                  </>
                )}

                {paymentTerm === "NET_30" && (
                  <>
                    <strong>Net 30:</strong>{" "}
                    Payment will be due 30 days after the invoice date.
                  </>
                )}

              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px"
                }}
              >

                <button
                  type="button"
                  disabled={processingPayment}
                  onClick={closePaymentConfirmation}
                  style={{
                    padding: "10px 18px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: processingPayment
                      ? "not-allowed"
                      : "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={processingPayment}
                  onClick={processPayment}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    minWidth: "150px",
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: processingPayment
                      ? "not-allowed"
                      : "pointer",
                    opacity: processingPayment ? 0.7 : 1
                  }}
                >

                  {processingPayment ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Confirm Payment
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        )}

      {/* =================================================
          ERROR MODAL
      ================================================= */}

      {paymentError && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 11000,
            padding: "24px"
          }}
          onClick={() =>
            setPaymentError("")
          }
        >

          <div
            style={{
              width: "450px",
              maxWidth: "100%",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "28px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.20)"
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "15px"
              }}
            >

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >

                <AlertCircle
                  size={22}
                  color="#dc2626"
                />

              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#111827"
                }}
              >
                Unable to Complete
              </h3>

            </div>

            <p
              style={{
                margin: "0 0 22px",
                color: "#475569",
                lineHeight: "1.6",
                fontSize: "14px"
              }}
            >
              {paymentError}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end"
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setPaymentError("")
                }
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          SUCCESS NOTIFICATION
      ================================================= */}

      {successMessage && (

        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            width: "420px",
            maxWidth:
              "calc(100vw - 48px)",
            background: "#ffffff",
            border:
              "1px solid #bbf7d0",
            borderRadius: "12px",
            boxShadow:
              "0 12px 30px rgba(0,0,0,0.15)",
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            zIndex: 12000
          }}
        >

          {/* SUCCESS ICON */}

          <div
            style={{
              width: "38px",
              height: "38px",
              minWidth: "38px",
              borderRadius: "50%",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >

            <CheckCircle
              size={21}
              color="#16a34a"
            />

          </div>

          {/* MESSAGE */}

          <div
            style={{
              flex: 1
            }}
          >

            <strong
              style={{
                display: "block",
                fontSize: "15px",
                color: "#166534",
                marginBottom: "4px"
              }}
            >
              Payment Processed Successfully
            </strong>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.5",
                color: "#475569"
              }}
            >
              {successMessage}
            </p>

          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "2px",
              color: "#64748b"
            }}
          >
            <X size={18} />
          </button>

        </div>

      )}

    </div>
  );
};

export default FinanceInvoices;