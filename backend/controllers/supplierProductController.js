const db = require("../config/db");

// =====================================================
// GET MY PRODUCTS
// =====================================================

const getMySupplierProducts = (req, res) => {
    const supplierId = req.user.supplier_id;

    if (!supplierId) {
        return res.status(400).json({
            message: "Supplier account is not properly configured."
        });
    }

    const sql = `
        SELECT
            sp.id,
            sp.supplier_id,
            sp.product_id,
            sp.supplier_description,

            p.product_name,
            p.description,
            p.unit,
            p.image,
            p.status AS product_status,

            c.id AS category_id,
            c.category_name,

            sp.price,
            sp.stock_quantity,
            sp.minimum_order_quantity,
            sp.status,
            sp.created_at

        FROM supplier_products sp

        INNER JOIN products p
            ON sp.product_id = p.id

        LEFT JOIN categories c
            ON p.category_id = c.id

        WHERE sp.supplier_id = ?

        ORDER BY sp.id DESC
    `;

    db.query(sql, [supplierId], (err, results) => {

        if (err) {
            console.error(
                "Get supplier products error:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch supplier products."
            });
        }

        res.json({
            products: results
        });
    });
};


// =====================================================
// GET MASTER PRODUCTS AVAILABLE TO ADD
// =====================================================

const getAvailableProducts = (req, res) => {
    const supplierId = req.user.supplier_id;

    if (!supplierId) {
        return res.status(400).json({
            message: "Supplier account is not properly configured."
        });
    }

    const sql = `
        SELECT
            p.id,
            p.product_name,
            p.description,
            p.unit,
            p.image,
            p.category_id,
            c.category_name

        FROM products p

        INNER JOIN categories c
            ON p.category_id = c.id

        WHERE p.status = 'ACTIVE'
        AND c.status = 'ACTIVE'

        AND NOT EXISTS (
            SELECT 1
            FROM supplier_products sp
            WHERE sp.product_id = p.id
            AND sp.supplier_id = ?
        )

        ORDER BY p.product_name ASC
    `;

    db.query(sql, [supplierId], (err, results) => {

        if (err) {
            console.error(
                "Get available products error:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch available products."
            });
        }

        res.json({
            products: results
        });
    });
};


// =====================================================
// ADD PRODUCT TO SUPPLIER CATALOG
// =====================================================

const addSupplierProduct = (req, res) => {

    const supplierId = req.user.supplier_id;

    const {
        product_id,
        supplier_description,
        price,
        stock_quantity,
        minimum_order_quantity
    } = req.body;

    if (!supplierId) {
        return res.status(400).json({
            message: "Supplier account is not properly configured."
        });
    }

    if (!product_id) {
        return res.status(400).json({
            message: "Product is required."
        });
    }

    if (
        price === undefined ||
        price === null ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            message: "Please enter a valid price."
        });
    }

    if (
        stock_quantity === undefined ||
        stock_quantity === null ||
        Number(stock_quantity) < 0
    ) {
        return res.status(400).json({
            message: "Please enter a valid stock quantity."
        });
    }

    if (
        minimum_order_quantity === undefined ||
        minimum_order_quantity === null ||
        Number(minimum_order_quantity) <= 0
    ) {
        return res.status(400).json({
            message:
                "Minimum order quantity must be greater than 0."
        });
    }


    // Check master product

    const productSql = `
        SELECT
            p.id,
            p.status AS product_status,
            c.status AS category_status

        FROM products p

        INNER JOIN categories c
            ON p.category_id = c.id

        WHERE p.id = ?
    `;

    db.query(
        productSql,
        [product_id],
        (err, productResults) => {

            if (err) {
                console.error(
                    "Check supplier product error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to validate product."
                });
            }

            if (productResults.length === 0) {
                return res.status(404).json({
                    message: "Product not found."
                });
            }

            const product = productResults[0];

            if (product.product_status !== "ACTIVE") {
                return res.status(400).json({
                    message:
                        "This product is currently inactive."
                });
            }

            if (product.category_status !== "ACTIVE") {
                return res.status(400).json({
                    message:
                        "This product belongs to an inactive category."
                });
            }


            // Check duplicate supplier listing

            const duplicateSql = `
                SELECT id
                FROM supplier_products
                WHERE supplier_id = ?
                AND product_id = ?
            `;

            db.query(
                duplicateSql,
                [supplierId, product_id],
                (duplicateErr, duplicateResults) => {

                    if (duplicateErr) {
                        console.error(
                            "Check duplicate supplier product error:",
                            duplicateErr
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check existing product."
                        });
                    }

                    if (duplicateResults.length > 0) {
                        return res.status(400).json({
                            message:
                                "This product is already in your catalog."
                        });
                    }


                    // Insert supplier product

                    const insertSql = `
                        INSERT INTO supplier_products
                        (
                            supplier_id,
                            product_id,
                            supplier_description,
                            price,
                            stock_quantity,
                            minimum_order_quantity,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
                    `;

                    db.query(
                        insertSql,
                        [
                            supplierId,
                            product_id,
                            supplier_description?.trim() || "",
                            Number(price),
                            Number(stock_quantity),
                            Number(minimum_order_quantity)
                        ],
                        (insertErr, result) => {

                            if (insertErr) {
                                console.error(
                                    "Add supplier product error:",
                                    insertErr
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to add product."
                                });
                            }

                            res.status(201).json({
                                message:
                                    "Product added successfully.",
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


// =====================================================
// UPDATE SUPPLIER PRODUCT
// =====================================================

const updateSupplierProduct = (req, res) => {

    const supplierId = req.user.supplier_id;
    const { id } = req.params;

    const {
        supplier_description,
        price,
        stock_quantity,
        minimum_order_quantity
    } = req.body;

    if (!supplierId) {
        return res.status(400).json({
            message: "Supplier account is not properly configured."
        });
    }

    if (
        price === undefined ||
        price === null ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            message: "Please enter a valid price."
        });
    }

    if (
        stock_quantity === undefined ||
        stock_quantity === null ||
        Number(stock_quantity) < 0
    ) {
        return res.status(400).json({
            message: "Please enter a valid stock quantity."
        });
    }

    if (
        minimum_order_quantity === undefined ||
        minimum_order_quantity === null ||
        Number(minimum_order_quantity) <= 0
    ) {
        return res.status(400).json({
            message:
                "Minimum order quantity must be greater than 0."
        });
    }


    const sql = `
        UPDATE supplier_products

        SET
            supplier_description = ?,
            price = ?,
            stock_quantity = ?,
            minimum_order_quantity = ?

        WHERE id = ?
        AND supplier_id = ?
    `;

    db.query(
        sql,
        [
            supplier_description?.trim() || "",
            Number(price),
            Number(stock_quantity),
            Number(minimum_order_quantity),
            id,
            supplierId
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Update supplier product error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to update product."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Supplier product not found."
                });
            }

            res.json({
                message:
                    "Supplier product updated successfully."
            });
        }
    );
};


// =====================================================
// DEACTIVATE SUPPLIER PRODUCT
// =====================================================

const deactivateSupplierProduct = (req, res) => {

    const supplierId = req.user.supplier_id;
    const { id } = req.params;

    const sql = `
        UPDATE supplier_products

        SET status = 'INACTIVE'

        WHERE id = ?
        AND supplier_id = ?
    `;

    db.query(
        sql,
        [id, supplierId],
        (err, result) => {

            if (err) {
                console.error(
                    "Deactivate supplier product error:",
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
                        "Supplier product not found."
                });
            }

            res.json({
                message:
                    "Supplier product deactivated successfully."
            });
        }
    );
};


// =====================================================
// ACTIVATE SUPPLIER PRODUCT
// =====================================================

const activateSupplierProduct = (req, res) => {

    const supplierId = req.user.supplier_id;
    const { id } = req.params;

    const checkSql = `
        SELECT
            sp.id,
            p.status AS product_status,
            c.status AS category_status

        FROM supplier_products sp

        INNER JOIN products p
            ON sp.product_id = p.id

        INNER JOIN categories c
            ON p.category_id = c.id

        WHERE sp.id = ?
        AND sp.supplier_id = ?
    `;

    db.query(
        checkSql,
        [id, supplierId],
        (err, results) => {

            if (err) {
                console.error(
                    "Check supplier product activation error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to validate product."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Supplier product not found."
                });
            }

            const product = results[0];

            if (product.product_status !== "ACTIVE") {
                return res.status(400).json({
                    message:
                        "The master product is inactive. It cannot be activated."
                });
            }

            if (product.category_status !== "ACTIVE") {
                return res.status(400).json({
                    message:
                        "The product category is inactive. It cannot be activated."
                });
            }


            const updateSql = `
                UPDATE supplier_products

                SET status = 'ACTIVE'

                WHERE id = ?
                AND supplier_id = ?
            `;

            db.query(
                updateSql,
                [id, supplierId],
                (updateErr, result) => {

                    if (updateErr) {
                        console.error(
                            "Activate supplier product error:",
                            updateErr
                        );

                        return res.status(500).json({
                            message:
                                "Failed to activate product."
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message:
                                "Supplier product not found."
                        });
                    }

                    res.json({
                        message:
                            "Supplier product activated successfully."
                    });
                }
            );
        }
    );
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getMySupplierProducts,
    getAvailableProducts,
    addSupplierProduct,
    updateSupplierProduct,
    deactivateSupplierProduct,
    activateSupplierProduct
};