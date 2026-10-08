const express = require("express");

const router = express.Router();

const {
    getMySupplierProducts,
    getAvailableProducts,
    addSupplierProduct,
    updateSupplierProduct,
    deactivateSupplierProduct,
    activateSupplierProduct
} = require("../controllers/supplierProductController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// GET MY PRODUCTS
router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    getMySupplierProducts
);


// GET MASTER PRODUCTS AVAILABLE TO ADD
router.get(
    "/available",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    getAvailableProducts
);


// ADD PRODUCT
router.post(
    "/",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    addSupplierProduct
);


// UPDATE PRODUCT
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    updateSupplierProduct
);


// DEACTIVATE PRODUCT
router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    deactivateSupplierProduct
);


// ACTIVATE PRODUCT
router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    activateSupplierProduct
);


module.exports = router;