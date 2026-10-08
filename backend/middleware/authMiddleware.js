const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login first."
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET || "procurehub_secret_key",
        (err, user) => {
            if (err) {
                return res.status(403).json({
                    message: "Invalid or expired token."
                });
            }

            req.user = user;
            next();
        }
    );
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission."
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};