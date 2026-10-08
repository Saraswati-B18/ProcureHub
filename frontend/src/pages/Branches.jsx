import {
  Building2,
  Search,
  Plus,
  MapPin,
  Phone,
  Pencil,
  CheckCircle,
  XCircle,
  X,
  Eye
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";

import Card from "../components/Card";
import Button from "../components/Button";

import "./Branches.css";


const Branches = () => {

  const [branches, setBranches] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);

  const [statusAction, setStatusAction] = useState("");

  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [formErrors, setFormErrors] = useState({});


  const [formData, setFormData] = useState({
    branch_name: "",
    address: "",
    city: "",
    state: "",
    phone: ""
  });


  // =====================================================
  // FETCH BRANCHES
  // =====================================================

  const fetchBranches = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/branches/my-branches",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBranches(
        response.data.branches || []
      );

    } catch (error) {

      console.error(
        "Failed to fetch branches:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Unable to load branches."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD BRANCHES WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    fetchBranches();

  }, []);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

  };


  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {

    const errors = {};

    const namePattern =
      /^[A-Za-z][A-Za-z\s.'-]*$/;

    const phonePattern =
      /^[6-9]\d{9}$/;


    if (!formData.branch_name.trim()) {

      errors.branch_name =
        "Branch name is required.";

    } else if (
      !/[A-Za-z]/.test(
        formData.branch_name.trim()
      )
    ) {

      errors.branch_name =
        "Please enter a valid branch name.";

    }


    if (
      formData.city.trim() &&
      !namePattern.test(
        formData.city.trim()
      )
    ) {

      errors.city =
        "Please enter a valid city.";

    }


    if (
      formData.state.trim() &&
      !namePattern.test(
        formData.state.trim()
      )
    ) {

      errors.state =
        "Please enter a valid state.";

    }


    if (
      formData.phone.trim() &&
      !phonePattern.test(
        formData.phone.trim()
      )
    ) {

      errors.phone =
        "Enter a valid 10-digit mobile number.";

    }


    setFormErrors(errors);

    return Object.keys(errors).length === 0;

  };


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const handleOpenAddForm = () => {

    setFormData({
      branch_name: "",
      address: "",
      city: "",
      state: "",
      phone: ""
    });

    setFormErrors({});

    setSelectedBranch(null);

    setErrorMessage("");

    setShowForm(true);

  };


  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const handleOpenEditForm = (branch) => {

    setFormData({
      branch_name:
        branch.branch_name || "",

      address:
        branch.address || "",

      city:
        branch.city || "",

      state:
        branch.state || "",

      phone:
        branch.phone || ""
    });

    setFormErrors({});

    setSelectedBranch(branch);

    setErrorMessage("");

    setShowForm(true);

  };


  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleCloseForm = () => {

    if (saving) {
      return;
    }

    setShowForm(false);

    setSelectedBranch(null);

    setFormErrors({});

  };


  // =====================================================
  // SAVE BRANCH
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSuccessMessage("");

    setErrorMessage("");


    if (!validateForm()) {
      return;
    }


    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");


      if (selectedBranch) {

        await axios.put(
          `http://localhost:5000/api/branches/${selectedBranch.id}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setSuccessMessage(
          "Branch updated successfully."
        );

      } else {

        await axios.post(
          "http://localhost:5000/api/branches",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setSuccessMessage(
          "Branch created successfully."
        );

      }


      setShowForm(false);

      setSelectedBranch(null);

      setFormData({
        branch_name: "",
        address: "",
        city: "",
        state: "",
        phone: ""
      });

      await fetchBranches();


      setTimeout(() => {

        setSuccessMessage("");

      }, 3000);


    } catch (error) {

      console.error(
        "Save branch failed:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to save branch."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // OPEN STATUS MODAL
  // =====================================================

  const handleOpenStatusModal = (
    branch
  ) => {

    setSelectedBranch(branch);

    setStatusAction(
      branch.status === "ACTIVE"
        ? "DEACTIVATE"
        : "ACTIVATE"
    );

    setShowStatusModal(true);

    setErrorMessage("");

  };


  // =====================================================
  // CLOSE STATUS MODAL
  // =====================================================

  const handleCloseStatusModal = () => {

    if (saving) {
      return;
    }

    setShowStatusModal(false);

    setSelectedBranch(null);

    setStatusAction("");

  };


  // =====================================================
  // CHANGE BRANCH STATUS
  // =====================================================

  const handleChangeStatus = async () => {

    if (!selectedBranch) {
      return;
    }


    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");


      const endpoint =
        statusAction === "ACTIVATE"
          ? "activate"
          : "deactivate";


      await axios.put(
        `http://localhost:5000/api/branches/${selectedBranch.id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      setShowStatusModal(false);

      setSelectedBranch(null);

      setStatusAction("");


      setSuccessMessage(
        statusAction === "ACTIVATE"
          ? "Branch activated successfully."
          : "Branch deactivated successfully."
      );


      await fetchBranches();


      setTimeout(() => {

        setSuccessMessage("");

      }, 3000);


    } catch (error) {

      console.error(
        "Branch status update failed:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to update branch status."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // VIEW BRANCH DETAILS
  // =====================================================

  const handleViewBranch = async (branch) => {

    try {

      const token =
        localStorage.getItem("token");


      const response = await axios.get(
        `http://localhost:5000/api/branches/${branch.id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      setSelectedBranch(
        response.data
      );

      setShowViewModal(true);

    } catch (error) {

      console.error(
        "Fetch branch details error:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load branch details."
      );

    }

  };


  // =====================================================
  // CLOSE VIEW MODAL
  // =====================================================

  const handleCloseViewModal = () => {

    setShowViewModal(false);

    setSelectedBranch(null);

  };


  // =====================================================
  // FILTER BRANCHES
  // =====================================================

  const filteredBranches =
    branches.filter((branch) => {

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        branch.branch_name
          ?.toLowerCase()
          .includes(search) ||

        branch.city
          ?.toLowerCase()
          .includes(search) ||

        branch.state
          ?.toLowerCase()
          .includes(search);


      const matchesStatus =
        statusFilter === "ALL" ||
        branch.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalBranches =
    branches.length;

  const activeBranches =
    branches.filter(
      (branch) =>
        branch.status === "ACTIVE"
    ).length;

  const inactiveBranches =
    branches.filter(
      (branch) =>
        branch.status === "INACTIVE"
    ).length;


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="branches-page">

        <div className="branches-loading">

          Loading branches...

        </div>

      </div>
    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="branches-page">


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (

        <div className="branch-notification success">

          <CheckCircle size={20} />

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >

            <X size={18} />

          </button>

        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {errorMessage && (

        <div className="branch-notification error">

          <XCircle size={20} />

          <span>
            {errorMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
          >

            <X size={18} />

          </button>

        </div>

      )}


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="branches-heading">

        <div>

          <h1>
            Branches
          </h1>

          <p>
            Manage branches of your company.
          </p>

        </div>


        <Button
          onClick={
            handleOpenAddForm
          }
        >

          <Plus size={17} />

          Add Branch

        </Button>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="branches-stats">


        <Card>

          <div className="branch-stat-card">

            <div className="branch-stat-icon blue">

              <Building2 size={22} />

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


        <Card>

          <div className="branch-stat-card">

            <div className="branch-stat-icon green">

              <CheckCircle size={22} />

            </div>

            <div>

              <span>
                Active Branches
              </span>

              <strong>
                {activeBranches}
              </strong>

            </div>

          </div>

        </Card>


        <Card>

          <div className="branch-stat-card">

            <div className="branch-stat-icon orange">

              <XCircle size={22} />

            </div>

            <div>

              <span>
                Inactive Branches
              </span>

              <strong>
                {inactiveBranches}
              </strong>

            </div>

          </div>

        </Card>


      </div>


      {/* =================================================
          BRANCH LIST
      ================================================= */}

      <Card className="branches-list-card">

        <div className="branches-list-header">

          <div>

            <h2>
              Company Branches
            </h2>

            <p>
              Branches registered under your company.
            </p>

          </div>


          <div className="branches-filters">


            <div className="branches-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search branches..."
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
                All Branches
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


        <div className="branches-table-wrapper">

          <table className="branches-table">

            <thead>

              <tr>

                <th>
                  Branch
                </th>

                <th>
                  Location
                </th>

                <th>
                  Phone
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

              {filteredBranches.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                  >

                    <div className="branches-empty">

                      <div className="branches-empty-icon">

                        <Building2
                          size={34}
                        />

                      </div>

                      <h3>
                        No branches found
                      </h3>

                      <p>
                        Add a branch to start managing your company's locations.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredBranches.map(
                  (branch) => (

                    <tr
                      key={branch.id}
                    >

                      <td>

                        <strong>
                          {branch.branch_name}
                        </strong>

                        <div className="branch-address">

                          {branch.address ||
                            "Address not available"}

                        </div>

                      </td>


                      <td>

                        <div className="branch-location">

                          <MapPin
                            size={15}
                          />

                          <span>

                            {[
                              branch.city,
                              branch.state
                            ]
                              .filter(Boolean)
                              .join(", ") ||

                              "Location not available"}

                          </span>

                        </div>

                      </td>


                      <td>

                        <div className="branch-phone">

                          <Phone
                            size={15}
                          />

                          <span>

                            {branch.phone ||
                              "Not available"}

                          </span>

                        </div>

                      </td>


                      <td>

                        <span
                          className={
                            `branch-status ${
                              branch.status === "ACTIVE"
                                ? "active"
                                : "inactive"
                            }`
                          }
                        >

                          {branch.status === "ACTIVE"
                            ? (
                              <CheckCircle
                                size={14}
                              />
                            )
                            : (
                              <XCircle
                                size={14}
                              />
                            )}

                          {branch.status}

                        </span>

                      </td>


                      <td>

                        <div className="branch-actions">


                          {/* VIEW */}

                          <button
                            type="button"
                            className="branch-action-button view"
                            onClick={() =>
                              handleViewBranch(
                                branch
                              )
                            }
                            title="View branch"
                          >

                            <Eye
                              size={16}
                            />

                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            className="branch-action-button edit"
                            onClick={() =>
                              handleOpenEditForm(
                                branch
                              )
                            }
                            title="Edit branch"
                          >

                            <Pencil
                              size={16}
                            />

                          </button>


                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            type="button"
                            className={
                              `branch-action-button ${
                                branch.status === "ACTIVE"
                                  ? "deactivate"
                                  : "activate"
                              }`
                            }
                            onClick={() =>
                              handleOpenStatusModal(
                                branch
                              )
                            }
                            title={
                              branch.status === "ACTIVE"
                                ? "Deactivate branch"
                                : "Activate branch"
                            }
                          >

                            {branch.status === "ACTIVE"
                              ? (
                                <XCircle
                                  size={16}
                                />
                              )
                              : (
                                <CheckCircle
                                  size={16}
                                />
                              )}

                          </button>


                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </Card>


      {/* =================================================
          ADD / EDIT BRANCH MODAL
      ================================================= */}

      {showForm && (

        <div className="branch-modal-overlay">

          <div className="branch-modal">


            <div className="branch-modal-header">

              <div>

                <h2>

                  {selectedBranch
                    ? "Edit Branch"
                    : "Add Branch"}

                </h2>

                <p>

                  {selectedBranch
                    ? "Update branch information."
                    : "Enter the branch details."}

                </p>

              </div>


              <button
                type="button"
                className="branch-modal-close"
                onClick={
                  handleCloseForm
                }
                disabled={saving}
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="branch-form"
            >


              <div className="branch-form-group">

                <label>
                  Branch Name
                </label>

                <input
                  type="text"
                  name="branch_name"
                  value={
                    formData.branch_name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter branch name"
                />

                {formErrors.branch_name && (

                  <span className="branch-form-error">

                    {formErrors.branch_name}

                  </span>

                )}

              </div>


              <div className="branch-form-group">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter branch address"
                  rows="3"
                />

              </div>


              <div className="branch-form-row">


                <div className="branch-form-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter city"
                  />

                  {formErrors.city && (

                    <span className="branch-form-error">

                      {formErrors.city}

                    </span>

                  )}

                </div>


                <div className="branch-form-group">

                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter state"
                  />

                  {formErrors.state && (

                    <span className="branch-form-error">

                      {formErrors.state}

                    </span>

                  )}

                </div>


              </div>


              <div className="branch-form-group">

                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />

                {formErrors.phone && (

                  <span className="branch-form-error">

                    {formErrors.phone}

                  </span>

                )}

              </div>


              <div className="branch-modal-actions">

                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    handleCloseForm
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : selectedBranch
                      ? "Save Changes"
                      : "Create Branch"}

                </Button>

              </div>


            </form>

          </div>

        </div>

      )}


      {/* =================================================
          VIEW BRANCH MODAL
      ================================================= */}

      {showViewModal &&
        selectedBranch && (

          <div className="branch-modal-overlay">

            <div className="branch-view-modal">


              <div className="branch-modal-header">

                <div>

                  <h2>
                    Branch Details
                  </h2>

                  <p>
                    View branch information and assigned users.
                  </p>

                </div>


                <button
                  type="button"
                  className="branch-modal-close"
                  onClick={
                    handleCloseViewModal
                  }
                >

                  <X size={20} />

                </button>

              </div>


              {/* BRANCH INFORMATION */}

              <div className="branch-view-content">

                <div className="branch-view-section">

                  <h3>
                    Branch Information
                  </h3>


                  <div className="branch-view-grid">

                    <div className="branch-view-item">

                      <span>
                        Branch Name
                      </span>

                      <strong>
                        {selectedBranch.branch?.branch_name ||
                          "—"}
                      </strong>

                    </div>


                    <div className="branch-view-item">

                      <span>
                        Status
                      </span>

                      <strong
                        className={
                          selectedBranch.branch?.status === "ACTIVE"
                            ? "branch-view-active"
                            : "branch-view-inactive"
                        }
                      >
                        {selectedBranch.branch?.status ||
                          "—"}
                      </strong>

                    </div>


                    <div className="branch-view-item">

                      <span>
                        Address
                      </span>

                      <strong>
                        {selectedBranch.branch?.address ||
                          "—"}
                      </strong>

                    </div>


                    <div className="branch-view-item">

                      <span>
                        City
                      </span>

                      <strong>
                        {selectedBranch.branch?.city ||
                          "—"}
                      </strong>

                    </div>


                    <div className="branch-view-item">

                      <span>
                        State
                      </span>

                      <strong>
                        {selectedBranch.branch?.state ||
                          "—"}
                      </strong>

                    </div>


                    <div className="branch-view-item">

                      <span>
                        Phone
                      </span>

                      <strong>
                        {selectedBranch.branch?.phone ||
                          "—"}
                      </strong>

                    </div>


                  </div>

                </div>


                {/* USERS */}

                <div className="branch-view-section">

                  <div className="branch-users-heading">

                    <div>

                      <h3>
                        Branch Users
                      </h3>

                      <p>
                        Users assigned to this branch.
                      </p>

                    </div>

                    <span className="branch-user-count">

                      {selectedBranch.users?.length || 0}

                    </span>

                  </div>


                  {selectedBranch.users?.length > 0 ? (

                    <div className="branch-users-list">

                      {selectedBranch.users.map(
                        (user) => (

                          <div
                            className="branch-user-row"
                            key={user.id}
                          >

                            <div className="branch-user-info">

                              <div className="branch-user-avatar">

                                {user.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}

                              </div>

                              <strong>
                                {user.name}
                              </strong>

                            </div>


                            <span
                              className={
                                `branch-user-role ${user.role?.toLowerCase()}`
                              }
                            >

                              {user.role === "MANAGER"
                                ? "Manager"
                                : user.role === "FINANCE"
                                  ? "Finance"
                                  : "Employee"}

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="branch-no-users">

                      <UsersIcon />

                      <p>
                        No users are assigned to this branch.
                      </p>

                    </div>

                  )}

                </div>

              </div>


              <div className="branch-view-footer">

                <Button
                  type="button"
                  onClick={
                    handleCloseViewModal
                  }
                >
                  Close
                </Button>

              </div>


            </div>

          </div>

        )}


      {/* =================================================
          STATUS CONFIRMATION MODAL
      ================================================= */}

      {showStatusModal &&
        selectedBranch && (

          <div className="branch-modal-overlay">

            <div className="branch-status-modal">


              <div className="branch-status-modal-icon">

                {statusAction === "ACTIVATE"
                  ? (
                    <CheckCircle
                      size={30}
                    />
                  )
                  : (
                    <XCircle
                      size={30}
                    />
                  )}

              </div>


              <h2>

                {statusAction === "ACTIVATE"
                  ? "Activate Branch?"
                  : "Deactivate Branch?"}

              </h2>


              <p>

                Are you sure you want to{" "}

                {statusAction === "ACTIVATE"
                  ? "activate"
                  : "deactivate"}{" "}

                <strong>
                  {selectedBranch.branch_name}
                </strong>?

              </p>


              <div className="branch-status-modal-actions">

                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    handleCloseStatusModal
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>


                <Button
                  type="button"
                  onClick={
                    handleChangeStatus
                  }
                  disabled={saving}
                >

                  {saving
                    ? "Processing..."
                    : statusAction === "ACTIVATE"
                      ? "Activate"
                      : "Deactivate"}

                </Button>

              </div>


            </div>

          </div>

        )}

    </div>

  );

};


const UsersIcon = () => {

  return (
    <div
      style={{
        fontSize: "28px",
        marginBottom: "8px"
      }}
    >
      👥
    </div>
  );

};


export default Branches;