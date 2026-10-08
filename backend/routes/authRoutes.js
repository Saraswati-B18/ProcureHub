const express = require("express");

const {
    login,
    updateProfile,
    changePassword
} = require("../controllers/authController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// LOGIN
// ==========================================

router.post(
    "/login",
    login
);


// ==========================================
// UPDATE PROFILE
// ==========================================

router.put(
    "/profile",
    authenticateToken,
    updateProfile
);


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
    "/change-password",
    authenticateToken,
    changePassword
);


module.exports = router;