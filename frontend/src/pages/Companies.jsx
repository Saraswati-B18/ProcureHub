import {
  Building2,
  Search,
  Plus,
  MapPin,
  Users,
  CheckCircle,
  X,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";

import Card from "../components/Card";
import Button from "../components/Button";

import "./Companies.css";


const Companies = () => {

const [showForm, setShowForm] = useState(false);
const [selectedCompany, setSelectedCompany] = useState(null);
const [showViewModal, setShowViewModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showCompanyStatusModal, setShowCompanyStatusModal] = useState(false);
const [statusAction, setStatusAction] = useState("");
const [showDeleteModal, setShowDeleteModal] = useState(false);

const [editData, setEditData] = useState({
  company_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: ""
});

  const [companies, setCompanies] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [formErrors, setFormErrors] = useState({});


  const [formData, setFormData] = useState({
    company_name: "",
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


  /* ---------------------------------------
     Fetch Companies
  --------------------------------------- */

  const fetchCompanies = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/companies",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCompanies(response.data.companies || []);

    } catch (error) {

      console.error(
        "Failed to fetch companies:",
        error
      );

      setErrorMessage(
        "Unable to load companies."
      );

    }
  };


  /* ---------------------------------------
     Load companies when page opens
  --------------------------------------- */

  useEffect(() => {
    fetchCompanies();
  }, []);


  /* ---------------------------------------
     Handle Input
  --------------------------------------- */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setFormErrors({
      ...formErrors,
      [name]: ""
    });
  };


  /* ---------------------------------------
     Frontend Validation
  --------------------------------------- */

  const validateForm = () => {

    const errors = {};

    const namePattern =
      /^[A-Za-z][A-Za-z\s.'-]*$/;

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phonePattern =
      /^[6-9]\d{9}$/;


    if (!formData.company_name.trim()) {
      errors.company_name =
        "Company name is required.";
    } else if (
      !/[A-Za-z]/.test(
        formData.company_name.trim()
      ) ||
      /^\d+$/.test(
        formData.company_name.trim()
      )
    ) {
      errors.company_name =
        "Please enter a valid company name.";
    }


    if (!formData.email.trim()) {
      errors.email =
        "Company email is required.";
    } else if (
      !emailPattern.test(
        formData.email.trim()
      )
    ) {
      errors.email =
        "Please enter a valid email address.";
    }


    if (!formData.phone.trim()) {
      errors.phone =
        "Company phone is required.";
    } else if (
      !phonePattern.test(
        formData.phone.trim()
      )
    ) {
      errors.phone =
        "Enter a valid 10-digit mobile number.";
    }


    if (!formData.address.trim()) {
      errors.address =
        "Address is required.";
    }


    if (!formData.city.trim()) {
      errors.city =
        "City is required.";
    } else if (
      !namePattern.test(
        formData.city.trim()
      )
    ) {
      errors.city =
        "Please enter a valid city.";
    }


    if (!formData.state.trim()) {
      errors.state =
        "State is required.";
    } else if (
      !namePattern.test(
        formData.state.trim()
      )
    ) {
      errors.state =
        "Please enter a valid state.";
    }


    if (!formData.admin_name.trim()) {
      errors.admin_name =
        "Admin name is required.";
    } else if (
      !namePattern.test(
        formData.admin_name.trim()
      )
    ) {
      errors.admin_name =
        "Admin name can contain only letters.";
    }


    if (!formData.admin_email.trim()) {
      errors.admin_email =
        "Admin email is required.";
    } else if (
      !emailPattern.test(
        formData.admin_email.trim()
      )
    ) {
      errors.admin_email =
        "Please enter a valid admin email.";
    }


    if (!formData.admin_password) {
      errors.admin_password =
        "Admin password is required.";
    } else if (
      formData.admin_password.length < 6
    ) {
      errors.admin_password =
        "Password must contain at least 6 characters.";
    }


    if (!formData.admin_phone.trim()) {
      errors.admin_phone =
        "Admin phone is required.";
    } else if (
      !phonePattern.test(
        formData.admin_phone.trim()
      )
    ) {
      errors.admin_phone =
        "Enter a valid 10-digit mobile number.";
    }


    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };


  /* ---------------------------------------
     Create Company
  --------------------------------------- */

  const handleCreateCompany = async (e) => {

    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");


    if (!validateForm()) {
      return;
    }


    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");


      const response = await axios.post(
        "http://localhost:5000/api/companies",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      


      /* Close form */

      setShowForm(false);


      /* Clear form */

      setFormData({
        company_name: "",
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


      setFormErrors({});


      /* Show success message */

      setSuccessMessage(
        "Company and Company Admin created successfully."
      );


      /* Reload companies */

      fetchCompanies();


      /* Automatically hide notification */

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);


    } catch (error) {

      console.error(
        "Company creation failed:",
        error
      );


      if (error.response) {

        setErrorMessage(
          error.response.data.message ||
          "Failed to create company."
        );

      } else {

        setErrorMessage(
          "Unable to connect to the server."
        );
      }


    } finally {

      setLoading(false);

    }
  };


  /* ---------------------------------------
     Filter Companies
  --------------------------------------- */

  const filteredCompanies =
    companies.filter((company) => {

      const matchesSearch =
        company.company_name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );


      const matchesStatus =
        statusFilter === "ALL" ||
        company.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  /* ---------------------------------------
     Statistics
  --------------------------------------- */

  const totalCompanies =
    companies.length;

  const activeCompanies =
    companies.filter(
      (company) =>
        company.status === "ACTIVE"
    ).length;

  const totalUsers =
    companies.reduce(
      (total, company) =>
        total +
        Number(company.user_count || 0),
      0
    );

  const totalBranches =
    companies.reduce(
      (total, company) =>
        total +
        Number(company.branch_count || 0),
      0
    );

    /* ---------------------------------------
   Update Company
--------------------------------------- */

const handleUpdateCompany = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/companies/${selectedCompany.id}`,
      editData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowEditModal(false);
    setSelectedCompany(null);

    setSuccessMessage("Company updated successfully.");

    await fetchCompanies();

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

  } catch (error) {
    console.error("Company update failed:", error);

    if (error.response) {
      setErrorMessage(
        error.response.data.message ||
        "Failed to update company."
      );
    } else {
      setErrorMessage(
        "Unable to connect to the server."
      );
    }

  } finally {
    setLoading(false);
  }
};

// ==========================================
// DEACTIVATE COMPANY
// ==========================================

const handleDeactivateCompany = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/companies/${selectedCompany.id}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowCompanyStatusModal(false);
    setSelectedCompany(null);
    setStatusAction("");

    setSuccessMessage("Company deactivated successfully!");

    await fetchCompanies();

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Company deactivation failed:", error);

    if (error.response) {
      console.error(error.response.data);
      alert(error.response.data.message);
    }
  }
};


// ==========================================
// ACTIVATE COMPANY
// ==========================================

const handleActivateCompany = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/companies/${selectedCompany.id}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowCompanyStatusModal(false);
    setSelectedCompany(null);
    setStatusAction("");

    setSuccessMessage("Company activated successfully!");

    await fetchCompanies();

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Company activation failed:", error);

    if (error.response) {
      console.error(error.response.data);
      alert(error.response.data.message);
    }
  }
};

const handleDeleteCompany = async () => {
  try {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/companies/${selectedCompany.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowDeleteModal(false);
    setSelectedCompany(null);

    setSuccessMessage("Company deleted successfully.");

    await fetchCompanies();

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

  } catch (error) {
    console.error("Company deletion failed:", error);

    if (error.response) {
      setErrorMessage(
        error.response.data.message || "Failed to delete company."
      );
    } else {
      setErrorMessage("Unable to connect to the server.");
    }

  } finally {
    setLoading(false);
  }
};

  return (

    <div className="companies-page">


      {/* Success Notification */}

      {successMessage && (

        <div className="company-notification success">

          <CheckCircle size={20} />

          <span>
            {successMessage}
          </span>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={18} />
          </button>

        </div>

      )}


      {/* Error Notification */}

      {errorMessage && (

        <div className="company-notification error">

          <X size={20} />

          <span>
            {errorMessage}
          </span>

          <button
            onClick={() =>
              setErrorMessage("")
            }
          >
            <X size={18} />
          </button>

        </div>

      )}


      {/* Page Heading */}

      <div className="companies-heading">

        <div>

          <h1>Companies</h1>

          <p>
            Manage companies registered on the
            ProcureHub platform.
          </p>

        </div>


        <Button
          onClick={() =>
            setShowForm(true)
          }
        >
          <Plus size={17} />
          Add Company
        </Button>

      </div>


      {/* Summary Cards */}

      <div className="companies-stats">


        <Card>

          <div className="company-stat-card">

            <div className="company-stat-icon blue">
              <Building2 size={22} />
            </div>

            <div>

              <span>
                Total Companies
              </span>

              <strong>
                {totalCompanies}
              </strong>

            </div>

          </div>

        </Card>


        <Card>

          <div className="company-stat-card">

            <div className="company-stat-icon green">
              <CheckCircle size={22} />
            </div>

            <div>

              <span>
                Active Companies
              </span>

              <strong>
                {activeCompanies}
              </strong>

            </div>

          </div>

        </Card>


        <Card>

          <div className="company-stat-card">

            <div className="company-stat-icon orange">
              <Users size={22} />
            </div>

            <div>

              <span>
                Total Users
              </span>

              <strong>
                {totalUsers}
              </strong>

            </div>

          </div>

        </Card>


        <Card>

          <div className="company-stat-card">

            <div className="company-stat-icon purple">
              <MapPin size={22} />
            </div>

            <div>

              <span>
                Total Branches
              </span>

              <strong>
                {totalBranches}
              </strong>

            </div>

          </div>

        </Card>


      </div>


      {/* Company List */}

      <Card className="companies-list-card">


        <div className="companies-list-header">

          <div>

            <h2>
              Registered Companies
            </h2>

            <p>
              Companies currently using
              ProcureHub.
            </p>

          </div>


          <div className="companies-filters">


            <div className="companies-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="ALL">
                All Companies
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>


          </div>

        </div>


        <div className="companies-table-wrapper">

          <table className="companies-table">

            <thead>

              <tr>

                <th>Company</th>
                <th>Contact</th>
                <th>Branches</th>
                <th>Users</th>
                <th>Status</th>
                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredCompanies.length === 0 ? (

                <tr>

                  <td colSpan="6">

                    <div className="companies-empty">

                      <div className="companies-empty-icon">
                        <Building2 size={34} />
                      </div>

                      <h3>
                        No companies registered
                      </h3>

                      <p>
                        Companies added to
                        ProcureHub will appear here.
                      </p>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          setShowForm(true)
                        }
                      >
                        <Plus size={16} />
                        Add Your First Company
                      </Button>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredCompanies.map(
                  (company) => (

                    <tr key={company.id}>

                      <td>

                        <strong>
                          {company.company_name}
                        </strong>

                        <div>
                          {company.email}
                        </div>

                      </td>


                      <td>

                        <div>
                          {company.phone}
                        </div>

                        <div>
                          {company.city},{" "}
                          {company.state}
                        </div>

                      </td>


                      <td>
                        {company.branch_count}
                      </td>


                      <td>
                        {company.user_count}
                      </td>


                      <td>

  <span
  className={
    company.status === "ACTIVE"
      ? "status-badge active"
      : "status-badge inactive"
  }
>
  {company.status === "ACTIVE"
    ? "Active"
    : "Inactive"}
</span>

</td>


                      <td>

                       <td>
  <div className="company-actions">

    <button
      className="company-action-btn view"
      title="View Company"
      onClick={() => {
        setSelectedCompany(company);
        setShowViewModal(true);
      }}
    >
      <Eye size={18} />
    </button>

    <button
  className="company-action-btn edit"
  title="Edit Company"
onClick={() => {
  setSelectedCompany(company);

  setEditData({
    company_name: company.company_name || "",
    email: company.email || "",
    phone: company.phone || "",
    address: company.address || "",
    city: company.city || "",
    state: company.state || ""
  });

  setShowEditModal(true);
}}
>
  <Pencil size={18} />
</button>

    {/* Activate / Deactivate */}

{company.status === "INACTIVE" ? (

  <button
    className="company-action-btn activate"
    title="Activate Company"
    onClick={() => {
      setSelectedCompany(company);
      setStatusAction("ACTIVATE");
      setShowCompanyStatusModal(true);
    }}
  >
    <CheckCircle size={18} />
  </button>

) : (

  <button
    className="company-action-btn delete"
    title="Deactivate Company"
    onClick={() => {
      setSelectedCompany(company);
      setStatusAction("DEACTIVATE");
      setShowCompanyStatusModal(true);
    }}
  >
    <Trash2 size={18} />
  </button>

)}
  </div>
</td>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </Card>


      {/* Information Card */}

      <Card className="companies-info-card">

        <div className="companies-info-icon">
          <Building2 size={22} />
        </div>

        <div>

          <h3>
            Company Management
          </h3>

          <p>
            Super Admins can add companies,
            manage their branches, monitor users
            and control company status from this
            section.
          </p>

        </div>

      </Card>


      {/* Add Company Modal */}

      {showForm && (

        <div className="company-modal">

          <div className="company-modal-content">


            <div className="company-modal-header">

              <div>

                <h2>
                  Add Company
                </h2>

                <p>
                  Create a company and its
                  Company Admin account.
                </p>

              </div>


              <button
                className="company-modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form
              className="company-form"
              onSubmit={handleCreateCompany}
            >


              <div>

                <input
                  type="text"
                  name="company_name"
                  placeholder="Company Name"
                  value={formData.company_name}
                  onChange={handleChange}
                />

                {formErrors.company_name && (
                  <small className="field-error">
                    {formErrors.company_name}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="email"
                  name="email"
                  placeholder="Company Email"
                  value={formData.email}
                  onChange={handleChange}
                />

                {formErrors.email && (
                  <small className="field-error">
                    {formErrors.email}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                />

                {formErrors.phone && (
                  <small className="field-error">
                    {formErrors.phone}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />

                {formErrors.address && (
                  <small className="field-error">
                    {formErrors.address}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />

                {formErrors.city && (
                  <small className="field-error">
                    {formErrors.city}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />

                {formErrors.state && (
                  <small className="field-error">
                    {formErrors.state}
                  </small>
                )}

              </div>


              <hr />


              <h3>
                Company Admin
              </h3>


              <div>

                <input
                  type="text"
                  name="admin_name"
                  placeholder="Admin Name"
                  value={formData.admin_name}
                  onChange={handleChange}
                />

                {formErrors.admin_name && (
                  <small className="field-error">
                    {formErrors.admin_name}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="email"
                  name="admin_email"
                  placeholder="Admin Email"
                  value={formData.admin_email}
                  onChange={handleChange}
                />

                {formErrors.admin_email && (
                  <small className="field-error">
                    {formErrors.admin_email}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="password"
                  name="admin_password"
                  placeholder="Admin Password"
                  value={formData.admin_password}
                  onChange={handleChange}
                />

                {formErrors.admin_password && (
                  <small className="field-error">
                    {formErrors.admin_password}
                  </small>
                )}

              </div>


              <div>

                <input
                  type="text"
                  name="admin_phone"
                  placeholder="Admin Phone"
                  maxLength="10"
                  value={formData.admin_phone}
                  onChange={handleChange}
                />

                {formErrors.admin_phone && (
                  <small className="field-error">
                    {formErrors.admin_phone}
                  </small>
                )}

              </div>


              <div className="company-form-actions">

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  disabled={loading}
                >

                  <Plus size={16} />

                  {loading
                    ? "Creating..."
                    : "Create Company"}

                </Button>

              </div>


            </form>

          </div>

        </div>

      )}
            {/* View Company Modal */}
      {showViewModal && selectedCompany && (
        <div className="company-modal">
          <div className="company-modal-content">

            <div className="company-modal-header">
              <div>
                <h2>Company Details</h2>
                <p>Complete information about this company.</p>
              </div>

              <button
                className="company-modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCompany(null);
                }}

              >
                <X size={20} />
              </button>
            </div>

            <div className="company-view-details">

              <div className="company-detail-section">
                <h3>Company Information</h3>

                <div className="company-detail-grid">

                  <div>
                    <span>Company Name: </span>
<strong>{selectedCompany.company_name}</strong>
                  </div>

                  <div>
                    <span>Email: </span>
                    <strong>{selectedCompany.email}</strong>
                  </div>

                  <div>
                    <span>Phone: </span>
                    <strong>{selectedCompany.phone}</strong>
                  </div>

                  <div>
                    <span>Status: </span>
                    <strong>{selectedCompany.status}</strong>
                  </div>

                  <div>
                    <span>City: </span>
                    <strong>{selectedCompany.city}</strong>
                  </div>

                  <div>
                    <span>State: </span>
                    <strong>{selectedCompany.state}</strong>
                  </div>

                  <div className="company-detail-full">
                    <span>Full Address: </span>
                    <strong>{selectedCompany.address}</strong>
                  </div>

                  <div>
                    <span>Created Date: </span>
                    <strong>
                      {selectedCompany.created_at
                        ? new Date(
                            selectedCompany.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </strong>
                  </div>

                </div>
              </div>


              <div className="company-detail-section">
                <h3>Company Admin</h3>

                <div className="company-detail-grid">

                  <div>
                    <span>Admin Name: </span>
                    <strong>
                      {selectedCompany.admin_name || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Admin Email: </span>
                    <strong>
                      {selectedCompany.admin_email || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Admin Phone: </span>
                    <strong>
                      {selectedCompany.admin_phone || "—"}
                    </strong>
                  </div>

                </div>
              </div>


              <div className="company-detail-section">
                <h3>Company Overview</h3>

                <div className="company-detail-grid">

                  <div>
                    <span>Total Users: </span>
                    <strong>
                      {selectedCompany.user_count || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Total Branches: </span>
                    <strong>
                      {selectedCompany.branch_count || 0}
                    </strong>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

       {/* Edit Company Modal */}
{showEditModal && selectedCompany && (
  <div className="company-modal">
    <div className="company-modal-content">

      <div className="company-modal-header">
        <div>
          <h2>Edit Company</h2>
          <p>Update company information.</p>
        </div>

        <button
          className="company-modal-close"
          onClick={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
        >
          <X size={20} />
        </button>
      </div>

      <form
        className="company-form"
        onSubmit={handleUpdateCompany}
      >

        <div>
          <input
            type="text"
            placeholder="Company Name"
            value={editData.company_name}
            onChange={(e) =>
              setEditData({
                ...editData,
                company_name: e.target.value
              })
            }
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Company Email"
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

        <div className="company-form-actions">

          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setShowEditModal(false);
              setSelectedCompany(null);
            }}
          >
            Cancel
          </Button>

          <Button type="submit">
            Save Changes
          </Button>

        </div>

      </form>

    </div>
  </div>
)}


{/* Delete Company Confirmation Modal */}
{showDeleteModal && selectedCompany && (
  <div className="company-modal">
    <div className="company-modal-content company-delete-modal">

      <div className="company-modal-header">
        <div>
          <h2>Delete Company</h2>
          <p>Confirm that you want to delete this company.</p>
        </div>

        <button
          className="company-modal-close"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedCompany(null);
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="delete-company-content">

        <div className="delete-company-icon">
          <Trash2 size={28} />
        </div>

        <h3>
          Are you sure you want to delete{" "}
          <strong>{selectedCompany.company_name}</strong>?
        </h3>

        <p>
          This action will remove the company from ProcureHub.
          Please make sure you want to continue.
        </p>

      </div>

      <div className="company-form-actions">

        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedCompany(null);
          }}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          type="button"
          onClick={handleDeleteCompany}
          disabled={loading}
        >
          <Trash2 size={16} />
          {loading ? "Deleting..." : "Delete Company"}
        </Button>

      </div>

    </div>
  </div>
)}

{/* =========================
    COMPANY STATUS MODAL
========================= */}

{showCompanyStatusModal && selectedCompany && (
  <div className="company-modal-overlay">

    <div className="company-modal-content company-delete-modal">

      <div className="company-modal-header">

        <div>
          <h2>
            {statusAction === "ACTIVATE"
              ? "Activate Company"
              : "Deactivate Company"}
          </h2>

          <p>
            {statusAction === "ACTIVATE"
              ? "Confirm company activation."
              : "Confirm company deactivation."}
          </p>
        </div>

        <button
          className="company-modal-close"
          onClick={() => {
            setShowCompanyStatusModal(false);
            setSelectedCompany(null);
          }}
        >
          <X size={20} />
        </button>

      </div>

      <div className="company-delete-content">

        <p>
          Are you sure you want to{" "}
          {statusAction === "ACTIVATE"
            ? "activate"
            : "deactivate"}{" "}
          <strong>
            {selectedCompany.company_name}
          </strong>
          ?
        </p>

        {statusAction === "ACTIVATE" ? (

          <p>
            This will reactivate the company and
            allow its users to access ProcureHub again.
          </p>

        ) : (

          <>
            <p>
              This will deactivate the company and
              prevent its users from accessing ProcureHub.
            </p>

            <p>
              Existing branches, users and procurement
              records will be preserved.
            </p>
          </>

        )}

      </div>

      <div className="company-modal-actions">

        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setShowCompanyStatusModal(false);
            setSelectedCompany(null);
          }}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={
            statusAction === "ACTIVATE"
              ? handleActivateCompany
              : handleDeactivateCompany
          }
        >
          {statusAction === "ACTIVATE"
            ? "Activate Company"
            : "Deactivate Company"}
        </Button>

      </div>

    </div>

  </div>
)}

    </div>
  );
};

export default Companies;