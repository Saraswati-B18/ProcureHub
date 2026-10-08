const express = require("express");

const router = express.Router();

const {
    getCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
    activateCategory
} = require("../controllers/categoryController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// ==========================================
// GET ALL CATEGORIES
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getCategories
);


// ==========================================
// CREATE CATEGORY
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    createCategory
);


// ==========================================
// UPDATE CATEGORY
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    updateCategory
);


// ==========================================
// DEACTIVATE CATEGORY
// ==========================================

router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    deactivateCategory
);


// ==========================================
// ACTIVATE CATEGORY
// ==========================================

router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    activateCategory
);


module.exports = router;