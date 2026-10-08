import { useEffect, useState } from "react";

import {

  ClipboardList,

  Eye,

  CheckCircle,

  XCircle,

  X,

  Package

} from "lucide-react";

import axios from "axios";

import Card from "../components/Card";

import Badge from "../components/Badge";

import Button from "../components/Button";

import "./PendingApprovals.css";

const API_BASE_URL = "http://localhost:5000";

const getProductImage = (image) => {

  if (!image) {

    return null;

  }

  if (

    image.startsWith("http://") ||

    image.startsWith("https://") ||

    image.startsWith("data:")

  ) {

    return image;

  }

  if (image.startsWith("/")) {

    return `${API_BASE_URL}${image}`;

  }

  return `${API_BASE_URL}/${image}`;

};

const PendingApprovals = () => {

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sortOption, setSortOption] = useState("all");

  // Modal State

  const [modalType, setModalType] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [rejectionReason, setRejectionReason] = useState("");

  // View request modal

  const [viewRequest, setViewRequest] = useState(null);

  const [viewLoading, setViewLoading] = useState(false);

  // Action loading

  const [actionLoading, setActionLoading] = useState(false);

  // Toast

  const [toast, setToast] = useState({

    show: false,

    message: "",

    type: ""

  });

  // =====================================================

  // FETCH PENDING PURCHASE REQUESTS

  // =====================================================

  const fetchPendingRequests = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(

        `${API_BASE_URL}/api/purchase-requests/manager/pending`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      setRequests(response.data.requests || []);

    } catch (error) {

      console.error(

        "Error fetching pending purchase requests:",

        error

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchPendingRequests();

  }, []);

  // =====================================================

  // TOAST

  // =====================================================

  const showToast = (message, type = "success") => {

    setToast({

      show: true,

      message,

      type

    });

    setTimeout(() => {

      setToast({

        show: false,

        message: "",

        type: ""

      });

    }, 3000);

  };

  // =====================================================

  // SORT

  // =====================================================

  const sortedRequests = [...requests].sort((a, b) => {

    if (sortOption === "recent") {

      return (

        new Date(b.created_at) -

        new Date(a.created_at)

      );

    }

    if (sortOption === "amount-high") {

      return (

        Number(b.total_amount || 0) -

        Number(a.total_amount || 0)

      );

    }

    if (sortOption === "amount-low") {

      return (

        Number(a.total_amount || 0) -

        Number(b.total_amount || 0)

      );

    }

    return 0;

  });

  // =====================================================

  // VIEW

  // =====================================================

  const handleView = async (requestId) => {

    try {

      setViewLoading(true);

      setViewRequest(null);

      const token = localStorage.getItem("token");

      const response = await axios.get(

        `${API_BASE_URL}/api/purchase-requests/manager/${requestId}`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      setViewRequest(response.data.request || null);

    } catch (error) {

      console.error(

        "Error fetching purchase request details:",

        error

      );

      showToast(

        error.response?.data?.message ||

          "Failed to fetch purchase request details.",

        "error"

      );

    } finally {

      setViewLoading(false);

    }

  };

  // =====================================================

  // MODAL CONTROLS

  // =====================================================

  const openApproveModal = (request) => {

    setSelectedRequest(request);

    setModalType("approve");

  };

  const openRejectModal = (request) => {

    setSelectedRequest(request);

    setRejectionReason("");

    setModalType("reject");

  };

  const closeModal = () => {

    if (actionLoading) return;

    setModalType(null);

    setSelectedRequest(null);

    setRejectionReason("");

  };

  // =====================================================

  // APPROVE REQUEST

  // =====================================================

  const handleApprove = async () => {

    if (!selectedRequest) return;

    try {

      setActionLoading(true);

      const token = localStorage.getItem("token");

      await axios.put(

        `${API_BASE_URL}/api/purchase-requests/manager/${selectedRequest.id}/approve`,

        {},

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      setRequests((currentRequests) =>

        currentRequests.filter(

          (req) => req.id !== selectedRequest.id

        )

      );

      setViewRequest(null);

      closeModal();

      showToast(

        `Purchase request ${

          selectedRequest.request_number ||

          `PR-${selectedRequest.id}`

        } approved successfully.`

      );

    } catch (error) {

      console.error(

        "Error approving purchase request:",

        error

      );

      showToast(

        error.response?.data?.message ||

          "Failed to approve purchase request.",

        "error"

      );

    } finally {

      setActionLoading(false);

    }

  };

  // =====================================================

  // REJECT REQUEST

  // =====================================================

  const handleReject = async () => {

    if (!selectedRequest) return;

    if (!rejectionReason.trim()) return;

    try {

      setActionLoading(true);

      const token = localStorage.getItem("token");

      await axios.put(

        `${API_BASE_URL}/api/purchase-requests/manager/${selectedRequest.id}/reject`,

        {

          rejection_reason: rejectionReason.trim()

        },

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      setRequests((currentRequests) =>

        currentRequests.filter(

          (req) => req.id !== selectedRequest.id

        )

      );

      setViewRequest(null);

      closeModal();

      showToast(

        `Purchase request ${

          selectedRequest.request_number ||

          `PR-${selectedRequest.id}`

        } rejected successfully.`

      );

    } catch (error) {

      console.error(

        "Error rejecting purchase request:",

        error

      );

      showToast(

        error.response?.data?.message ||

          "Failed to reject purchase request.",

        "error"

      );

    } finally {

      setActionLoading(false);

    }

  };

  // =====================================================

  // SUMMARY CALCULATIONS

  // =====================================================

  const pendingCount = requests.length;

  const totalRequested = requests.reduce(

    (total, req) =>

      total + Number(req.total_amount || 0),

    0

  );

  return (

    <div className="pending-approvals-page">

      {/* TOAST */}

      {toast.show && (

        <div

          className={`approval-toast ${

            toast.type === "error"

              ? "approval-toast-error"

              : "approval-toast-success"

          }`}

        >

          <div className="approval-toast-icon">

            {toast.type === "error" ? (

              <XCircle size={18} />

            ) : (

              <CheckCircle size={18} />

            )}

          </div>

          <span>{toast.message}</span>

        </div>

      )}

      {/* PAGE HEADING */}

      <div className="page-heading">

        <div>

          <h1>Pending Approvals</h1>

          <p>

            Review and manage purchase requests waiting

            for your approval.

          </p>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="approval-summary">

        <Card>

          <div className="approval-summary-card">

            <div className="approval-summary-icon orange">

              <ClipboardList size={21} />

            </div>

            <div>

              <span>Pending Requests</span>

              <strong>{pendingCount}</strong>

            </div>

          </div>

        </Card>

        <Card>

          <div className="approval-summary-card">

            <div className="approval-summary-icon blue">

              <Eye size={21} />

            </div>

            <div>

              <span>Total Requested</span>

              <strong>

                ₹{totalRequested.toFixed(2)}

              </strong>

            </div>

          </div>

        </Card>

      </div>

      {/* REQUEST TABLE */}

      <Card>

        <div className="approval-header">

          <div>

            <h2>Purchase Requests</h2>

            <p>

              Requests submitted by employees in your

              assigned branch.

            </p>

          </div>

          <select

            value={sortOption}

            onChange={(e) =>

              setSortOption(e.target.value)

            }

          >

            <option value="all">

              All Requests

            </option>

            <option value="recent">

              Most Recent

            </option>

            <option value="amount-high">

              Highest Amount

            </option>

            <option value="amount-low">

              Lowest Amount

            </option>

          </select>

        </div>

        <div className="approval-table-wrapper">

          <table className="approval-table">

            <thead>

              <tr>

                <th>Request ID</th>

                <th>Employee</th>

                <th>Branch</th>

                <th>Date</th>

                <th>Items</th>

                <th>Amount</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td colSpan="8">

                    <div className="approval-empty">

                      <div className="approval-empty-icon">

                        <ClipboardList size={34} />

                      </div>

                      <h3>

                        Loading requests...

                      </h3>

                      <p>

                        Please wait while we fetch

                        pending purchase requests.

                      </p>

                    </div>

                  </td>

                </tr>

              ) : sortedRequests.length === 0 ? (

                <tr>

                  <td colSpan="8">

                    <div className="approval-empty">

                      <div className="approval-empty-icon">

                        <ClipboardList size={34} />

                      </div>

                      <h3>

                        No pending requests

                      </h3>

                      <p>

                        Purchase requests waiting for

                        your approval will appear here.

                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                sortedRequests.map((request) => (

                  <tr key={request.id}>

                    <td>

                      {request.request_number ||

                        `PR-${request.id}`}

                    </td>

                    <td>

                      {request.employee_name ||

                        request.requested_by_name ||

                        "-"}

                    </td>

                    <td>

                      {request.branch_name || "-"}

                    </td>

                    <td>

                      {request.created_at

                        ? new Date(

                            request.created_at

                          ).toLocaleDateString()

                        : "-"}

                    </td>

                    <td>

                      {request.item_count ??

                        request.total_items ??

                        0}

                    </td>

                    <td>

                      ₹

                      {Number(

                        request.total_amount || 0

                      ).toFixed(2)}

                    </td>

                    <td>

                      <Badge>

                        {request.status || "PENDING"}

                      </Badge>

                    </td>

                    <td>

                      <div className="approval-actions">

                        <Button

                          onClick={() =>

                            handleView(request.id)

                          }

                          title="View Request"

                        >

                          <Eye size={17} />

                        </Button>

                        <Button

                          onClick={() =>

                            openApproveModal(request)

                          }

                          title="Approve Request"

                        >

                          <CheckCircle size={17} />

                        </Button>

                        <Button

                          onClick={() =>

                            openRejectModal(request)

                          }

                          title="Reject Request"

                        >

                          <XCircle size={17} />

                        </Button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* VIEW PURCHASE REQUEST MODAL */}

      {viewLoading && !viewRequest && (

        <div

          className="approval-modal-overlay"

          onClick={() => setViewLoading(false)}

        >

          <div

            className="approval-modal request-loading-modal"

            onClick={(e) => e.stopPropagation()}

          >

            <div className="request-loading-content">

              <div className="request-loading-spinner"></div>

              <h2>

                Loading Request Details

              </h2>

              <p>

                Please wait while the purchase request

                is loaded.

              </p>

            </div>

          </div>

        </div>

      )}

      {viewRequest && (
        <div className="approval-modal-overlay" onClick={() => setViewRequest(null)}>
          <div className="manager-request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="manager-request-header">
              <div className="manager-request-header-left">
                <div className="manager-request-icon"><ClipboardList size={22} /></div>
                <div className="manager-request-heading-content">
                  <div className="manager-request-title-row">
                    <h2>Purchase Request</h2>
                    <span className="manager-request-status">{viewRequest.status || "PENDING"}</span>
                  </div>
                  <p className="manager-request-number">{viewRequest.request_number || `PR-${viewRequest.id}`}</p>
                </div>
              </div>
              <button type="button" className="manager-request-close" onClick={() => setViewRequest(null)} disabled={actionLoading}>
                <X size={18} />
              </button>
            </div>

            <div className="manager-request-body">
              <section className="manager-request-section manager-request-info-section">
                <div className="manager-request-section-heading">
                  <div>
                    <h3>Request Information</h3>
                    <p>Details about the employee and request</p>
                  </div>
                </div>
                <div className="manager-request-info-grid">
                  <div className="manager-request-info-card">
                    <div className="manager-request-info-icon"><ClipboardList size={16} /></div>
                    <div><span>Requested By</span><strong>{viewRequest.requested_by_name || viewRequest.employee_name || "-"}</strong></div>
                  </div>
                  <div className="manager-request-info-card">
                    <div className="manager-request-info-icon"><ClipboardList size={16} /></div>
                    <div><span>Branch</span><strong>{viewRequest.branch_name || "-"}</strong></div>
                  </div>
                  <div className="manager-request-info-card">
                    <div className="manager-request-info-icon"><ClipboardList size={16} /></div>
                    <div><span>Request Date</span><strong>{viewRequest.created_at ? new Date(viewRequest.created_at).toLocaleDateString("en-GB") : "-"}</strong></div>
                  </div>
                  <div className="manager-request-info-card">
                    <div className="manager-request-info-icon"><ClipboardList size={16} /></div>
                    <div><span>Total Items</span><strong>{viewRequest.items?.length || 0} Item{viewRequest.items?.length === 1 ? "" : "s"}</strong></div>
                  </div>
                </div>
              </section>

              <section className="manager-request-section manager-request-products-section">
                <div className="manager-request-section-heading manager-request-products-heading">
                  <div>
                    <h3>Requested Products</h3>
                    <p>Products included in this purchase request</p>
                  </div>
                  <span className="manager-request-products-count">{viewRequest.items?.length || 0} Item{viewRequest.items?.length === 1 ? "" : "s"}</span>
                </div>
                {viewRequest.items?.length > 0 ? (
                  <div className="manager-request-products-list">
                    {viewRequest.items.map((item, index) => {
                      const productImage = item.product_image || item.image || item.product_image_url || item.image_url || item.product?.image || item.product?.product_image || "";
                      const productName = item.product_name || item.name || item.product?.name || "-";
                      const supplierName = item.supplier_name || item.supplier?.name || "-";
                      const quantity = Number(item.quantity || 0);
                      const unitPrice = Number(item.unit_price || 0);
                      const totalPrice = Number(item.total_price || quantity * unitPrice || 0);
                      return (
                        <div className="manager-request-product-card" key={item.id || index}>
                          <div className="manager-request-product-image">
                            {getProductImage(productImage) ? (
                              <>
                                <img src={getProductImage(productImage)} alt={productName} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden"); }} />
                                <div className="request-product-image-placeholder hidden"><Package size={26} /></div>
                              </>
                            ) : (
                              <div className="manager-request-product-image-placeholder"><Package size={26} /></div>
                            )}
                          </div>
                          <div className="manager-request-product-main">
                            <div className="manager-request-product-top">
                              <div className="manager-request-product-name-block">
                                <h4>{productName}</h4>
                                {item.unit && <span className="manager-request-product-unit">Unit: {item.unit}</span>}
                              </div>
                              <div className="manager-request-product-total"><span>Total</span><strong>₹{totalPrice.toFixed(2)}</strong></div>
                            </div>
                            <div className="manager-request-product-details">
                              <div><span>Supplier</span><strong>{supplierName}</strong></div>
                              <div><span>Quantity</span><strong>{quantity}</strong></div>
                              <div><span>Unit Price</span><strong>₹{unitPrice.toFixed(2)}</strong></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="manager-request-no-products">
                    <ClipboardList size={28} />
                    <h4>No Products Found</h4>
                    <p>No products were found for this purchase request.</p>
                  </div>
                )}
              </section>

              <section className="manager-request-summary-section">
                <div className="manager-request-summary">
                  <div className="manager-request-summary-row"><span>Subtotal</span><strong>₹{Number(viewRequest.subtotal || 0).toFixed(2)}</strong></div>
                  <div className="manager-request-summary-row"><span>GST</span><strong>₹{Number(viewRequest.gst || 0).toFixed(2)}</strong></div>
                  <div className="manager-request-summary-divider" />
                  <div className="manager-request-summary-total"><span>Request Total</span><strong>₹{Number(viewRequest.total_amount || 0).toFixed(2)}</strong></div>
                </div>
              </section>
            </div>

            <div className="manager-request-footer">
              <div className="manager-request-footer-note"><span>Review this request carefully before taking action.</span></div>
              <div className="manager-request-actions">
                <button type="button" className="request-action-button request-reject-button" onClick={() => openRejectModal(viewRequest)} disabled={actionLoading}>
                  <XCircle size={16} /> Reject Request
                </button>
                <button type="button" className="request-action-button request-approve-button" onClick={() => openApproveModal(viewRequest)} disabled={actionLoading}>
                  <CheckCircle size={16} /> Approve Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE / REJECT MODAL */}

      {modalType && selectedRequest && (

        <div

          className="approval-modal-overlay"

          onClick={closeModal}

        >

          <div

            className="approval-modal"

            onClick={(e) =>

              e.stopPropagation()

            }

          >

            {/* APPROVE */}

            {modalType === "approve" && (

              <>

                <div className="approval-modal-icon approve">

                  <CheckCircle size={26} />

                </div>

                <h2>

                  Approve Purchase Request?

                </h2>

                <p>

                  Are you sure you want to

                  approve{" "}

                  <strong>

                    {selectedRequest.request_number ||

                      `PR-${selectedRequest.id}`}

                  </strong>

                  ?

                </p>

                <div className="approval-modal-details">

                  <div>

                    <span>

                      Employee

                    </span>

                    <strong>

                      {selectedRequest.employee_name ||

                        selectedRequest.requested_by_name ||

                        "-"}

                    </strong>

                  </div>

                  <div>

                    <span>

                      Amount

                    </span>

                    <strong>

                      ₹

                      {Number(

                        selectedRequest.total_amount ||

                          0

                      ).toFixed(2)}

                    </strong>

                  </div>

                </div>

                <div className="approval-modal-actions">

                  <button

                    type="button"

                    className="approval-modal-cancel"

                    onClick={closeModal}

                    disabled={actionLoading}

                  >

                    Cancel

                  </button>

                  <button

                    type="button"

                    className="approval-modal-confirm approve"

                    onClick={handleApprove}

                    disabled={actionLoading}

                  >

                    {actionLoading

                      ? "Approving..."

                      : "Approve Request"}

                  </button>

                </div>

              </>

            )}

            {/* REJECT */}

            {modalType === "reject" && (

              <>

                <div className="approval-modal-icon reject">

                  <XCircle size={26} />

                </div>

                <h2>

                  Reject Purchase Request?

                </h2>

                <p>

                  Please provide a reason for

                  rejecting{" "}

                  <strong>

                    {selectedRequest.request_number ||

                      `PR-${selectedRequest.id}`}

                  </strong>

                  .

                </p>

                <textarea

                  className="approval-modal-textarea"

                  placeholder="Enter rejection reason..."

                  value={rejectionReason}

                  onChange={(e) =>

                    setRejectionReason(

                      e.target.value

                    )

                  }

                  rows={4}

                  style={{

                    width: "100%",

                    padding: "10px",

                    borderRadius: "8px",

                    border:

                      "1px solid #d1d5db",

                    marginTop: "12px",

                    marginBottom: "16px",

                    resize: "vertical"

                  }}

                />

                <div className="approval-modal-actions">

                  <button

                    type="button"

                    className="approval-modal-cancel"

                    onClick={closeModal}

                    disabled={actionLoading}

                  >

                    Cancel

                  </button>

                  <button

                    type="button"

                    className="approval-modal-confirm reject"

                    onClick={handleReject}

                    disabled={

                      actionLoading ||

                      !rejectionReason.trim()

                    }

                  >

                    {actionLoading

                      ? "Rejecting..."

                      : "Reject Request"}

                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>

  );

};

export default PendingApprovals;
