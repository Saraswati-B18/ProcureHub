const express = require("express");

const {
    getFinanceApprovedRequests,
    getFinancePurchaseRequestDetails,
    processFinancePayment,
    getFinancePayments,
    getFinanceReports
} = require("../controllers/financeController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/approved-requests",
    authenticateToken,
    authorizeRoles("FINANCE"),
    getFinanceApprovedRequests
);

router.get(
    "/approved-requests/:id",
    authenticateToken,
    authorizeRoles("FINANCE"),
    getFinancePurchaseRequestDetails
);

router.post(
    "/approved-requests/:id/process-payment",
    authenticateToken,
    authorizeRoles("FINANCE"),
    processFinancePayment
);

router.get(
    "/payments",
    authenticateToken,
    authorizeRoles("FINANCE"),
    getFinancePayments
);

router.get(
    "/reports",
    authenticateToken,
    authorizeRoles("FINANCE"),
    getFinanceReports
);

module.exports = router;