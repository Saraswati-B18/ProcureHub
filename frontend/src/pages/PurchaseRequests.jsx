import {
  ClipboardList,
  Eye,
  X
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

import "./PurchaseRequests.css";


const API_BASE_URL =
  "http://localhost:5000";


const PurchaseRequests = () => {

  // =====================================================
  // REQUESTS
  // =====================================================

  const [requests, setRequests] =
    useState([]);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  // =====================================================
  // SUCCESS TOAST
  // =====================================================

  const [successMessage, setSuccessMessage] =
    useState("");


  // =====================================================
  // SELECTED REQUEST
  // =====================================================

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);


  // =====================================================
  // FETCH REQUESTS
  // =====================================================

  const fetchRequests = async () => {

    try {

      setLoading(true);
      setErrorMessage("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/purchase-requests/my`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setRequests(
        response.data.requests || []
      );

    } catch (error) {

      console.error(
        "Fetch purchase requests failed:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load purchase requests."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchRequests();

    // -----------------------------------------------
    // CHECK FOR SUCCESS MESSAGE
    // -----------------------------------------------

    const savedMessage =
      sessionStorage.getItem(
        "procurehub_success_message"
      );

    if (savedMessage) {

      try {

        const parsed =
          JSON.parse(savedMessage);

        setSuccessMessage(
          parsed.message
        );

      } catch {

        setSuccessMessage(
          "Purchase request created successfully."
        );

      }

      sessionStorage.removeItem(
        "procurehub_success_message"
      );

      // Automatically disappear after 3 seconds
      setTimeout(() => {

        setSuccessMessage("");

      }, 3000);
    }

  }, []);


  // =====================================================
  // VIEW REQUEST DETAILS
  // =====================================================

  const handleViewRequest = async (
    requestId
  ) => {

    try {

      setDetailsLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/purchase-requests/${requestId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setSelectedRequest(
        response.data.request
      );

    } catch (error) {

      console.error(
        "Fetch request details failed:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load request details."
      );

    } finally {

      setDetailsLoading(false);

    }
  };


  // =====================================================
  // FILTER REQUESTS
  // =====================================================

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter(
          (request) =>
            request.status ===
            statusFilter.toUpperCase()
        );


  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusVariant = (
    status
  ) => {

    switch (status) {

      case "APPROVED":
        return "success";

      case "REJECTED":
      case "CANCELLED":
        return "danger";

      case "PENDING":
      default:
        return "warning";
    }
  };


  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "—";
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


  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const formatMoney = (amount) => {

    return `₹${Number(
      amount || 0
    ).toFixed(2)}`;
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="requests-page">


      {/* =================================================
          SUCCESS TOAST
      ================================================= */}

      {successMessage && (

        <div className="request-success-toast">

          <div className="request-success-icon">
            ✓
          </div>

          <div>
            <strong>
              Success
            </strong>

            <p>
              {successMessage}
            </p>
          </div>

        </div>

      )}


      {/* =================================================
          PAGE HEADING
      ================================================= */}

      <div className="page-heading">

        <div>

          <h1>
            Purchase Requests
          </h1>

          <p>
            Track the purchase requests
            you have submitted.
          </p>

        </div>


        <Button
          variant="primary"
          onClick={() =>
            window.location.href =
              "/employee/cart"
          }
        >
          <ClipboardList
            size={17}
          />

          New Request

        </Button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {errorMessage && (

        <div className="request-error-message">
          {errorMessage}
        </div>

      )}


      {/* =================================================
          REQUEST CARD
      ================================================= */}

      <Card>

        <div className="requests-header">

          <div>

            <h2>
              My Requests
            </h2>

            <span>
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1
                ? "request"
                : "requests"}
            </span>

          </div>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="all">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="requests-loading">
            Loading purchase requests...
          </div>

        ) : filteredRequests.length === 0 ? (

          <div className="requests-table-wrapper">

            <table className="requests-table">

              <tbody>

                <tr>

                  <td colSpan="6">

                    <div className="requests-empty">

                      <ClipboardList
                        size={36}
                      />

                      <h3>
                        No purchase requests
                      </h3>

                      <p>
                        Your submitted purchase
                        requests will appear here.
                      </p>

                    </div>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        ) : (

          <div className="requests-table-wrapper">

            <table className="requests-table">

              <thead>

                <tr>

                  <th>
                    Request ID
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Total Amount
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

                {filteredRequests.map(
                  (request) => (

                    <tr
                      key={
                        request.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            request.request_number
                          }
                        </strong>
                      </td>


                      <td>
                        {
                          formatDate(
                            request.created_at
                          )
                        }
                      </td>


                      <td>
                        {
                          request.item_count
                        }
                      </td>


                      <td>
                        {
                          formatMoney(
                            request.total_amount
                          )
                        }
                      </td>


                      <td>

                        <Badge
                          variant={
                            getStatusVariant(
                              request.status
                            )
                          }
                        >
                          {
                            request.status
                          }
                        </Badge>

                      </td>


                      <td>

                        <Button
                          variant="secondary"
                          onClick={() =>
                            handleViewRequest(
                              request.id
                            )
                          }
                        >

                          <Eye
                            size={16}
                          />

                          View

                        </Button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>


      {/* =================================================
          REQUEST DETAILS MODAL
      ================================================= */}

      {selectedRequest && (

        <div
          className="request-details-overlay"
          onClick={() =>
            setSelectedRequest(null)
          }
        >

          <div
            className="request-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="request-details-header">

              <div>

                <span>
                  Purchase Request
                </span>

                <h2>
                  {
                    selectedRequest.request_number
                  }
                </h2>

              </div>


              <button
                type="button"
                className="request-details-close"
                onClick={() =>
                  setSelectedRequest(null)
                }
              >

                <X
                  size={21}
                />

              </button>

            </div>


            {/* STATUS */}

            <div className="request-details-status">

              <Badge
                variant={
                  getStatusVariant(
                    selectedRequest.status
                  )
                }
              >
                {
                  selectedRequest.status
                }
              </Badge>

            </div>


            {/* GENERAL INFORMATION */}

            <div className="request-info-grid">

              <div>

                <span>
                  Request Number
                </span>

                <strong>
                  {
                    selectedRequest.request_number
                  }
                </strong>

              </div>


              <div>

                <span>
                  Request Date
                </span>

                <strong>
                  {
                    formatDate(
                      selectedRequest.created_at
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  Requested By
                </span>

                <strong>
                  {
                    selectedRequest.requested_by_name
                  }
                </strong>

              </div>


              <div>

                <span>
                  Employee Email
                </span>

                <strong>
                  {
                    selectedRequest.requested_by_email
                  }
                </strong>

              </div>


              <div>

                <span>
                  Company
                </span>

                <strong>
                  {
                    selectedRequest.company_name
                  }
                </strong>

              </div>


              <div>

                <span>
                  Branch
                </span>

                <strong>
                  {
                    selectedRequest.branch_name
                  }
                </strong>

              </div>

            </div>


            {/* PRODUCTS */}

            <div className="request-products-section">

              <h3>
                Requested Products
              </h3>


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

                    {(
                      selectedRequest.items ||
                      []
                    ).map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                item.product_name
                              }
                            </strong>

                            <small>
                              {item.unit}
                            </small>
                          </td>


                          <td>
                            {
                              item.supplier_name
                            }
                          </td>


                          <td>
                            {
                              item.quantity
                            }
                          </td>


                          <td>
                            {
                              formatMoney(
                                item.unit_price
                              )
                            }
                          </td>


                          <td>
                            <strong>
                              {
                                formatMoney(
                                  item.total_price
                                )
                              }
                            </strong>
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* SUMMARY */}

            <div className="request-details-summary">

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  {
                    formatMoney(
                      selectedRequest.subtotal
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  GST (18%)
                </span>

                <strong>
                  {
                    formatMoney(
                      selectedRequest.gst
                    )
                  }
                </strong>

              </div>


              <div className="request-grand-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  {
                    formatMoney(
                      selectedRequest.total_amount
                    )
                  }
                </strong>

              </div>

            </div>


            {/* REJECTION REASON */}

            {selectedRequest.rejection_reason && (

              <div className="request-rejection">

                <strong>
                  Rejection Reason
                </strong>

                <p>
                  {
                    selectedRequest.rejection_reason
                  }
                </p>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};


export default PurchaseRequests;