const express = require("express");

const {
    getEmployeeProducts
} = require("../controllers/employeeProductController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// Employee product catalog
router.get(
    "/",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    getEmployeeProducts
);


module.exports = router;