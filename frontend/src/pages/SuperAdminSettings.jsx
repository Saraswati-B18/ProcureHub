import { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  ShoppingCart,
  Bell,
  CreditCard,
  Save
} from "lucide-react";

import Card from "../components/Card";
import "./SuperAdminSettings.css";

const SuperAdminSettings = () => {
  const [platformName, setPlatformName] = useState("ProcureHub");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");

  const [approvalRequired, setApprovalRequired] = useState(true);
  const [autoCreateOrder, setAutoCreateOrder] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [invoiceNotifications, setInvoiceNotifications] = useState(true);

  const [prepaidEnabled, setPrepaidEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [partialEnabled, setPartialEnabled] = useState(true);

  return (
    <div className="super-admin-settings-page">

      {/* Header */}
      <div className="super-admin-settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Configure ProcureHub platform settings and preferences.
          </p>
        </div>
      </div>

      {/* Platform Information */}
      <Card className="super-admin-settings-card">

        <div className="super-admin-settings-card-header">
          <div className="super-admin-settings-title-icon blue">
            <Building2 size={20} />
          </div>

          <div>
            <h2>Platform Information</h2>
            <p>
              Manage basic information used across the platform.
            </p>
          </div>
        </div>

        <div className="super-admin-settings-form">

          <div className="super-admin-settings-field">
            <label>Platform Name</label>

            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Enter platform name"
            />
          </div>

          <div className="super-admin-settings-field">
            <label>Support Email</label>

            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="Enter support email"
            />
          </div>

          <div className="super-admin-settings-field">
            <label>Support Phone</label>

            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="Enter support phone"
            />
          </div>

        </div>

        <div className="super-admin-settings-actions">
          <button type="button" className="super-admin-save-button">
            <Save size={17} />
            Save Changes
          </button>
        </div>

      </Card>

      {/* Procurement Settings */}
      <Card className="super-admin-settings-card">

        <div className="super-admin-settings-card-header">
          <div className="super-admin-settings-title-icon purple">
            <ShoppingCart size={20} />
          </div>

          <div>
            <h2>Procurement Settings</h2>
            <p>
              Configure purchase request and order behaviour.
            </p>
          </div>
        </div>

        <div className="super-admin-settings-options">

          <div className="super-admin-settings-option">
            <div>
              <h3>Manager Approval Required</h3>
              <p>
                Purchase requests must be approved by a manager before
                a purchase order is created.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) =>
                  setApprovalRequired(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

          <div className="super-admin-settings-option">
            <div>
              <h3>Automatic Purchase Order Creation</h3>
              <p>
                Automatically create a purchase order after manager
                approval.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={autoCreateOrder}
                onChange={(e) =>
                  setAutoCreateOrder(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

        </div>

        <div className="super-admin-settings-actions">
          <button type="button" className="super-admin-save-button">
            <Save size={17} />
            Save Changes
          </button>
        </div>

      </Card>

      {/* Notification Settings */}
      <Card className="super-admin-settings-card">

        <div className="super-admin-settings-card-header">
          <div className="super-admin-settings-title-icon orange">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notification Settings</h2>
            <p>
              Configure platform notification preferences.
            </p>
          </div>
        </div>

        <div className="super-admin-settings-options">

          <div className="super-admin-settings-option">
            <div>
              <h3>Email Notifications</h3>
              <p>
                Enable email notifications for important platform
                events.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) =>
                  setEmailNotifications(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

          <div className="super-admin-settings-option">
            <div>
              <h3>Order Notifications</h3>
              <p>
                Send notifications when purchase orders change status.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={orderNotifications}
                onChange={(e) =>
                  setOrderNotifications(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

          <div className="super-admin-settings-option">
            <div>
              <h3>Invoice Notifications</h3>
              <p>
                Send notifications for invoice creation and payment
                updates.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={invoiceNotifications}
                onChange={(e) =>
                  setInvoiceNotifications(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

        </div>

        <div className="super-admin-settings-actions">
          <button type="button" className="super-admin-save-button">
            <Save size={17} />
            Save Changes
          </button>
        </div>

      </Card>

      {/* Payment Settings */}
      <Card className="super-admin-settings-card">

        <div className="super-admin-settings-card-header">
          <div className="super-admin-settings-title-icon green">
            <CreditCard size={20} />
          </div>

          <div>
            <h2>Payment Settings</h2>
            <p>
              Configure payment methods available on the platform.
            </p>
          </div>
        </div>

        <div className="super-admin-settings-options">

          <div className="super-admin-settings-option">
            <div>
              <h3>Prepaid</h3>
              <p>
                Allow full payment before order processing.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={prepaidEnabled}
                onChange={(e) =>
                  setPrepaidEnabled(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

          <div className="super-admin-settings-option">
            <div>
              <h3>Cash on Delivery</h3>
              <p>
                Allow payment to be collected after delivery.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) =>
                  setCodEnabled(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

          <div className="super-admin-settings-option">
            <div>
              <h3>Partial Payment</h3>
              <p>
                Allow an advance payment followed by the remaining
                balance.
              </p>
            </div>

            <label className="super-admin-switch">
              <input
                type="checkbox"
                checked={partialEnabled}
                onChange={(e) =>
                  setPartialEnabled(e.target.checked)
                }
              />
              <span></span>
            </label>
          </div>

        </div>

        <div className="super-admin-settings-actions">
          <button type="button" className="super-admin-save-button">
            <Save size={17} />
            Save Changes
          </button>
        </div>

      </Card>

      {/* Information */}
      <Card className="super-admin-settings-info">

        <div className="super-admin-settings-info-icon">
          <SettingsIcon size={20} />
        </div>

        <div>
          <h3>About Platform Settings</h3>

          <p>
            These settings control platform-wide behaviour. Changes
            will be connected to the backend and database during the
            functionality integration phase.
          </p>
        </div>

      </Card>

    </div>
  );
};

export default SuperAdminSettings;