import {
  Building2,
  Truck,
  Users,
  Package,
  ClipboardList,
  FileText,
  BarChart3,
  TrendingUp
} from "lucide-react";

import Card from "../components/Card";
import "./SuperAdminReports.css";

const SuperAdminReports = () => {
  return (
    <div className="super-admin-reports-page">

      {/* Header */}
      <div className="super-admin-reports-header">
        <div>
          <h1>Reports</h1>
          <p>
            Monitor platform-wide business activity and performance.
          </p>
        </div>
      </div>

      {/* Platform Summary */}
      <div className="super-admin-reports-summary">

        <Card className="super-admin-reports-card">
          <div className="super-admin-reports-card-content">
            <div>
              <p>Total Companies</p>
              <h2>0</h2>
            </div>

            <div className="super-admin-reports-icon blue">
              <Building2 size={22} />
            </div>
          </div>
        </Card>

        <Card className="super-admin-reports-card">
          <div className="super-admin-reports-card-content">
            <div>
              <p>Total Suppliers</p>
              <h2>0</h2>
            </div>

            <div className="super-admin-reports-icon orange">
              <Truck size={22} />
            </div>
          </div>
        </Card>

        <Card className="super-admin-reports-card">
          <div className="super-admin-reports-card-content">
            <div>
              <p>Total Users</p>
              <h2>0</h2>
            </div>

            <div className="super-admin-reports-icon green">
              <Users size={22} />
            </div>
          </div>
        </Card>

        <Card className="super-admin-reports-card">
          <div className="super-admin-reports-card-content">
            <div>
              <p>Total Products</p>
              <h2>0</h2>
            </div>

            <div className="super-admin-reports-icon purple">
              <Package size={22} />
            </div>
          </div>
        </Card>

      </div>

      {/* Order and Invoice Overview */}
      <div className="super-admin-reports-grid">

        <Card className="super-admin-reports-section">

          <div className="super-admin-reports-section-header">
            <div className="super-admin-reports-section-title">
              <div className="super-admin-reports-title-icon blue">
                <ClipboardList size={20} />
              </div>

              <div>
                <h2>Order Overview</h2>
                <p>Platform-wide purchase order activity.</p>
              </div>
            </div>
          </div>

          <div className="super-admin-reports-stat-list">

            <div className="super-admin-reports-stat-row">
              <span>Total Orders</span>
              <strong>0</strong>
            </div>

            <div className="super-admin-reports-stat-row">
              <span>Pending Orders</span>
              <strong>0</strong>
            </div>

            <div className="super-admin-reports-stat-row">
              <span>Processing Orders</span>
              <strong>0</strong>
            </div>

            <div className="super-admin-reports-stat-row">
              <span>Completed Orders</span>
              <strong>0</strong>
            </div>

          </div>

        </Card>

        <Card className="super-admin-reports-section">

          <div className="super-admin-reports-section-header">
            <div className="super-admin-reports-section-title">
              <div className="super-admin-reports-title-icon green">
                <FileText size={20} />
              </div>

              <div>
                <h2>Invoice Overview</h2>
                <p>Platform-wide invoice activity.</p>
              </div>
            </div>
          </div>

          <div className="super-admin-reports-stat-list">

            <div className="super-admin-reports-stat-row">
              <span>Total Invoices</span>
              <strong>0</strong>
            </div>

            <div className="super-admin-reports-stat-row">
              <span>Issued Invoices</span>
              <strong>0</strong>
            </div>

            <div className="super-admin-reports-stat-row">
              <span>Paid Invoices</span>
              <strong>0</strong>
            </div>

            <div className="super-admin-reports-stat-row">
              <span>Overdue Invoices</span>
              <strong>0</strong>
            </div>

          </div>

        </Card>

      </div>

      {/* Platform Activity */}
      <Card className="super-admin-reports-activity">

        <div className="super-admin-reports-section-header">
          <div className="super-admin-reports-section-title">
            <div className="super-admin-reports-title-icon purple">
              <BarChart3 size={20} />
            </div>

            <div>
              <h2>Platform Activity</h2>
              <p>
                Overview of activity across ProcureHub.
              </p>
            </div>
          </div>
        </div>

        <div className="super-admin-reports-empty">

          <TrendingUp size={34} />

          <h3>No activity data available</h3>

          <p>
            Reports will display platform activity once companies,
            suppliers, products and orders are available.
          </p>

        </div>

      </Card>

      {/* Information */}
      <Card className="super-admin-reports-info">

        <div className="super-admin-reports-info-icon">
          <BarChart3 size={20} />
        </div>

        <div>
          <h3>About Reports</h3>

          <p>
            Super Admin reports provide a platform-wide view of
            companies, suppliers, users, products, orders and invoices.
            Detailed report data will be connected to the backend later.
          </p>
        </div>

      </Card>

    </div>
  );
};

export default SuperAdminReports;