const express = require("express");

const {
    createPurchaseRequest,
    getMyPurchaseRequests,
    getPurchaseRequestDetails,
    getManagerPendingRequests,
    getManagerPurchaseRequestDetails,
    getManagerApprovedRequests,
    getManagerRejectedRequests,
    getManagerOrders,
    getManagerOrderDetails,
    getCompanyAdminOrders,
getCompanyAdminOrderDetails,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    getMyOrders,
    getMyOrderDetails
} = require("../controllers/purchaseRequestController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CREATE PURCHASE REQUEST - EMPLOYEE
// =====================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    createPurchaseRequest
);


// =====================================================
// GET MY PURCHASE REQUESTS - EMPLOYEE
// =====================================================

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    getMyPurchaseRequests
);

router.get(
    "/orders",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    getMyOrders
);

router.get(
    "/orders/:id",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    getMyOrderDetails
);

// MANAGER - GET APPROVED PURCHASE REQUESTS
router.get(
    "/manager/approved",
    authenticateToken,
    authorizeRoles("MANAGER"),
    getManagerApprovedRequests
);


// MANAGER - GET REJECTED PURCHASE REQUESTS
router.get(
    "/manager/rejected",
    authenticateToken,
    authorizeRoles("MANAGER"),
    getManagerRejectedRequests
);


// =====================================================
// MANAGER - GET ORDERS
// =====================================================

router.get(
    "/manager/orders",
    authenticateToken,
    authorizeRoles("MANAGER"),
    getManagerOrders
);

// =====================================================
// MANAGER - GET ORDER DETAILS
// =====================================================

router.get(
    "/manager/orders/:id",
    authenticateToken,
    authorizeRoles("MANAGER"),
    getManagerOrderDetails
);

// =====================================================
// COMPANY ADMIN - GET ORDERS
// =====================================================

router.get(
    "/company-admin/orders",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    getCompanyAdminOrders
);


// =====================================================
// COMPANY ADMIN - GET ORDER DETAILS
// =====================================================

router.get(
    "/company-admin/orders/:id",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    getCompanyAdminOrderDetails
);

// =====================================================
// GET SINGLE PURCHASE REQUEST - EMPLOYEE
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    getPurchaseRequestDetails
);


// =====================================================
// MANAGER - GET PENDING PURCHASE REQUESTS
// =====================================================

router.get(
    "/manager/pending",
    authenticateToken,
    authorizeRoles("MANAGER"),
    getManagerPendingRequests
);




// =====================================================
// MANAGER - GET PURCHASE REQUEST DETAILS
// =====================================================

router.get(
    "/manager/:id",
    authenticateToken,
    authorizeRoles("MANAGER"),
    getManagerPurchaseRequestDetails
);


// =====================================================
// MANAGER - APPROVE PURCHASE REQUEST
// =====================================================

router.put(
    "/manager/:id/approve",
    authenticateToken,
    authorizeRoles("MANAGER"),
    approvePurchaseRequest
);


// =====================================================
// MANAGER - REJECT PURCHASE REQUEST
// =====================================================

router.put(
    "/manager/:id/reject",
    authenticateToken,
    authorizeRoles("MANAGER"),
    rejectPurchaseRequest
);


module.exports = router;