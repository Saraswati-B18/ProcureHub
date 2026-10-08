import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Search,
  Heart,
  ShoppingCart,
  Package,
  X,
  Check
} from "lucide-react";

import "./Products.css";

const API_BASE_URL = "http://localhost:5000";

const Products = () => {
  const navigate = useNavigate();

  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // SELECTED PRODUCT
  // =====================================================

  const [selectedProduct, setSelectedProduct] = useState(null);

  // =====================================================
  // WISHLIST
  // =====================================================

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("procurehub_wishlist");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =====================================================
  // CART COUNT
  // =====================================================

  const [cartCount, setCartCount] = useState(() => {
    try {
      const savedCart = localStorage.getItem("procurehub_cart");

      if (!savedCart) {
        return 0;
      }

      const cart = JSON.parse(savedCart);

      return cart.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      );
    } catch {
      return 0;
    }
  });

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notification, setNotification] = useState("");

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/employee-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.error(
        "Fetch employee products failed:",
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

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =====================================================
  // UPDATE CART COUNT
  // =====================================================

  const updateCartCount = () => {
    try {
      const savedCart =
        localStorage.getItem("procurehub_cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(savedCart);

      const count = cart.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  // =====================================================
  // UPDATE WISHLIST
  // =====================================================

  const updateWishlist = () => {
    try {
      const savedWishlist =
        localStorage.getItem("procurehub_wishlist");

      setWishlist(
        savedWishlist
          ? JSON.parse(savedWishlist)
          : []
      );
    } catch {
      setWishlist([]);
    }
  };

  // =====================================================
  // LISTEN FOR CART / WISHLIST CHANGES
  // =====================================================

  useEffect(() => {
    const handleStorageChange = () => {
      updateCartCount();
      updateWishlist();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "procurehub-cart-updated",
      handleStorageChange
    );

    window.addEventListener(
      "procurehub-wishlist-updated",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "procurehub-cart-updated",
        handleStorageChange
      );

      window.removeEventListener(
        "procurehub-wishlist-updated",
        handleStorageChange
      );
    };
  }, []);

  // =====================================================
  // BUILD CATEGORY LIST
  // =====================================================

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      if (
        product.category_id &&
        product.category_name
      ) {
        categoryMap.set(
          String(product.category_id),
          {
            id: product.category_id,
            category_name: product.category_name
          }
        );
      }
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) =>
        a.category_name.localeCompare(
          b.category_name
        )
    );
  }, [products]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter(
    (product) => {
      const search =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        product.product_name
          ?.toLowerCase()
          .includes(search) ||
        product.supplier_name
          ?.toLowerCase()
          .includes(search) ||
        product.category_name
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === "ALL" ||
        String(product.category_id) ===
          String(categoryFilter);

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  const getProductImage = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_BASE_URL}${image}`;
    }

    return `${API_BASE_URL}/${image}`;
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const toggleWishlist = (
    product,
    event
  ) => {
    event?.stopPropagation();

    const productId =
      product.supplier_product_id;

    setWishlist((previous) => {
      let updated;

      if (previous.includes(productId)) {
        updated = previous.filter(
          (id) => id !== productId
        );

        showNotification(
          "Removed from wishlist."
        );
      } else {
        updated = [
          ...previous,
          productId
        ];

        showNotification(
          "Added to wishlist."
        );
      }

      localStorage.setItem(
        "procurehub_wishlist",
        JSON.stringify(updated)
      );

      // Tell other components/pages
      window.dispatchEvent(
        new Event(
          "procurehub-wishlist-updated"
        )
      );

      return updated;
    });
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (
    product,
    event
  ) => {
    event?.stopPropagation();

    try {
      const savedCart =
        localStorage.getItem(
          "procurehub_cart"
        );

      const cart = savedCart
        ? JSON.parse(savedCart)
        : [];

      const productId =
        product.supplier_product_id;

      const minimumQuantity =
        Number(
          product.minimum_order_quantity
        ) || 1;

      const existingIndex =
        cart.findIndex(
          (item) =>
            item.supplier_product_id ===
            productId
        );

      if (existingIndex !== -1) {
        cart[existingIndex].quantity +=
          minimumQuantity;
      } else {
        cart.push({
          supplier_product_id:
            product.supplier_product_id,

          product_id:
            product.product_id,

          product_name:
            product.product_name,

          supplier_id:
            product.supplier_id,

          supplier_name:
            product.supplier_name,

          price:
            Number(product.price),

          unit:
            product.unit,

          image:
            product.image,

          minimum_order_quantity:
            minimumQuantity,

          quantity:
            minimumQuantity
        });
      }

      localStorage.setItem(
        "procurehub_cart",
        JSON.stringify(cart)
      );

      updateCartCount();

      window.dispatchEvent(
        new Event(
          "procurehub-cart-updated"
        )
      );

      showNotification(
        "Product added to cart."
      );
    } catch (error) {
      console.error(
        "Add to cart failed:",
        error
      );

      showNotification(
        "Unable to add product to cart."
      );
    }
  };

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const showNotification = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  // =====================================================
  // CLOSE PRODUCT DETAILS
  // =====================================================

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const openCart = () => {
    navigate("/employee/cart");
  };

  const openWishlist = () => {
    navigate("/employee/wishlist");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="products-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="products-header">

        <div>
          <h1>Products</h1>

          <p>
            Browse and shop products from
            ProcureHub suppliers.
          </p>
        </div>

        {/* CART + WISHLIST */}
        <div className="products-header-actions">

          {/* WISHLIST */}
          <button
            type="button"
            className="products-header-icon"
            onClick={openWishlist}
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={21} />

            {wishlist.length > 0 && (
              <span className="header-icon-count">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* CART */}
          <button
            type="button"
            className="products-header-icon"
            onClick={openCart}
            aria-label="Cart"
            title="Cart"
          >
            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span className="header-icon-count">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>


      {/* =================================================
          SEARCH + CATEGORY
      ================================================= */}

      <div className="products-toolbar">

        <div className="product-search">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search products, suppliers or categories..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>


        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.category_name}
              </option>
            )
          )}

        </select>

      </div>


      {/* =================================================
          PRODUCT COUNT
      ================================================= */}

      <div className="products-result-header">

        <span>
          {loading
            ? "Loading products..."
            : `${filteredProducts.length} products`}
        </span>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {errorMessage && (
        <div className="product-error">
          {errorMessage}
        </div>
      )}


      {/* =================================================
          PRODUCT GRID
      ================================================= */}

      {!loading &&
      filteredProducts.length > 0 ? (

        <div className="products-grid">

          {filteredProducts.map(
            (product) => {

              const imageUrl =
                getProductImage(
                  product.image
                );

              const isWishlisted =
                wishlist.includes(
                  product.supplier_product_id
                );

              return (
                <div
                  className="shop-product-card"
                  key={
                    product.supplier_product_id
                  }
                  onClick={() =>
                    setSelectedProduct(
                      product
                    )
                  }
                >

                  {/* IMAGE */}

                  <div className="shop-product-image">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={
                          product.product_name
                        }
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          e.currentTarget
                            .nextElementSibling
                            ?.classList.remove(
                              "hidden"
                            );
                        }}
                      />
                    ) : null}

                    <div
                      className={`image-fallback ${
                        imageUrl
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <Package size={42} />
                    </div>


                    {/* WISHLIST */}

                    <button
                      type="button"
                      className={`wishlist-button ${
                        isWishlisted
                          ? "wishlisted"
                          : ""
                      }`}
                      onClick={(e) =>
                        toggleWishlist(
                          product,
                          e
                        )
                      }
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={19}
                        fill={
                          isWishlisted
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                  </div>


                  {/* PRODUCT INFORMATION */}

                  <div className="shop-product-info">

                    <h3>
                      {product.product_name}
                    </h3>

                    <div className="shop-product-supplier">
                      {product.supplier_name}
                    </div>

                    <div className="shop-product-price">

                      ₹
                      {Number(
                        product.price
                      ).toFixed(2)}

                      <span>
                        / {product.unit}
                      </span>

                    </div>


                    {/* ADD TO CART */}

                    <button
                      type="button"
                      className="add-cart-button"
                      disabled={
                        product.availability !==
                        "AVAILABLE"
                      }
                      onClick={(e) =>
                        addToCart(
                          product,
                          e
                        )
                      }
                    >

                      <ShoppingCart
                        size={17}
                      />

                      {product.availability ===
                      "AVAILABLE"
                        ? "Add to Cart"
                        : "Out of Stock"}

                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>

      ) : !loading ? (

        <div className="no-products">

          <Package size={48} />

          <h3>
            No products found
          </h3>

          <p>
            Try changing your search or
            category filter.
          </p>

        </div>

      ) : (

        <div className="products-loading">

          <Package size={42} />

          <p>
            Loading products...
          </p>

        </div>

      )}


      {/* =================================================
          PRODUCT DETAILS MODAL
      ================================================= */}

      {selectedProduct && (

        <div
          className="product-details-overlay"
          onClick={closeProductDetails}
        >

          <div
            className="product-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="product-details-close"
              onClick={closeProductDetails}
            >
              <X size={21} />
            </button>


            <div className="product-details-layout">

              {/* IMAGE */}

              <div className="product-details-image">

                {getProductImage(
                  selectedProduct.image
                ) ? (

                  <img
                    src={getProductImage(
                      selectedProduct.image
                    )}
                    alt={
                      selectedProduct.product_name
                    }
                  />

                ) : (

                  <div>
                    <Package size={70} />
                  </div>

                )}

              </div>


              {/* DETAILS */}

              <div className="product-details-content">

                <div className="product-details-category">
                  {selectedProduct.category_name}
                </div>


                <h2>
                  {selectedProduct.product_name}
                </h2>


                <p className="details-supplier">
                  Sold by{" "}

                  <strong>
                    {selectedProduct.supplier_name}
                  </strong>
                </p>


                <div className="details-price">

                  ₹
                  {Number(
                    selectedProduct.price
                  ).toFixed(2)}

                  <span>
                    / {selectedProduct.unit}
                  </span>

                </div>


                <div className="details-divider" />


                {/* DESCRIPTION */}

                <div className="details-section">

                  <h4>
                    Description
                  </h4>

                  <p>
                    {selectedProduct.supplier_description ||
                      selectedProduct.description ||
                      "No description available."}
                  </p>

                </div>


                {/* STOCK */}

                <div className="details-info-grid">

                  <div>

                    <span>
                      Available Stock
                    </span>

                    <strong>
                      {
                        selectedProduct.stock_quantity
                      }{" "}
                      {selectedProduct.unit}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Minimum Order
                    </span>

                    <strong>
                      {
                        selectedProduct.minimum_order_quantity
                      }{" "}
                      {selectedProduct.unit}
                    </strong>

                  </div>

                </div>


                {/* AVAILABILITY */}

                <div
                  className={
                    selectedProduct.availability ===
                    "AVAILABLE"
                      ? "details-available"
                      : "details-unavailable"
                  }
                >

                  <Check size={16} />

                  {selectedProduct.availability ===
                  "AVAILABLE"
                    ? "Available for purchase"
                    : "Currently out of stock"}

                </div>


                {/* ADD TO CART */}

                <button
                  type="button"
                  className="details-add-cart-button"
                  disabled={
                    selectedProduct.availability !==
                    "AVAILABLE"
                  }
                  onClick={() =>
                    addToCart(
                      selectedProduct
                    )
                  }
                >

                  <ShoppingCart size={18} />

                  Add to Cart

                </button>


                {/* WISHLIST */}

                <button
                  type="button"
                  className={`details-wishlist-button ${
                    wishlist.includes(
                      selectedProduct.supplier_product_id
                    )
                      ? "wishlisted"
                      : ""
                  }`}
                  onClick={() =>
                    toggleWishlist(
                      selectedProduct
                    )
                  }
                >

                  <Heart
                    size={18}
                    fill={
                      wishlist.includes(
                        selectedProduct.supplier_product_id
                      )
                        ? "currentColor"
                        : "none"
                    }
                  />

                  {wishlist.includes(
                    selectedProduct.supplier_product_id
                  )
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (
        <div className="product-notification">

          <Check size={17} />

          {notification}

        </div>
      )}

    </div>
  );
};

export default Products;