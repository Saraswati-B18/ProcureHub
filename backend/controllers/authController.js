const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
    const { email, password } = req.body;

    // Check if email and password were provided
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    // Find user by email
    const sql = `
    SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.role,
        u.phone,
        u.status,
        u.company_id,
        u.branch_id,
        u.supplier_id,

        c.company_name,
        c.email AS company_email,
        c.phone AS company_phone,
        c.address AS company_address,
        c.city AS company_city,
        c.state AS company_state,

        b.branch_name,

        s.supplier_name,
        s.email AS supplier_email,
        s.phone AS supplier_phone,
        s.address AS supplier_address,
        s.city AS supplier_city,
        s.state AS supplier_state

    FROM users u

    LEFT JOIN companies c
        ON u.company_id = c.id

    LEFT JOIN branches b
        ON u.branch_id = b.id

    LEFT JOIN suppliers s
        ON u.supplier_id = s.id

    WHERE u.email = ?
    AND u.status = 'ACTIVE'
`;

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Login error:", err);
            return res.status(500).json({
                message: "Server error"
            });
        }

        // User not found
        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                company_id: user.company_id,
                branch_id: user.branch_id,
                supplier_id: user.supplier_id
            },
            process.env.JWT_SECRET || "procurehub_secret_key",
            {
                expiresIn: "1d"
            }
        );

        // Send response
        res.json({
            message: "Login successful",
            token,
            user: {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,

    company_id: user.company_id,
    company_name: user.company_name,
    company_email: user.company_email,
    company_phone: user.company_phone,
    company_address: user.company_address,
    company_city: user.company_city,
    company_state: user.company_state,

    branch_id: user.branch_id,
    branch_name: user.branch_name,

    supplier_id: user.supplier_id,
    supplier_name: user.supplier_name,
    supplier_email: user.supplier_email,
    supplier_phone: user.supplier_phone,
    supplier_address: user.supplier_address,
    supplier_city: user.supplier_city,
    supplier_state: user.supplier_state
}
               });
    });
};


// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = (req, res) => {

    const userId = req.user.id;

    const {
        name,
        email,
        phone,

        supplier_name,
        supplier_email,
        supplier_phone,
        supplier_address,
        supplier_city,
        supplier_state
    } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Name is required."
        });
    }

    if (!email || !email.trim()) {
        return res.status(400).json({
            message: "Email is required."
        });
    }

    if (!phone || !phone.trim()) {
        return res.status(400).json({
            message: "Phone number is required."
        });
    }

    const checkEmailSql = `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
    `;

    db.query(
        checkEmailSql,
        [
            email.trim(),
            userId
        ],
        (err, results) => {

            if (err) {
                console.error(
                    "Check profile email error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check email."
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "Email is already in use."
                });
            }

            const updateUserSql = `
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    phone = ?
                WHERE id = ?
            `;

            db.query(
                updateUserSql,
                [
                    name.trim(),
                    email.trim(),
                    phone.trim(),
                    userId
                ],
                (err) => {

                    if (err) {
                        console.error(
                            "Update user profile error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to update profile."
                        });
                    }

                    // ------------------------------------------
                    // Supplier organization update
                    // ------------------------------------------

                    if (req.user.role !== "SUPPLIER") {

                        return res.json({
                            message: "Profile updated successfully."
                        });
                    }

                    const supplierId = req.user.supplier_id;

                    if (!supplierId) {
                        return res.status(400).json({
                            message: "Supplier account is not linked to a supplier."
                        });
                    }

                    if (
                        !supplier_name ||
                        !supplier_name.trim() ||
                        !supplier_email ||
                        !supplier_email.trim() ||
                        !supplier_phone ||
                        !supplier_phone.trim() ||
                        !supplier_address ||
                        !supplier_address.trim() ||
                        !supplier_city ||
                        !supplier_city.trim() ||
                        !supplier_state ||
                        !supplier_state.trim()
                    ) {
                        return res.status(400).json({
                            message: "All supplier organization fields are required."
                        });
                    }

                    const updateSupplierSql = `
                        UPDATE suppliers
                        SET
                            supplier_name = ?,
                            email = ?,
                            phone = ?,
                            address = ?,
                            city = ?,
                            state = ?
                        WHERE id = ?
                    `;

                    db.query(
                        updateSupplierSql,
                        [
                            supplier_name.trim(),
                            supplier_email.trim(),
                            supplier_phone.trim(),
                            supplier_address.trim(),
                            supplier_city.trim(),
                            supplier_state.trim(),
                            supplierId
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Update supplier profile error:",
                                    err
                                );

                                return res.status(500).json({
                                    message: "Failed to update supplier organization."
                                });
                            }

                            if (result.affectedRows === 0) {
                                return res.status(404).json({
                                    message: "Supplier not found."
                                });
                            }

                            res.json({
                                message: "Profile updated successfully."
                            });

                        }
                    );

                }
            );

        }
    );
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {

    const userId = req.user.id;

    const {
        current_password,
        new_password,
        confirm_password
    } = req.body;


    // ------------------------------------------
    // Validate fields
    // ------------------------------------------

    if (
        !current_password ||
        !new_password ||
        !confirm_password
    ) {
        return res.status(400).json({
            message: "All password fields are required."
        });
    }


    // ------------------------------------------
    // Check new password confirmation
    // ------------------------------------------

    if (new_password !== confirm_password) {

        return res.status(400).json({
            message: "New passwords do not match."
        });
    }


    // ------------------------------------------
    // Password length
    // ------------------------------------------

    if (new_password.length < 6) {

        return res.status(400).json({
            message: "New password must be at least 6 characters."
        });
    }


    // ------------------------------------------
    // Get current password
    // ------------------------------------------

    const sql = `
        SELECT password
        FROM users
        WHERE id = ?
        AND status = 'ACTIVE'
    `;

    db.query(
        sql,
        [userId],
        async (err, results) => {

            if (err) {

                console.error(
                    "Get password error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to verify current password."
                });
            }


            if (results.length === 0) {

                return res.status(404).json({
                    message: "User account not found."
                });
            }


            const user = results[0];


            // ------------------------------------------
            // Verify current password
            // ------------------------------------------

            const passwordMatch = await bcrypt.compare(
                current_password,
                user.password
            );


            if (!passwordMatch) {

                return res.status(400).json({
                    message: "Current password is incorrect."
                });
            }


            // ------------------------------------------
            // Hash new password
            // ------------------------------------------

            const hashedPassword = await bcrypt.hash(
                new_password,
                10
            );


            // ------------------------------------------
            // Update password
            // ------------------------------------------

            const updateSql = `
                UPDATE users
                SET password = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [
                    hashedPassword,
                    userId
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Update password error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to update password."
                        });
                    }


                    if (result.affectedRows === 0) {

                        return res.status(400).json({
                            message: "Password was not updated."
                        });
                    }


                    res.json({
                        message: "Password changed successfully."
                    });

                }
            );

        }
    );
};

module.exports = {
    login,
    updateProfile,
    changePassword
};