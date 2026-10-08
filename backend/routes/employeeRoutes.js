const express = require("express");

const {
    getMyEmployees,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    activateEmployee
} = require("../controllers/employeeController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


/* =====================================================
   GET COMPANY USERS
===================================================== */

router.get(
    "/my-employees",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    getMyEmployees
);


/* =====================================================
   CREATE USER
===================================================== */

router.post(
    "/",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    createEmployee
);


/* =====================================================
   UPDATE USER
===================================================== */

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    updateEmployee
);


/* =====================================================
   DEACTIVATE USER
===================================================== */

router.put(
    "/:id/deactivate",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    deactivateEmployee
);


/* =====================================================
   ACTIVATE USER
===================================================== */

router.put(
    "/:id/activate",
    authenticateToken,
    authorizeRoles("COMPANY_ADMIN"),
    activateEmployee
);


module.exports = router;