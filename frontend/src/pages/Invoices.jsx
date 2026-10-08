import { FileText, Eye } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import "./Invoices.css";

const Invoices = () => {
  return (
    <div className="invoices-page">

      <div className="page-heading">
        <div>
          <h1>Invoices</h1>
          <p>View invoices related to your purchase orders.</p>
        </div>
      </div>

      <Card>
        <div className="invoices-header">
          <div>
            <h2>My Invoices</h2>
            <span>0 invoices</span>
          </div>

          <select defaultValue="all">
            <option value="all">All Statuses</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="invoices-table-wrapper">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Invoice Date</th>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Total Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="8">
                  <div className="invoices-empty">
                    <FileText size={36} />

                    <h3>No invoices available</h3>

                    <p>
                      Supplier invoices will appear here once
                      they are created for your orders.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default Invoices;