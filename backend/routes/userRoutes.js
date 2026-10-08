const express = require("express");

const router = express.Router();

const {
    getUsers
} = require("../controllers/userController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("SUPER_ADMIN"),
    getUsers
);


module.exports = router;