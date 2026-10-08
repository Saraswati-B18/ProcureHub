import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  X
} from "lucide-react";

import axios from "axios";

import "./SupplierProducts.css";

function SupplierProducts() {

  // ==========================================
  // STATES
  // ==========================================

  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusAction, setStatusAction] = useState("");

  const [formError, setFormError] = useState("");

  const [productForm, setProductForm] = useState({
    product_id: "",
    supplier_description: "",
    price: "",
    stock_quantity: "",
    minimum_order_quantity: ""
});

  const [editForm, setEditForm] = useState({
    supplier_description: "",
    price: "",
    stock_quantity: "",
    minimum_order_quantity: ""
});

  // ==========================================
  // FETCH MY PRODUCTS
  // ==========================================

  const fetchProducts = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/supplier-products",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProducts(response.data.products || []);
      setErrorMessage("");

    } catch (error) {

      console.error(
        "Failed to fetch supplier products:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load products."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // FETCH AVAILABLE MASTER PRODUCTS
  // ==========================================

  const fetchAvailableProducts = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/supplier-products/available",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAvailableProducts(
        response.data.products || []
      );

    } catch (error) {

      console.error(
        "Failed to fetch available products:",
        error
      );

    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    fetchProducts();
    fetchAvailableProducts();

  }, []);


  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((product) => {

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.product_name
        ?.toLowerCase()
        .includes(search) ||
      product.category_name
        ?.toLowerCase()
        .includes(search);

    let matchesFilter = true;

    if (statusFilter === "ACTIVE") {
      matchesFilter = product.status === "ACTIVE";
    }

    if (statusFilter === "INACTIVE") {
      matchesFilter = product.status === "INACTIVE";
    }

    if (statusFilter === "LOW_STOCK") {
      matchesFilter =
        Number(product.stock_quantity) <= 10 &&
        product.status === "ACTIVE";
    }

    return matchesSearch && matchesFilter;

  });


  // ==========================================
  // SUMMARY
  // ==========================================

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status === "INACTIVE"
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      product.status === "ACTIVE" &&
      Number(product.stock_quantity) <= 10
  ).length;


  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleOpenAddModal = async () => {

    setProductForm({
      product_id: "",
      price: "",
      stock_quantity: "",
      minimum_order_quantity: ""
    });

    setFormError("");

    await fetchAvailableProducts();

    setShowAddModal(true);
  };


  // ==========================================
  // CLOSE MODALS
  // ==========================================

  const handleCloseModal = () => {

    if (saving) {
      return;
    }

    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowStatusModal(false);

    setSelectedProduct(null);
    setFormError("");

  };


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleProductFormChange = (e) => {

    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setFormError("");
  };


  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleAddProduct = async () => {

    if (!productForm.product_id) {
      setFormError("Please select a product.");
      return;
    }

    if (
      productForm.price === "" ||
      Number(productForm.price) < 0
    ) {
      setFormError("Please enter a valid price.");
      return;
    }

    if (
      productForm.stock_quantity === "" ||
      Number(productForm.stock_quantity) < 0
    ) {
      setFormError("Please enter a valid stock quantity.");
      return;
    }

    if (
      productForm.minimum_order_quantity === "" ||
      Number(productForm.minimum_order_quantity) <= 0
    ) {
      setFormError(
        "Minimum order quantity must be greater than 0."
      );
      return;
    }

    try {

      setSaving(true);
      setFormError("");

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/supplier-products",
        {
          product_id: productForm.product_id,
          supplier_description:
        productForm.supplier_description.trim(),
          price: Number(productForm.price),
          stock_quantity: Number(
            productForm.stock_quantity
          ),
          minimum_order_quantity: Number(
            productForm.minimum_order_quantity
          )
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowAddModal(false);

      setProductForm({
    product_id: "",
    supplier_description: "",
    price: "",
    stock_quantity: "",
    minimum_order_quantity: ""
});

      setSuccessMessage(
        "Product added to your catalog successfully!"
      );

      await fetchProducts();
      await fetchAvailableProducts();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Add supplier product failed:",
        error
      );

      setFormError(
        error.response?.data?.message ||
        "Failed to add product."
      );

    } finally {

      setSaving(false);

    }
  };


  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleOpenEditModal = (product) => {

    setSelectedProduct(product);

    setEditForm({
    supplier_description:
        product.supplier_description ?? "",
    price: product.price ?? "",
    stock_quantity:
        product.stock_quantity ?? "",
    minimum_order_quantity:
        product.minimum_order_quantity ?? ""
});
    setFormError("");
    setShowEditModal(true);
  };


  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const handleUpdateProduct = async () => {

    if (
      editForm.price === "" ||
      Number(editForm.price) < 0
    ) {
      setFormError("Please enter a valid price.");
      return;
    }

    if (
      editForm.stock_quantity === "" ||
      Number(editForm.stock_quantity) < 0
    ) {
      setFormError("Please enter a valid stock quantity.");
      return;
    }

    if (
      editForm.minimum_order_quantity === "" ||
      Number(editForm.minimum_order_quantity) <= 0
    ) {
      setFormError(
        "Minimum order quantity must be greater than 0."
      );
      return;
    }

    try {

      setSaving(true);
      setFormError("");

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/supplier-products/${selectedProduct.id}`,
        {
    supplier_description:
        editForm.supplier_description.trim(),
    price: Number(editForm.price),
    stock_quantity: Number(
        editForm.stock_quantity
    ),
    minimum_order_quantity: Number(
        editForm.minimum_order_quantity
    )
},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowEditModal(false);
      setSelectedProduct(null);

      setSuccessMessage(
        "Product updated successfully!"
      );

      await fetchProducts();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {

      console.error(
        "Update supplier product failed:",
        error
      );

      setFormError(
        error.response?.data?.message ||
        "Failed to update product."
      );

    } finally {

      setSaving(false);

    }
  };


  // ==========================================
  // VIEW PRODUCT
  // ==========================================

  const handleViewProduct = (product) => {

    setSelectedProduct(product);
    setShowViewModal(true);

  };


  // ==========================================
  // OPEN STATUS MODAL
  // ==========================================

  const handleOpenStatusModal = (
    product,
    action
  ) => {

    setSelectedProduct(product);
    setStatusAction(action);
    setShowStatusModal(true);

  };


  // ==========================================
  // DEACTIVATE PRODUCT
  // ==========================================

  const handleDeactivateProduct = async () => {

    try {

      setSaving(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/supplier-products/${selectedProduct.id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowStatusModal(false);
      setSelectedProduct(null);

      setSuccessMessage(
        "Product deactivated successfully!"
      );

      await fetchProducts();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {

      console.error(
        "Deactivate supplier product failed:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to deactivate product."
      );

    } finally {

      setSaving(false);

    }
  };


  // ==========================================
  // ACTIVATE PRODUCT
  // ==========================================

  const handleActivateProduct = async () => {

    try {

      setSaving(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/supplier-products/${selectedProduct.id}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowStatusModal(false);
      setSelectedProduct(null);

      setSuccessMessage(
        "Product activated successfully!"
      );

      await fetchProducts();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {

      console.error(
        "Activate supplier product failed:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to activate product."
      );

    } finally {

      setSaving(false);

    }
  };


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="supplier-products-page">

      {/* HEADER */}

      <div className="supplier-products-header">

        <div>
          <h1>My Products</h1>
          <p>
            Manage the products you provide to customers.
          </p>
        </div>

        <button
          className="add-product-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>


      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            zIndex: 9999,
            background: "#ecfdf3",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >
          {successMessage}
        </div>
      )}


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


      {/* SUMMARY */}

      <div className="supplier-product-summary">

        <div className="supplier-summary-card">

          <div className="supplier-summary-icon blue">
            <Package size={22} />
          </div>

          <div>
            <span>Total Products</span>
            <strong>{totalProducts}</strong>
          </div>

        </div>


        <div className="supplier-summary-card">

          <div className="supplier-summary-icon green">
            <Package size={22} />
          </div>

          <div>
            <span>Active Products</span>
            <strong>{activeProducts}</strong>
          </div>

        </div>


        <div className="supplier-summary-card">

          <div className="supplier-summary-icon orange">
            <Package size={22} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStockProducts}</strong>
          </div>

        </div>


        <div className="supplier-summary-card">

          <div className="supplier-summary-icon red">
            <Package size={22} />
          </div>

          <div>
            <span>Inactive Products</span>
            <strong>{inactiveProducts}</strong>
          </div>

        </div>

      </div>


      {/* PRODUCT TABLE */}

      <div className="supplier-products-card">

        <div className="supplier-products-toolbar">

          <div>

            <h2>Product Catalog</h2>

            <p>
              Products currently offered by your company.
            </p>

          </div>


          <div className="supplier-product-controls">

            <div className="supplier-search-box">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

            </div>


            <select
              className="supplier-product-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="ALL">
                All Products
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="LOW_STOCK">
                Low Stock
              </option>

            </select>

          </div>

        </div>


        <div className="supplier-product-table-wrapper">

          <table className="supplier-product-table">

            <thead>

              <tr>

                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "50px"
                    }}
                  >
                    Loading products...
                  </td>

                </tr>

              ) : filteredProducts.length === 0 ? (

                <tr>

                  <td colSpan="6">

                    <div className="supplier-products-empty">

                      <div className="supplier-empty-icon">
                        <Package size={30} />
                      </div>

                      <h3>
                        {products.length === 0
                          ? "No products available"
                          : "No products found"}
                      </h3>

                      <p>
                        {products.length === 0
                          ? "Products added to your catalog will appear here."
                          : "Try changing your search or filter."}
                      </p>

                      {products.length === 0 && (
                        <button
                          className="empty-add-product-btn"
                          onClick={handleOpenAddModal}
                        >
                          <Plus size={17} />
                          Add Your First Product
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ) : (

                filteredProducts.map((product) => (

                  <tr key={product.id}>

                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}
                      >

                        <div
    style={{
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0
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
        <Package
            size={17}
            color="#2563eb"
        />
    )}
</div>
                        <strong>
                          {product.product_name}
                        </strong>

                      </div>

                    </td>


                    <td>
                      {product.category_name || "-"}
                    </td>


                    <td>
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2
                      })}
                    </td>


                    <td>
                      {product.stock_quantity}
                    </td>


                    <td>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background:
                            product.status === "ACTIVE"
                              ? "#ecfdf3"
                              : "#fef2f2",
                          color:
                            product.status === "ACTIVE"
                              ? "#15803d"
                              : "#dc2626"
                        }}
                      >
                        {product.status === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>


                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >

                        {/* VIEW */}

                        <button
                          type="button"
                          title="View Product"
                          onClick={() =>
                            handleViewProduct(product)
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border:
                              "1px solid #e2e8f0",
                            background: "#ffffff",
                            borderRadius: "8px",
                            color: "#64748b",
                            cursor: "pointer"
                          }}
                        >
                          <Eye size={17} />
                        </button>


                        {/* EDIT */}

                        <button
                          type="button"
                          title="Edit Product"
                          onClick={() =>
                            handleOpenEditModal(product)
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border:
                              "1px solid #e2e8f0",
                            background: "#ffffff",
                            borderRadius: "8px",
                            color: "#64748b",
                            cursor: "pointer"
                          }}
                        >
                          <Edit size={17} />
                        </button>


                        {/* DEACTIVATE / ACTIVATE */}

                        {product.status === "ACTIVE" ? (

                          <button
                            type="button"
                            title="Deactivate Product"
                            onClick={() =>
                              handleOpenStatusModal(
                                product,
                                "DEACTIVATE"
                              )
                            }
                            style={{
                              width: "36px",
                              height: "36px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border:
                                "1px solid #e2e8f0",
                              background: "#ffffff",
                              borderRadius: "8px",
                              color: "#64748b",
                              cursor: "pointer"
                            }}
                          >
                            <Trash2 size={17} />
                          </button>

                        ) : (

                          <button
                            type="button"
                            title="Activate Product"
                            onClick={() =>
                              handleOpenStatusModal(
                                product,
                                "ACTIVATE"
                              )
                            }
                            style={{
                              width: "36px",
                              height: "36px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border:
                                "1px solid #e2e8f0",
                              background: "#ffffff",
                              borderRadius: "8px",
                              color: "#64748b",
                              cursor: "pointer"
                            }}
                          >
                            <CheckCircle size={17} />
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

      </div>


      {/* INFORMATION */}

      <div className="supplier-product-info">

        <div className="supplier-info-icon">
          <Package size={22} />
        </div>

        <div>

          <h3>Product Management</h3>

          <p>
            Add and manage the products available to customers.
            Product pricing, stock and availability can be
            updated from this section.
          </p>

        </div>

        <button
          className="supplier-info-action"
          onClick={handleOpenAddModal}
        >
          <Edit size={16} />
          Manage
        </button>

      </div>


      {/* ========================================== */}
      {/* ADD PRODUCT MODAL */}
      {/* ========================================== */}

      {showAddModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998
          }}
        >

          <div
            style={{
              width: "500px",
              maxWidth: "90%",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "28px",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.15)"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px"
                  }}
                >
                  Add Product
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#64748b",
                    fontSize: "14px"
                  }}
                >
                  Add a master product to your catalog.
                </p>

              </div>


              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>

            </div>


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


            <div style={{ marginBottom: "16px" }}>

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Product
              </label>

              <select
                name="product_id"
                value={productForm.product_id}
                onChange={handleProductFormChange}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px"
                }}
              >

                <option value="">
                  Select a product
                </option>

                {availableProducts.map((product) => (

                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.product_name}
                    {product.category_name
                      ? ` — ${product.category_name}`
                      : ""}
                  </option>

                ))}

              </select>

              <div style={{ marginTop: "18px" }}>
    <label
        style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#1e293b"
        }}
    >
        Product Description
    </label>

    <textarea
        name="supplier_description"
        value={productForm.supplier_description}
        onChange={(e) =>
            setProductForm((prev) => ({
                ...prev,
                supplier_description: e.target.value
            }))
        }
        placeholder="Enter your description for this product..."
        rows="3"
        style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #dbe3ef",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box"
        }}
    />
</div>

              {availableProducts.length === 0 && (
                <p
                  style={{
                    marginTop: "7px",
                    marginBottom: 0,
                    color: "#64748b",
                    fontSize: "12px"
                  }}
                >
                  No new master products are currently
                  available.
                </p>
              )}

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "14px"
              }}
            >

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  placeholder="e.g. 280"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />

              </div>


              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stock_quantity"
                  min="0"
                  value={productForm.stock_quantity}
                  onChange={handleProductFormChange}
                  placeholder="e.g. 100"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />

              </div>

            </div>


            <div
              style={{
                marginTop: "16px"
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Minimum Order Quantity (MOQ)
              </label>

              <input
                type="number"
                name="minimum_order_quantity"
                min="1"
                value={
                  productForm.minimum_order_quantity
                }
                onChange={handleProductFormChange}
                placeholder="e.g. 10"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px"
                }}
              />

            </div>


            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "26px"
              }}
            >

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                style={{
                  padding: "10px 18px",
                  border:
                    "1px solid #e2e8f0",
                  background: "#ffffff",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={handleAddProduct}
                disabled={
                  saving ||
                  availableProducts.length === 0
                }
                style={{
                  padding: "10px 18px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                {saving
                  ? "Adding..."
                  : "Add Product"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================== */}
      {/* VIEW PRODUCT MODAL */}
      {/* ========================================== */}

      {showViewModal &&
        selectedProduct && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9998
            }}
          >

            <div
              style={{
                width: "500px",
                maxWidth: "90%",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "28px",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.15)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "20px"
                }}
              >

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px"
                  }}
                >
                  Product Details
                </h2>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    cursor: "pointer"
                  }}
                >
                  <X size={20} />
                </button>

              </div>

              <div
    style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "22px"
    }}
>
    {selectedProduct.image ? (
        <img
            src={`http://localhost:5000${selectedProduct.image}`}
            alt={selectedProduct.product_name}
            style={{
                width: "150px",
                height: "150px",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
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
                border: "1px solid #e2e8f0",
                background: "#f8fafc"
            }}
        >
            <Package
                size={42}
                color="#94a3b8"
            />
        </div>
    )}
</div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "18px"
                }}
              >

                <div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px"
                    }}
                  >
                    Product
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {selectedProduct.product_name}
                  </strong>
                </div>


                <div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px"
                    }}
                  >
                    Category
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {selectedProduct.category_name ||
                      "-"}
                  </strong>
                </div>


                <div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px"
                    }}
                  >
                    Price
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    ₹
                    {Number(
                      selectedProduct.price
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2
                    })}
                  </strong>
                </div>


                <div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px"
                    }}
                  >
                    Stock
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {selectedProduct.stock_quantity}
                  </strong>
                </div>


                <div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px"
                    }}
                  >
                    Minimum Order Quantity
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {
                      selectedProduct.minimum_order_quantity
                    }
                  </strong>
                </div>


                <div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px"
                    }}
                  >
                    Status
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color:
                        selectedProduct.status ===
                        "ACTIVE"
                          ? "#15803d"
                          : "#dc2626"
                    }}
                  >
                    {selectedProduct.status ===
                    "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>

              </div>


              <div
                style={{
                  marginTop: "22px",
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#64748b"
                }}
              >
                This is your supplier-specific listing
                for the master product.
              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "22px"
                }}
              >

                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "10px 18px",
                    border:
                      "1px solid #e2e8f0",
                    background: "#ffffff",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}


      {/* ========================================== */}
      {/* EDIT PRODUCT MODAL */}
      {/* ========================================== */}

      {showEditModal &&
        selectedProduct && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9998
            }}
          >

            <div
              style={{
                width: "500px",
                maxWidth: "90%",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "28px",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.15)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "20px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px"
                    }}
                  >
                    Edit Product
                  </h2>

                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      color: "#64748b",
                      fontSize: "14px"
                    }}
                  >
                    {selectedProduct.product_name}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    cursor: "pointer"
                  }}
                >
                  <X size={20} />
                </button>

              </div>


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
              <div
    style={{
        marginBottom: "16px"
    }}
>
    <label
        style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "14px",
            fontWeight: "500"
        }}
    >
        Product Description
    </label>

    <textarea
        value={editForm.supplier_description}
        onChange={(e) =>
            setEditForm((prev) => ({
                ...prev,
                supplier_description: e.target.value
            }))
        }
        placeholder="Enter your description for this product..."
        rows={4}
        style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "11px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            resize: "vertical",
            fontFamily: "inherit"
        }}
    />
</div>


              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      price: e.target.value
                    }))
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />

              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                  marginTop: "16px"
                }}
              >

                <div>

                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      editForm.stock_quantity
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        stock_quantity:
                          e.target.value
                      }))
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px"
                    }}
                  />

                </div>


                <div>

                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    MOQ
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      editForm.minimum_order_quantity
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        minimum_order_quantity:
                          e.target.value
                      }))
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "11px 12px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px"
                    }}
                  />

                </div>

              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "26px"
                }}
              >

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    border:
                      "1px solid #e2e8f0",
                    background: "#ffffff",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>

          </div>

        )}


      {/* ========================================== */}
      {/* ACTIVATE / DEACTIVATE MODAL */}
      {/* ========================================== */}

      {showStatusModal &&
        selectedProduct && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9998
            }}
          >

            <div
              style={{
                width: "420px",
                maxWidth: "90%",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "28px",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.15)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "18px"
                }}
              >

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px"
                  }}
                >
                  {statusAction === "ACTIVATE"
                    ? "Activate Product"
                    : "Deactivate Product"}
                </h2>


                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    cursor: "pointer"
                  }}
                >
                  <X size={20} />
                </button>

              </div>


              <p
                style={{
                  margin:
                    "0 0 24px",
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: "1.6"
                }}
              >

                Are you sure you want to{" "}

                {statusAction === "ACTIVATE"
                  ? "activate"
                  : "deactivate"}{" "}

                <strong>
                  {selectedProduct.product_name}
                </strong>
                ?

                <br />

                {statusAction === "ACTIVATE"
                  ? "This product listing will become available to customers."
                  : "This product listing will no longer be available to customers."}

              </p>


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px"
                }}
              >

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  style={{
                    padding:
                      "10px 18px",
                    border:
                      "1px solid #e2e8f0",
                    background:
                      "#ffffff",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer"
                  }}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    statusAction ===
                    "ACTIVATE"
                      ? handleActivateProduct
                      : handleDeactivateProduct
                  }
                  disabled={saving}
                  style={{
                    padding:
                      "10px 18px",
                    border: "none",
                    background:
                      statusAction ===
                      "ACTIVATE"
                        ? "#16a34a"
                        : "#dc2626",
                    color: "#ffffff",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer"
                  }}
                >

                  {saving
                    ? statusAction ===
                      "ACTIVATE"
                      ? "Activating..."
                      : "Deactivating..."
                    : statusAction ===
                      "ACTIVATE"
                      ? "Activate"
                      : "Deactivate"}

                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default SupplierProducts;