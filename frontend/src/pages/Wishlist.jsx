import { useEffect, useState } from "react";
import axios from "axios";

import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  ArrowLeft
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Wishlist.css";


const API_BASE_URL = "http://localhost:5000";


const Wishlist = () => {

  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // FETCH WISHLIST PRODUCTS
  // =====================================================

  const fetchWishlist = async () => {

    try {

      setLoading(true);

      const savedWishlist =
        localStorage.getItem(
          "procurehub_wishlist"
        );

      const wishlistIds = savedWishlist
        ? JSON.parse(savedWishlist)
        : [];


      if (wishlistIds.length === 0) {

        setProducts([]);

        setLoading(false);

        return;

      }


      const token =
        localStorage.getItem("token");


      const response = await axios.get(
        `${API_BASE_URL}/api/employee-products`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      const allProducts =
        response.data.products || [];


      const wishlistProducts =
        allProducts.filter(
          (product) =>
            wishlistIds.includes(
              product.supplier_product_id
            )
        );


      setProducts(
        wishlistProducts
      );

    } catch (error) {

      console.error(
        "Fetch wishlist failed:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchWishlist();

  }, []);


  // =====================================================
  // REMOVE FROM WISHLIST
  // =====================================================

  const removeFromWishlist = (
    productId
  ) => {

    const savedWishlist =
      localStorage.getItem(
        "procurehub_wishlist"
      );

    const wishlist = savedWishlist
      ? JSON.parse(savedWishlist)
      : [];


    const updatedWishlist =
      wishlist.filter(
        (id) => id !== productId
      );


    localStorage.setItem(
      "procurehub_wishlist",
      JSON.stringify(
        updatedWishlist
      )
    );


    setProducts(
      (previous) =>
        previous.filter(
          (product) =>
            product.supplier_product_id !==
            productId
        )
    );

  };


  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (product) => {

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


      alert(
        "Product added to cart."
      );

    } catch (error) {

      console.error(
        "Add to cart failed:",
        error
      );

    }

  };


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


  return (

    <div className="wishlist-page">


      {/* HEADER */}

      <div className="wishlist-header">

        <div>

          <button
            type="button"
            className="wishlist-back-button"
            onClick={() =>
              navigate("/employee/products")
            }
          >

            <ArrowLeft size={18} />

            Continue Shopping

          </button>


          <h1>
            My Wishlist
          </h1>

          <p>
            Products you have saved for later.
          </p>

        </div>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="wishlist-empty">

          <Package size={45} />

          <h3>
            Loading wishlist...
          </h3>

        </div>

      )}


      {/* EMPTY */}

      {!loading &&
      products.length === 0 && (

        <div className="wishlist-empty">

          <Heart size={52} />

          <h3>
            Your wishlist is empty
          </h3>

          <p>
            Save products you like and find
            them here later.
          </p>


          <button
            type="button"
            className="wishlist-shop-button"
            onClick={() =>
              navigate("/employee/products")
            }
          >

            Browse Products

          </button>

        </div>

      )}


      {/* WISHLIST PRODUCTS */}

      {!loading &&
      products.length > 0 && (

        <>

          <div className="wishlist-count">

            {products.length}{" "}
            {products.length === 1
              ? "Product"
              : "Products"}

          </div>


          <div className="wishlist-grid">

            {products.map(
              (product) => {

                const imageUrl =
                  getProductImage(
                    product.image
                  );


                return (

                  <div
                    className="wishlist-card"
                    key={
                      product.supplier_product_id
                    }
                  >


                    {/* IMAGE */}

                    <div className="wishlist-image">

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={
                            product.product_name
                          }
                        />

                      ) : (

                        <Package size={42} />

                      )}

                    </div>


                    {/* DETAILS */}

                    <div className="wishlist-product-info">

                      <h3>
                        {product.product_name}
                      </h3>


                      <p className="wishlist-supplier">

                        {product.supplier_name}

                      </p>


                      <div className="wishlist-price">

                        ₹
                        {Number(
                          product.price
                        ).toFixed(2)}

                        <span>
                          / {product.unit}
                        </span>

                      </div>


                      {/* ACTIONS */}

                      <div className="wishlist-actions">


                        <button
                          type="button"
                          className="wishlist-cart-button"
                          disabled={
                            product.availability !==
                            "AVAILABLE"
                          }
                          onClick={() =>
                            addToCart(product)
                          }
                        >

                          <ShoppingCart
                            size={16}
                          />

                          {product.availability ===
                          "AVAILABLE"
                            ? "Add to Cart"
                            : "Out of Stock"}

                        </button>


                        <button
                          type="button"
                          className="wishlist-remove-button"
                          onClick={() =>
                            removeFromWishlist(
                              product.supplier_product_id
                            )
                          }
                          title="Remove from wishlist"
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </>

      )}

    </div>

  );

};


export default Wishlist;