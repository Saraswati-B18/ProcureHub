const db = require("../config/db");
const bcrypt = require("bcryptjs");


/* =====================================================
   GET COMPANY USERS
===================================================== */

const getMyEmployees = (req, res) => {

    const companyId = req.user.company_id;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }

    const sql = `
        SELECT
            u.id,
            u.company_id,
            u.branch_id,
            u.name,
            u.email,
            u.phone,
            u.role,
            u.status,
            u.created_at,

            b.branch_name

        FROM users u

        LEFT JOIN branches b
            ON u.branch_id = b.id

        WHERE u.company_id = ?
        AND u.role IN ('EMPLOYEE', 'MANAGER', 'FINANCE')

        ORDER BY u.id DESC
    `;

    db.query(sql, [companyId], (error, results) => {

        if (error) {
            console.error(
                "Get employees error:",
                error
            );

            return res.status(500).json({
                message: "Failed to fetch employees."
            });
        }

        res.json({
            employees: results
        });
    });
};


/* =====================================================
   CREATE EMPLOYEE / MANAGER / FINANCE
===================================================== */

const createEmployee = async (req, res) => {

    const companyId = req.user.company_id;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }

    const {
        name,
        email,
        phone,
        password,
        role,
        branch_id
    } = req.body;

    /* ---------- Phone validation ---------- */

if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
    return res.status(400).json({
        message:
            "Phone number must be a valid 10-digit Indian mobile number."
    });
}


    /* ---------- Basic validation ---------- */

    if (
        !name?.trim() ||
        !email?.trim() ||
        !password ||
        !role ||
        !branch_id
    ) {
        return res.status(400).json({
            message:
                "Name, email, password, role and branch are required."
        });
    }


    /* ---------- Allowed roles ---------- */

    const allowedRoles = [
        "EMPLOYEE",
        "MANAGER",
        "FINANCE"
    ];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid user role."
        });
    }


    try {

        /* ---------- Check branch ---------- */

        const branchSql = `
            SELECT
                id,
                branch_name,
                status
            FROM branches
            WHERE id = ?
            AND company_id = ?
        `;

        db.query(
            branchSql,
            [branch_id, companyId],
            async (branchError, branchResults) => {

                if (branchError) {

                    console.error(
                        "Check branch error:",
                        branchError
                    );

                    return res.status(500).json({
                        message:
                            "Failed to verify branch."
                    });
                }


                if (branchResults.length === 0) {

                    return res.status(404).json({
                        message:
                            "Selected branch does not belong to your company."
                    });
                }


                if (
                    branchResults[0].status !== "ACTIVE"
                ) {

                    return res.status(400).json({
                        message:
                            "Cannot assign a user to an inactive branch."
                    });
                }


                /* ---------- Check email ---------- */

                const emailSql = `
                    SELECT id
                    FROM users
                    WHERE email = ?
                `;

                db.query(
                    emailSql,
                    [email.trim()],
                    async (emailError, emailResults) => {

                        if (emailError) {

                            console.error(
                                "Check email error:",
                                emailError
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to verify email."
                            });
                        }


                        if (emailResults.length > 0) {

                            return res.status(409).json({
                                message:
                                    "A user with this email already exists."
                            });
                        }


                        /* ---------- One Manager per branch ---------- */

                        if (
                            role === "MANAGER" ||
                            role === "FINANCE"
                        ) {

                            const roleSql = `
                                SELECT id
                                FROM users
                                WHERE company_id = ?
                                AND branch_id = ?
                                AND role = ?
                                AND status = 'ACTIVE'
                            `;

                            db.query(
                                roleSql,
                                [
                                    companyId,
                                    branch_id,
                                    role
                                ],
                                async (
                                    roleError,
                                    roleResults
                                ) => {

                                    if (roleError) {

                                        console.error(
                                            "Check branch role error:",
                                            roleError
                                        );

                                        return res.status(500).json({
                                            message:
                                                "Failed to verify branch role."
                                        });
                                    }


                                    if (
                                        roleResults.length > 0
                                    ) {

                                        return res.status(409).json({
                                            message:
                                                `This branch already has an active ${role.toLowerCase()}.`
                                        });
                                    }


                                    await insertUser();
                                }
                            );

                        } else {

                            await insertUser();
                        }


                        /* ---------- Insert user ---------- */

                        async function insertUser() {

                            const hashedPassword =
                                await bcrypt.hash(
                                    password,
                                    10
                                );


                            const insertSql = `
                                INSERT INTO users
                                (
                                    company_id,
                                    branch_id,
                                    name,
                                    email,
                                    password,
                                    role,
                                    phone,
                                    status
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
                            `;


                            db.query(
                                insertSql,
                                [
                                    companyId,
                                    branch_id,
                                    name.trim(),
                                    email.trim(),
                                    hashedPassword,
                                    role,
                                    phone?.trim() || null
                                ],
                                (
                                    insertError,
                                    result
                                ) => {

                                    if (insertError) {

                                        console.error(
                                            "Create employee error:",
                                            insertError
                                        );

                                        return res.status(500).json({
                                            message:
                                                "Failed to create user."
                                        });
                                    }


                                    res.status(201).json({
                                        message:
                                            "User created successfully.",
                                        userId:
                                            result.insertId
                                    });
                                }
                            );
                        }
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            "Create employee unexpected error:",
            error
        );

        return res.status(500).json({
            message:
                "Something went wrong while creating the user."
        });
    }
};


/* =====================================================
   UPDATE EMPLOYEE / MANAGER / FINANCE
===================================================== */

const updateEmployee = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;

    const {
        name,
        email,
        phone,
        role,
        branch_id
    } = req.body;

    /* ---------- Phone validation ---------- */

if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
    return res.status(400).json({
        message:
            "Phone number must be a valid 10-digit Indian mobile number."
    });
}

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }


    if (
        !name?.trim() ||
        !email?.trim() ||
        !role ||
        !branch_id
    ) {
        return res.status(400).json({
            message:
                "Name, email, role and branch are required."
        });
    }


    const allowedRoles = [
        "EMPLOYEE",
        "MANAGER",
        "FINANCE"
    ];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid user role."
        });
    }


    const findUserSql = `
        SELECT id
        FROM users
        WHERE id = ?
        AND company_id = ?
        AND role IN ('EMPLOYEE', 'MANAGER', 'FINANCE')
    `;


    db.query(
        findUserSql,
        [id, companyId],
        (userError, userResults) => {

            if (userError) {

                console.error(
                    "Find employee error:",
                    userError
                );

                return res.status(500).json({
                    message:
                        "Failed to verify user."
                });
            }


            if (userResults.length === 0) {

                return res.status(404).json({
                    message:
                        "User not found."
                });
            }


            const branchSql = `
                SELECT id, status
                FROM branches
                WHERE id = ?
                AND company_id = ?
            `;


            db.query(
                branchSql,
                [branch_id, companyId],
                (branchError, branchResults) => {

                    if (branchError) {

                        console.error(
                            "Check branch error:",
                            branchError
                        );

                        return res.status(500).json({
                            message:
                                "Failed to verify branch."
                        });
                    }


                    if (branchResults.length === 0) {

                        return res.status(404).json({
                            message:
                                "Selected branch does not belong to your company."
                        });
                    }


                    if (
                        branchResults[0].status !== "ACTIVE"
                    ) {

                        return res.status(400).json({
                            message:
                                "Cannot assign a user to an inactive branch."
                        });
                    }


                    const roleSql = `
                        SELECT id
                        FROM users
                        WHERE company_id = ?
                        AND branch_id = ?
                        AND role = ?
                        AND status = 'ACTIVE'
                        AND id != ?
                    `;


                    if (
                        role === "MANAGER" ||
                        role === "FINANCE"
                    ) {

                        db.query(
                            roleSql,
                            [
                                companyId,
                                branch_id,
                                role,
                                id
                            ],
                            (roleError, roleResults) => {

                                if (roleError) {

                                    console.error(
                                        "Check role error:",
                                        roleError
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to verify branch role."
                                    });
                                }


                                if (
                                    roleResults.length > 0
                                ) {

                                    return res.status(409).json({
                                        message:
                                            `This branch already has an active ${role.toLowerCase()}.`
                                    });
                                }


                                performUpdate();
                            }
                        );

                    } else {

                        performUpdate();
                    }


                    function performUpdate() {

                        const updateSql = `
                            UPDATE users
                            SET
                                name = ?,
                                email = ?,
                                phone = ?,
                                role = ?,
                                branch_id = ?
                            WHERE id = ?
                            AND company_id = ?
                        `;


                        db.query(
                            updateSql,
                            [
                                name.trim(),
                                email.trim(),
                                phone?.trim() || null,
                                role,
                                branch_id,
                                id,
                                companyId
                            ],
                            (
                                updateError,
                                result
                            ) => {

                                if (updateError) {

                                    console.error(
                                        "Update employee error:",
                                        updateError
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to update user."
                                    });
                                }


                                if (
                                    result.affectedRows === 0
                                ) {

                                    return res.status(404).json({
                                        message:
                                            "User not found."
                                    });
                                }


                                res.json({
                                    message:
                                        "User updated successfully."
                                });
                            }
                        );
                    }
                }
            );
        }
    );
};


/* =====================================================
   DEACTIVATE USER
===================================================== */

const deactivateEmployee = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;


    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }


    const sql = `
        UPDATE users
        SET status = 'INACTIVE'
        WHERE id = ?
        AND company_id = ?
        AND role IN ('EMPLOYEE', 'MANAGER', 'FINANCE')
    `;


    db.query(
        sql,
        [id, companyId],
        (error, result) => {

            if (error) {

                console.error(
                    "Deactivate employee error:",
                    error
                );

                return res.status(500).json({
                    message:
                        "Failed to deactivate user."
                });
            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "User not found."
                });
            }


            res.json({
                message:
                    "User deactivated successfully."
            });
        }
    );
};


/* =====================================================
   ACTIVATE USER
===================================================== */

const activateEmployee = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;


    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }


    const sql = `
        UPDATE users
        SET status = 'ACTIVE'
        WHERE id = ?
        AND company_id = ?
        AND role IN ('EMPLOYEE', 'MANAGER', 'FINANCE')
    `;


    db.query(
        sql,
        [id, companyId],
        (error, result) => {

            if (error) {

                console.error(
                    "Activate employee error:",
                    error
                );

                return res.status(500).json({
                    message:
                        "Failed to activate user."
                });
            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "User not found."
                });
            }


            res.json({
                message:
                    "User activated successfully."
            });
        }
    );
};


module.exports = {
    getMyEmployees,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    activateEmployee
};