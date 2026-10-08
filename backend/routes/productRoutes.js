const express = require("express");

const router = express.Router();

const {
    getProducts,
    createProduct,
    updateProduct,
    deactivateProduct,
    activateProduct
} = require("../controllers/productController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// ==========================================
// GET ALL PRODUCTS
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getProducts
);


// ==========================================
// CREATE PRODUCT
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    createProduct
);


// ==========================================
// UPDATE PRODUCT
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    updateProduct
);


// ==========================================
// DEACTIVATE PRODUCT
// ==========================================

router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    deactivateProduct
);


// ==========================================
// ACTIVATE PRODUCT
// ==========================================

router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    activateProduct
);


module.exports = router;