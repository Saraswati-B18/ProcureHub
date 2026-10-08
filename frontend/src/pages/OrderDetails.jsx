import {
  ArrowLeft,
  Truck,
  Package,
  FileText,
  CreditCard,
  CheckCircle
} from "lucide-react";

import Card from "../components/Card";
import Badge from "../components/Badge";

import "./OrderDetails.css";

const OrderDetails = () => {
  return (
    <div className="order-details-page">

      <button className="back-button" type="button">
        <ArrowLeft size={17} />
        Back to Orders
      </button>

      <div className="order-details-heading">
        <div>
          <h1>Order #PO-00001</h1>
          <p>Order placed on —</p>
        </div>

        <Badge variant="processing">
          Processing
        </Badge>
      </div>

      <div className="order-details-grid">

        <Card>
          <div className="order-section">
            <h2>Order Information</h2>

            <div className="order-info-grid">

              <div>
                <span>Purchase Order</span>
                <strong>PO-00001</strong>
              </div>

              <div>
                <span>Supplier</span>
                <strong>Supplier Name</strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>NET 30 DAYS</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>₹0.00</strong>
              </div>

            </div>
          </div>
        </Card>

        <Card>
          <div className="order-section">
            <h2>Order Status</h2>

            <div className="status-timeline">

              <div className="timeline-item completed">
                <div className="timeline-icon">
                  <CheckCircle size={17} />
                </div>

                <div>
                  <strong>Order Created</strong>
                  <span>Purchase order created successfully.</span>
                </div>
              </div>

              <div className="timeline-item active">
                <div className="timeline-icon">
                  <Package size={17} />
                </div>

                <div>
                  <strong>Processing</strong>
                  <span>Supplier is processing your order.</span>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <Truck size={17} />
                </div>

                <div>
                  <strong>Shipped</strong>
                  <span>Waiting for shipment.</span>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <CheckCircle size={17} />
                </div>

                <div>
                  <strong>Delivered</strong>
                  <span>Waiting for delivery.</span>
                </div>
              </div>

            </div>
          </div>
        </Card>

      </div>

      <div className="order-bottom-grid">

        <Card>
          <div className="order-section">
            <h2>
              <FileText size={18} />
              Invoice
            </h2>

            <div className="order-empty-small">
              <FileText size={30} />
              <p>No invoice has been created yet.</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="order-section">
            <h2>
              <CreditCard size={18} />
              Payment
            </h2>

            <div className="payment-summary">
              <span>Payment Status</span>

              <Badge variant="warning">
                Pending
              </Badge>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default OrderDetails;