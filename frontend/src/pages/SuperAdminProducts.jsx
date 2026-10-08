import { useEffect, useState } from "react";
import axios from "axios";

import {
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  Pencil,
  Trash2,
  X
} from "lucide-react";

import Card from "../components/Card";
import Badge from "../components/Badge";
import "./SuperAdminProducts.css";

const SuperAdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
const [statusAction, setStatusAction] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

 const [productForm, setProductForm] = useState({
    product_name: "",
    category_id: "",
    unit: "",
    description: "",
    image: null
});

  const [editForm, setEditForm] = useState({
    product_name: "",
    category_id: "",
    unit: "",
    description: "",
    image: null
});


  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/super-admin/products",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProducts(response.data.products || []);
      setErrorMessage("");

    } catch (error) {
      console.error("Failed to fetch products:", error);

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load products."
      );

    } finally {
      setLoading(false);
    }
  };


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
      console.error("Failed to fetch categories:", error);
    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((product) => {

    const matchesSearch = product.product_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ||
      String(product.category_id) === String(categoryFilter);

    const matchesStatus =
      statusFilter === "ALL" ||
      product.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });


  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status === "INACTIVE"
  ).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.available_stock) <= 10
  ).length;


  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleOpenAddModal = () => {

    setProductForm({
    product_name: "",
    category_id: "",
    unit: "",
    description: "",
    image: null
});
    setFormError("");
    setShowAddModal(true);
  };


  const handleCloseAddModal = () => {

    if (saving) {
      return;
    }

    setShowAddModal(false);
    setFormError("");
  };


  const handleProductFormChange = (e) => {

    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setFormError("");
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        setFormError(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        );
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setFormError(
            "Image size must be less than 5 MB."
        );
        return;
    }

    setProductForm((prev) => ({
        ...prev,
        image: file
    }));

    setFormError("");
};


  // ==========================================
  // CREATE PRODUCT
  // ==========================================

  const handleCreateProduct = async () => {

    const productName = productForm.product_name.trim();

    if (!productName) {
      setFormError("Product name is required.");
      return;
    }

    if (!productForm.category_id) {
      setFormError("Please select a category.");
      return;
    }

    if (!productForm.unit) {
      setFormError("Please select a unit.");
      return;
    }

    try {

      setSaving(true);
      setFormError("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

formData.append(
    "category_id",
    productForm.category_id
);

formData.append(
    "product_name",
    productName
);

formData.append(
    "description",
    productForm.description.trim()
);

formData.append(
    "unit",
    productForm.unit
);

if (productForm.image) {
    formData.append(
        "image",
        productForm.image
    );
}

await axios.post(
    "http://localhost:5000/api/super-admin/products",
    formData,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

      setShowAddModal(false);

setProductForm({
    product_name: "",
    category_id: "",
    unit: "",
    description: "",
    image: null
});

setSuccessMessage("Product created successfully!");

await fetchProducts();

setTimeout(() => {
    setSuccessMessage("");
}, 3000);

    } catch (error) {

      console.error("Create product failed:", error);

      setFormError(
        error.response?.data?.message ||
        "Failed to create product."
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // VIEW PRODUCT
  // ==========================================

  const handleViewProduct = async (productId) => {

    try {

      setViewLoading(true);
      setShowViewModal(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/super-admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSelectedProduct(response.data);

    } catch (error) {

      console.error("Failed to fetch product details:", error);

      setShowViewModal(false);

      alert(
        error.response?.data?.message ||
        "Failed to load product details."
      );

    } finally {
      setViewLoading(false);
    }
  };


  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedProduct(null);
  };


  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const handleOpenEditModal = (product) => {

    setEditForm({
    product_name: product.product_name || "",
    category_id: product.category_id || "",
    unit: product.unit || "",
    description: product.description || "",
    image: null
});

    setSelectedProduct(product);
    setFormError("");
    setShowEditModal(true);
  };


  const handleCloseEditModal = () => {

    if (saving) {
      return;
    }

    setShowEditModal(false);
    setSelectedProduct(null);
    setFormError("");
  };


  const handleEditFormChange = (e) => {

    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setFormError("");
  };

  const handleEditProductImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        setFormError(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        );
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setFormError(
            "Image size must be less than 5 MB."
        );
        return;
    }

    setEditForm((prev) => ({
        ...prev,
        image: file
    }));

    setFormError("");
};


  const handleUpdateProduct = async () => {

    const productName = editForm.product_name.trim();

    if (!productName) {
      setFormError("Product name is required.");
      return;
    }

    if (!editForm.category_id) {
      setFormError("Please select a category.");
      return;
    }

    if (!editForm.unit) {
      setFormError("Please select a unit.");
      return;
    }

    try {

      setSaving(true);
      setFormError("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

formData.append(
    "category_id",
    editForm.category_id
);

formData.append(
    "product_name",
    productName
);

formData.append(
    "description",
    editForm.description.trim()
);

formData.append(
    "unit",
    editForm.unit
);

if (editForm.image) {
    formData.append(
        "image",
        editForm.image
    );
}

await axios.put(
    `http://localhost:5000/api/super-admin/products/${selectedProduct.id}`,
    formData,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);
      setShowEditModal(false);
setSelectedProduct(null);

setSuccessMessage("Product updated successfully!");

await fetchProducts();

setTimeout(() => {
  setSuccessMessage("");
}, 3000);

    } catch (error) {

      console.error("Update product failed:", error);

      setFormError(
        error.response?.data?.message ||
        "Failed to update product."
      );

    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateProduct = async () => {
  try {
    setSaving(true);

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/super-admin/products/${selectedProduct.id}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowStatusModal(false);
    setSelectedProduct(null);

    setSuccessMessage("Product deactivated successfully!");

    await fetchProducts();

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Deactivate product failed:", error);

    setErrorMessage(
      error.response?.data?.message ||
      "Failed to deactivate product."
    );

  } finally {
    setSaving(false);
  }
};

const handleActivateProduct = async () => {
  try {
    setSaving(true);

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/super-admin/products/${selectedProduct.id}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setShowStatusModal(false);
    setSelectedProduct(null);

    setSuccessMessage("Product activated successfully!");

    await fetchProducts();

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Activate product failed:", error);

    setErrorMessage(
      error.response?.data?.message ||
      "Failed to activate product."
    );

  } finally {
    setSaving(false);
  }
};


  return (
    <div className="super-admin-products-page">

      {/* HEADER */}

      <div className="super-admin-products-header">

        <div>
          <h1>Products</h1>

          <p>
            Manage master products available on the ProcureHub platform.
          </p>
        </div>

        <button
          type="button"
          className="super-admin-products-add-button"
          onClick={handleOpenAddModal}
        >
          + Add Product
        </button>

      </div>


      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px 16px",
            background: "#fef2f2",
            color: "#dc2626",
            borderRadius: "8px",
            fontSize: "14px"
          }}
        >
          {errorMessage}
        </div>
      )}

{successMessage && (
  <div
    style={{
      position: "fixed",
      top: "90px",
      right: "30px",
      zIndex: 9999,
      padding: "13px 20px",
      background: "#ecfdf3",
      color: "#15803d",
      border: "1px solid #a7f3d0",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)"
    }}
  >
    {successMessage}
  </div>
)}


      {/* SUMMARY CARDS */}

      <div className="super-admin-products-summary">

        <Card className="super-admin-products-summary-card">

          <div className="super-admin-products-card-content">

            <div>
              <p>Total Products</p>
              <h2>{totalProducts}</h2>
            </div>

            <div className="super-admin-products-icon blue">
              <Package size={22} />
            </div>

          </div>

        </Card>


        <Card className="super-admin-products-summary-card">

          <div className="super-admin-products-card-content">

            <div>
              <p>Active Products</p>
              <h2>{activeProducts}</h2>
            </div>

            <div className="super-admin-products-icon green">
              <CheckCircle size={22} />
            </div>

          </div>

        </Card>


        <Card className="super-admin-products-summary-card">

          <div className="super-admin-products-card-content">

            <div>
              <p>Inactive Products</p>
              <h2>{inactiveProducts}</h2>
            </div>

            <div className="super-admin-products-icon red">
              <XCircle size={22} />
            </div>

          </div>

        </Card>


        <Card className="super-admin-products-summary-card">

          <div className="super-admin-products-card-content">

            <div>
              <p>Low Stock Products</p>
              <h2>{lowStockProducts}</h2>
            </div>

            <div className="super-admin-products-icon orange">
              <AlertTriangle size={22} />
            </div>

          </div>

        </Card>

      </div>


      {/* PRODUCT LIST */}

      <Card className="super-admin-products-table-card">

        <div className="super-admin-products-section-header">

          <div>
            <h2>Product List</h2>

            <p>
              Master products available on the ProcureHub platform.
            </p>
          </div>

        </div>


        {/* SEARCH AND FILTERS */}

        <div className="super-admin-products-toolbar">

          <div className="super-admin-products-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>


          <select
            className="super-admin-products-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >

            <option value="ALL">
              All Categories
            </option>

            {categories.map((category) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.category_name}
              </option>

            ))}

          </select>


          <select
            className="super-admin-products-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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


        {/* PRODUCT TABLE */}

        <div className="super-admin-products-table-wrapper">

          <table className="super-admin-products-table">

            <thead>

              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>Suppliers</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="super-admin-products-empty-cell"
                  >

                    <div className="super-admin-products-empty">

                      <Package size={34} />

                      <h3>
                        Loading products...
                      </h3>

                    </div>

                  </td>

                </tr>

              ) : filteredProducts.length > 0 ? (

                filteredProducts.map((product) => (

                  <tr key={product.id}>

                    <td>

                      <div className="super-admin-product-name">

    <div
        className="super-admin-product-icon"
        style={{
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}
    >
        {product.image ? (
            <img
                src={`http://localhost:5000${product.image}`}
                alt={product.product_name}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                }}
            />
        ) : (
            <Package size={16} />
        )}
    </div>

    <span>
        {product.product_name}
    </span>

</div>

                    </td>


                    <td>
                      {product.category_name || "-"}
                    </td>


                    <td>
                      {Number(product.available_stock) || 0}
                    </td>


                    <td>
                      {Number(product.supplier_count) || 0}
                    </td>


                    <td>

                      <Badge
                        variant={
                          product.status === "ACTIVE"
                            ? "success"
                            : "danger"
                        }
                      >
                        {product.status === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </Badge>

                    </td>


                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px"
                        }}
                      >

                        {/* VIEW */}

                        <button
                          type="button"
                          className="super-admin-products-action"
                          title="View Product"
                          onClick={() =>
                            handleViewProduct(product.id)
                          }
                        >
                          <Eye size={18} />
                        </button>


                        {/* EDIT */}

                        <button
                          type="button"
                          className="super-admin-products-action"
                          title="Edit Product"
                          onClick={() =>
                            handleOpenEditModal(product)
                          }
                        >
                          <Pencil size={18} />
                        </button>


                        {/* DEACTIVATE / ACTIVATE */}

                        {product.status === "ACTIVE" ? (

                          <button
  type="button"
  className="super-admin-products-action"
  onClick={() => {
    setSelectedProduct(product);
    setStatusAction("DEACTIVATE");
    setShowStatusModal(true);
  }}
  title="Deactivate Product"
>
  <Trash2 size={18} />
</button>
                        ) : (

                          <button
  type="button"
  className="super-admin-products-action"
  onClick={() => {
    setSelectedProduct(product);
    setStatusAction("ACTIVATE");
    setShowStatusModal(true);
  }}
  title="Activate Product"
>ch
  <CheckCircle size={18} />
</button>

                        )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="super-admin-products-empty-cell"
                  >

                    <div className="super-admin-products-empty">

                      <Package size={34} />

                      <h3>
                        No products found
                      </h3>

                      <p>
                        Create a master product using the
                        Add Product button.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </Card>


      {/* INFORMATION CARD */}

      <Card className="super-admin-products-info">

        <div className="super-admin-products-info-icon">
          <Package size={20} />
        </div>

        <div>

          <h3>
            About Products
          </h3>

          <p>
            Super Admin manages the master product catalog.
            Suppliers can later add these products to their
            catalogs with their own price, stock and minimum
            order quantity.
          </p>

        </div>

      </Card>


      {/* ==========================================
          ADD PRODUCT MODAL
      ========================================== */}

      {showAddModal && (

        <div
          className="super-admin-products-modal-overlay"
          onClick={handleCloseAddModal}
        >

          <div
            className="super-admin-products-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="super-admin-products-modal-header">

              <div>

                <h2>
                  Add Product
                </h2>

                <p>
                  Create a new master product
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            <div className="super-admin-products-modal-body">

              {formError && (

                <div
                  style={{
                    marginBottom: "18px",
                    padding: "10px 12px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    borderRadius: "8px",
                    fontSize: "13px"
                  }}
                >
                  {formError}
                </div>

              )}


              <div className="product-form-group">

                <label>
                  Product Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="product_name"
                  placeholder="Enter product name"
                  value={productForm.product_name}
                  onChange={handleProductFormChange}
                />

              </div>


              <div className="product-form-group">

                <label>
                  Category <span>*</span>
                </label>

                <select
                  name="category_id"
                  value={productForm.category_id}
                  onChange={handleProductFormChange}
                >

                  <option value="">
                    Select category
                  </option>

                  {categories
                    .filter(
                      (category) =>
                        category.status === "ACTIVE"
                    )
                    .map((category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.category_name}
                      </option>

                    ))}

                </select>

              </div>


              <div className="product-form-group">

                <label>
                  Unit <span>*</span>
                </label>

                <select
                  name="unit"
                  value={productForm.unit}
                  onChange={handleProductFormChange}
                >

                  <option value="">
                    Select unit
                  </option>

                  <option value="Piece">
                    Piece
                  </option>

                  <option value="Box">
                    Box
                  </option>

                  <option value="Pack">
                    Pack
                  </option>

                  <option value="Kg">
                    Kg
                  </option>

                  <option value="Litre">
                    Litre
                  </option>

                </select>

              </div>


              <div className="product-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Enter product description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                />

              </div>

              <div className="product-form-group">

    <label>
        Product Image
    </label>

    <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleProductImageChange}
    />

    <small
        style={{
            display: "block",
            marginTop: "6px",
            color: "#6b7280",
            fontSize: "12px"
        }}
    >
        JPG, JPEG, PNG or WEBP. Maximum size: 5 MB.
    </small>

</div>


              <div className="product-form-actions">

                <button
                  type="button"
                  className="product-cancel-button"
                  onClick={handleCloseAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="product-save-button"
                  onClick={handleCreateProduct}
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Product"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ==========================================
          VIEW PRODUCT MODAL
      ========================================== */}

      {showViewModal && (

        <div
          className="super-admin-products-modal-overlay"
          onClick={handleCloseViewModal}
        >

          <div
            className="super-admin-products-modal"
            style={{ maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >

            <div className="super-admin-products-modal-header">

              <div>

                <h2>
                  Product Details
                </h2>

                <p>
                  View master product and supplier information
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseViewModal}
              >
                ×
              </button>

            </div>


            <div className="super-admin-products-modal-body">

              {viewLoading ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "30px"
                  }}
                >

                  <Package size={34} />

                  <h3>
                    Loading product details...
                  </h3>

                </div>

              ) : selectedProduct ? (

                <>

                  {/* MASTER PRODUCT */}

                  <div
                    style={{
                      marginBottom: "25px"
                    }}
                    
                  >
                    <div
    style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
    }}
>
    {selectedProduct.product.image ? (
        <img
            src={`http://localhost:5000${selectedProduct.product.image}`}
            alt={selectedProduct.product.product_name}
            style={{
                width: "150px",
                height: "150px",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "8px",
                background: "#ffffff"
            }}
        />
    ) : (
        <div
            style={{
                width: "150px",
                height: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                background: "#f8fafc"
            }}
        >
            <Package size={42} color="#94a3b8" />
        </div>
    )}
</div>

                    <h3
                      style={{
                        margin: "0 0 15px",
                        fontSize: "17px",
                        color: "#111827"
                      }}
                    >
                      Master Product
                    </h3>


                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "15px"
                      }}
                    >

                      <div>

                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "5px"
                          }}
                        >
                          Product Name
                        </label>

                        <strong>
                          {selectedProduct.product.product_name}
                        </strong>

                      </div>


                      <div>

                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "5px"
                          }}
                        >
                          Category
                        </label>

                        <strong>
                          {selectedProduct.product.category_name ||
                            "-"}
                        </strong>

                      </div>


                      <div>

                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "5px"
                          }}
                        >
                          Unit
                        </label>

                        <strong>
                          {selectedProduct.product.unit || "-"}
                        </strong>

                      </div>


                      <div>

                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "5px"
                          }}
                        >
                          Status
                        </label>

                        <Badge
                          variant={
                            selectedProduct.product.status ===
                            "ACTIVE"
                              ? "success"
                              : "danger"
                          }
                        >
                          {selectedProduct.product.status ===
                          "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </Badge>

                      </div>

                    </div>


                    <div
                      style={{
                        marginTop: "15px"
                      }}
                    >

                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "5px"
                        }}
                      >
                        Description
                      </label>

                      <p
                        style={{
                          margin: 0,
                          color: "#374151",
                          lineHeight: "1.6"
                        }}
                      >
                        {selectedProduct.product.description ||
                          "No description available."}
                      </p>

                    </div>

                  </div>


                  {/* SUPPLIER DETAILS */}

                  <div>

                    <h3
                      style={{
                        margin: "0 0 15px",
                        fontSize: "17px",
                        color: "#111827"
                      }}
                    >
                      Supplier Details
                    </h3>


                    {selectedProduct.suppliers &&
                    selectedProduct.suppliers.length > 0 ? (

                      <div
                        style={{
                          overflowX: "auto",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px"
                        }}
                      >

                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px"
                          }}
                        >

                          <thead>

                            <tr
                              style={{
                                background: "#f9fafb"
                              }}
                            >

                              <th
                                style={{
                                  padding: "11px",
                                  textAlign: "left",
                                  borderBottom:
                                    "1px solid #e5e7eb"
                                }}
                              >
                                Supplier
                              </th>

                              <th
                                style={{
                                  padding: "11px",
                                  textAlign: "left",
                                  borderBottom:
                                    "1px solid #e5e7eb"
                                }}
                              >
                                Price
                              </th>

                              <th
                                style={{
                                  padding: "11px",
                                  textAlign: "left",
                                  borderBottom:
                                    "1px solid #e5e7eb"
                                }}
                              >
                                Stock
                              </th>

                              <th
                                style={{
                                  padding: "11px",
                                  textAlign: "left",
                                  borderBottom:
                                    "1px solid #e5e7eb"
                                }}
                              >
                                MOQ
                              </th>

                              <th
                                style={{
                                  padding: "11px",
                                  textAlign: "left",
                                  borderBottom:
                                    "1px solid #e5e7eb"
                                }}
                              >
                                Status
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {selectedProduct.suppliers.map(
                              (supplier) => (

                                <tr key={supplier.id}>

                                  <td
                                    style={{
                                      padding: "11px",
                                      borderBottom:
                                        "1px solid #f3f4f6"
                                    }}
                                  >
                                    {supplier.supplier_name}
                                  </td>

                                  <td
                                    style={{
                                      padding: "11px",
                                      borderBottom:
                                        "1px solid #f3f4f6"
                                    }}
                                  >
                                    ₹
                                    {Number(
                                      supplier.price
                                    ).toFixed(2)}
                                  </td>

                                  <td
                                    style={{
                                      padding: "11px",
                                      borderBottom:
                                        "1px solid #f3f4f6"
                                    }}
                                  >
                                    {supplier.stock_quantity}
                                  </td>

                                  <td
                                    style={{
                                      padding: "11px",
                                      borderBottom:
                                        "1px solid #f3f4f6"
                                    }}
                                  >
                                    {supplier.minimum_order_quantity}
                                  </td>

                                  <td
                                    style={{
                                      padding: "11px",
                                      borderBottom:
                                        "1px solid #f3f4f6"
                                    }}
                                  >

                                    <Badge
                                      variant={
                                        supplier.status ===
                                        "ACTIVE"
                                          ? "success"
                                          : "danger"
                                      }
                                    >
                                      {supplier.status ===
                                      "ACTIVE"
                                        ? "Active"
                                        : "Inactive"}
                                    </Badge>

                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <div
                        style={{
                          padding: "25px",
                          textAlign: "center",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          color: "#6b7280"
                        }}
                      >

                        <Package size={30} />

                        <p
                          style={{
                            margin: "10px 0 0"
                          }}
                        >
                          No suppliers have added this
                          product yet.
                        </p>

                      </div>

                    )}

                  </div>

                </>

              ) : null}

            </div>

          </div>

        </div>

      )}


      {/* ==========================================
          EDIT PRODUCT MODAL
      ========================================== */}

      {showEditModal && (

        <div
          className="super-admin-products-modal-overlay"
          onClick={handleCloseEditModal}
        >

          <div
            className="super-admin-products-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* EDIT HEADER */}

            <div className="super-admin-products-modal-header">

              <div>

                <h2>
                  Edit Product
                </h2>

                <p>
                  Update master product information
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* EDIT BODY */}

            <div className="super-admin-products-modal-body">

              {formError && (

                <div
                  style={{
                    marginBottom: "18px",
                    padding: "10px 12px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    borderRadius: "8px",
                    fontSize: "13px"
                  }}
                >
                  {formError}
                </div>

              )}


              {/* PRODUCT NAME */}

              <div className="product-form-group">

                <label>
                  Product Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="product_name"
                  placeholder="Enter product name"
                  value={editForm.product_name}
                  onChange={handleEditFormChange}
                />

              </div>


              {/* CATEGORY */}

              <div className="product-form-group">

                <label>
                  Category <span>*</span>
                </label>

                <select
                  name="category_id"
                  value={editForm.category_id}
                  onChange={handleEditFormChange}
                >

                  <option value="">
                    Select category
                  </option>

                  {categories
                    .filter(
                      (category) =>
                        category.status === "ACTIVE"
                    )
                    .map((category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.category_name}
                      </option>

                    ))}

                </select>

              </div>


              {/* UNIT */}

              <div className="product-form-group">

                <label>
                  Unit <span>*</span>
                </label>

                <select
                  name="unit"
                  value={editForm.unit}
                  onChange={handleEditFormChange}
                >

                  <option value="">
                    Select unit
                  </option>

                  <option value="Piece">
                    Piece
                  </option>

                  <option value="Box">
                    Box
                  </option>

                  <option value="Pack">
                    Pack
                  </option>

                  <option value="Kg">
                    Kg
                  </option>

                  <option value="Litre">
                    Litre
                  </option>

                </select>

              </div>


              {/* DESCRIPTION */}

              <div className="product-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Enter product description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                />

              </div>

              <div className="product-form-group">

    <label>
        Product Image
    </label>

    <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleEditProductImageChange}
    />

    <small
        style={{
            display: "block",
            marginTop: "6px",
            color: "#6b7280",
            fontSize: "12px"
        }}
    >
        Select a new image only if you want to add or replace the current image.
        JPG, JPEG, PNG or WEBP. Maximum size: 5 MB.
    </small>

</div>


              {/* ACTIONS */}

              <div className="product-form-actions">

                <button
                  type="button"
                  className="product-cancel-button"
                  onClick={handleCloseEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="product-save-button"
                  onClick={handleUpdateProduct}
                  disabled={saving}
                >
                  {saving
                    ? "Updating..."
                    : "Update Product"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {showStatusModal && selectedProduct && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9998
    }}
  >
    <div
      style={{
        width: "420px",
        background: "#ffffff",
        borderRadius: "12px",
        padding: "28px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px"
        }}
      >
        <h3 style={{ margin: 0, fontSize: "20px" }}>
  {statusAction === "ACTIVATE"
    ? "Activate Product"
    : "Deactivate Product"}
</h3>

        <button
          onClick={() => {
            if (!saving) {
              setShowStatusModal(false);
              setSelectedProduct(null);
            }
          }}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>
      </div>

      <p
  style={{
    margin: "0 0 24px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6"
  }}
>
  Are you sure you want to{" "}
  {statusAction === "ACTIVATE" ? "activate" : "deactivate"}{" "}
  <strong>{selectedProduct.product_name}</strong>?
  <br />
  {statusAction === "ACTIVATE"
    ? "This product will become available for new procurement."
    : "This product will no longer be available for new procurement."}
</p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px"
        }}
      >
        <button
          onClick={() => {
            setShowStatusModal(false);
            setSelectedProduct(null);
          }}
          disabled={saving}
          style={{
            padding: "10px 18px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
  onClick={
    statusAction === "ACTIVATE"
      ? handleActivateProduct
      : handleDeactivateProduct
  }
  disabled={saving}
  style={{
    padding: "10px 18px",
    border: "none",
    background:
      statusAction === "ACTIVATE"
        ? "#16a34a"
        : "#dc2626",
    color: "#ffffff",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  {saving
    ? statusAction === "ACTIVATE"
      ? "Activating..."
      : "Deactivating..."
    : statusAction === "ACTIVATE"
      ? "Activate"
      : "Deactivate"}
</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default SuperAdminProducts;