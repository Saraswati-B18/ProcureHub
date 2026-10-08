import { ArrowLeft, Package, ShoppingCart, Truck } from "lucide-react";

import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";

import "./ProductDetails.css";

const ProductDetails = () => {
  return (
    <div className="product-details-page">

      <button className="back-button" type="button">
        <ArrowLeft size={17} />
        Back to Products
      </button>

      <div className="product-details-layout">

        <Card>
          <div className="product-image-placeholder">
            <Package size={70} />
            <span>Product Image</span>
          </div>
        </Card>

        <Card>
          <div className="product-info">

            <Badge variant="success">
              Available
            </Badge>

            <h1>Product Name</h1>

            <p className="product-description">
              Product description will appear here. Suppliers can
              provide detailed information about their products.
            </p>

            <div className="product-price">
              <span>Price</span>
              <strong>₹0.00</strong>
            </div>

            <div className="product-meta">
              <div>
                <Package size={18} />
                <span>Stock: 0 units</span>
              </div>

              <div>
                <Truck size={18} />
                <span>Supplier: Supplier Name</span>
              </div>
            </div>

            <div className="quantity-section">
              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                defaultValue="1"
              />
            </div>

            <Button variant="primary" className="add-cart-button">
              <ShoppingCart size={18} />
              Add to Cart
            </Button>

          </div>
        </Card>

      </div>

    </div>
  );
};

export default ProductDetails;