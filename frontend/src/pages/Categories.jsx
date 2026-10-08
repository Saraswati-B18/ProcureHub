import { useEffect, useState } from "react";

import {
  FolderTree,
  CheckCircle,
  XCircle,
  Package,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X
} from "lucide-react";

import axios from "axios";

import Card from "../components/Card";
import Badge from "../components/Badge";
import "./Categories.css";


const Categories = () => {

  // ==========================================
  // STATES
  // ==========================================

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showCategoryStatusModal, setShowCategoryStatusModal] = useState(false);
  
  const [statusAction, setStatusAction] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [formErrors, setFormErrors] = useState({});

  const [categoryForm, setCategoryForm] = useState({
    category_name: "",
    description: ""
  });


  const [editCategoryData, setEditCategoryData] = useState({
  category_name: "",
  description: ""
});

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCategories(response.data.categories || []);

    } catch (error) {

      console.error(
        "Failed to fetch categories:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
// VIEW CATEGORY
// ==========================================

const handleViewCategory = (category) => {
  setSelectedCategory(category);
  setShowViewModal(true);
};


// ==========================================
// CLOSE VIEW MODAL
// ==========================================

const closeViewModal = () => {
  setSelectedCategory(null);
  setShowViewModal(false);
};


// ==========================================
// OPEN EDIT MODAL
// ==========================================

const handleEditCategory = (category) => {
  setSelectedCategory(category);

  setEditCategoryData({
    category_name: category.category_name || "",
    description: category.description || ""
  });

  setShowEditModal(true);
};


// ==========================================
// CLOSE EDIT MODAL
// ==========================================

const closeEditModal = () => {
  setSelectedCategory(null);
  setShowEditModal(false);
};

const handleUpdateCategory = async (e) => {
  e.preventDefault();

  if (!editCategoryData.category_name.trim()) {
    setErrorMessage("Category name is required.");
    return;
  }

  try {
    setSaving(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/categories/${selectedCategory.id}`,
      {
        category_name: editCategoryData.category_name.trim(),
        description: editCategoryData.description.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowEditModal(false);
    setSelectedCategory(null);

    setSuccessMessage("Category updated successfully!");

    await fetchCategories();

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Update category failed:", error);

    setErrorMessage(
      error.response?.data?.message ||
      "Failed to update category."
    );

  } finally {
    setSaving(false);
  }
};


// ==========================================
// OPEN STATUS MODAL
// ==========================================

const handleCategoryStatus = (category, action) => {
  setSelectedCategory(category);
  setStatusAction(action);
  setShowCategoryStatusModal(true);
};


// ==========================================
// CLOSE STATUS MODAL
// ==========================================

const closeCategoryStatusModal = () => {
  setSelectedCategory(null);
  setStatusAction("");
  setShowCategoryStatusModal(false);
};

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  useEffect(() => {

    fetchCategories();

  }, []);


  // ==========================================
  // FILTER CATEGORIES
  // ==========================================

  const filteredCategories = categories.filter((category) => {

    const matchesSearch = category.category_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      category.status === statusFilter;

    return matchesSearch && matchesStatus;

  });


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.status === "ACTIVE"
  ).length;

  const inactiveCategories = categories.filter(
    (category) => category.status === "INACTIVE"
  ).length;

  const totalProducts = categories.reduce(
    (total, category) =>
      total + Number(category.product_count || 0),
    0
  );


  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const openAddModal = () => {

    setCategoryForm({
      category_name: "",
      description: ""
    });

    setFormErrors({});

    setErrorMessage("");

    setShowAddModal(true);

  };


  // ==========================================
  // CLOSE ADD MODAL
  // ==========================================

  const closeAddModal = () => {

    if (saving) {
      return;
    }

    setShowAddModal(false);

    setCategoryForm({
      category_name: "",
      description: ""
    });

    setFormErrors({});

    setErrorMessage("");

  };


  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleFormChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setCategoryForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    setErrorMessage("");

  };


  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validateForm = () => {

    const errors = {};

    if (!categoryForm.category_name.trim()) {

      errors.category_name =
        "Category name is required.";

    }

    if (categoryForm.category_name.trim().length > 100) {

      errors.category_name =
        "Category name cannot exceed 100 characters.";

    }

    return errors;

  };


  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  const handleCreateCategory = async (e) => {

    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {

      setFormErrors(errors);

      return;

    }

    try {

      setSaving(true);

      setErrorMessage("");

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/categories",
        {
          category_name:
            categoryForm.category_name.trim(),

          description:
            categoryForm.description.trim() || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowAddModal(false);

      setCategoryForm({
        category_name: "",
        description: ""
      });

      setFormErrors({});

      setSuccessMessage(
        "Category created successfully!"
      );

      await fetchCategories();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {

      console.error(
        "Create category failed:",
        error
      );

      if (error.response) {

        setErrorMessage(
          error.response.data.message ||
          "Failed to create category."
        );

      } else {

        setErrorMessage(
          "Unable to connect to the server."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {

    return (
      <div className="categories-page">

        <div className="categories-page-header">

          <div>

            <h1>Categories</h1>

            <p>
              Manage product categories across the ProcureHub platform.
            </p>

          </div>

        </div>


        <Card>

          <div className="categories-empty-state">

            <FolderTree size={32} />

            <h3>Loading categories...</h3>

            <p>
              Please wait while categories are being loaded.
            </p>

          </div>

        </Card>

      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="categories-page">


      {/* ==========================================
          SUCCESS MESSAGE
      ========================================== */}

      {successMessage && (

        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            zIndex: 2000,
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
            borderRadius: "10px",
            padding: "12px 18px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          {successMessage}
        </div>

      )}


      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="categories-page-header">

        <div>

          <h1>Categories</h1>

          <p>
            Manage product categories across the ProcureHub platform.
          </p>

        </div>


        <button
          className="categories-add-button"
          type="button"
          onClick={openAddModal}
        >

          <Plus size={18} />

          Add Category

        </button>

      </div>


      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="categories-summary-grid">


        <Card className="categories-summary-card">

          <div className="categories-summary-content">

            <div>

              <p>Total Categories</p>

              <h2>
                {totalCategories}
              </h2>

            </div>


            <div className="categories-icon blue">

              <FolderTree size={22} />

            </div>

          </div>

        </Card>


        <Card className="categories-summary-card">

          <div className="categories-summary-content">

            <div>

              <p>Active Categories</p>

              <h2>
                {activeCategories}
              </h2>

            </div>


            <div className="categories-icon green">

              <CheckCircle size={22} />

            </div>

          </div>

        </Card>


        <Card className="categories-summary-card">

          <div className="categories-summary-content">

            <div>

              <p>Inactive Categories</p>

              <h2>
                {inactiveCategories}
              </h2>

            </div>


            <div className="categories-icon red">

              <XCircle size={22} />

            </div>

          </div>

        </Card>


        <Card className="categories-summary-card">

          <div className="categories-summary-content">

            <div>

              <p>Products in Categories</p>

              <h2>
                {totalProducts}
              </h2>

            </div>


            <div className="categories-icon purple">

              <Package size={22} />

            </div>

          </div>

        </Card>


      </div>


      {/* ==========================================
          CATEGORY TABLE
      ========================================== */}

      <Card className="categories-table-card">


        <div className="categories-section-header">

          <div>

            <h2>Category List</h2>

            <p>
              View and manage product categories.
            </p>

          </div>

        </div>


        {/* Search and Filter */}

        <div className="categories-toolbar">


          <div className="categories-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <select
            className="categories-status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>


        </div>


        {/* Table */}

        <div className="categories-table-wrapper">

          <table className="categories-table">

            <thead>

              <tr>

                <th>Category</th>

                <th>Products</th>

                <th>Status</th>

                <th>Created On</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredCategories.length > 0 ? (

                filteredCategories.map((category) => (

                  <tr key={category.id}>


                    <td>

                      <div className="category-name">

                        <div className="category-small-icon">

                          <FolderTree size={16} />

                        </div>

                        <span>
                          {category.category_name}
                        </span>

                      </div>

                    </td>


                    <td>
                      {category.product_count}
                    </td>


                    <td>

                      <Badge
                        variant={
                          category.status === "ACTIVE"
                            ? "success"
                            : "danger"
                        }
                      >

                        {category.status === "ACTIVE"
                          ? "Active"
                          : "Inactive"}

                      </Badge>

                    </td>


                    <td>

                      {category.created_at
                        ? new Date(
                            category.created_at
                          ).toLocaleDateString()
                        : "—"}

                    </td>


                   <td>

  <div className="categories-action-buttons">

    {/* View */}

    <button
      type="button"
      className="categories-action-button"
      title="View Category"
      onClick={() => handleViewCategory(category)}
    >
      <Eye size={17} />
    </button>


    {/* Edit */}

    <button
      type="button"
      className="categories-action-button"
      title="Edit Category"
      onClick={() => handleEditCategory(category)}
    >
      <Pencil size={17} />
    </button>


    {/* Activate / Deactivate */}

    {category.status === "ACTIVE" ? (

      <button
        type="button"
        className="categories-action-button danger"
        title="Deactivate Category"
        onClick={() =>
          handleCategoryStatus(category, "DEACTIVATE")
        }
      >
        <Trash2 size={17} />
      </button>

    ) : (

      <button
        type="button"
        className="categories-action-button success"
        title="Activate Category"
        onClick={() =>
          handleCategoryStatus(category, "ACTIVATE")
        }
      >
        <CheckCircle size={17} />
      </button>

    )}

  </div>

</td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="categories-empty-cell"
                  >

                    <div className="categories-empty-state">

                      <FolderTree size={32} />

                      <h3>
                        No categories found
                      </h3>

                      <p>
                        Try changing your search or filter.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


      </Card>


      {/* ==========================================
          INFORMATION CARD
      ========================================== */}

      <Card className="categories-info-card">

        <div className="categories-info-icon">

          <FolderTree size={20} />

        </div>


        <div>

          <h3>
            About Categories
          </h3>

          <p>
            Categories help organize products across the ProcureHub
            platform. Inactive categories can no longer be used for
            new products while existing product records remain safe.
          </p>

        </div>

      </Card>


      {/* ==========================================
          ADD CATEGORY MODAL
      ========================================== */}

      {showAddModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={closeAddModal}
        >

          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "500px",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              overflow: "hidden"
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* Modal Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "22px 24px",
                borderBottom: "1px solid #e5e7eb"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#111827"
                  }}
                >
                  Add Category
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#6b7280",
                    fontSize: "13px"
                  }}
                >
                  Create a new product category
                </p>

              </div>


              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  padding: "6px",
                  color: "#6b7280"
                }}
              >

                <X size={22} />

              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleCreateCategory}
            >

              <div
                style={{
                  padding: "24px"
                }}
              >


                {/* Category Name */}

                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}
                  >

                    Category Name
                    <span style={{ color: "#dc2626" }}>
                      {" "}*
                    </span>

                  </label>


                  <input
                    type="text"
                    name="category_name"
                    value={categoryForm.category_name}
                    onChange={handleFormChange}
                    placeholder="Enter category name"
                    maxLength={100}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      border: formErrors.category_name
                        ? "1px solid #dc2626"
                        : "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />


                  {formErrors.category_name && (

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#dc2626",
                        fontSize: "12px"
                      }}
                    >
                      {formErrors.category_name}
                    </p>

                  )}

                </div>


                {/* Description */}

                <div>

                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}
                  >
                    Description
                  </label>


                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleFormChange}
                    placeholder="Enter category description"
                    rows={4}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      fontSize: "14px",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />

                </div>


                {/* Backend Error */}

                {errorMessage && (

                  <div
                    style={{
                      marginTop: "16px",
                      padding: "10px 12px",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}
                  >
                    {errorMessage}
                  </div>

                )}

              </div>


              {/* Modal Footer */}

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px"
                }}
              >

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "500"
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "500"
                  }}
                >

                  {saving
                    ? "Creating..."
                    : "Create Category"}

                </button>

              </div>

            </form>

          </div>

        </div>

           )}


      {/* ==========================================
          VIEW CATEGORY MODAL
      ========================================== */}

      {showViewModal && selectedCategory && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={closeViewModal}
        >

          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "500px",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "22px 24px",
                borderBottom: "1px solid #e5e7eb"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#111827"
                  }}
                >
                  Category Details
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#6b7280",
                    fontSize: "13px"
                  }}
                >
                  View category information
                </p>

              </div>


              <button
                type="button"
                onClick={closeViewModal}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "6px",
                  color: "#6b7280"
                }}
              >
                <X size={22} />
              </button>

            </div>


            {/* Details */}

            <div style={{ padding: "24px" }}>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px"
                }}
              >

                <div>
                  <span className="category-detail-label">
                    Category ID
                  </span>

                  <strong>
                    #{selectedCategory.id}
                  </strong>
                </div>


                <div>
                  <span className="category-detail-label">
                    Category Name
                  </span>

                  <strong>
                    {selectedCategory.category_name}
                  </strong>
                </div>


                <div style={{ gridColumn: "1 / -1" }}>
                  <span className="category-detail-label">
                    Description
                  </span>

                  <strong>
                    {selectedCategory.description ||
                      "No description"}
                  </strong>
                </div>


                <div>
                  <span className="category-detail-label">
                    Products
                  </span>

                  <strong>
                    {selectedCategory.product_count}
                  </strong>
                </div>


                <div>
                  <span className="category-detail-label">
                    Status
                  </span>

                  <strong
                    style={{
                      color:
                        selectedCategory.status === "ACTIVE"
                          ? "#15803d"
                          : "#dc2626"
                    }}
                  >
                    {selectedCategory.status === "ACTIVE"
                      ? "✓ ACTIVE"
                      : "✕ INACTIVE"}
                  </strong>
                </div>


                <div>
                  <span className="category-detail-label">
                    Created Date
                  </span>

                  <strong>
                    {new Date(
                      selectedCategory.created_at
                    ).toLocaleDateString("en-IN")}
                  </strong>
                </div>

              </div>

            </div>


            {/* Footer */}

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end"
              }}
            >

              <button
                type="button"
                onClick={closeViewModal}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ==========================================
    EDIT CATEGORY MODAL
========================================== */}

{showEditModal && selectedCategory && (

  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}
    onClick={closeEditModal}
  >

    <div
      style={{
        background: "#ffffff",
        width: "100%",
        maxWidth: "500px",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}
      onClick={(e) => e.stopPropagation()}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 24px",
          borderBottom: "1px solid #e5e7eb"
        }}
      >

        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            Edit Category
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#6b7280",
              fontSize: "13px"
            }}
          >
            Update category information
          </p>
        </div>

        <button
          type="button"
          onClick={closeEditModal}
          disabled={saving}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "6px",
            color: "#6b7280"
          }}
        >
          <X size={22} />
        </button>

      </div>


      <form onSubmit={handleUpdateCategory}>

        <div style={{ padding: "24px" }}>

          {/* Category Name */}

          <div style={{ marginBottom: "18px" }}>

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Category Name *
            </label>

            <input
              type="text"
              value={editCategoryData.category_name}
              onChange={(e) =>
                setEditCategoryData({
                  ...editCategoryData,
                  category_name: e.target.value
                })
              }
              maxLength={100}
              disabled={saving}
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />

          </div>


          {/* Description */}

          <div>

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Description
            </label>

            <textarea
              value={editCategoryData.description}
              onChange={(e) =>
                setEditCategoryData({
                  ...editCategoryData,
                  description: e.target.value
                })
              }
              rows={4}
              disabled={saving}
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />

          </div>


          {errorMessage && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 12px",
                background: "#fef2f2",
                color: "#b91c1c",
                borderRadius: "8px",
                fontSize: "13px"
              }}
            >
              {errorMessage}
            </div>
          )}

        </div>


        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}
        >

          <button
            type="button"
            onClick={closeEditModal}
            disabled={saving}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </form>

    </div>

  </div>

)}

{/* ==========================================
    CATEGORY STATUS MODAL
========================================== */}

{showCategoryStatusModal && selectedCategory && (

  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}
    onClick={closeCategoryStatusModal}
  >

    <div
      style={{
        background: "#ffffff",
        width: "100%",
        maxWidth: "430px",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 24px",
          borderBottom: "1px solid #e5e7eb"
        }}
      >

        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            color: "#111827"
          }}
        >
          {statusAction === "DEACTIVATE"
            ? "Deactivate Category"
            : "Activate Category"}
        </h2>

        <button
          type="button"
          onClick={closeCategoryStatusModal}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#6b7280"
          }}
        >
          <X size={22} />
        </button>

      </div>


      {/* Content */}

      <div style={{ padding: "24px" }}>

        <p
          style={{
            margin: 0,
            color: "#374151",
            fontSize: "15px",
            lineHeight: "1.6"
          }}
        >

          Are you sure you want to{" "}

          <strong>
            {statusAction === "DEACTIVATE"
              ? "deactivate"
              : "activate"}
          </strong>{" "}

          the category{" "}

          <strong>
            "{selectedCategory.category_name}"
          </strong>
          ?

        </p>

        {statusAction === "DEACTIVATE" && (

          <p
            style={{
              marginTop: "12px",
              marginBottom: 0,
              color: "#6b7280",
              fontSize: "13px",
              lineHeight: "1.5"
            }}
          >
            Existing products and historical records will remain
            safe. The category will not be available for new
            procurement activities.
          </p>

        )}

      </div>


      {/* Footer */}

      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px"
        }}
      >

        <button
          type="button"
          onClick={closeCategoryStatusModal}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Cancel
        </button>


        <button
          type="button"
          onClick={async () => {

            try {

              setSaving(true);

              const token =
                localStorage.getItem("token");

              const endpoint =
                statusAction === "DEACTIVATE"
                  ? "deactivate"
                  : "activate";

              await axios.put(
                `http://localhost:5000/api/categories/${selectedCategory.id}/${endpoint}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              closeCategoryStatusModal();

              setSuccessMessage(
                statusAction === "DEACTIVATE"
                  ? "Category deactivated successfully!"
                  : "Category activated successfully!"
              );

              await fetchCategories();

              setTimeout(() => {
                setSuccessMessage("");
              }, 3000);

            } catch (error) {

              console.error(
                "Category status update failed:",
                error
              );

              setErrorMessage(
                error.response?.data?.message ||
                "Failed to update category status."
              );

            } finally {

              setSaving(false);

            }

          }}
          disabled={saving}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background:
              statusAction === "DEACTIVATE"
                ? "#dc2626"
                : "#16a34a",
            color: "#ffffff",
            cursor: saving
              ? "not-allowed"
              : "pointer",
            fontWeight: "500"
          }}
        >
          {saving
            ? "Processing..."
            : statusAction === "DEACTIVATE"
              ? "Deactivate"
              : "Activate"}
        </button>

      </div>

    </div>

  </div>

)}

    </div>

  );

};


export default Categories;