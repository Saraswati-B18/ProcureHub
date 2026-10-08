const db = require("../config/db");

// GET ALL MASTER PRODUCTS
const getSuperAdminProducts = (req, res) => {
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

            COUNT(DISTINCT sp.supplier_id) AS supplier_count,

            COALESCE(
                SUM(sp.stock_quantity),
                0
            ) AS available_stock

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
            console.error("Get Super Admin products error:", err);

            return res.status(500).json({
                message: "Failed to fetch products."
            });
        }

        res.json({
            products: results
        });
    });
};


// CREATE MASTER PRODUCT

const createSuperAdminProduct = (req, res) => {

    const {
        category_id,
        product_name,
        description,
        unit
    } = req.body;

    const image = req.file
        ? `/uploads/products/${req.file.filename}`
        : null;


    if (!category_id || !product_name || !unit) {
        return res.status(400).json({
            message: "Category, product name and unit are required."
        });
    }


    const checkCategorySql = `
        SELECT id, status
        FROM categories
        WHERE id = ?
    `;


    db.query(
        checkCategorySql,
        [category_id],
        (err, categoryResults) => {

            if (err) {
                console.error("Category check error:", err);

                return res.status(500).json({
                    message: "Failed to validate category."
                });
            }


            if (categoryResults.length === 0) {
                return res.status(400).json({
                    message: "Category not found."
                });
            }


            if (categoryResults[0].status !== "ACTIVE") {
                return res.status(400).json({
                    message: "Cannot create product under an inactive category."
                });
            }


            const checkProductSql = `
                SELECT id
                FROM products
                WHERE product_name = ?
            `;


            db.query(
                checkProductSql,
                [product_name.trim()],
                (err, productResults) => {

                    if (err) {
                        console.error(
                            "Product duplicate check error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to validate product."
                        });
                    }


                    if (productResults.length > 0) {
                        return res.status(400).json({
                            message: "Product already exists."
                        });
                    }


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
                            unit,
                            image
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Create product error:",
                                    err
                                );

                                return res.status(500).json({
                                    message: "Failed to create product."
                                });
                            }


                            res.status(201).json({
                                message: "Product created successfully.",
                                product: {
                                    id: result.insertId,
                                    product_name: product_name.trim(),
                                    image: image
                                }
                            });

                        }
                    );

                }
            );

        }
    );

};


// UPDATE MASTER PRODUCT
const updateSuperAdminProduct = (req, res) => {
    const { id } = req.params;

    const {
    category_id,
    product_name,
    description,
    unit
} = req.body;

const image = req.file
    ? `/uploads/products/${req.file.filename}`
    : null;

    if (!category_id || !product_name || !unit) {
        return res.status(400).json({
            message: "Category, product name and unit are required."
        });
    }

    const checkCategorySql = `
        SELECT id, status
        FROM categories
        WHERE id = ?
    `;

    db.query(checkCategorySql, [category_id], (err, categoryResults) => {

        if (err) {
            console.error("Category check error:", err);

            return res.status(500).json({
                message: "Failed to validate category."
            });
        }

        if (categoryResults.length === 0) {
            return res.status(400).json({
                message: "Category not found."
            });
        }

        if (categoryResults[0].status !== "ACTIVE") {
            return res.status(400).json({
                message: "Cannot use an inactive category."
            });
        }

        const checkProductSql = `
            SELECT id
            FROM products
            WHERE product_name = ?
            AND id != ?
        `;

        db.query(
            checkProductSql,
            [product_name.trim(), id],
            (err, productResults) => {

                if (err) {
                    console.error("Product duplicate check error:", err);

                    return res.status(500).json({
                        message: "Failed to validate product."
                    });
                }

                if (productResults.length > 0) {
                    return res.status(400).json({
                        message: "Another product with this name already exists."
                    });
                }

                const updateSql = `
    UPDATE products
    SET
        category_id = ?,
        product_name = ?,
        description = ?,
        unit = ?,
        image = COALESCE(?, image)
    WHERE id = ?
`;

                db.query(
                    updateSql,
                    [
    category_id,
    product_name.trim(),
    description || null,
    unit,
    image,
    id
],
                    (err, result) => {

                        if (err) {
                            console.error("Update product error:", err);

                            return res.status(500).json({
                                message: "Failed to update product."
                            });
                        }

                        if (result.affectedRows === 0) {
                            return res.status(404).json({
                                message: "Product not found."
                            });
                        }

                        res.json({
                            message: "Product updated successfully."
                        });
                    }
                );
            }
        );
    });
};


// DEACTIVATE MASTER PRODUCT
const deactivateSuperAdminProduct = (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE products
        SET status = 'INACTIVE'
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Deactivate product error:", err);

            return res.status(500).json({
                message: "Failed to deactivate product."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.json({
            message: "Product deactivated successfully."
        });
    });
};


// ACTIVATE MASTER PRODUCT
const activateSuperAdminProduct = (req, res) => {
    const { id } = req.params;

    const checkProductSql = `
        SELECT
            p.id,
            p.status,
            c.status AS category_status
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = ?
    `;

    db.query(checkProductSql, [id], (err, results) => {

        if (err) {
            console.error("Check product error:", err);

            return res.status(500).json({
                message: "Failed to check product."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        if (results[0].status === "ACTIVE") {
            return res.status(400).json({
                message: "Product is already active."
            });
        }

        if (results[0].category_status !== "ACTIVE") {
            return res.status(400).json({
                message: "Cannot activate product because its category is inactive."
            });
        }

        const updateSql = `
            UPDATE products
            SET status = 'ACTIVE'
            WHERE id = ?
        `;

        db.query(updateSql, [id], (err) => {

            if (err) {
                console.error("Activate product error:", err);

                return res.status(500).json({
                    message: "Failed to activate product."
                });
            }

            res.json({
                message: "Product activated successfully."
            });
        });
    });
};

// GET SINGLE PRODUCT DETAILS
const getSuperAdminProductById = (req, res) => {
    const { id } = req.params;

    const productSql = `
        SELECT
            p.id,
            p.product_name,
            p.description,
            p.unit,
            p.image,
            p.status,
            p.created_at,
            p.category_id,
            c.category_name
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = ?
    `;

    db.query(productSql, [id], (err, productResults) => {

        if (err) {
            console.error("Get product details error:", err);

            return res.status(500).json({
                message: "Failed to fetch product details."
            });
        }

        if (productResults.length === 0) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        const supplierSql = `
            SELECT
                sp.id,
                sp.supplier_id,
                s.supplier_name,
                s.status AS supplier_status,
                sp.price,
                sp.stock_quantity,
                sp.minimum_order_quantity,
                sp.status
            FROM supplier_products sp
            INNER JOIN suppliers s
                ON sp.supplier_id = s.id
            WHERE sp.product_id = ?
            ORDER BY sp.id DESC
        `;

        db.query(
            supplierSql,
            [id],
            (supplierErr, supplierResults) => {

                if (supplierErr) {
                    console.error(
                        "Get product suppliers error:",
                        supplierErr
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch supplier details."
                    });
                }

                res.json({
                    product: productResults[0],
                    suppliers: supplierResults
                });
            }
        );
    });
};


module.exports = {
    getSuperAdminProducts,
    getSuperAdminProductById,
    createSuperAdminProduct,
    updateSuperAdminProduct,
    deactivateSuperAdminProduct,
    activateSuperAdminProduct
}