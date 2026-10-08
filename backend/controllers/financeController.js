const db = require("../config/db");

// =====================================================
// GET APPROVED PURCHASE REQUESTS FOR FINANCE
// Only requests belonging to Finance user's
// company + branch are returned.
// =====================================================

const getFinanceApprovedRequests = (req, res) => {
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    if (!companyId || !branchId) {
        return res.status(400).json({
            success: false,
            message: "Finance user is not assigned to a company and branch."
        });
    }

    const query = `
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
            u.name AS requested_by_name,
            u.email AS requested_by_email,
            u.phone AS requested_by_phone
        FROM purchase_requests pr
        LEFT JOIN users u
            ON u.id = pr.requested_by
        WHERE
            pr.company_id = ?
            AND pr.branch_id = ?
            AND pr.status = 'APPROVED'
            AND NOT EXISTS (
                SELECT 1
                FROM purchase_orders po
                WHERE po.purchase_request_id = pr.id
            )
        ORDER BY pr.approved_at DESC, pr.created_at DESC
    `;

    db.query(query, [companyId, branchId], (err, results) => {
        if (err) {
            console.error(
                "Error fetching Finance approved requests:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch approved purchase requests."
            });
        }

        // =====================================================
        // GET ACTUAL PROCESSED REQUEST COUNT
        //
        // A request is considered processed when its payment
        // has SUCCESS status.
        //
        // DISTINCT is important because one purchase request
        // can create multiple purchase orders when it has
        // products from multiple suppliers.
        // =====================================================

        const processedCountQuery = `
            SELECT
                COUNT(DISTINCT po.purchase_request_id) AS processed_count
            FROM purchase_orders po
            INNER JOIN payments p
                ON p.purchase_order_id = po.id
            WHERE
                po.company_id = ?
                AND po.branch_id = ?
                AND p.status = 'SUCCESS'
        `;

        db.query(
            processedCountQuery,
            [companyId, branchId],
            (processedErr, processedResults) => {
                if (processedErr) {
                    console.error(
                        "Error fetching processed request count:",
                        processedErr
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch processed request count."
                    });
                }

                const processedCount =
                    Number(
                        processedResults[0]?.processed_count || 0
                    );

                return res.status(200).json({
                    success: true,
                    requests: results,
                    summary: {
                        processed_count: processedCount
                    }
                });
            }
        );
    });
};


// =====================================================
// GET SINGLE APPROVED PURCHASE REQUEST FOR FINANCE
// Company + branch isolation is enforced.
// =====================================================

const getFinancePurchaseRequestDetails = (req, res) => {
    const requestId = req.params.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    if (!companyId || !branchId) {
        return res.status(400).json({
            success: false,
            message: "Finance user is not assigned to a company and branch."
        });
    }

    const requestQuery = `
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
            u.phone AS requested_by_phone
        FROM purchase_requests pr
        LEFT JOIN users u
            ON u.id = pr.requested_by
        WHERE
            pr.id = ?
            AND pr.company_id = ?
            AND pr.branch_id = ?
            AND pr.status = 'APPROVED'
    `;

    db.query(
        requestQuery,
        [requestId, companyId, branchId],
        (err, requestResults) => {
            if (err) {
                console.error(
                    "Error fetching Finance request details:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch purchase request details."
                });
            }

            if (requestResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Approved purchase request not found."
                });
            }

            const request = requestResults[0];

            const itemsQuery = `
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
                WHERE pri.purchase_request_id = ?
                ORDER BY pri.id ASC
            `;

            db.query(
                itemsQuery,
                [requestId],
                (itemsErr, items) => {
                    if (itemsErr) {
                        console.error(
                            "Error fetching Finance request items:",
                            itemsErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to fetch purchase request items."
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        request: {
                            ...request,
                            items
                        }
                    });
                }
            );
        }
    );
};


// =====================================================
// PROCESS APPROVED PURCHASE REQUEST
// Finance processes payment terms and creates
// supplier-specific PO(s), invoice(s), and payment(s).
// =====================================================

const processFinancePayment = async (req, res) => {
    const requestId = req.params.id;

    const financeUserId = req.user.id;
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    const {
        payment_term = "PREPAID"
    } = req.body;

    // =====================================================
    // ALLOWED PAYMENT TERMS
    // =====================================================

    const allowedPaymentTerms = [
        "PREPAID",
        "COD",
        "NET_15",
        "NET_30"
    ];

    if (!allowedPaymentTerms.includes(payment_term)) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment term."
        });
    }

    if (!companyId || !branchId) {
        return res.status(400).json({
            success: false,
            message:
                "Finance user is not assigned to a company and branch."
        });
    }

    let transactionStarted = false;

    try {

        // =================================================
        // START TRANSACTION
        // =================================================

        await new Promise((resolve, reject) => {
            db.beginTransaction((err) => {
                if (err) {
                    reject(err);
                } else {
                    transactionStarted = true;
                    resolve();
                }
            });
        });


        // =================================================
        // GET APPROVED REQUEST
        // COMPANY + BRANCH ISOLATION
        // =================================================

        const request = await new Promise(
            (resolve, reject) => {

                const query = `
                    SELECT
                        pr.id,
                        pr.request_number,
                        pr.company_id,
                        pr.branch_id,
                        pr.status,
                        pr.total_amount
                    FROM purchase_requests pr
                    WHERE
                        pr.id = ?
                        AND pr.company_id = ?
                        AND pr.branch_id = ?
                        AND pr.status = 'APPROVED'
                    FOR UPDATE
                `;

                db.query(
                    query,
                    [
                        requestId,
                        companyId,
                        branchId
                    ],
                    (err, results) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(results[0]);
                    }
                );
            }
        );


        if (!request) {
            throw new Error(
                "Approved purchase request not found or it has already been processed."
            );
        }


        // =================================================
        // PREVENT DUPLICATE PROCESSING
        // =================================================

        const existingOrders = await new Promise(
            (resolve, reject) => {

                const query = `
                    SELECT id
                    FROM purchase_orders
                    WHERE purchase_request_id = ?
                    LIMIT 1
                `;

                db.query(
                    query,
                    [requestId],
                    (err, results) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(results);
                    }
                );
            }
        );


        if (existingOrders.length > 0) {
            throw new Error(
                "This purchase request has already been processed."
            );
        }


        // =================================================
        // GET REQUEST ITEMS
        // =================================================

        const items = await new Promise(
            (resolve, reject) => {

                const query = `
                    SELECT
                        pri.id,
                        pri.product_id,
                        pri.supplier_id,
                        pri.quantity,
                        pri.unit_price,
                        pri.total_price,
                        p.product_name,
                        s.supplier_name
                    FROM purchase_request_items pri
                    INNER JOIN products p
                        ON pri.product_id = p.id
                    INNER JOIN suppliers s
                        ON pri.supplier_id = s.id
                    WHERE
                        pri.purchase_request_id = ?
                    ORDER BY pri.id ASC
                `;

                db.query(
                    query,
                    [requestId],
                    (err, results) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(results);
                    }
                );
            }
        );


        if (items.length === 0) {
            throw new Error(
                "This purchase request has no products."
            );
        }


        // =================================================
        // GROUP PRODUCTS BY SUPPLIER
        // =================================================

        const supplierGroups = {};

        for (const item of items) {

            if (!supplierGroups[item.supplier_id]) {

                supplierGroups[item.supplier_id] = {
                    supplier_id: item.supplier_id,
                    supplier_name: item.supplier_name,
                    items: [],
                    subtotal: 0
                };

            }

            supplierGroups[item.supplier_id].items.push(item);

            supplierGroups[item.supplier_id].subtotal +=
                Number(item.total_price || 0);
        }


        const createdOrders = [];


        // =================================================
        // CREATE ONE PO PER SUPPLIER
        // =================================================

        for (const supplierId in supplierGroups) {

            const group =
                supplierGroups[supplierId];


            // =============================================
            // CALCULATE SUPPLIER TOTAL
            // =============================================

            const subtotal =
                Number(group.subtotal.toFixed(2));

            const tax =
                Number((subtotal * 0.18).toFixed(2));

            const totalAmount =
                Number(
                    (subtotal + tax).toFixed(2)
                );


            // =============================================
            // CHECK AND REDUCE STOCK
            // =============================================

            for (const item of group.items) {

                const supplierProduct =
                    await new Promise(
                        (resolve, reject) => {

                            const query = `
                                SELECT
                                    id,
                                    stock_quantity
                                FROM supplier_products
                                WHERE
                                    product_id = ?
                                    AND supplier_id = ?
                                    AND status = 'ACTIVE'
                                FOR UPDATE
                            `;

                            db.query(
                                query,
                                [
                                    item.product_id,
                                    item.supplier_id
                                ],
                                (err, results) => {

                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    resolve(results[0]);
                                }
                            );
                        }
                    );


                if (!supplierProduct) {
                    throw new Error(
                        `Supplier product not found for ${item.product_name}.`
                    );
                }


                const availableStock =
                    Number(
                        supplierProduct.stock_quantity
                    );

                const requestedQuantity =
                    Number(item.quantity);


                if (
                    availableStock <
                    requestedQuantity
                ) {

                    throw new Error(
                        `Insufficient stock for ${item.product_name}. Available: ${availableStock}, Required: ${requestedQuantity}.`
                    );
                }


                await new Promise(
                    (resolve, reject) => {

                        const query = `
                            UPDATE supplier_products
                            SET stock_quantity =
                                stock_quantity - ?
                            WHERE id = ?
                        `;

                        db.query(
                            query,
                            [
                                requestedQuantity,
                                supplierProduct.id
                            ],
                            (err) => {

                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }

                            }
                        );
                    }
                );
            }


            // =============================================
            // CREATE PO NUMBER
            // =============================================

            const poNumber =
                `PO-${new Date().getFullYear()}-${String(
                    request.id
                ).padStart(5, "0")}-${String(
                    supplierId
                ).padStart(3, "0")}`;


            // =============================================
            // CREATE PURCHASE ORDER
            // =============================================

            const purchaseOrder =
                await new Promise(
                    (resolve, reject) => {

                        const query = `
                            INSERT INTO purchase_orders
                            (
                                po_number,
                                purchase_request_id,
                                company_id,
                                branch_id,
                                supplier_id,
                                created_by,
                                payment_method,
                                total_amount,
                                status
                            )
                            VALUES
                            (
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                'PENDING'
                            )
                        `;

                        db.query(
                            query,
                            [
                                poNumber,
                                request.id,
                                companyId,
                                branchId,
                                supplierId,
                                financeUserId,
                                payment_term,
                                totalAmount
                            ],
                            (err, result) => {

                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve(result);
                            }
                        );
                    }
                );


            const purchaseOrderId =
                purchaseOrder.insertId;


            // =============================================
            // CREATE PO ITEMS
            // =============================================

            for (const item of group.items) {

                await new Promise(
                    (resolve, reject) => {

                        const query = `
                            INSERT INTO purchase_order_items
                            (
                                purchase_order_id,
                                product_id,
                                quantity,
                                unit_price,
                                total_price
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `;

                        db.query(
                            query,
                            [
                                purchaseOrderId,
                                item.product_id,
                                item.quantity,
                                item.unit_price,
                                item.total_price
                            ],
                            (err) => {

                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }

                            }
                        );
                    }
                );
            }


            // =============================================
            // CALCULATE INVOICE DUE DATE
            // =============================================

            let dueDateExpression = "NULL";


            if (payment_term === "NET_15") {

                dueDateExpression =
                    "DATE_ADD(CURDATE(), INTERVAL 15 DAY)";
            }


            if (payment_term === "NET_30") {

                dueDateExpression =
                    "DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
            }


            // =============================================
            // CALCULATE INVOICE STATUS
            // =============================================

            let invoiceStatus = "ISSUED";


            if (payment_term === "PREPAID") {

                invoiceStatus = "PAID";
            }


            // =============================================
            // CREATE INVOICE
            // =============================================

            const invoiceNumber =
                `INV-${new Date().getFullYear()}-${String(
                    purchaseOrderId
                ).padStart(6, "0")}`;


            const invoice =
                await new Promise(
                    (resolve, reject) => {

                        const query = `
                            INSERT INTO invoices
                            (
                                invoice_number,
                                purchase_order_id,
                                supplier_id,
                                created_by,
                                invoice_date,
                                due_date,
                                subtotal,
                                tax,
                                total_amount,
                                status
                            )
                            VALUES
                            (
                                ?,
                                ?,
                                ?,
                                ?,
                                CURDATE(),
                                ${dueDateExpression},
                                ?,
                                ?,
                                ?,
                                ?
                            )
                        `;

                        db.query(
                            query,
                            [
                                invoiceNumber,
                                purchaseOrderId,
                                supplierId,
                                financeUserId,
                                subtotal,
                                tax,
                                totalAmount,
                                invoiceStatus
                            ],
                            (err, result) => {

                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve(result);
                            }
                        );
                    }
                );


            const invoiceId =
                invoice.insertId;


            // =============================================
            // CREATE PAYMENT
            // =============================================

            const transactionReference =
                `PAY-${Date.now()}-${purchaseOrderId}`;


            let paymentStatus = "PENDING";

            let recordedPaymentAmount = 0;


            // =============================================
            // PREPAID
            // =============================================

            if (payment_term === "PREPAID") {

                paymentStatus = "SUCCESS";

                recordedPaymentAmount =
                    totalAmount;
            }


            // =============================================
            // COD / NET 15 / NET 30
            // =============================================

            if (
                payment_term === "COD" ||
                payment_term === "NET_15" ||
                payment_term === "NET_30"
            ) {

                paymentStatus = "PENDING";

                // Store the full amount as outstanding amount.
                // Actual payment has not happened yet.
                recordedPaymentAmount =
                    totalAmount;
            }


            // =============================================
            // INSERT PAYMENT
            // =============================================

            await new Promise(
                (resolve, reject) => {

                    const query = `
                        INSERT INTO payments
                        (
                            invoice_id,
                            purchase_order_id,
                            payment_method,
                            amount,
                            payment_date,
                            transaction_reference,
                            status,
                            recorded_by
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            ?,
                            ?,
                            NOW(),
                            ?,
                            ?,
                            ?
                        )
                    `;

                    db.query(
                        query,
                        [
                            invoiceId,
                            purchaseOrderId,
                            payment_term,
                            recordedPaymentAmount,
                            transactionReference,
                            paymentStatus,
                            financeUserId
                        ],
                        (err) => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }

                        }
                    );
                }
            );


            // =============================================
            // STORE CREATED ORDER DETAILS
            // =============================================

            createdOrders.push({

                purchase_order_id:
                    purchaseOrderId,

                po_number:
                    poNumber,

                invoice_id:
                    invoiceId,

                invoice_number:
                    invoiceNumber,

                supplier_id:
                    supplierId,

                supplier_name:
                    group.supplier_name,

                amount:
                    totalAmount,

                payment_amount:
                    recordedPaymentAmount,

                payment_status:
                    paymentStatus,

                payment_term

            });
        }


        // =================================================
        // COMMIT
        // =================================================

        await new Promise(
            (resolve, reject) => {

                db.commit((err) => {

                    if (err) {
                        reject(err);
                    } else {

                        transactionStarted = false;

                        resolve();
                    }

                });
            }
        );


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                payment_term === "PREPAID"
                    ? "Payment processed and supplier order(s) created successfully."
                    : "Supplier order(s) created and payment terms recorded successfully.",

            payment_term,

            request_number:
                request.request_number,

            orders:
                createdOrders

        });


    } catch (error) {

        console.error(
            "Finance payment processing error:",
            error
        );


        if (transactionStarted) {

            await new Promise(
                (resolve) => {

                    db.rollback(() => {
                        resolve();
                    });

                }
            );
        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to process payment."

        });
    }
};


// =====================================================
// GET FINANCE PAYMENTS
// Only payments belonging to Finance user's
// company + branch are returned.
// =====================================================

const getFinancePayments = (req, res) => {

    const companyId = req.user.company_id;

    const branchId = req.user.branch_id;


    if (!companyId || !branchId) {

        return res.status(400).json({

            success: false,

            message:
                "Finance user is not assigned to a company and branch."

        });
    }


    const query = `
        SELECT
            p.id,
            p.invoice_id,
            p.purchase_order_id,
            p.payment_method,
            p.amount,
            p.payment_date,
            p.transaction_reference,
            p.status,
            p.recorded_by,
            p.created_at,
            i.invoice_number,
            i.total_amount AS invoice_total,
            i.status AS invoice_status,
            i.due_date,
            po.po_number,
            s.supplier_name
        FROM payments p
        INNER JOIN purchase_orders po
            ON p.purchase_order_id = po.id
        INNER JOIN invoices i
            ON p.invoice_id = i.id
        INNER JOIN suppliers s
            ON po.supplier_id = s.id
        WHERE
            po.company_id = ?
            AND po.branch_id = ?
        ORDER BY p.payment_date DESC
    `;


    db.query(
        query,
        [companyId, branchId],
        (err, payments) => {

            if (err) {

                console.error(
                    "Error fetching Finance payments:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Failed to fetch payments."

                });
            }


            const totalPayments =
                payments.length;


            const pendingPayments =
                payments.filter(
                    payment =>
                        payment.status === "PENDING"
                ).length;


            const completedPayments =
                payments.filter(
                    payment =>
                        payment.status === "SUCCESS"
                ).length;


            const failedPayments =
                payments.filter(
                    payment =>
                        payment.status === "FAILED"
                ).length;


            const outstandingAmount =
                payments
                    .filter(
                        payment =>
                            payment.status !== "SUCCESS"
                    )
                    .reduce(
                        (total, payment) =>
                            total +
                            Number(payment.amount || 0),
                        0
                    );


            return res.status(200).json({

                success: true,

                summary: {

                    total_payments:
                        totalPayments,

                    pending_payments:
                        pendingPayments,

                    completed_payments:
                        completedPayments,

                    failed_payments:
                        failedPayments,

                    outstanding_amount:
                        outstandingAmount

                },

                payments

            });
        }
    );
};

// =====================================================
// GET FINANCE REPORTS
// Only data belonging to Finance user's
// company + branch is returned.
// =====================================================

const getFinanceReports = (req, res) => {
    const companyId = req.user.company_id;
    const branchId = req.user.branch_id;

    if (!companyId || !branchId) {
        return res.status(400).json({
            success: false,
            message:
                "Finance user is not assigned to a company and branch."
        });
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    const summaryQuery = `
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN i.invoice_date >= DATE_FORMAT(
                            CURDATE(),
                            '%Y-%m-01'
                        )
                        THEN i.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_purchase_value,

            COALESCE(
                SUM(
                    CASE
                        WHEN i.invoice_date >= DATE_FORMAT(
                            CURDATE(),
                            '%Y-%m-01'
                        )
                        THEN COALESCE(
                            paid.total_paid,
                            0
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS total_paid_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN i.invoice_date >= DATE_FORMAT(
                            CURDATE(),
                            '%Y-%m-01'
                        )
                        THEN GREATEST(
                            i.total_amount -
                            COALESCE(
                                paid.total_paid,
                                0
                            ),
                            0
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS outstanding_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN i.invoice_date >= DATE_FORMAT(
                            CURDATE(),
                            '%Y-%m-01'
                        )
                        AND i.due_date < CURDATE()
                        AND GREATEST(
                            i.total_amount -
                            COALESCE(
                                paid.total_paid,
                                0
                            ),
                            0
                        ) > 0
                        THEN GREATEST(
                            i.total_amount -
                            COALESCE(
                                paid.total_paid,
                                0
                            ),
                            0
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS overdue_amount

        FROM invoices i

        INNER JOIN purchase_orders po
            ON i.purchase_order_id = po.id

        LEFT JOIN (
            SELECT
                invoice_id,
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ) AS total_paid

            FROM payments

            GROUP BY invoice_id
        ) paid
            ON paid.invoice_id = i.id

        WHERE
            po.company_id = ?
            AND po.branch_id = ?
    `;

    // =====================================================
    // MONTHLY SUMMARY
    // LAST 6 MONTHS
    // =====================================================

    const monthlyQuery = `
        SELECT
            DATE_FORMAT(
                i.invoice_date,
                '%M %Y'
            ) AS month,

            DATE_FORMAT(
                i.invoice_date,
                '%Y-%m'
            ) AS month_key,

            COALESCE(
                SUM(i.total_amount),
                0
            ) AS purchase_value,

            COALESCE(
                SUM(
                    COALESCE(
                        paid.total_paid,
                        0
                    )
                ),
                0
            ) AS paid_amount,

            COALESCE(
                SUM(
                    GREATEST(
                        i.total_amount -
                        COALESCE(
                            paid.total_paid,
                            0
                        ),
                        0
                    )
                ),
                0
            ) AS outstanding_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN i.due_date < CURDATE()
                        AND GREATEST(
                            i.total_amount -
                            COALESCE(
                                paid.total_paid,
                                0
                            ),
                            0
                        ) > 0
                        THEN GREATEST(
                            i.total_amount -
                            COALESCE(
                                paid.total_paid,
                                0
                            ),
                            0
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS overdue_amount

        FROM invoices i

        INNER JOIN purchase_orders po
            ON i.purchase_order_id = po.id

        LEFT JOIN (
            SELECT
                invoice_id,
                SUM(
                    CASE
                        WHEN status = 'SUCCESS'
                        THEN amount
                        ELSE 0
                    END
                ) AS total_paid

            FROM payments

            GROUP BY invoice_id
        ) paid
            ON paid.invoice_id = i.id

        WHERE
            po.company_id = ?
            AND po.branch_id = ?
            AND i.invoice_date >= DATE_SUB(
                DATE_FORMAT(
                    CURDATE(),
                    '%Y-%m-01'
                ),
                INTERVAL 5 MONTH
            )

        GROUP BY
            DATE_FORMAT(
                i.invoice_date,
                '%Y-%m'
            ),
            DATE_FORMAT(
                i.invoice_date,
                '%M %Y'
            )

        ORDER BY
            month_key DESC
    `;

    // =====================================================
    // PROCUREMENT ACTIVITY
    // =====================================================

    const activityQuery = `
        SELECT
            COUNT(
                DISTINCT po.id
            ) AS purchase_orders,

            COUNT(
                DISTINCT i.id
            ) AS invoices,

            COUNT(
                DISTINCT p.id
            ) AS payment_transactions,

            COUNT(
                DISTINCT po.supplier_id
            ) AS suppliers_used

        FROM purchase_orders po

        LEFT JOIN invoices i
            ON i.purchase_order_id = po.id

        LEFT JOIN payments p
            ON p.purchase_order_id = po.id

        WHERE
            po.company_id = ?
            AND po.branch_id = ?
    `;

    // =====================================================
    // PAYMENT METHODS
    // =====================================================

    const paymentMethodsQuery = `
        SELECT
            po.payment_method,

            COUNT(
                DISTINCT p.id
            ) AS transaction_count,

            COALESCE(
                SUM(
                    CASE
                        WHEN p.status = 'SUCCESS'
                        THEN p.amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_amount

        FROM purchase_orders po

        LEFT JOIN payments p
            ON p.purchase_order_id = po.id

        WHERE
            po.company_id = ?
            AND po.branch_id = ?

        GROUP BY
            po.payment_method

        ORDER BY
            total_amount DESC
    `;

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    const paymentStatusQuery = `
        SELECT
            p.status,

            COUNT(*) AS transaction_count,

            COALESCE(
                SUM(p.amount),
                0
            ) AS total_amount

        FROM payments p

        INNER JOIN purchase_orders po
            ON p.purchase_order_id = po.id

        WHERE
            po.company_id = ?
            AND po.branch_id = ?

        GROUP BY
            p.status

        ORDER BY
            transaction_count DESC
    `;

    // =====================================================
    // SUPPLIER SPEND
    // =====================================================

    const supplierSpendQuery = `
        SELECT
            po.supplier_id,

            s.supplier_name,

            COUNT(
                DISTINCT po.id
            ) AS purchase_orders,

            COUNT(
                DISTINCT i.id
            ) AS invoices,

            COALESCE(
                SUM(
                    i.total_amount
                ),
                0
            ) AS total_spend

        FROM purchase_orders po

        INNER JOIN suppliers s
            ON po.supplier_id = s.id

        LEFT JOIN invoices i
            ON i.purchase_order_id = po.id

        WHERE
            po.company_id = ?
            AND po.branch_id = ?

        GROUP BY
            po.supplier_id,
            s.supplier_name

        ORDER BY
            total_spend DESC
    `;

    // =====================================================
    // SUMMARY QUERY
    // =====================================================

    db.query(
        summaryQuery,
        [companyId, branchId],
        (summaryErr, summaryResults) => {
            if (summaryErr) {
                console.error(
                    "Error fetching Finance report summary:",
                    summaryErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to fetch financial report summary."
                });
            }

            // =================================================
            // MONTHLY QUERY
            // =================================================

            db.query(
                monthlyQuery,
                [companyId, branchId],
                (monthlyErr, monthlyResults) => {
                    if (monthlyErr) {
                        console.error(
                            "Error fetching monthly Finance reports:",
                            monthlyErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to fetch monthly financial reports."
                        });
                    }

                    // =============================================
                    // ACTIVITY
                    // =============================================

                    db.query(
                        activityQuery,
                        [companyId, branchId],
                        (activityErr, activityResults) => {
                            if (activityErr) {
                                console.error(
                                    "Error fetching Finance activity:",
                                    activityErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to fetch procurement activity."
                                });
                            }

                            // =========================================
                            // PAYMENT METHODS
                            // =========================================

                            db.query(
                                paymentMethodsQuery,
                                [companyId, branchId],
                                (methodErr, methodResults) => {
                                    if (methodErr) {
                                        console.error(
                                            "Error fetching payment methods:",
                                            methodErr
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to fetch payment method report."
                                        });
                                    }

                                    // =================================
                                    // PAYMENT STATUS
                                    // =================================

                                    db.query(
                                        paymentStatusQuery,
                                        [companyId, branchId],
                                        (statusErr, statusResults) => {
                                            if (statusErr) {
                                                console.error(
                                                    "Error fetching payment status:",
                                                    statusErr
                                                );

                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to fetch payment status report."
                                                });
                                            }

                                            // =============================
                                            // SUPPLIER SPEND
                                            // =============================

                                            db.query(
                                                supplierSpendQuery,
                                                [companyId, branchId],
                                                (supplierErr, supplierResults) => {
                                                    if (supplierErr) {
                                                        console.error(
                                                            "Error fetching supplier spend:",
                                                            supplierErr
                                                        );

                                                        return res.status(500).json({
                                                            success: false,
                                                            message:
                                                                "Failed to fetch supplier spend report."
                                                        });
                                                    }

                                                    const summary =
                                                        summaryResults[0] || {};

                                                    const activity =
                                                        activityResults[0] || {};

                                                    return res.status(200).json({
                                                        success: true,

                                                        summary: {
                                                            total_purchase_value:
                                                                Number(
                                                                    summary.total_purchase_value ||
                                                                    0
                                                                ),

                                                            total_paid_amount:
                                                                Number(
                                                                    summary.total_paid_amount ||
                                                                    0
                                                                ),

                                                            outstanding_amount:
                                                                Number(
                                                                    summary.outstanding_amount ||
                                                                    0
                                                                ),

                                                            overdue_amount:
                                                                Number(
                                                                    summary.overdue_amount ||
                                                                    0
                                                                )
                                                        },

                                                        activity: {
                                                            purchase_orders:
                                                                Number(
                                                                    activity.purchase_orders ||
                                                                    0
                                                                ),

                                                            invoices:
                                                                Number(
                                                                    activity.invoices ||
                                                                    0
                                                                ),

                                                            payment_transactions:
                                                                Number(
                                                                    activity.payment_transactions ||
                                                                    0
                                                                ),

                                                            suppliers_used:
                                                                Number(
                                                                    activity.suppliers_used ||
                                                                    0
                                                                )
                                                        },

                                                        payment_methods:
                                                            methodResults.map(
                                                                row => ({
                                                                    payment_method:
                                                                        row.payment_method,

                                                                    transaction_count:
                                                                        Number(
                                                                            row.transaction_count ||
                                                                            0
                                                                        ),

                                                                    total_amount:
                                                                        Number(
                                                                            row.total_amount ||
                                                                            0
                                                                        )
                                                                })
                                                            ),

                                                        payment_status:
                                                            statusResults.map(
                                                                row => ({
                                                                    status:
                                                                        row.status,

                                                                    transaction_count:
                                                                        Number(
                                                                            row.transaction_count ||
                                                                            0
                                                                        ),

                                                                    total_amount:
                                                                        Number(
                                                                            row.total_amount ||
                                                                            0
                                                                        )
                                                                })
                                                            ),

                                                        supplier_spend:
                                                            supplierResults.map(
                                                                row => ({
                                                                    supplier_id:
                                                                        row.supplier_id,

                                                                    supplier_name:
                                                                        row.supplier_name,

                                                                    purchase_orders:
                                                                        Number(
                                                                            row.purchase_orders ||
                                                                            0
                                                                        ),

                                                                    invoices:
                                                                        Number(
                                                                            row.invoices ||
                                                                            0
                                                                        ),

                                                                    total_spend:
                                                                        Number(
                                                                            row.total_spend ||
                                                                            0
                                                                        )
                                                                })
                                                            ),

                                                        monthly_summary:
                                                            monthlyResults.map(
                                                                row => ({
                                                                    month:
                                                                        row.month,

                                                                    purchase_value:
                                                                        Number(
                                                                            row.purchase_value ||
                                                                            0
                                                                        ),

                                                                    paid_amount:
                                                                        Number(
                                                                            row.paid_amount ||
                                                                            0
                                                                        ),

                                                                    outstanding_amount:
                                                                        Number(
                                                                            row.outstanding_amount ||
                                                                            0
                                                                        ),

                                                                    overdue_amount:
                                                                        Number(
                                                                            row.overdue_amount ||
                                                                            0
                                                                        )
                                                                })
                                                            )
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getFinanceApprovedRequests,
    getFinancePurchaseRequestDetails,
    processFinancePayment,
    getFinancePayments,
    getFinanceReports
};