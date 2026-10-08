import {
  Bell,
  CheckCircle,
  AlertCircle,
  Truck,
  FileText
} from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";

import "./Notifications.css";

const Notifications = () => {
  return (
    <div className="notifications-page">

      <div className="page-heading">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your procurement activities.</p>
        </div>

        <Button variant="secondary">
          Mark All as Read
        </Button>
      </div>

      <Card>
        <div className="notifications-header">
          <div>
            <h2>Recent Notifications</h2>
            <span>0 notifications</span>
          </div>
        </div>

        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={32} />
          </div>

          <h3>No notifications</h3>

          <p>
            Important updates about your purchase requests,
            orders, invoices and payments will appear here.
          </p>
        </div>
      </Card>

    </div>
  );
};

export default Notifications;