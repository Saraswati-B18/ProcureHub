import {
  ArrowLeft,
  User,
  Building2,
  CalendarDays,
  Package,
  CheckCircle,
  XCircle
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

import "./RequestDetails.css";

const API_BASE_URL = "http://localhost:5000";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // =====================================================
  // FETCH REQUEST DETAILS
  // =====================================================

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/purchase-requests/manager/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setRequest(response.data.request);
      } catch (error) {
        console.error(
          "Error fetching purchase request details:",
          error
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Failed to load purchase request details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {

    if (request?.status === "APPROVED") {
        navigate("/manager/approved-requests");
        return;
    }

    if (request?.status === "REJECTED") {
        navigate("/manager/rejected-requests");
        return;
    }

    navigate("/manager/approvals");
};
  // =====================================================
  // APPROVE PURCHASE REQUEST
  // =====================================================

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/purchase-requests/manager/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowApproveModal(false);

      navigate("/manager/approvals");
    } catch (error) {
      console.error(
        "Error approving purchase request:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to approve purchase request."
      );

      setShowApproveModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // REJECT PURCHASE REQUEST
  // =====================================================

  const handleReject = async () => {
    if (!remarks.trim()) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/purchase-requests/manager/${id}/reject`,
        {
          rejection_reason: remarks.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowRejectModal(false);
      setRemarks("");

      navigate("/manager/approvals");
    } catch (error) {
      console.error(
        "Error rejecting purchase request:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to reject purchase request."
      );

      setShowRejectModal(false);
    } finally {
      setActionLoading(false);
    }
  };

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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="request-details-page">

        <div className="request-details-loading">

          <Package size={34} />

          <h3>
            Loading purchase request...
          </h3>

          <p>
            Please wait while we fetch the request details.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (errorMessage || !request) {
    return (
      <div className="request-details-page">

        <button
          className="back-button"
          type="button"
          onClick={handleBack}
        >
          <ArrowLeft size={17} />
          Back to Pending Approvals
        </button>

        <Card>

          <div className="request-details-error">

            <XCircle size={36} />

            <h3>
              Unable to load request
            </h3>

            <p>
              {errorMessage ||
                "Purchase request details could not be found."}
            </p>

          </div>

        </Card>

      </div>
    );
  }

  // =====================================================
  // REQUEST DATA
  // =====================================================

  const items = request.items || [];

  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="request-details-page">

      {/* =================================================
          BACK BUTTON
          ================================================= */}

      <button
        className="back-button"
        type="button"
        onClick={handleBack}
      >
        <ArrowLeft size={17} />

{request.status === "APPROVED"
    ? "Back to Approved Requests"
    : request.status === "REJECTED"
    ? "Back to Rejected Requests"
    : "Back to Pending Approvals"}
      </button>


      {/* =================================================
          HEADING
          ================================================= */}

      <div className="request-details-heading">

        <div>

          <h1>
            Purchase Request #{request.request_number}
          </h1>

          <p>
            Review the request details before making a decision.
          </p>

        </div>

        <Badge
          variant={
            request.status === "APPROVED"
              ? "success"
              : request.status === "REJECTED"
              ? "danger"
              : "warning"
          }
        >
          {request.status || "PENDING"}
        </Badge>

      </div>


      {/* =================================================
          REQUEST INFORMATION
          ================================================= */}

      <Card>

        <div className="request-section">

          <h2>
            Request Information
          </h2>

          <div className="request-info-grid">

            {/* Requested By */}

            <div className="request-info-item">

              <User size={18} />

              <div>

                <span>
                  Requested By
                </span>

                <strong>
                  {request.requested_by_name || "—"}
                </strong>

              </div>

            </div>


            {/* Branch */}

            <div className="request-info-item">

              <Building2 size={18} />

              <div>

                <span>
                  Branch
                </span>

                <strong>
                  {request.branch_name || "—"}
                </strong>

              </div>

            </div>


            {/* Request Date */}

            <div className="request-info-item">

              <CalendarDays size={18} />

              <div>

                <span>
                  Request Date
                </span>

                <strong>
                  {formatDate(request.created_at)}
                </strong>

              </div>

            </div>


            {/* Total Items */}

            <div className="request-info-item">

              <Package size={18} />

              <div>

                <span>
                  Total Items
                </span>

                <strong>
                  {totalItems} Items
                </strong>

              </div>

            </div>

          </div>

        </div>

      </Card>


      {/* =================================================
          REQUESTED PRODUCTS
          ================================================= */}

      <div className="request-products-section">

        <Card>

          <div className="request-section-header">

            <div>

              <h2>
                Requested Products
              </h2>

              <p>
                Products included in this purchase request.
              </p>

            </div>

          </div>


          <div className="request-table-wrapper">

            <table className="request-table">

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

                {items.length === 0 ? (

                  <tr>

                    <td colSpan="5">

                      <div className="request-products-empty">

                        <Package size={34} />

                        <h3>
                          No products
                        </h3>

                        <p>
                          No products were found for this request.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  items.map((item) => (

                    <tr key={item.id}>

                      <td>

                        <div className="request-product-name">

                          <strong>
                            {item.product_name || "—"}
                          </strong>

                          {item.unit && (
                            <span>
                              Unit: {item.unit}
                            </span>
                          )}

                        </div>

                      </td>


                      <td>
                        {item.supplier_name || "—"}
                      </td>


                      <td>
                        {item.quantity || 0}
                      </td>


                      <td>
                        ₹
                        {Number(
                          item.unit_price || 0
                        ).toFixed(2)}
                      </td>


                      <td>
                        ₹
                        {Number(
                          item.total_price || 0
                        ).toFixed(2)}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </Card>

      </div>


      {/* =================================================
          TOTAL + DECISION
          ================================================= */}

      <div className="request-bottom-grid">


        {/* REQUEST SUMMARY */}

        <Card>

          <div className="request-total-section">

            <div className="request-total-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {Number(
                  request.subtotal || 0
                ).toFixed(2)}
              </strong>

            </div>


            <div className="request-total-row">

              <span>
                GST
              </span>

              <strong>
                ₹
                {Number(
                  request.gst || 0
                ).toFixed(2)}
              </strong>

            </div>


            <div className="request-total-divider"></div>


            <div className="request-total-row request-grand-total">

              <span>
                Request Total
              </span>

              <strong>
                ₹
                {Number(
                  request.total_amount || 0
                ).toFixed(2)}
              </strong>

            </div>

          </div>

        </Card>


        {/* MANAGER DECISION */}

{request.status === "PENDING" && (

    <Card>

        <div className="request-decision">

            <h2>
                Manager Decision
            </h2>

            <p>
                Review the request carefully before approving or
                rejecting it.
            </p>

            <textarea
                placeholder="Add remarks (optional)"
                rows="4"
            ></textarea>

            <div className="decision-buttons">

                <Button variant="danger">
                    <XCircle size={17} />
                    Reject Request
                </Button>

                <Button variant="success">
                    <CheckCircle size={17} />
                    Approve Request
                </Button>

            </div>

        </div>

    </Card>

)}

      </div>


      {/* =================================================
          APPROVE MODAL
          ================================================= */}

      {showApproveModal && (

        <div className="decision-modal-overlay">

          <div className="decision-modal">

            <div className="decision-modal-icon approve-icon">
              <CheckCircle size={30} />
            </div>


            <h2>
              Approve Purchase Request?
            </h2>


            <p>
              Are you sure you want to approve{" "}
              <strong>
                {request.request_number}
              </strong>
              ?
            </p>


            <div className="decision-modal-details">

              <div>

                <span>
                  Employee
                </span>

                <strong>
                  {request.requested_by_name || "—"}
                </strong>

              </div>


              <div>

                <span>
                  Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    request.total_amount || 0
                  ).toFixed(2)}
                </strong>

              </div>

            </div>


            <div className="decision-modal-actions">

              <Button
                variant="secondary"
                onClick={() =>
                  setShowApproveModal(false)
                }
                disabled={actionLoading}
              >
                Cancel
              </Button>


              <Button
                variant="success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle size={17} />

                {actionLoading
                  ? "Approving..."
                  : "Approve Request"}
              </Button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          REJECT MODAL
          ================================================= */}

      {showRejectModal && (

        <div className="decision-modal-overlay">

          <div className="decision-modal">

            <div className="decision-modal-icon reject-icon">
              <XCircle size={30} />
            </div>


            <h2>
              Reject Purchase Request?
            </h2>


            <p>
              Please provide a reason for rejecting{" "}
              <strong>
                {request.request_number}
              </strong>
              .
            </p>


            <textarea
              className="reject-reason-input"
              placeholder="Enter rejection reason..."
              rows="4"
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              disabled={actionLoading}
            />


            <div className="decision-modal-actions">

              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRemarks("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>


              <Button
                variant="danger"
                onClick={handleReject}
                disabled={
                  actionLoading ||
                  !remarks.trim()
                }
              >
                <XCircle size={17} />

                {actionLoading
                  ? "Rejecting..."
                  : "Reject Request"}
              </Button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default RequestDetails;