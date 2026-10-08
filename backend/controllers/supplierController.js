const db = require("../config/db");
const bcrypt = require("bcryptjs");

const createSupplier = async (req, res) => {
    const {
        supplier_name,
        email,
        phone,
        address,
        city,
        state,
        admin_name,
        admin_email,
        admin_password,
        admin_phone
    } = req.body;

    // Check all required fields
    if (
        !supplier_name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !admin_name ||
        !admin_email ||
        !admin_password ||
        !admin_phone
    ) {
        return res.status(400).json({
            message: "All fields are required. Please fill in all fields."
        });
    }

    // Supplier name validation
    if (/^\d+$/.test(supplier_name.trim())) {
        return res.status(400).json({
            message: "Supplier name cannot contain only numbers."
        });
    }

    // Admin name validation
    if (/^\d+$/.test(admin_name.trim())) {
        return res.status(400).json({
            message: "Admin name cannot contain only numbers."
        });
    }

    // Email validation
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid supplier email address."
        });
    }

    if (!emailPattern.test(admin_email)) {
        return res.status(400).json({
            message: "Please enter a valid admin email address."
        });
    }

    // Phone validation - exactly 10 digits
    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(phone)) {
        return res.status(400).json({
            message: "Supplier phone number must be a valid 10-digit number."
        });
    }

    if (!phonePattern.test(admin_phone)) {
        return res.status(400).json({
            message: "Admin phone number must be a valid 10-digit number."
        });
    }

    // Password validation
    if (admin_password.length < 6) {
        return res.status(400).json({
            message: "Admin password must contain at least 6 characters."
        });
    }

    try {

        // Check supplier email
        db.query(
            "SELECT id FROM suppliers WHERE email = ?",
            [email],
            async (supplierEmailErr, supplierResults) => {

                if (supplierEmailErr) {
                    console.error(
                        "Supplier email check error:",
                        supplierEmailErr
                    );

                    return res.status(500).json({
                        message: "Server error"
                    });
                }

                if (supplierResults.length > 0) {
                    return res.status(409).json({
                        message: "Supplier email already exists."
                    });
                }

                // Check admin email
                db.query(
                    "SELECT id, role FROM users WHERE email = ?",
                    [admin_email],
                    async (userEmailErr, userResults) => {

                        if (userEmailErr) {
                            console.error(
                                "Admin email check error:",
                                userEmailErr
                            );

                            return res.status(500).json({
                                message: "Server error"
                            });
                        }

                        if (userResults.length > 0) {
                            return res.status(409).json({
                                message:
                                    "This admin email is already registered. Please use a different email."
                            });
                        }

                        const hashedPassword =
                            await bcrypt.hash(admin_password, 10);

                        // Start transaction
                        db.beginTransaction((transactionErr) => {

                            if (transactionErr) {
                                console.error(
                                    "Transaction start error:",
                                    transactionErr
                                );

                                return res.status(500).json({
                                    message:
                                        "Could not start database transaction."
                                });
                            }

                            // 1. Create Supplier
                            const supplierSql = `
                                INSERT INTO suppliers
                                (
                                    supplier_name,
                                    email,
                                    phone,
                                    address,
                                    city,
                                    state,
                                    status
                                )
                                VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
                            `;

                            db.query(
                                supplierSql,
                                [
                                    supplier_name.trim(),
                                    email.trim(),
                                    phone.trim(),
                                    address.trim(),
                                    city.trim(),
                                    state.trim()
                                ],
                                (supplierErr, supplierResult) => {

                                    if (supplierErr) {
                                        return db.rollback(() => {

                                            console.error(
                                                "Supplier creation error:",
                                                supplierErr
                                            );

                                            res.status(500).json({
                                                message:
                                                    "Failed to create supplier."
                                            });
                                        });
                                    }

                                    const supplierId =
                                        supplierResult.insertId;

                                    // 2. Create Supplier Login
                                    const userSql = `
                                        INSERT INTO users
                                        (
                                            supplier_id,
                                            name,
                                            email,
                                            password,
                                            role,
                                            phone,
                                            status
                                        )
                                        VALUES (?, ?, ?, ?, 'SUPPLIER', ?, 'ACTIVE')
                                    `;

                                    db.query(
                                        userSql,
                                        [
                                            supplierId,
                                            admin_name.trim(),
                                            admin_email.trim(),
                                            hashedPassword,
                                            admin_phone.trim()
                                        ],
                                        (userErr, userResult) => {

                                            if (userErr) {
                                                return db.rollback(() => {

                                                    console.error(
                                                        "Supplier user creation error:",
                                                        userErr
                                                    );

                                                    res.status(500).json({
                                                        message:
                                                            "Failed to create Supplier Login."
                                                    });
                                                });
                                            }

                                            // 3. Commit transaction
                                            db.commit((commitErr) => {

                                                if (commitErr) {
                                                    return db.rollback(() => {

                                                        console.error(
                                                            "Transaction commit error:",
                                                            commitErr
                                                        );

                                                        res.status(500).json({
                                                            message:
                                                                "Failed to save supplier and Supplier Login."
                                                        });
                                                    });
                                                }

                                                res.status(201).json({

                                                    message:
                                                        "Supplier and Supplier Login created successfully.",

                                                    supplier: {
                                                        id: supplierId,
                                                        supplier_name:
                                                            supplier_name.trim()
                                                    },

                                                    supplierUser: {
                                                        id: userResult.insertId,
                                                        name:
                                                            admin_name.trim(),
                                                        email:
                                                            admin_email.trim(),
                                                        role: "SUPPLIER",
                                                        supplier_id:
                                                            supplierId
                                                    }
                                                });
                                            });
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            "Create supplier error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const getSuppliers = (req, res) => {
    const sql = `
        SELECT
            s.id,
            s.supplier_name,
            s.email,
            s.phone,
            s.address,
            s.city,
            s.state,
            s.status,
            s.created_at,
            COUNT(DISTINCT sp.id) AS product_count,
            COUNT(DISTINCT spm.id) AS payment_method_count
        FROM suppliers s
        LEFT JOIN supplier_products sp
            ON s.id = sp.supplier_id
        LEFT JOIN supplier_payment_methods spm
            ON s.id = spm.supplier_id
        GROUP BY
            s.id,
            s.supplier_name,
            s.email,
            s.phone,
            s.address,
            s.city,
            s.state,
            s.status,
            s.created_at
        ORDER BY s.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get suppliers error:", err);

            return res.status(500).json({
                message: "Failed to fetch suppliers."
            });
        }

        res.json({
            suppliers: results
        });
    });
};

const updateSupplier = (req, res) => {
    const { id } = req.params;

    const {
        supplier_name,
        email,
        phone,
        address,
        city,
        state
    } = req.body;

    // ------------------------------------------
    // SUPPLIER ACCESS CONTROL
    // ------------------------------------------

    // Supplier users can edit ONLY their own supplier organization.
    if (
        req.user.role === "SUPPLIER" &&
        Number(req.user.supplier_id) !== Number(id)
    ) {
        return res.status(403).json({
            message: "You can only update your own supplier profile."
        });
    }

    // ------------------------------------------
    // REQUIRED FIELD VALIDATION
    // ------------------------------------------

    if (
        !supplier_name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state
    ) {
        return res.status(400).json({
            message: "All supplier fields are required."
        });
    }

    // ------------------------------------------
    // EMAIL VALIDATION
    // ------------------------------------------

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
        return res.status(400).json({
            message: "Please enter a valid supplier email address."
        });
    }

    // ------------------------------------------
    // PHONE VALIDATION
    // ------------------------------------------

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(phone.trim())) {
        return res.status(400).json({
            message:
                "Supplier phone number must be a valid 10-digit number."
        });
    }

    // ------------------------------------------
    // UPDATE SUPPLIER
    // ------------------------------------------

    const sql = `
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
        sql,
        [
            supplier_name.trim(),
            email.trim(),
            phone.trim(),
            address.trim(),
            city.trim(),
            state.trim(),
            id
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Update supplier error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to update supplier."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Supplier not found."
                });
            }

            res.json({
                message: "Supplier updated successfully."
            });
        }
    );
};


// Delete Supplier - Soft Delete
const deleteSupplier = (req, res) => {
    const { id } = req.params;

    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);

            return res.status(500).json({
                message: "Failed to delete supplier."
            });
        }

        // 1. Deactivate supplier
        const supplierSql = `
            UPDATE suppliers
            SET status = 'INACTIVE'
            WHERE id = ?
        `;

        db.query(supplierSql, [id], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Supplier deactivation error:", err);

                    res.status(500).json({
                        message: "Failed to deactivate supplier."
                    });
                });
            }

            if (result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(404).json({
                        message: "Supplier not found."
                    });
                });
            }

            // 2. Deactivate supplier login
            const userSql = `
                UPDATE users
                SET status = 'INACTIVE'
                WHERE supplier_id = ?
                AND role = 'SUPPLIER'
            `;

            db.query(userSql, [id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(
                            "Supplier login deactivation error:",
                            err
                        );

                        res.status(500).json({
                            message:
                                "Failed to deactivate supplier login."
                        });
                    });
                }

                // 3. Deactivate supplier products
                const productSql = `
                    UPDATE supplier_products
                    SET status = 'INACTIVE'
                    WHERE supplier_id = ?
                `;

                db.query(productSql, [id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(
                                "Supplier product deactivation error:",
                                err
                            );

                            res.status(500).json({
                                message:
                                    "Failed to deactivate supplier products."
                            });
                        });
                    }

                    // 4. Commit all changes
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(
                                    "Transaction commit error:",
                                    err
                                );

                                res.status(500).json({
                                    message:
                                        "Failed to delete supplier."
                                });
                            });
                        }

                        res.json({
                            message:
                                "Supplier deleted successfully."
                        });
                    });
                });
            });
        });
    });
};

// Activate Supplier
const activateSupplier = (req, res) => {
    const { id } = req.params;

    const checkSupplierSql = `
        SELECT id, status
        FROM suppliers
        WHERE id = ?
    `;

    db.query(checkSupplierSql, [id], (err, results) => {
        if (err) {
            console.error("Check supplier error:", err);
            return res.status(500).json({
                message: "Failed to check supplier."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Supplier not found."
            });
        }

        if (results[0].status === "ACTIVE") {
            return res.status(400).json({
                message: "Supplier is already active."
            });
        }

        const updateSupplierSql = `
            UPDATE suppliers
            SET status = 'ACTIVE'
            WHERE id = ?
        `;

        db.query(updateSupplierSql, [id], (err) => {
            if (err) {
                console.error("Activate supplier error:", err);
                return res.status(500).json({
                    message: "Failed to activate supplier."
                });
            }

            const updateUserSql = `
                UPDATE users
                SET status = 'ACTIVE'
                WHERE supplier_id = ?
                AND role = 'SUPPLIER'
            `;

            db.query(updateUserSql, [id], (err) => {
                if (err) {
                    console.error("Activate supplier login error:", err);
                    return res.status(500).json({
                        message: "Supplier activated, but login could not be activated."
                    });
                }

                res.json({
                    message: "Supplier activated successfully."
                });
            });
        });
    });
};

// =====================================================
// GET SUPPLIER ORDERS
// Only orders belonging to the logged-in supplier
// Includes customer contact details and order products
// =====================================================

const getSupplierOrders = (req, res) => {

    const supplierId = req.user.supplier_id;

    if (!supplierId) {

        return res.status(400).json({
            success: false,
            message: "Supplier account is not linked to a supplier."
        });

    }

    const ordersSql = `
        SELECT
            po.id,
            po.po_number,
            po.purchase_request_id,
            po.company_id,
            po.branch_id,
            po.supplier_id,
            po.payment_method,
            po.total_amount,
            po.status,
            po.created_at,

            c.company_name,
            c.email AS company_email,
            c.phone AS company_phone,
            c.address AS company_address,
            c.city AS company_city,
            c.state AS company_state,

            b.branch_name,
            b.address AS branch_address,
            b.city AS branch_city,
            b.state AS branch_state

        FROM purchase_orders po

        LEFT JOIN companies c
            ON po.company_id = c.id

        LEFT JOIN branches b
            ON po.branch_id = b.id

        WHERE po.supplier_id = ?

        ORDER BY po.created_at DESC
    `;

    db.query(
        ordersSql,
        [supplierId],
        (err, orders) => {

            if (err) {

                console.error(
                    "Get supplier orders error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch supplier orders."
                });

            }

            if (orders.length === 0) {

                return res.json({
                    success: true,
                    orders: []
                });

            }

            const orderIds = orders.map(
                (order) => order.id
            );

            const placeholders = orderIds
                .map(() => "?")
                .join(",");


            const itemsSql = `
                SELECT
                    poi.id,
                    poi.purchase_order_id,
                    poi.product_id,
                    poi.quantity,
                    poi.unit_price,
                    poi.total_price,

                    p.product_name,
                    p.unit,
                    p.description,
                    p.image

                FROM purchase_order_items poi

                INNER JOIN products p
                    ON poi.product_id = p.id

                WHERE poi.purchase_order_id IN (${placeholders})

                ORDER BY poi.id ASC
            `;


            db.query(
                itemsSql,
                orderIds,
                (itemsErr, items) => {

                    if (itemsErr) {

                        console.error(
                            "Get supplier order items error:",
                            itemsErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to fetch supplier order products."
                        });

                    }


                    const ordersWithItems =
                        orders.map((order) => {

                            return {
                                ...order,

                                items: items.filter(
                                    (item) =>
                                        item.purchase_order_id ===
                                        order.id
                                )
                            };

                        });


                    return res.json({
                        success: true,
                        orders: ordersWithItems
                    });

                }
            );

        }
    );

};

// =====================================================
// UPDATE SUPPLIER ORDER STATUS
// =====================================================

const updateSupplierOrderStatus = (req, res) => {
    const supplierId = req.user.supplier_id;
    const orderId = req.params.id;
    const { status } = req.body;

    if (!supplierId) {
        return res.status(400).json({
            success: false,
            message: "Supplier account is not linked to a supplier."
        });
    }

    const allowedStatuses = [
        "PENDING",
        "ACCEPTED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED"
    ];

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order status."
        });
    }

    const checkSql = `
        SELECT
            id,
            po_number,
            status
        FROM purchase_orders
        WHERE
            id = ?
            AND supplier_id = ?
    `;

    db.query(
        checkSql,
        [orderId, supplierId],
        (err, results) => {
            if (err) {
                console.error(
                    "Check supplier order status error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to check order."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            const currentStatus = results[0].status;

            const updateSql = `
                UPDATE purchase_orders
                SET
                    status = ?,
                    status_updated_at = NOW()
                WHERE
                    id = ?
                    AND supplier_id = ?
            `;

            db.query(
                updateSql,
                [
                    status,
                    orderId,
                    supplierId
                ],
                (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error(
                            "Update supplier order status error:",
                            updateErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to update order status."
                        });
                    }

                    if (updateResult.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Order could not be updated."
                        });
                    }

                    return res.json({
                        success: true,
                        message: "Order status updated successfully.",
                        order: {
                            id: results[0].id,
                            po_number: results[0].po_number,
                            previous_status: currentStatus,
                            status
                        }
                    });
                }
            );
        }
    );
};

// =====================================================
// GET SUPPLIER INVOICES
// Only invoices belonging to the logged-in supplier
// =====================================================

const getSupplierInvoices = (req, res) => {

    const supplierId = req.user.supplier_id;

    if (!supplierId) {

        return res.status(400).json({
            success: false,
            message: "Supplier account is not linked to a supplier."
        });

    }

    const sql = `
        SELECT
            i.id,
            i.invoice_number,
            i.purchase_order_id,
            i.supplier_id,
            i.created_by,
            i.invoice_date,
            i.due_date,
            i.subtotal,
            i.tax,
            i.total_amount,
            i.status,

            po.po_number,
            po.payment_method,
            po.company_id,
            po.branch_id,

            c.company_name,

            b.branch_name

        FROM invoices i

        INNER JOIN purchase_orders po
            ON i.purchase_order_id = po.id

        LEFT JOIN companies c
            ON po.company_id = c.id

        LEFT JOIN branches b
            ON po.branch_id = b.id

        WHERE i.supplier_id = ?

        ORDER BY i.invoice_date DESC, i.id DESC
    `;

    db.query(
        sql,
        [supplierId],
        (err, results) => {

            if (err) {

                console.error(
                    "Get supplier invoices error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch supplier invoices."
                });

            }

            return res.json({
                success: true,
                invoices: results
            });

        }
    );

};

// =====================================================
// GET SUPPLIER REPORTS
// Only data belonging to the logged-in supplier
// =====================================================

const getSupplierReports = (req, res) => {

    const supplierId = req.user.supplier_id;

    if (!supplierId) {

        return res.status(400).json({
            success: false,
            message:
                "Supplier account is not linked to a supplier."
        });

    }

    const query = (sql, params = []) => {

        return new Promise((resolve, reject) => {

            db.query(
                sql,
                params,
                (error, results) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }

                }
            );

        });

    };


    Promise.all([

        // =================================================
        // 1. MAIN SUMMARY
        // =================================================

        query(
            `
            SELECT

                (
                    SELECT COUNT(*)
                    FROM supplier_products
                    WHERE supplier_id = ?
                ) AS total_products,

                (
                    SELECT COUNT(*)
                    FROM supplier_products
                    WHERE supplier_id = ?
                    AND status = 'ACTIVE'
                ) AS active_products,

                (
                    SELECT COUNT(*)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                ) AS total_orders,

                (
                    SELECT COUNT(*)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                    AND status = 'PENDING'
                ) AS pending_orders,

                (
                    SELECT COUNT(*)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                    AND status IN (
                        'PROCESSING',
                        'PACKED'
                    )
                ) AS processing_orders,

                (
                    SELECT COUNT(*)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                    AND status = 'SHIPPED'
                ) AS shipped_orders,

                (
                    SELECT COUNT(*)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                    AND status IN (
                        'DELIVERED',
                        'COMPLETED'
                    )
                ) AS completed_orders,

                (
                    SELECT COUNT(*)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                    AND status = 'CANCELLED'
                ) AS cancelled_orders,

                (
                    SELECT COALESCE(
                        SUM(total_amount),
                        0
                    )
                    FROM purchase_orders
                    WHERE supplier_id = ?
                    AND status <> 'CANCELLED'
                ) AS total_sales,

                (
                    SELECT COUNT(DISTINCT company_id)
                    FROM purchase_orders
                    WHERE supplier_id = ?
                ) AS customer_count,

                (
                    SELECT COUNT(*)
                    FROM supplier_products
                    WHERE supplier_id = ?
                    AND status = 'ACTIVE'
                    AND stock_quantity <= minimum_order_quantity
                ) AS low_stock_products

            `,
            [
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId,
                supplierId
            ]
        ),


        // =================================================
        // 2. INVOICE SUMMARY
        // =================================================

        query(
            `
            SELECT

                COUNT(*) AS total_invoices,

                SUM(
                    CASE
                        WHEN i.status = 'PAID'
                        THEN 1
                        ELSE 0
                    END
                ) AS paid_invoices,

                SUM(
                    CASE
                        WHEN i.status = 'ISSUED'
                        THEN 1
                        ELSE 0
                    END
                ) AS issued_invoices,

                SUM(
                    CASE
                        WHEN i.status = 'PARTIALLY_PAID'
                        THEN 1
                        ELSE 0
                    END
                ) AS partially_paid_invoices,

                COALESCE(
                    SUM(
                        CASE
                            WHEN i.status = 'PAID'
                            THEN i.total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS paid_amount,

                COALESCE(
                    SUM(
                        CASE
                            WHEN i.status <> 'PAID'
                            THEN i.total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS outstanding_amount,

                COALESCE(
                    SUM(
                        CASE
                            WHEN i.status <> 'PAID'
                            AND i.due_date IS NOT NULL
                            AND i.due_date < CURDATE()
                            THEN i.total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS overdue_amount

            FROM invoices i

            WHERE i.supplier_id = ?

            `,
            [supplierId]
        ),


        // =================================================
        // 3. MONTHLY SALES
        // Last 6 months
        // =================================================

        query(
            `
            SELECT

                DATE_FORMAT(
                    po.created_at,
                    '%Y-%m'
                ) AS month_key,

                DATE_FORMAT(
                    po.created_at,
                    '%b %Y'
                ) AS month,

                COUNT(*) AS order_count,

                COALESCE(
                    SUM(po.total_amount),
                    0
                ) AS sales

            FROM purchase_orders po

            WHERE
                po.supplier_id = ?

                AND po.status <> 'CANCELLED'

                AND po.created_at >=
                    DATE_SUB(
                        CURDATE(),
                        INTERVAL 5 MONTH
                    )

            GROUP BY
                YEAR(po.created_at),
                MONTH(po.created_at)

            ORDER BY
                YEAR(po.created_at),
                MONTH(po.created_at)

            `,
            [supplierId]
        ),


        // =================================================
        // 4. TOP PRODUCTS
        // =================================================

        query(
            `
            SELECT

                poi.product_id,

                p.product_name,

                SUM(
                    poi.quantity
                ) AS quantity_sold,

                SUM(
                    poi.total_price
                ) AS sales

            FROM purchase_order_items poi

            INNER JOIN purchase_orders po
                ON poi.purchase_order_id = po.id

            INNER JOIN products p
                ON poi.product_id = p.id

            WHERE
                po.supplier_id = ?

                AND po.status <> 'CANCELLED'

            GROUP BY
                poi.product_id,
                p.product_name

            ORDER BY
                quantity_sold DESC

            LIMIT 5

            `,
            [supplierId]
        ),


        // =================================================
        // 5. CUSTOMER / COMPANY SALES
        // =================================================

        query(
            `
            SELECT

                c.company_name,

                COUNT(
                    po.id
                ) AS order_count,

                COALESCE(
                    SUM(po.total_amount),
                    0
                ) AS sales

            FROM purchase_orders po

            INNER JOIN companies c
                ON po.company_id = c.id

            WHERE
                po.supplier_id = ?

                AND po.status <> 'CANCELLED'

            GROUP BY
                po.company_id,
                c.company_name

            ORDER BY
                sales DESC

            LIMIT 5

            `,
            [supplierId]
        ),


        // =================================================
        // 6. RECENT ORDERS
        // =================================================

        query(
            `
            SELECT

                po.po_number,

                po.total_amount,

                po.status,

                po.payment_method,

                po.created_at,

                c.company_name

            FROM purchase_orders po

            LEFT JOIN companies c
                ON po.company_id = c.id

            WHERE
                po.supplier_id = ?

            ORDER BY
                po.created_at DESC

            LIMIT 5

            `,
            [supplierId]
        )

    ])

    .then(([
        summaryResult,
        invoiceResult,
        monthlySales,
        topProducts,
        customers,
        recentOrders
    ]) => {

        const summary =
            summaryResult[0] || {};

        const invoices =
            invoiceResult[0] || {};


        return res.json({

            success: true,

            summary: {

                total_products:
                    Number(
                        summary.total_products || 0
                    ),

                active_products:
                    Number(
                        summary.active_products || 0
                    ),

                total_orders:
                    Number(
                        summary.total_orders || 0
                    ),

                pending_orders:
                    Number(
                        summary.pending_orders || 0
                    ),

                processing_orders:
                    Number(
                        summary.processing_orders || 0
                    ),

                shipped_orders:
                    Number(
                        summary.shipped_orders || 0
                    ),

                completed_orders:
                    Number(
                        summary.completed_orders || 0
                    ),

                cancelled_orders:
                    Number(
                        summary.cancelled_orders || 0
                    ),

                total_sales:
                    Number(
                        summary.total_sales || 0
                    ),

                customer_count:
                    Number(
                        summary.customer_count || 0
                    ),

                low_stock_products:
                    Number(
                        summary.low_stock_products || 0
                    )

            },


            invoices: {

                total:
                    Number(
                        invoices.total_invoices || 0
                    ),

                paid:
                    Number(
                        invoices.paid_invoices || 0
                    ),

                issued:
                    Number(
                        invoices.issued_invoices || 0
                    ),

                partially_paid:
                    Number(
                        invoices.partially_paid_invoices || 0
                    ),

                paid_amount:
                    Number(
                        invoices.paid_amount || 0
                    ),

                outstanding_amount:
                    Number(
                        invoices.outstanding_amount || 0
                    ),

                overdue_amount:
                    Number(
                        invoices.overdue_amount || 0
                    )

            },


            monthly_sales:
                monthlySales,

            top_products:
                topProducts,

            customers:
                customers,

            recent_orders:
                recentOrders

        });

    })

    .catch((error) => {

        console.error(
            "Get supplier reports error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch supplier reports."
        });

    });

};

module.exports = {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    activateSupplier,
    getSupplierOrders,
    updateSupplierOrderStatus,
    getSupplierInvoices,
    getSupplierReports
};