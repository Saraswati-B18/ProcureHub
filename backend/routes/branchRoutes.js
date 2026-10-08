const express = require("express");

const {
    getMyBranches,
    getBranchDetails,
    createBranch,
    updateBranch,
    deactivateBranch,
    activateBranch
} = require("../controllers/branchController");
const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all branches belonging to logged-in company
router.get(
    "/my-branches",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    getMyBranches
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    getBranchDetails
);


// Create branch
router.post(
    "/",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    createBranch
);


// Update branch
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    updateBranch
);


// Deactivate branch
router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    deactivateBranch
);


// Activate branch
router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    activateBranch
);


module.exports = router;