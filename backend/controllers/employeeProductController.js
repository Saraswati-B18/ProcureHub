const db = require("../config/db");

// =====================================================
// GET PRODUCTS AVAILABLE TO EMPLOYEES
// =====================================================

const getEmployeeProducts = (req, res) => {

    const sql = `
        SELECT
            sp.id AS supplier_product_id,

            p.id AS product_id,
            p.product_name,

            -- Description entered by the supplier
            sp.supplier_description,

            -- Master product description as fallback
            p.description,

            p.unit,
            p.image,

            c.id AS category_id,
            c.category_name,

            s.id AS supplier_id,
            s.supplier_name,

            sp.price,
            sp.stock_quantity,
            sp.minimum_order_quantity,
            sp.status AS supplier_product_status,

            CASE
                WHEN sp.stock_quantity > 0
                     AND sp.status = 'ACTIVE'
                THEN 'AVAILABLE'
                ELSE 'OUT_OF_STOCK'
            END AS availability

        FROM supplier_products sp

        INNER JOIN products p
            ON sp.product_id = p.id

        INNER JOIN categories c
            ON p.category_id = c.id

        INNER JOIN suppliers s
            ON sp.supplier_id = s.id

        WHERE
            sp.status = 'ACTIVE'
            AND sp.stock_quantity > 0
            AND p.status = 'ACTIVE'
            AND c.status = 'ACTIVE'
            AND s.status = 'ACTIVE'

        ORDER BY
            p.product_name ASC,
            s.supplier_name ASC
    `;


    db.query(sql, (error, results) => {

        if (error) {

            console.error(
                "Get employee products error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to fetch employee products."
            });
        }


        // =====================================================
        // GET ACTIVE CATEGORIES
        // =====================================================

        const categorySql = `
            SELECT
                id,
                category_name
            FROM categories
            WHERE status = 'ACTIVE'
            ORDER BY category_name ASC
        `;


        db.query(
            categorySql,
            (categoryError, categoryResults) => {

                if (categoryError) {

                    console.error(
                        "Get employee categories error:",
                        categoryError
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch product categories."
                    });
                }


                // =====================================================
                // SEND PRODUCTS + CATEGORIES
                // =====================================================

                res.json({

                    products: results,

                    categories: categoryResults

                });

            }
        );

    });
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getEmployeeProducts
};