const db = require("../config/db");

// ==========================================
// GET ALL PRODUCTS
// ==========================================

const getProducts = (req, res) => {

    const sql = `
        SELECT
            p.id,
            p.product_name,
            p.description,
            p.unit,
            p.image,
            p.status,
            p.created_at,

            p.category_id,
            c.category_name,

            COUNT(DISTINCT sp.supplier_id) AS supplier_count

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.id

        LEFT JOIN supplier_products sp
            ON p.id = sp.product_id
            AND sp.status = 'ACTIVE'

        GROUP BY
            p.id,
            p.product_name,
            p.description,
            p.unit,
            p.image,
            p.status,
            p.created_at,
            p.category_id,
            c.category_name

        ORDER BY p.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get products error:", err);

            return res.status(500).json({
                message: "Failed to fetch products."
            });
        }

        res.json({
            products: results
        });
    });
};


// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = (req, res) => {

    const {
        category_id,
        product_name,
        description,
        unit,
        image
    } = req.body;


    // Required fields

    if (!category_id) {

        return res.status(400).json({
            message: "Category is required."
        });
    }


    if (!product_name || !product_name.trim()) {

        return res.status(400).json({
            message: "Product name is required."
        });
    }


    if (!unit || !unit.trim()) {

        return res.status(400).json({
            message: "Unit is required."
        });
    }


    // Check category

    const categorySql = `
        SELECT id, status
        FROM categories
        WHERE id = ?
    `;

    db.query(
        categorySql,
        [category_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Check product category error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check category."
                });
            }


            if (results.length === 0) {

                return res.status(400).json({
                    message: "Selected category does not exist."
                });
            }


            if (results[0].status !== "ACTIVE") {

                return res.status(400).json({
                    message:
                        "Cannot create product under an inactive category."
                });
            }


            // Check duplicate product name

            const duplicateSql = `
                SELECT id
                FROM products
                WHERE product_name = ?
            `;

            db.query(
                duplicateSql,
                [product_name.trim()],
                (err, duplicateResults) => {

                    if (err) {

                        console.error(
                            "Check duplicate product error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check product."
                        });
                    }


                    if (duplicateResults.length > 0) {

                        return res.status(400).json({
                            message:
                                "Product with this name already exists."
                        });
                    }


                    // Insert product

                    const insertSql = `
                        INSERT INTO products
                        (
                            category_id,
                            product_name,
                            description,
                            unit,
                            image,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, 'ACTIVE')
                    `;

                    db.query(
                        insertSql,
                        [
                            category_id,
                            product_name.trim(),
                            description || null,
                            unit.trim(),
                            image || null
                        ],
                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Create product error:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to create product."
                                });
                            }


                            res.status(201).json({
                                message:
                                    "Product created successfully.",
                                productId:
                                    result.insertId
                            });

                        }
                    );

                }
            );

        }
    );
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = (req, res) => {

    const { id } = req.params;

    const {
        category_id,
        product_name,
        description,
        unit,
        image
    } = req.body;


    if (!category_id) {

        return res.status(400).json({
            message: "Category is required."
        });
    }


    if (!product_name || !product_name.trim()) {

        return res.status(400).json({
            message: "Product name is required."
        });
    }


    if (!unit || !unit.trim()) {

        return res.status(400).json({
            message: "Unit is required."
        });
    }


    // Check category

    const categorySql = `
        SELECT id, status
        FROM categories
        WHERE id = ?
    `;

    db.query(
        categorySql,
        [category_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Check update category error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check category."
                });
            }


            if (results.length === 0) {

                return res.status(400).json({
                    message:
                        "Selected category does not exist."
                });
            }


            if (results[0].status !== "ACTIVE") {

                return res.status(400).json({
                    message:
                        "Cannot assign product to an inactive category."
                });
            }


            // Check duplicate product name

            const duplicateSql = `
                SELECT id
                FROM products
                WHERE product_name = ?
                AND id != ?
            `;

            db.query(
                duplicateSql,
                [
                    product_name.trim(),
                    id
                ],
                (err, duplicateResults) => {

                    if (err) {

                        console.error(
                            "Check product update error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check product."
                        });
                    }


                    if (duplicateResults.length > 0) {

                        return res.status(400).json({
                            message:
                                "Another product with this name already exists."
                        });
                    }


                    const updateSql = `
                        UPDATE products
                        SET
                            category_id = ?,
                            product_name = ?,
                            description = ?,
                            unit = ?,
                            image = ?
                        WHERE id = ?
                    `;

                    db.query(
                        updateSql,
                        [
                            category_id,
                            product_name.trim(),
                            description || null,
                            unit.trim(),
                            image || null,
                            id
                        ],
                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Update product error:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to update product."
                                });
                            }


                            if (
                                result.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    message:
                                        "Product not found."
                                });
                            }


                            res.json({
                                message:
                                    "Product updated successfully."
                            });

                        }
                    );

                }
            );

        }
    );
};


// ==========================================
// DEACTIVATE PRODUCT
// ==========================================

const deactivateProduct = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE products
        SET status = 'INACTIVE'
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "Deactivate product error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to deactivate product."
                });
            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Product not found."
                });
            }


            res.json({
                message:
                    "Product deactivated successfully."
            });

        }
    );
};


// ==========================================
// ACTIVATE PRODUCT
// ==========================================

const activateProduct = (req, res) => {

    const { id } = req.params;


    // Product can only be activated
    // if its category is active.

    const checkSql = `
        SELECT
            p.id,
            p.status,
            c.status AS category_status

        FROM products p

        INNER JOIN categories c
            ON p.category_id = c.id

        WHERE p.id = ?
    `;

    db.query(
        checkSql,
        [id],
        (err, results) => {

            if (err) {

                console.error(
                    "Check product activation error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check product."
                });
            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "Product not found."
                });
            }


            if (
                results[0].category_status !== "ACTIVE"
            ) {

                return res.status(400).json({
                    message:
                        "Cannot activate product because its category is inactive."
                });
            }


            const updateSql = `
                UPDATE products
                SET status = 'ACTIVE'
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [id],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Activate product error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to activate product."
                        });
                    }


                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(400).json({
                            message:
                                "Product is already active."
                        });
                    }


                    res.json({
                        message:
                            "Product activated successfully."
                    });

                }
            );

        }
    );
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deactivateProduct,
    activateProduct
};