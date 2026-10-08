const db = require("../config/db");


// =====================================================
// HELPER
// =====================================================

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// =====================================================
// WORKING DAY HELPER
// =====================================================

const addWorkingDays = (date, days) => {
    const result = new Date(date);

    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);

        const day = result.getDay();

        if (day !== 0 && day !== 6) {
            addedDays++;
        }
    }

    return result;
};

// =====================================================
// CREATE PURCHASE REQUEST
// =====================================================

const createPurchaseRequest = async (req, res) => {

    const userId = req.user.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    const { items } = req.body;

    if (!companyId || !branchId) {
        return res.status(400).json({
            message:
                "Your employee account is not linked to a company and branch."
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "Your cart is empty."
        });
    }

    // Validate cart items before starting transaction
    for (const item of items) {

        if (
            !item.supplier_product_id ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid cart item or quantity."
            });
        }
    }

    try {

        // =================================================
        // START TRANSACTION
        // =================================================

        await new Promise((resolve, reject) => {
            db.beginTransaction((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });


        // =================================================
        // VERIFY BRANCH
        // =================================================

        const branchResults = await query(
            `
            SELECT id
            FROM branches
            WHERE id = ?
              AND company_id = ?
              AND status = 'ACTIVE'
            `,
            [branchId, companyId]
        );

        if (branchResults.length === 0) {

            const error = new Error(
                "Your assigned branch is not active."
            );

            error.statusCode = 400;

            throw error;
        }


        // =================================================
        // CHECK PRODUCTS + CALCULATE TOTAL
        // =================================================

        let subtotal = 0;

        const requestItems = [];

        for (const item of items) {

            const quantity = Number(item.quantity);

            const productResults = await query(
                `
                SELECT
                    sp.id AS supplier_product_id,
                    sp.product_id,
                    sp.supplier_id,
                    sp.price,
                    sp.stock_quantity,
                    sp.minimum_order_quantity,

                    p.product_name,

                    s.supplier_name

                FROM supplier_products sp

                INNER JOIN products p
                    ON sp.product_id = p.id

                INNER JOIN suppliers s
                    ON sp.supplier_id = s.id

                WHERE sp.id = ?
                  AND sp.status = 'ACTIVE'
                  AND p.status = 'ACTIVE'
                  AND s.status = 'ACTIVE'

                FOR UPDATE
                `,
                [item.supplier_product_id]
            );


            if (productResults.length === 0) {

                const error = new Error(
                    "One of the products in your cart is no longer available."
                );

                error.statusCode = 400;

                throw error;
            }


            const product = productResults[0];

            const minimumQuantity =
                Number(product.minimum_order_quantity) || 1;


            // =============================================
            // CHECK MINIMUM ORDER QUANTITY
            // =============================================

            if (
                quantity < minimumQuantity ||
                quantity % minimumQuantity !== 0
            ) {

                const error = new Error(
                    `${product.product_name} must be ordered in multiples of ${minimumQuantity}.`
                );

                error.statusCode = 400;

                throw error;
            }


            // =============================================
            // CHECK STOCK
            // =============================================

            if (
                Number(product.stock_quantity) <
                quantity
            ) {

                const error = new Error(
                    `Only ${product.stock_quantity} units of ${product.product_name} are currently available.`
                );

                error.statusCode = 409;

                throw error;
            }


            const unitPrice =
                Number(product.price);

            const itemTotal =
                unitPrice * quantity;

            subtotal += itemTotal;


            requestItems.push({
                product_id:
                    product.product_id,

                supplier_id:
                    product.supplier_id,

                quantity,

                unit_price:
                    unitPrice,

                total_price:
                    itemTotal
            });
        }


        // =================================================
        // GST
        // =================================================

        const gst = subtotal * 0.18;

        const totalAmount =
            Number(
                (subtotal + gst).toFixed(2)
            );


        // =================================================
        // CREATE PURCHASE REQUEST
        // =================================================

        const temporaryRequestNumber =
            `TEMP-${Date.now()}-${userId}`;


        const requestResult = await query(
            `
            INSERT INTO purchase_requests
            (
                request_number,
                company_id,
                branch_id,
                requested_by,
                status,
                total_amount
            )
            VALUES (?, ?, ?, ?, 'PENDING', ?)
            `,
            [
                temporaryRequestNumber,
                companyId,
                branchId,
                userId,
                totalAmount
            ]
        );


        const requestId =
            requestResult.insertId;


        // =================================================
        // FINAL REQUEST NUMBER
        // =================================================

        const requestNumber =
            `PR-${new Date().getFullYear()}-${String(
                requestId
            ).padStart(5, "0")}`;


        await query(
            `
            UPDATE purchase_requests
            SET request_number = ?
            WHERE id = ?
            `,
            [
                requestNumber,
                requestId
            ]
        );


        // =================================================
        // INSERT REQUEST ITEMS
        // =================================================

        for (const item of requestItems) {

            await query(
                `
                INSERT INTO purchase_request_items
                (
                    purchase_request_id,
                    product_id,
                    supplier_id,
                    quantity,
                    unit_price,
                    total_price
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    requestId,
                    item.product_id,
                    item.supplier_id,
                    item.quantity,
                    item.unit_price,
                    item.total_price
                ]
            );
        }


        // =================================================
        // COMMIT
        // =================================================

        await new Promise((resolve, reject) => {

            db.commit((error) => {

                if (error) {
                    reject(error);
                } else {
                    resolve();
                }

            });

        });


        // =================================================
        // SUCCESS
        // =================================================

        res.status(201).json({

            message:
                "Purchase request created successfully.",

            request: {
                id: requestId,
                request_number: requestNumber,
                status: "PENDING",
                subtotal,
                gst,
                total_amount: totalAmount
            }

        });


    } catch (error) {

        console.error(
            "Create purchase request error:",
            error
        );


        // =================================================
        // ROLLBACK
        // =================================================

        try {

            await new Promise((resolve) => {

                db.rollback(() => {
                    resolve();
                });

            });

        } catch (rollbackError) {

            console.error(
                "Rollback error:",
                rollbackError
            );

        }


        res.status(
            error.statusCode || 500
        ).json({

            message:
                error.statusCode
                    ? error.message
                    : "Failed to create purchase request."

        });

    }
};


// =====================================================
// GET EMPLOYEE PURCHASE REQUESTS
// =====================================================

const getMyPurchaseRequests = async (req, res) => {

    const userId = req.user.id;

    const { status } = req.query;

    try {

        let sql = `
            SELECT
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.status,
                pr.total_amount,
                pr.rejection_reason,
                pr.created_at,
                pr.approved_at,

                b.branch_name,

                COUNT(pri.id) AS item_count

            FROM purchase_requests pr

            LEFT JOIN branches b
                ON pr.branch_id = b.id

            LEFT JOIN purchase_request_items pri
                ON pr.id = pri.purchase_request_id

            WHERE pr.requested_by = ?
        `;

        const params = [userId];


        if (
            status &&
            [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "CANCELLED"
            ].includes(status)
        ) {

            sql += `
                AND pr.status = ?
            `;

            params.push(status);
        }


        sql += `
            GROUP BY
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.status,
                pr.total_amount,
                pr.rejection_reason,
                pr.created_at,
                pr.approved_at,
                b.branch_name

            ORDER BY pr.created_at DESC
        `;


        const results =
            await query(sql, params);


        res.json({
            requests: results
        });


    } catch (error) {

        console.error(
            "Get purchase requests error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch purchase requests."
        });

    }
};


// =====================================================
// GET SINGLE PURCHASE REQUEST DETAILS - EMPLOYEE
// =====================================================

const getPurchaseRequestDetails = async (req, res) => {

    const userId = req.user.id;
    const requestId = req.params.id;

    try {

        const requestSql = `
            SELECT

                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.approved_by,
                pr.status,
                pr.total_amount,
                pr.rejection_reason,
                pr.created_at,
                pr.approved_at,

                u.name AS requested_by_name,
                u.email AS requested_by_email,
                u.phone AS requested_by_phone,

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

            FROM purchase_requests pr

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN companies c
                ON pr.company_id = c.id

            LEFT JOIN branches b
                ON pr.branch_id = b.id

            WHERE
                pr.id = ?
                AND pr.requested_by = ?
        `;


        const requestResults =
            await query(
                requestSql,
                [
                    requestId,
                    userId
                ]
            );


        if (requestResults.length === 0) {

            return res.status(404).json({
                message:
                    "Purchase request not found."
            });

        }


        const request =
            requestResults[0];


        // =================================================
        // REQUEST ITEMS
        // =================================================

        const itemsSql = `
            SELECT

                pri.id,
                pri.purchase_request_id,
                pri.product_id,
                pri.supplier_id,
                pri.quantity,
                pri.unit_price,
                pri.total_price,

                p.product_name,
                p.unit,
                p.description,
                p.image,

                s.supplier_name,
                s.email AS supplier_email,
                s.phone AS supplier_phone,
                s.address AS supplier_address,
                s.city AS supplier_city,
                s.state AS supplier_state

            FROM purchase_request_items pri

            INNER JOIN products p
                ON pri.product_id = p.id

            INNER JOIN suppliers s
                ON pri.supplier_id = s.id

            WHERE
                pri.purchase_request_id = ?

            ORDER BY pri.id ASC
        `;


        const items =
            await query(
                itemsSql,
                [requestId]
            );


        // =================================================
        // CALCULATE SUBTOTAL + GST
        // =================================================

        const subtotal =
            items.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.total_price || 0
                    ),
                0
            );


        const totalAmount =
            Number(
                request.total_amount || 0
            );


        const gst =
            totalAmount - subtotal;


        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            request: {

                ...request,

                items,

                subtotal:
                    Number(
                        subtotal.toFixed(2)
                    ),

                gst:
                    Number(
                        gst.toFixed(2)
                    ),

                total_amount:
                    Number(
                        totalAmount.toFixed(2)
                    )

            }

        });


    } catch (error) {

        console.error(
            "Get purchase request details error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch purchase request details."
        });

    }
};


// =====================================================
// GET MANAGER PENDING PURCHASE REQUESTS
// =====================================================

const getManagerPendingRequests = async (req, res) => {

    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    try {

        // -------------------------------------------------
        // Make sure the logged-in user is a manager
        // -------------------------------------------------

        if (req.user.role !== "MANAGER") {

            return res.status(403).json({
                message:
                    "Only managers can access purchase approvals."
            });

        }


        if (!companyId || !branchId) {

            return res.status(400).json({
                message:
                    "Manager is not linked to a company and branch."
            });

        }


        // -------------------------------------------------
        // Get only PENDING requests from this manager's
        // company and branch
        // -------------------------------------------------

        const sql = `
            SELECT

                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.status,
                pr.total_amount,
                pr.created_at,

                u.name AS employee_name,
                u.email AS employee_email,

                b.branch_name,

                COUNT(pri.id) AS item_count

            FROM purchase_requests pr

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN branches b
                ON pr.branch_id = b.id

            LEFT JOIN purchase_request_items pri
                ON pr.id = pri.purchase_request_id

            WHERE
                pr.company_id = ?
                AND pr.branch_id = ?
                AND pr.status = 'PENDING'

            GROUP BY
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.status,
                pr.total_amount,
                pr.created_at,
                u.name,
                u.email,
                b.branch_name

            ORDER BY pr.created_at DESC
        `;


        const results =
            await query(
                sql,
                [
                    companyId,
                    branchId
                ]
            );


        res.json({
            requests: results
        });


    } catch (error) {

        console.error(
            "Get manager pending requests error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch pending purchase requests."
        });

    }
};


// =====================================================
// GET MANAGER PURCHASE REQUEST DETAILS
// =====================================================

const getManagerPurchaseRequestDetails = async (req, res) => {

    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;
    const requestId = req.params.id;

    try {

        // =================================================
        // ROLE CHECK
        // =================================================

        if (req.user.role !== "MANAGER") {

            return res.status(403).json({
                message:
                    "Only managers can access purchase approvals."
            });

        }


        // =================================================
        // REQUEST DETAILS
        // =================================================

        const requestSql = `
            SELECT

                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.approved_by,
                pr.status,
                pr.total_amount,
                pr.rejection_reason,
                pr.created_at,
                pr.approved_at,

                u.name AS requested_by_name,
                u.email AS requested_by_email,
                u.phone AS requested_by_phone,

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

            FROM purchase_requests pr

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN companies c
                ON pr.company_id = c.id

            LEFT JOIN branches b
                ON pr.branch_id = b.id

            WHERE
                pr.id = ?
                AND pr.company_id = ?
                AND pr.branch_id = ?
        `;


        const requestResults =
            await query(
                requestSql,
                [
                    requestId,
                    companyId,
                    branchId
                ]
            );


        if (requestResults.length === 0) {

            return res.status(404).json({
                message:
                    "Purchase request not found in your branch."
            });

        }


        const request =
            requestResults[0];


        // =================================================
        // REQUEST ITEMS
        // =================================================

        const itemsSql = `
            SELECT

                pri.id,
                pri.purchase_request_id,
                pri.product_id,
                pri.supplier_id,
                pri.quantity,
                pri.unit_price,
                pri.total_price,

                p.product_name,
                p.unit,
                p.description,
                p.image,

                s.supplier_name,
                s.email AS supplier_email,
                s.phone AS supplier_phone,
                s.address AS supplier_address,
                s.city AS supplier_city,
                s.state AS supplier_state

            FROM purchase_request_items pri

            INNER JOIN products p
                ON pri.product_id = p.id

            INNER JOIN suppliers s
                ON pri.supplier_id = s.id

            WHERE
                pri.purchase_request_id = ?

            ORDER BY pri.id ASC
        `;


        const items =
            await query(
                itemsSql,
                [requestId]
            );


        // =================================================
        // TOTALS
        // =================================================

        const subtotal =
            items.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.total_price || 0
                    ),
                0
            );


        const totalAmount =
            Number(
                request.total_amount || 0
            );


        const gst =
            totalAmount - subtotal;


        res.json({

            request: {

                ...request,

                items,

                subtotal:
                    Number(
                        subtotal.toFixed(2)
                    ),

                gst:
                    Number(
                        gst.toFixed(2)
                    ),

                total_amount:
                    Number(
                        totalAmount.toFixed(2)
                    )

            }

        });


    } catch (error) {

        console.error(
            "Get manager purchase request details error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch purchase request details."
        });

    }
};


// =====================================================
// GET MANAGER APPROVED PURCHASE REQUESTS
// =====================================================

const getManagerApprovedRequests = async (req, res) => {

    const managerId = req.user.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    try {

        if (req.user.role !== "MANAGER") {
            return res.status(403).json({
                message: "Only managers can access approved requests."
            });
        }

        if (!companyId || !branchId) {
            return res.status(400).json({
                message: "Manager is not linked to a company and branch."
            });
        }

        const sql = `
            SELECT
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.approved_by,
                pr.status,
                pr.total_amount,
                pr.created_at,
                pr.approved_at,

                u.name AS employee_name,
                u.email AS employee_email,

                b.branch_name,

                COUNT(pri.id) AS item_count

            FROM purchase_requests pr

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN branches b
                ON pr.branch_id = b.id

            LEFT JOIN purchase_request_items pri
                ON pr.id = pri.purchase_request_id

            WHERE
                pr.company_id = ?
                AND pr.branch_id = ?
                AND pr.status = 'APPROVED'
                AND pr.approved_by = ?

            GROUP BY
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.approved_by,
                pr.status,
                pr.total_amount,
                pr.created_at,
                pr.approved_at,
                u.name,
                u.email,
                b.branch_name

            ORDER BY pr.approved_at DESC
        `;

        const results = await query(
            sql,
            [
                companyId,
                branchId,
                managerId
            ]
        );

        res.json({
            requests: results
        });

    } catch (error) {

        console.error(
            "Get manager approved requests error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch approved purchase requests."
        });
    }
};


// =====================================================
// GET MANAGER REJECTED PURCHASE REQUESTS
// =====================================================

const getManagerRejectedRequests = async (req, res) => {

    const managerId = req.user.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    try {

        if (req.user.role !== "MANAGER") {
            return res.status(403).json({
                message: "Only managers can access rejected requests."
            });
        }

        if (!companyId || !branchId) {
            return res.status(400).json({
                message: "Manager is not linked to a company and branch."
            });
        }

        const sql = `
            SELECT
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.approved_by,
                pr.status,
                pr.total_amount,
                pr.rejection_reason,
                pr.created_at,
                pr.approved_at,

                u.name AS employee_name,
                u.email AS employee_email,

                b.branch_name,

                COUNT(pri.id) AS item_count

            FROM purchase_requests pr

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN branches b
                ON pr.branch_id = b.id

            LEFT JOIN purchase_request_items pri
                ON pr.id = pri.purchase_request_id

            WHERE
                pr.company_id = ?
                AND pr.branch_id = ?
                AND pr.status = 'REJECTED'
                AND pr.approved_by = ?

            GROUP BY
                pr.id,
                pr.request_number,
                pr.company_id,
                pr.branch_id,
                pr.requested_by,
                pr.approved_by,
                pr.status,
                pr.total_amount,
                pr.rejection_reason,
                pr.created_at,
                pr.approved_at,
                u.name,
                u.email,
                b.branch_name

            ORDER BY pr.approved_at DESC
        `;

        const results = await query(
            sql,
            [
                companyId,
                branchId,
                managerId
            ]
        );

        res.json({
            requests: results
        });

    } catch (error) {

        console.error(
            "Get manager rejected requests error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch rejected purchase requests."
        });
    }
};

// =====================================================
// GET MANAGER ORDERS
// =====================================================

const getManagerOrders = async (req, res) => {

    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    try {

        if (req.user.role !== "MANAGER") {
            return res.status(403).json({
                message:
                    "Only managers can access orders."
            });
        }

        if (!companyId || !branchId) {
            return res.status(400).json({
                message:
                    "Manager is not linked to a company and branch."
            });
        }

        const sql = `
            SELECT
                po.id,
                po.po_number,
                po.purchase_request_id,
                po.supplier_id,
                po.payment_method,
                po.total_amount,
                po.status,
                po.created_at,
                po.status_updated_at,

                pr.request_number,
                pr.requested_by,

                u.name AS employee_name,

                s.supplier_name

            FROM purchase_orders po

            INNER JOIN purchase_requests pr
                ON po.purchase_request_id = pr.id

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN suppliers s
                ON po.supplier_id = s.id

            WHERE
                po.company_id = ?
                AND po.branch_id = ?

            ORDER BY
                po.created_at DESC
        `;

        const results = await query(
            sql,
            [
                companyId,
                branchId
            ]
        );

        res.json({
            orders: results
        });

    } catch (error) {

        console.error(
            "Get manager orders error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch manager orders."
        });

    }

};

// =====================================================
// GET MANAGER ORDER DETAILS
// =====================================================

const getManagerOrderDetails = async (req, res) => {

    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;
    const orderId = req.params.id;

    try {

        if (req.user.role !== "MANAGER") {
            return res.status(403).json({
                message: "Only managers can access order details."
            });
        }

        if (!companyId || !branchId) {
            return res.status(400).json({
                message: "Manager is not linked to a company and branch."
            });
        }

        // =================================================
        // ORDER DETAILS
        // =================================================

        const orderSql = `
            SELECT
                po.id,
                po.po_number,
                po.purchase_request_id,
                po.supplier_id,
                po.payment_method,
                po.total_amount,
                po.status,
                po.created_at,
                po.status_updated_at,

                pr.request_number,
                pr.requested_by,

                u.name AS employee_name,

                s.supplier_name

            FROM purchase_orders po

            INNER JOIN purchase_requests pr
                ON po.purchase_request_id = pr.id

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN suppliers s
                ON po.supplier_id = s.id

            WHERE
                po.id = ?
                AND po.company_id = ?
                AND po.branch_id = ?
        `;

        const orderResults = await query(
            orderSql,
            [
                orderId,
                companyId,
                branchId
            ]
        );

        if (orderResults.length === 0) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        const order = orderResults[0];

        // =================================================
        // ORDER ITEMS
        // =================================================

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
                p.image

            FROM purchase_order_items poi

            INNER JOIN products p
                ON poi.product_id = p.id

            WHERE
                poi.purchase_order_id = ?

            ORDER BY poi.id ASC
        `;

        const items = await query(
            itemsSql,
            [orderId]
        );

        // =================================================
        // RESPONSE
        // =================================================

        res.json({
            success: true,
            order: {
                ...order,
                total_amount: Number(
                    order.total_amount || 0
                ),
                items
            }
        });

    } catch (error) {

        console.error(
            "Get manager order details error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch order details."
        });

    }
};


// =====================================================
// COMPANY ADMIN - GET ALL COMPANY ORDERS
// =====================================================

const getCompanyAdminOrders = async (req, res) => {
    const companyId = req.user.company_id;

    try {
        if (req.user.role !== "COMPANY_ADMIN") {
            return res.status(403).json({
                message: "Only company admins can access company orders."
            });
        }

        if (!companyId) {
            return res.status(400).json({
                message: "Company admin is not linked to a company."
            });
        }

        const sql = `
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
                po.status_updated_at,

                pr.request_number,
                pr.requested_by,

                u.name AS employee_name,

                b.branch_name,

                s.supplier_name

            FROM purchase_orders po

            INNER JOIN purchase_requests pr
                ON po.purchase_request_id = pr.id

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN branches b
                ON po.branch_id = b.id

            LEFT JOIN suppliers s
                ON po.supplier_id = s.id

            WHERE
                po.company_id = ?

            ORDER BY
                po.created_at DESC
        `;

        const results = await query(sql, [
            companyId
        ]);

        res.json({
            orders: results
        });

    } catch (error) {
        console.error(
            "Get company admin orders error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch company orders."
        });
    }
};


// =====================================================
// COMPANY ADMIN - GET ORDER DETAILS
// =====================================================

const getCompanyAdminOrderDetails = async (req, res) => {
    const companyId = req.user.company_id;
    const orderId = req.params.id;

    try {
        if (req.user.role !== "COMPANY_ADMIN") {
            return res.status(403).json({
                message: "Only company admins can access order details."
            });
        }

        if (!companyId) {
            return res.status(400).json({
                message: "Company admin is not linked to a company."
            });
        }

        // =================================================
        // ORDER DETAILS
        // =================================================

        const orderSql = `
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
                po.status_updated_at,

                pr.request_number,
                pr.requested_by,

                u.name AS employee_name,
                u.email AS employee_email,

                b.branch_name,

                s.supplier_name

            FROM purchase_orders po

            INNER JOIN purchase_requests pr
                ON po.purchase_request_id = pr.id

            INNER JOIN users u
                ON pr.requested_by = u.id

            LEFT JOIN branches b
                ON po.branch_id = b.id

            LEFT JOIN suppliers s
                ON po.supplier_id = s.id

            WHERE
                po.id = ?
                AND po.company_id = ?

            LIMIT 1
        `;

        const orderResults = await query(
            orderSql,
            [
                orderId,
                companyId
            ]
        );

        if (orderResults.length === 0) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        // =================================================
        // ORDER ITEMS
        // =================================================

        const itemsSql = `
            SELECT
                poi.id,
                poi.product_id,
                poi.quantity,
                poi.unit_price,
                poi.total_price,

                p.product_name

            FROM purchase_order_items poi

            LEFT JOIN products p
                ON poi.product_id = p.id

            WHERE
                poi.purchase_order_id = ?

            ORDER BY
                poi.id ASC
        `;

        const items = await query(
            itemsSql,
            [orderId]
        );

        res.json({
            order: orderResults[0],
            items
        });

    } catch (error) {
        console.error(
            "Get company admin order details error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch order details."
        });
    }
};

// =====================================================
// APPROVE PURCHASE REQUEST
// =====================================================

const approvePurchaseRequest = async (req, res) => {

    const managerId = req.user.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;
    const requestId = req.params.id;

    try {

        if (req.user.role !== "MANAGER") {

            return res.status(403).json({
                message:
                    "Only managers can approve requests."
            });

        }


        const result =
            await query(
                `
                UPDATE purchase_requests

                SET
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP

                WHERE
                    id = ?
                    AND company_id = ?
                    AND branch_id = ?
                    AND status = 'PENDING'
                `,
                [
                    managerId,
                    requestId,
                    companyId,
                    branchId
                ]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Purchase request not found, already processed, or does not belong to your branch."
            });

        }


        res.json({
            message:
                "Purchase request approved successfully."
        });


    } catch (error) {

        console.error(
            "Approve purchase request error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to approve purchase request."
        });

    }
};


// =====================================================
// REJECT PURCHASE REQUEST
// =====================================================

const rejectPurchaseRequest = async (req, res) => {

    const managerId = req.user.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;
    const requestId = req.params.id;

    const {
        rejection_reason
    } = req.body;


    try {

        if (req.user.role !== "MANAGER") {

            return res.status(403).json({
                message:
                    "Only managers can reject requests."
            });

        }


        if (
            !rejection_reason ||
            !rejection_reason.trim()
        ) {

            return res.status(400).json({
                message:
                    "Rejection reason is required."
            });

        }


        const result =
            await query(
                `
                UPDATE purchase_requests

                SET
                    status = 'REJECTED',
                    approved_by = ?,
                    rejection_reason = ?,
                    approved_at = CURRENT_TIMESTAMP

                WHERE
                    id = ?
                    AND company_id = ?
                    AND branch_id = ?
                    AND status = 'PENDING'
                `,
                [
                    managerId,
                    rejection_reason.trim(),
                    requestId,
                    companyId,
                    branchId
                ]
            );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Purchase request not found, already processed, or does not belong to your branch."
            });

        }


        res.json({
            message:
                "Purchase request rejected successfully."
        });


    } catch (error) {

        console.error(
            "Reject purchase request error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to reject purchase request."
        });

    }
};

// =====================================================
// GET EMPLOYEE PURCHASE ORDERS
// =====================================================

const getMyOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const sql = `
            SELECT
                po.id,
                po.po_number,
                po.purchase_request_id,
                po.supplier_id,
                po.payment_method,
                po.total_amount,
                po.status,
                po.created_at,
                pr.request_number,
                s.supplier_name
            FROM purchase_orders po
            INNER JOIN purchase_requests pr
                ON po.purchase_request_id = pr.id
            LEFT JOIN suppliers s
                ON po.supplier_id = s.id
            WHERE pr.requested_by = ?
            ORDER BY po.created_at DESC
        `;

        const orders = await query(sql, [userId]);

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Get employee orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your orders."
        });
    }
};


// =====================================================
// GET EMPLOYEE ORDER DETAILS
// =====================================================

const getMyOrderDetails = async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        // Get order, purchase request, approver and supplier
        const orderSql = `
            SELECT
                po.id,
                po.po_number,
                po.purchase_request_id,
                po.supplier_id,
                po.payment_method,
                po.total_amount,
                po.status,
                po.status_updated_at,
                po.created_at,
                pr.request_number,
                pr.requested_by,
                pr.approved_by,
                pr.approved_at,
                approver.name AS approved_by_name,
                s.supplier_name
            FROM purchase_orders po
            INNER JOIN purchase_requests pr
                ON po.purchase_request_id = pr.id
            LEFT JOIN users approver
                ON pr.approved_by = approver.id
            LEFT JOIN suppliers s
                ON po.supplier_id = s.id
            WHERE po.id = ?
              AND pr.requested_by = ?
            LIMIT 1
        `;

        const orderResults = await query(orderSql, [
            orderId,
            userId
        ]);

        if (orderResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or you do not have access to this order."
            });
        }

        const order = orderResults[0];

        // Get products in the order
        const itemsSql = `
            SELECT
                poi.id,
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
            WHERE poi.purchase_order_id = ?
            ORDER BY poi.id ASC
        `;

        const items = await query(itemsSql, [orderId]);

        // Get latest payment information
        const paymentSql = `
            SELECT
                pay.id,
                pay.amount,
                pay.payment_method,
                pay.payment_date,
                pay.transaction_reference,
                pay.status,
                pay.recorded_by,
                finance_user.name AS recorded_by_name
            FROM payments pay
            LEFT JOIN users finance_user
                ON pay.recorded_by = finance_user.id
            WHERE pay.purchase_order_id = ?
            ORDER BY pay.created_at DESC, pay.id DESC
            LIMIT 1
        `;

        const paymentResults = await query(paymentSql, [orderId]);
        const payment = paymentResults[0] || null;

        // Calculate totals
        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.total_price || 0),
            0
        );

        const totalAmount = Number(order.total_amount || 0);
        const gst = totalAmount - subtotal;

        return res.json({
            success: true,
            order: {
                ...order,
                total_amount: Number(totalAmount.toFixed(2)),
                subtotal: Number(subtotal.toFixed(2)),
                gst: Number(gst.toFixed(2)),
                approved_by_name: order.approved_by_name || null,

                payment: payment
                    ? {
                        ...payment,
                        amount: Number(payment.amount || 0)
                    }
                    : null,

                expected_delivery_date:
                    order.status === "SHIPPED" &&
                    order.status_updated_at
                        ? addWorkingDays(
                            order.status_updated_at,
                            5
                        )
                        : null,

                items
            }
        });
    } catch (error) {
        console.error("Get employee order details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order details."
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createPurchaseRequest,
    getMyPurchaseRequests,
    getPurchaseRequestDetails,

    getManagerPendingRequests,
    getManagerPurchaseRequestDetails,

    getManagerApprovedRequests,
    getManagerRejectedRequests,
    getManagerOrders,
    getManagerOrderDetails,
    getCompanyAdminOrders,
getCompanyAdminOrderDetails,
    

    approvePurchaseRequest,
    rejectPurchaseRequest,

    getMyOrders,
    getMyOrderDetails
};