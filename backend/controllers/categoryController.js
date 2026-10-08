const db = require("../config/db");

// ==========================================
// GET ALL CATEGORIES
// ==========================================

const getCategories = (req, res) => {

    const sql = `
        SELECT
            c.id,
            c.category_name,
            c.description,
            c.status,
            c.created_at,

            COUNT(p.id) AS product_count

        FROM categories c

        LEFT JOIN products p
            ON c.id = p.category_id

        GROUP BY
            c.id,
            c.category_name,
            c.description,
            c.status,
            c.created_at

        ORDER BY c.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get categories error:", err);

            return res.status(500).json({
                message: "Failed to fetch categories."
            });
        }

        res.json({
            categories: results
        });
    });
};


// ==========================================
// CREATE CATEGORY
// ==========================================

const createCategory = (req, res) => {

    const {
        category_name,
        description
    } = req.body;

    if (!category_name || !category_name.trim()) {

        return res.status(400).json({
            message: "Category name is required."
        });
    }

    const checkSql = `
        SELECT id
        FROM categories
        WHERE category_name = ?
    `;

    db.query(
        checkSql,
        [category_name.trim()],
        (err, results) => {

            if (err) {
                console.error(
                    "Check category error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check category."
                });
            }

            if (results.length > 0) {

                return res.status(400).json({
                    message: "Category already exists."
                });
            }

            const insertSql = `
                INSERT INTO categories
                (
                    category_name,
                    description,
                    status
                )
                VALUES (?, ?, 'ACTIVE')
            `;

            db.query(
                insertSql,
                [
                    category_name.trim(),
                    description || null
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Create category error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to create category."
                        });
                    }

                    res.status(201).json({
                        message: "Category created successfully.",
                        categoryId: result.insertId
                    });

                }
            );

        }
    );
};


// ==========================================
// UPDATE CATEGORY
// ==========================================

const updateCategory = (req, res) => {

    const { id } = req.params;

    const {
        category_name,
        description
    } = req.body;

    if (!category_name || !category_name.trim()) {

        return res.status(400).json({
            message: "Category name is required."
        });
    }

    const checkSql = `
        SELECT id
        FROM categories
        WHERE category_name = ?
        AND id != ?
    `;

    db.query(
        checkSql,
        [
            category_name.trim(),
            id
        ],
        (err, results) => {

            if (err) {
                console.error(
                    "Check category update error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check category."
                });
            }

            if (results.length > 0) {

                return res.status(400).json({
                    message: "Another category with this name already exists."
                });
            }

            const updateSql = `
                UPDATE categories
                SET
                    category_name = ?,
                    description = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [
                    category_name.trim(),
                    description || null,
                    id
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Update category error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to update category."
                        });
                    }

                    if (result.affectedRows === 0) {

                        return res.status(404).json({
                            message: "Category not found."
                        });
                    }

                    res.json({
                        message: "Category updated successfully."
                    });

                }
            );

        }
    );
};


// ==========================================
// DEACTIVATE CATEGORY
// ==========================================

const deactivateCategory = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE categories
        SET status = 'INACTIVE'
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error(
                "Deactivate category error:",
                err
            );

            return res.status(500).json({
                message: "Failed to deactivate category."
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Category not found."
            });
        }

        res.json({
            message: "Category deactivated successfully."
        });

    });
};


// ==========================================
// ACTIVATE CATEGORY
// ==========================================

const activateCategory = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE categories
        SET status = 'ACTIVE'
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error(
                "Activate category error:",
                err
            );

            return res.status(500).json({
                message: "Failed to activate category."
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Category not found."
            });
        }

        res.json({
            message: "Category activated successfully."
        });

    });
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
    activateCategory
};