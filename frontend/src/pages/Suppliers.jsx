import { useEffect, useState } from "react";
import axios from "axios";

import {
  Truck,
  Search,
  Plus,
  Package,
  CheckCircle,
  XCircle,
  X,
  Check,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";

import "./Suppliers.css";

const Suppliers = () => {

  const [suppliers, setSuppliers] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const [editData, setEditData] = useState({
    supplier_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: ""
  });

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/suppliers",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuppliers(response.data.suppliers);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    supplier_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: ""
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");

const filteredSuppliers = suppliers.filter((supplier) => {
  const matchesSearch =
    supplier.supplier_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    supplier.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesStatus =
    statusFilter === "ALL" ||
    supplier.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  // =========================
  // UPDATE SUPPLIER
  // =========================

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/suppliers/${selectedSupplier.id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowEditModal(false);
      setSelectedSupplier(null);

      setSuccessMessage("Supplier updated successfully!");

      await fetchSuppliers();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Supplier update failed:", error);

      if (error.response) {
        console.error(error.response.data);
      }
    }
  };

  // =========================
  // DELETE / DEACTIVATE SUPPLIER
  // =========================

  const handleDeleteSupplier = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/suppliers/${selectedSupplier.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowDeleteModal(false);
      setSelectedSupplier(null);

      setSuccessMessage("Supplier deleted successfully!");

      await fetchSuppliers();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Supplier delete failed:", error);

      if (error.response) {
        console.error(error.response.data);
      }
    }
  };

  // =========================
// ACTIVATE SUPPLIER
// =========================

const handleActivateSupplier = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/suppliers/${selectedSupplier.id}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowActivateModal(false);
    setSelectedSupplier(null);

    setSuccessMessage("Supplier activated successfully!");

    await fetchSuppliers();

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Supplier activation failed:", error);

    if (error.response) {
      console.error(error.response.data);
      alert(error.response.data.message);
    }
  }
};

  // =========================
  // ADD SUPPLIER FORM
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openModal = () => {
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend required-field validation
    const allFieldsFilled = Object.values(formData).every(
      (value) => value.trim() !== ""
    );

    if (!allFieldsFilled) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    // Supplier name validation
    if (/^\d+$/.test(formData.supplier_name.trim())) {
      alert("Supplier name cannot contain only numbers.");
      return;
    }

    // Admin name validation
    if (/^\d+$/.test(formData.admin_name.trim())) {
      alert("Admin name cannot contain only numbers.");
      return;
    }

    // Email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      alert("Please enter a valid supplier email address.");
      return;
    }

    if (!emailPattern.test(formData.admin_email)) {
      alert("Please enter a valid admin email address.");
      return;
    }

    // Phone validation
    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(formData.phone)) {
      alert(
        "Supplier phone number must be a valid 10-digit number."
      );
      return;
    }

    if (!phonePattern.test(formData.admin_phone)) {
      alert(
        "Admin phone number must be a valid 10-digit number."
      );
      return;
    }

    // Password validation
    if (formData.admin_password.length < 6) {
      alert(
        "Admin password must contain at least 6 characters."
      );
      return;
    }

    try {

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/suppliers",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "Supplier created:",
        response.data
      );

      await fetchSuppliers();

      // Close form
      setShowModal(false);

      // Show success message
      setSuccessMessage(
        "Supplier and Supplier Login created successfully."
      );

      // Clear form
      setFormData({
        supplier_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
        admin_phone: ""
      });

    } catch (error) {

      console.error(
        "Supplier creation failed:",
        error
      );

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert(
          "Unable to connect to the server."
        );
      }
    }
  };

  return (
    <div className="suppliers-page">

      {/* =========================
          SUCCESS MESSAGE
      ========================== */}

      {successMessage && (
        <div className="supplier-success-message">

          <div className="supplier-success-icon">
            <Check size={20} />
          </div>

          <div>
            <strong>Success</strong>
            <p>{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =========================
          PAGE HEADING
      ========================== */}

      <div className="suppliers-heading">

        <div>
          <h1>Suppliers</h1>

          <p>
            Manage suppliers registered on the ProcureHub platform.
          </p>
        </div>

        <Button onClick={openModal}>
          <Plus size={17} />
          Add Supplier
        </Button>

      </div>

      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <div className="suppliers-stats">

        {/* Total Suppliers */}

        <Card>
          <div className="supplier-stat-card">

            <div className="supplier-stat-icon blue">
              <Truck size={22} />
            </div>

            <div>
              <span>Total Suppliers</span>

              <strong>
                {suppliers.length}
              </strong>
            </div>

          </div>
        </Card>

        {/* Active Suppliers */}

        <Card>
          <div className="supplier-stat-card">

            <div className="supplier-stat-icon green">
              <CheckCircle size={22} />
            </div>

            <div>
              <span>Active Suppliers</span>

              <strong>
                {
                  suppliers.filter(
                    (supplier) =>
                      supplier.status === "ACTIVE"
                  ).length
                }
              </strong>
            </div>

          </div>
        </Card>

        {/* Total Products */}

        <Card>
          <div className="supplier-stat-card">

            <div className="supplier-stat-icon orange">
              <Package size={22} />
            </div>

            <div>
              <span>Total Products</span>

              <strong>
                {suppliers.reduce(
                  (total, supplier) =>
                    total +
                    Number(
                      supplier.product_count || 0
                    ),
                  0
                )}
              </strong>
            </div>

          </div>
        </Card>

        {/* Inactive Suppliers */}

        <Card>
          <div className="supplier-stat-card">

            <div className="supplier-stat-icon purple">
              <XCircle size={22} />
            </div>

            <div>
              <span>Inactive Suppliers</span>

              <strong>
                {
                  suppliers.filter(
                    (supplier) =>
                      supplier.status === "INACTIVE"
                  ).length
                }
              </strong>
            </div>

          </div>
        </Card>

      </div>

      {/* =========================
          REGISTERED SUPPLIERS
      ========================== */}

      <Card className="suppliers-list-card">

        <div className="suppliers-list-header">

          <div>
            <h2>Registered Suppliers</h2>

            <p>
              Suppliers currently available on ProcureHub.
            </p>
          </div>

          <div className="suppliers-filters">

            <div className="suppliers-search">

              <Search size={18} />

              <input
  type="text"
  placeholder="Search suppliers..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

            </div>

            <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="ALL">All Suppliers</option>
  <option value="ACTIVE">Active</option>
  <option value="INACTIVE">Inactive</option>
</select>

          </div>

        </div>

        <div className="suppliers-table-wrapper">

          <table className="suppliers-table">

            <thead>

              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Products</th>
                
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredSuppliers.length === 0 ? (

                <tr>

                 <td colSpan="5">

                    <div className="suppliers-empty">

                      <div className="suppliers-empty-icon">
                        <Truck size={34} />
                      </div>

                      <h3>
                        No suppliers registered
                      </h3>

                      <p>
                        Suppliers added to ProcureHub
                        will appear here.
                      </p>

                      <Button
                        variant="secondary"
                        onClick={openModal}
                      >
                        <Plus size={16} />
                        Add Your First Supplier
                      </Button>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredSuppliers.map((supplier) => (

                  <tr key={supplier.id}>

                    {/* Supplier */}

                    <td>

                      <strong>
                        {supplier.supplier_name}
                      </strong>

                      <br />

                      <span>
                        {supplier.email}
                      </span>

                    </td>

                    {/* Contact */}

                    <td>

                      {supplier.phone || "-"}

                      <br />

                      <span>
                        {supplier.city || "-"},{" "}
                        {supplier.state || "-"}
                      </span>

                    </td>

                    {/* Products */}

                    <td>
                      {supplier.product_count || 0}
                    </td>

                    

                    {/* Status */}

                    <td>

  <span
  className={
    supplier.status === "ACTIVE"
      ? "status-badge active"
      : "status-badge inactive"
  }
>
  {supplier.status === "ACTIVE"
    ? "Active"
    : "Inactive"}
</span>

</td>

                    {/* Actions */}

                    <td>

                      <div className="supplier-actions">

                        {/* View */}

                        <button
                          className="supplier-action-btn view"
                          title="View Supplier"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye size={18} />
                        </button>

                        {/* Edit */}

                        <button
                          className="supplier-action-btn edit"
                          title="Edit Supplier"
                          onClick={() => {

                            setSelectedSupplier(supplier);

                            setEditData({
                              supplier_name:
                                supplier.supplier_name || "",

                              email:
                                supplier.email || "",

                              phone:
                                supplier.phone || "",

                              address:
                                supplier.address || "",

                              city:
                                supplier.city || "",

                              state:
                                supplier.state || ""
                            });

                            setShowEditModal(true);

                          }}
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Delete */}

                        {/* Activate / Deactivate */}

{supplier.status === "INACTIVE" ? (

  <button
    className="supplier-action-btn activate"
    title="Activate Supplier"
    onClick={() => {
      setSelectedSupplier(supplier);
      setShowActivateModal(true);
    }}
  >
    <CheckCircle size={18} />
  </button>

) : (

  <button
    className="supplier-action-btn delete"
    title="Deactivate Supplier"
    onClick={() => {
      setSelectedSupplier(supplier);
      setShowDeleteModal(true);
    }}
  >
    <Trash2 size={18} />
  </button>

)}

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* =========================
          INFORMATION CARD
      ========================== */}

      <Card className="suppliers-info-card">

        <div className="suppliers-info-icon">
          <Truck size={22} />
        </div>

        <div>

          <h3>
            Supplier Management
          </h3>

          <p>
            Super Admins can add suppliers, manage
            supplier accounts, monitor their products
            and configure supplier payment methods.
          </p>

        </div>

      </Card>

      {/* =========================
          ADD SUPPLIER MODAL
      ========================== */}

      {showModal && (

        <div className="supplier-modal-overlay">

          <div className="supplier-modal">

            <div className="supplier-modal-header">

              <div>

                <h2>
                  Add Supplier
                </h2>

                <p>
                  Create a supplier and its Supplier
                  Login account.
                </p>

              </div>

              <button
                type="button"
                className="supplier-modal-close"
                onClick={closeModal}
              >
                <X size={22} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Supplier Information */}

              <div className="supplier-form-grid">

                <input
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  placeholder="Supplier Name"
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Supplier Email"
                />

                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Supplier Phone"
                  maxLength="10"
                />

                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />

                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />

              </div>

              {/* Supplier Admin */}

              <div className="supplier-form-section">

                <h3>
                  Supplier Admin
                </h3>

              </div>

              <div className="supplier-form-grid">

                <input
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleChange}
                  placeholder="Admin Name"
                />

                <input
                  name="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={handleChange}
                  placeholder="Admin Email"
                />

                <input
                  name="admin_password"
                  type="password"
                  value={formData.admin_password}
                  onChange={handleChange}
                  placeholder="Admin Password"
                />

                <input
                  name="admin_phone"
                  type="tel"
                  value={formData.admin_phone}
                  onChange={handleChange}
                  placeholder="Admin Phone"
                  maxLength="10"
                />

              </div>

              {/* Modal Actions */}

              <div className="supplier-modal-actions">

                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                >
                  Cancel
                </Button>

                <Button type="submit">

                  <Plus size={17} />

                  Create Supplier

                </Button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          VIEW SUPPLIER MODAL
      ========================== */}

      {showViewModal && selectedSupplier && (

        <div className="supplier-modal-overlay">

          <div className="supplier-modal-content">

            <div className="supplier-modal-header">

              <div>

                <h2>
                  Supplier Details
                </h2>

                <p>
                  View supplier information.
                </p>

              </div>

              <button
                className="supplier-modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSupplier(null);
                }}
              >
                <X size={20} />
              </button>

            </div>

            <div className="supplier-details">

              <div className="supplier-detail-row">

                <span>
                  Supplier Name:
                </span>

                <strong>
                  {selectedSupplier.supplier_name || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  Email:
                </span>

                <strong>
                  {selectedSupplier.email || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  Phone:
                </span>

                <strong>
                  {selectedSupplier.phone || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  Status:
                </span>

                <strong>
                  {selectedSupplier.status || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  City:
                </span>

                <strong>
                  {selectedSupplier.city || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  State:
                </span>

                <strong>
                  {selectedSupplier.state || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  Address:
                </span>

                <strong>
                  {selectedSupplier.address || "-"}
                </strong>

              </div>

              <div className="supplier-detail-row">

                <span>
                  Total Products:
                </span>

                <strong>
                  {selectedSupplier.product_count || 0}
                </strong>

              </div>

              
              <div className="supplier-detail-row">

                <span>
                  Created Date:
                </span>

                <strong>

                  {selectedSupplier.created_at
                    ? new Date(
                        selectedSupplier.created_at
                      ).toLocaleDateString("en-IN")
                    : "-"}

                </strong>

              </div>

            </div>

            <div className="supplier-form-actions">

              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSupplier(null);
                }}
              >
                Close
              </Button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          EDIT SUPPLIER MODAL
      ========================== */}

      {showEditModal && selectedSupplier && (

        <div className="supplier-modal-overlay">

          <div className="supplier-modal-content">

            <div className="supplier-modal-header">

              <div>

                <h2>
                  Edit Supplier
                </h2>

                <p>
                  Update supplier information.
                </p>

              </div>

              <button
                className="supplier-modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSupplier(null);
                }}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="supplier-form-grid"
              onSubmit={handleUpdateSupplier}
            >

              <div>

                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={editData.supplier_name}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      supplier_name: e.target.value
                    })
                  }
                />

              </div>

              <div>

                <input
                  type="email"
                  placeholder="Supplier Email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      email: e.target.value
                    })
                  }
                />

              </div>

              <div>

                <input
                  type="text"
                  placeholder="Phone"
                  maxLength="10"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      phone: e.target.value
                    })
                  }
                />

              </div>

              <div>

                <input
                  type="text"
                  placeholder="Address"
                  value={editData.address}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      address: e.target.value
                    })
                  }
                />

              </div>

              <div>

                <input
                  type="text"
                  placeholder="City"
                  value={editData.city}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      city: e.target.value
                    })
                  }
                />

              </div>

              <div>

                <input
                  type="text"
                  placeholder="State"
                  value={editData.state}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      state: e.target.value
                    })
                  }
                />

              </div>

            </form>

            <div className="supplier-modal-actions">

              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSupplier(null);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleUpdateSupplier}
              >
                Save Changes
              </Button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          DELETE SUPPLIER MODAL
      ========================== */}

      {showDeleteModal && selectedSupplier && (

        <div className="supplier-modal-overlay">

          <div className="supplier-modal-content supplier-delete-modal">

            <div className="supplier-modal-header">

              <div>

                <h2>
                  Delete Supplier
                </h2>

                <p>
                  Confirm supplier deactivation.
                </p>

              </div>

              <button
                className="supplier-modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSupplier(null);
                }}
              >
                <X size={20} />
              </button>

            </div>

            <div className="supplier-delete-content">

              <p>

                Are you sure you want to delete/deactivate{" "}
                <strong>
                  {selectedSupplier.supplier_name}
                </strong>
                ?

              </p>

              <p>

                This will deactivate the supplier,
                supplier login and supplier products.

              </p>

              <p>

                Existing orders, deliveries, invoices
                and payment history will be preserved.

              </p>

            </div>

            <div className="supplier-modal-actions">

              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSupplier(null);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDeleteSupplier}
              >
                Delete Supplier
              </Button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
    ACTIVATE SUPPLIER MODAL
========================== */}

{showActivateModal && selectedSupplier && (

  <div className="supplier-modal-overlay">

    <div className="supplier-modal-content supplier-delete-modal">

      <div className="supplier-modal-header">

        <div>

          <h2>
            Activate Supplier
          </h2>

          <p>
            Confirm supplier activation.
          </p>

        </div>

        <button
          className="supplier-modal-close"
          onClick={() => {
            setShowActivateModal(false);
            setSelectedSupplier(null);
          }}
        >
          <X size={20} />
        </button>

      </div>

      <div className="supplier-delete-content">

        <p>

          Are you sure you want to activate{" "}
          <strong>
            {selectedSupplier.supplier_name}
          </strong>
          ?

        </p>

        <p>

          This will reactivate the supplier and
          their Supplier Login account.

        </p>

        <p>

          Supplier products will remain inactive
          until they are activated separately.

        </p>

      </div>

      <div className="supplier-modal-actions">

        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setShowActivateModal(false);
            setSelectedSupplier(null);
          }}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleActivateSupplier}
        >
          Activate Supplier
        </Button>

      </div>

    </div>

  </div>

)}

    </div>
  );
};

export default Suppliers;