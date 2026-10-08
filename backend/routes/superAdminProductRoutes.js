const express = require("express");
const router = express.Router();

const {
    getSuperAdminProducts,
    getSuperAdminProductById,
    createSuperAdminProduct,
    updateSuperAdminProduct,
    deactivateSuperAdminProduct,
    activateSuperAdminProduct
} = require("../controllers/superAdminProductController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const uploadProductImage = require("../middleware/productUpload");


// GET ALL PRODUCTS
router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getSuperAdminProducts
);


// GET SINGLE PRODUCT
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getSuperAdminProductById
);


// CREATE PRODUCT WITH IMAGE
router.post(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    uploadProductImage.single("image"),
    createSuperAdminProduct
);


// UPDATE PRODUCT
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    uploadProductImage.single("image"),
    updateSuperAdminProduct
);


// DEACTIVATE PRODUCT
router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    deactivateSuperAdminProduct
);


// ACTIVATE PRODUCT
router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    activateSuperAdminProduct
);


module.exports = router;