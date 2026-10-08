const db = require("../config/db");

// ==========================================
// GET ALL USERS
// ==========================================

const getUsers = (req, res) => {

    const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.phone,
            u.status,
            u.created_at,

            u.company_id,
            u.branch_id,
            u.supplier_id,

            c.company_name,
            s.supplier_name,
            b.branch_name

        FROM users u

        LEFT JOIN companies c
            ON u.company_id = c.id

        LEFT JOIN suppliers s
            ON u.supplier_id = s.id

        LEFT JOIN branches b
            ON u.branch_id = b.id

        ORDER BY u.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get users error:", err);

            return res.status(500).json({
                message: "Failed to fetch users."
            });
        }

        res.json({
            users: results
        });
    });
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    getUsers
};