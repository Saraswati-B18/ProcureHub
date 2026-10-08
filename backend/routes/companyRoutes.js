const express = require("express");

const {
    createCompany,
    getCompanies,
    getCompanyStats,
    updateCompany,
    deleteCompany,
    deactivateCompany,
    activateCompany,
    getMyCompany,
    updateMyCompany
} = require("../controllers/companyController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


/* Create Company */

router.post(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    createCompany
);


/* Get Companies */

router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getCompanies
);



/* Get Company Statistics */

router.get(
    "/stats",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getCompanyStats
);

router.get(
    "/my-company",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    getMyCompany
);

router.put(
    "/my-company",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    updateMyCompany
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    updateCompany
);

router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    deactivateCompany
);

router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    activateCompany
);
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    deleteCompany
);


module.exports = router;