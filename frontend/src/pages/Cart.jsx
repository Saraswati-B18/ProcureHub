import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";
import "./Cart.css";

const Cart = () => {

  // =====================================================
  // CART
  // =====================================================

  const [cart, setCart] = useState([]);

  const [submittingRequest, setSubmittingRequest] =
    useState(false);

  const API_BASE_URL = "http://localhost:5000";

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
  // LOAD CART
  // =====================================================

  const loadCart = () => {
    try {
      const savedCart =
        localStorage.getItem("procurehub_cart");

      if (!savedCart) {
        setCart([]);
        return;
      }

      const parsedCart = JSON.parse(savedCart);

      setCart(
        Array.isArray(parsedCart)
          ? parsedCart
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      setCart([]);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadCart();

  }, []);

  // =====================================================
  // UPDATE CART
  // =====================================================

  const saveCart = (updatedCart) => {

    setCart(updatedCart);

    localStorage.setItem(
      "procurehub_cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("procurehub-cart-updated")
    );
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (supplierProductId) => {

    const updatedCart = cart.filter(
      (item) =>
        item.supplier_product_id !==
        supplierProductId
    );

    saveCart(updatedCart);
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = (item) => {

    const minimumQuantity =
      Number(
        item.minimum_order_quantity
      ) || 1;

    const updatedCart = cart.map(
      (cartItem) => {

        if (
          cartItem.supplier_product_id ===
          item.supplier_product_id
        ) {

          return {
            ...cartItem,
            quantity:
              Number(cartItem.quantity) +
              minimumQuantity
          };

        }

        return cartItem;
      }
    );

    saveCart(updatedCart);
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = (item) => {

    const minimumQuantity =
      Number(
        item.minimum_order_quantity
      ) || 1;

    const currentQuantity =
      Number(item.quantity) ||
      minimumQuantity;

    // Do not allow quantity below minimum order
    if (
      currentQuantity <=
      minimumQuantity
    ) {
      return;
    }

    const updatedCart = cart.map(
      (cartItem) => {

        if (
          cartItem.supplier_product_id ===
          item.supplier_product_id
        ) {

          return {
            ...cartItem,
            quantity:
              Math.max(
                minimumQuantity,
                Number(cartItem.quantity) -
                  minimumQuantity
              )
          };

        }

        return cartItem;
      }
    );

    saveCart(updatedCart);
  };

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = cart.reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 0),
    0
  );

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  // =====================================================
  // TAX
  // =====================================================

  const tax = subtotal * 0.18;

  // =====================================================
  // TOTAL
  // =====================================================

  const total = subtotal + tax;

  // =====================================================
  // BROWSE PRODUCTS
  // =====================================================

  const handleBrowseProducts = () => {
    window.location.href =
      "/employee/products";
  };

  // =====================================================
  // CREATE PURCHASE REQUEST
  // =====================================================

const handleCreateRequest = async () => {

  if (cart.length === 0) {
    return;
  }

  try {

    setSubmittingRequest(true);

    const token =
      localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/api/purchase-requests`,
      {
        items: cart.map((item) => ({
          supplier_product_id:
            item.supplier_product_id,

          quantity:
            Number(item.quantity)
        }))
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    // Clear cart only after successful request
    localStorage.removeItem(
      "procurehub_cart"
    );

    setCart([]);

    window.dispatchEvent(
      new Event("procurehub-cart-updated")
    );

    // Store success message for Purchase Requests page
    sessionStorage.setItem(
      "procurehub_success_message",
      JSON.stringify({
        message:
          `Purchase request ${response.data.request.request_number} created successfully.`
      })
    );

    // Go to Purchase Requests
    window.location.href =
      "/employee/requests";

  } catch (error) {

    console.error(
      "Create purchase request failed:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Failed to create purchase request."
    );

  } finally {

    setSubmittingRequest(false);

  }
};
  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="cart-page">

      {/* =================================================
          PAGE HEADING
      ================================================= */}

      <div className="page-heading">

        <div>

          <h1>
            Shopping Cart
          </h1>

          <p>
            Review your selected products before
            submitting a request.
          </p>

        </div>

      </div>


      {/* =================================================
          CART LAYOUT
      ================================================= */}

      <div className="cart-layout">


        {/* =================================================
            CART ITEMS
        ================================================= */}

        <Card>

          <div className="cart-header">

            <div>

              <h2>
                Cart Items
              </h2>

              <span>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}
              </span>

            </div>

          </div>


          {/* =================================================
              EMPTY CART
          ================================================= */}

          {cart.length === 0 ? (

            <div className="cart-empty">

              <div className="cart-empty-icon">

                <ShoppingCart
                  size={32}
                />

              </div>


              <h3>
                Your cart is empty
              </h3>


              <p>
                Add products from the catalog
                to create a purchase request.
              </p>


              <Button
                variant="primary"
                onClick={
                  handleBrowseProducts
                }
              >
                Browse Products
              </Button>

            </div>

          ) : (

            /* =================================================
               CART ITEMS LIST
            ================================================= */

            <div className="cart-items-list">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={
                    item.supplier_product_id
                  }
                >

                  {/* PRODUCT IMAGE */}

                  <div className="cart-item-image">

                    {item.image ? (

                      <img
                        src={getProductImage(item.image)}
                        alt={
                          item.product_name
                        }
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <ShoppingCart
                        size={30}
                      />

                    )}

                  </div>


                  {/* PRODUCT DETAILS */}

                  <div className="cart-item-details">

                    <h3>
                      {item.product_name}
                    </h3>

                    <p>
                      {item.supplier_name}
                    </p>

                    <span>
                      ₹
                      {Number(
                        item.price || 0
                      ).toFixed(2)}
                      {" / "}
                      {item.unit}
                    </span>

                  </div>


                  {/* QUANTITY */}

                  <div className="cart-item-quantity">

                    <span>
                      Quantity
                    </span>

                    <div className="quantity-control">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item
                          )
                        }
                        disabled={
                          Number(
                            item.quantity
                          ) <=
                          Number(
                            item.minimum_order_quantity
                          )
                        }
                      >
                        <Minus
                          size={15}
                        />
                      </button>


                      <strong>
                        {item.quantity}
                      </strong>


                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item
                          )
                        }
                      >
                        <Plus
                          size={15}
                        />
                      </button>

                    </div>

                  </div>


                  {/* ITEM TOTAL */}

                  <div className="cart-item-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {(
                        Number(
                          item.price || 0
                        ) *
                        Number(
                          item.quantity || 0
                        )
                      ).toFixed(2)}
                    </strong>

                  </div>


                  {/* REMOVE */}

                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() =>
                      removeItem(
                        item.supplier_product_id
                      )
                    }
                    title="Remove from cart"
                  >
                    <Trash2
                      size={18}
                    />
                  </button>

                </div>

              ))}

            </div>

          )}

        </Card>


        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <Card>

          <div className="cart-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toFixed(2)}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                 GST (18%)
              </span>

              <strong>
                ₹
                {tax.toFixed(2)}
              </strong>

            </div>


            <div className="summary-divider"></div>


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {total.toFixed(2)}
              </strong>

            </div>


            <Button
  variant="primary"
  className="request-button"
  disabled={
    cart.length === 0 ||
    submittingRequest
  }
  onClick={handleCreateRequest}
>
  {submittingRequest
    ? "Creating Request..."
    : "Create Purchase Request"
  }

  <ArrowRight
    size={17}
  />
</Button>

          </div>

        </Card>

      </div>

    </div>
  );
};

export default Cart;