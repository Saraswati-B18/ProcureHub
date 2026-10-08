const express = require("express");

const {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    activateSupplier,
    getSupplierOrders,
    updateSupplierOrderStatus,
    getSupplierInvoices,
    getSupplierReports
} = require("../controllers/supplierController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    createSupplier
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getSuppliers
);

router.get(
    "/orders",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    getSupplierOrders
);

router.put(
    "/orders/:id/status",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    updateSupplierOrderStatus
);

router.get(
    "/invoices",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    getSupplierInvoices
);

router.get(
    "/reports",
    authenticateToken,
    authorizeRoles("SUPPLIER"),
    getSupplierReports
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN", "SUPPLIER"),
    updateSupplier
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    deleteSupplier
);

router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    activateSupplier
);
module.exports = router;