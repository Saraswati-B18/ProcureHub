const db = require("../config/db");
const bcrypt = require("bcryptjs");

/* ---------------------------------------
   Validation Helpers
--------------------------------------- */

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
};

const isValidName = (name) => {
    return /^[A-Za-z][A-Za-z\s.'-]*$/.test(name);
};


/* ---------------------------------------
   CREATE COMPANY
--------------------------------------- */

const createCompany = async (req, res) => {

    const {
        company_name,
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


    /* ---------------------------------------
       Required Field Validation
    --------------------------------------- */

    if (
        !company_name ||
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


    /* ---------------------------------------
       Trim Values
    --------------------------------------- */

    const companyName = company_name.trim();
    const companyEmail = email.trim().toLowerCase();
    const companyPhone = phone.trim();
    const companyAddress = address.trim();
    const companyCity = city.trim();
    const companyState = state.trim();

    const adminName = admin_name.trim();
    const adminEmail = admin_email.trim().toLowerCase();
    const adminPassword = admin_password;
    const adminPhone = admin_phone.trim();


    /* ---------------------------------------
       Company Name Validation
    --------------------------------------- */

    if (
    companyName.length < 2 ||
    !/[A-Za-z]/.test(companyName) ||
    /^\d+$/.test(companyName)
) {
    return res.status(400).json({
        message: "Please enter a valid company name."
    });
}


    /* ---------------------------------------
       Company Email Validation
    --------------------------------------- */

    if (!isValidEmail(companyEmail)) {
        return res.status(400).json({
            message: "Please enter a valid company email address."
        });
    }


    /* ---------------------------------------
       Company Phone Validation
    --------------------------------------- */

    if (!isValidPhone(companyPhone)) {
        return res.status(400).json({
            message: "Please enter a valid 10-digit company mobile number."
        });
    }


    /* ---------------------------------------
       Address / City / State Validation
    --------------------------------------- */

    if (companyAddress.length < 5) {
        return res.status(400).json({
            message: "Please enter a valid company address."
        });
    }

    if (companyCity.length < 2) {
        return res.status(400).json({
            message: "Please enter a valid city."
        });
    }

    if (companyState.length < 2) {
        return res.status(400).json({
            message: "Please enter a valid state."
        });
    }


    /* ---------------------------------------
       Admin Name Validation
    --------------------------------------- */

    if (!isValidName(adminName)) {
        return res.status(400).json({
            message:
                "Admin name can contain only letters, spaces and basic punctuation."
        });
    }


    /* ---------------------------------------
       Admin Email Validation
    --------------------------------------- */

    if (!isValidEmail(adminEmail)) {
        return res.status(400).json({
            message: "Please enter a valid Company Admin email address."
        });
    }


    /* ---------------------------------------
       Password Validation
    --------------------------------------- */

    if (adminPassword.length < 6) {
        return res.status(400).json({
            message: "Admin password must be at least 6 characters long."
        });
    }


    /* ---------------------------------------
       Admin Phone Validation
    --------------------------------------- */

    if (!isValidPhone(adminPhone)) {
        return res.status(400).json({
            message: "Please enter a valid 10-digit Admin mobile number."
        });
    }


    try {

        /* ---------------------------------------
           Check Duplicate Admin Email
        --------------------------------------- */

        db.query(
            "SELECT id FROM users WHERE email = ?",
            [adminEmail],
            async (userCheckError, existingUsers) => {

                if (userCheckError) {
                    console.error(
                        "User email check error:",
                        userCheckError
                    );

                    return res.status(500).json({
                        message: "Server error while checking admin email."
                    });
                }


                if (existingUsers.length > 0) {
                    return res.status(409).json({
                        message:
                            "This Company Admin email is already registered."
                    });
                }


                /* ---------------------------------------
                   Check Duplicate Company Email
                --------------------------------------- */

                db.query(
                    "SELECT id FROM companies WHERE email = ?",
                    [companyEmail],
                    async (companyCheckError, existingCompanies) => {

                        if (companyCheckError) {
                            console.error(
                                "Company email check error:",
                                companyCheckError
                            );

                            return res.status(500).json({
                                message:
                                    "Server error while checking company email."
                            });
                        }


                        if (existingCompanies.length > 0) {
                            return res.status(409).json({
                                message:
                                    "A company with this email already exists."
                            });
                        }


                        /* ---------------------------------------
                           Hash Password
                        --------------------------------------- */

                        const hashedPassword = await bcrypt.hash(
                            adminPassword,
                            10
                        );


                        /* ---------------------------------------
                           Start Transaction
                        --------------------------------------- */

                        db.beginTransaction((transactionError) => {

                            if (transactionError) {
                                console.error(
                                    "Transaction start error:",
                                    transactionError
                                );

                                return res.status(500).json({
                                    message:
                                        "Could not start database transaction."
                                });
                            }


                            /* ---------------------------------------
                               Create Company
                            --------------------------------------- */

                            const companySql = `
                                INSERT INTO companies
                                (
                                    company_name,
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
                                companySql,
                                [
                                    companyName,
                                    companyEmail,
                                    companyPhone,
                                    companyAddress,
                                    companyCity,
                                    companyState
                                ],
                                (companyError, companyResult) => {

                                    if (companyError) {

                                        return db.rollback(() => {

                                            console.error(
                                                "Company creation error:",
                                                companyError
                                            );

                                            res.status(500).json({
                                                message:
                                                    "Failed to create company."
                                            });

                                        });
                                    }


                                    const companyId =
                                        companyResult.insertId;


                                    /* ---------------------------------------
                                       Create Company Admin
                                    --------------------------------------- */

                                    const userSql = `
                                        INSERT INTO users
                                        (
                                            company_id,
                                            name,
                                            email,
                                            password,
                                            role,
                                            phone,
                                            status
                                        )
                                        VALUES
                                        (
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            'COMPANY_ADMIN',
                                            ?,
                                            'ACTIVE'
                                        )
                                    `;


                                    db.query(
                                        userSql,
                                        [
                                            companyId,
                                            adminName,
                                            adminEmail,
                                            hashedPassword,
                                            adminPhone
                                        ],
                                        (userError, userResult) => {

                                            if (userError) {

                                                return db.rollback(() => {

                                                    console.error(
                                                        "Company Admin creation error:",
                                                        userError
                                                    );

                                                    res.status(500).json({
                                                        message:
                                                            "Failed to create Company Admin."
                                                    });

                                                });
                                            }


                                            /* ---------------------------------------
                                               Commit Transaction
                                            --------------------------------------- */

                                            db.commit((commitError) => {

                                                if (commitError) {

                                                    return db.rollback(() => {

                                                        console.error(
                                                            "Transaction commit error:",
                                                            commitError
                                                        );

                                                        res.status(500).json({
                                                            message:
                                                                "Failed to save company and Company Admin."
                                                        });

                                                    });
                                                }


                                                /* ---------------------------------------
                                                   Success Response
                                                --------------------------------------- */

                                                res.status(201).json({

                                                    message:
                                                        "Company and Company Admin created successfully.",

                                                    company: {
                                                        id: companyId,
                                                        company_name:
                                                            companyName,
                                                        email:
                                                            companyEmail,
                                                        phone:
                                                            companyPhone,
                                                        status:
                                                            "ACTIVE"
                                                    },

                                                    companyAdmin: {
                                                        id:
                                                            userResult.insertId,
                                                        name:
                                                            adminName,
                                                        email:
                                                            adminEmail,
                                                        role:
                                                            "COMPANY_ADMIN",
                                                        company_id:
                                                            companyId
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
            "Create company error:",
            error
        );

        res.status(500).json({
            message: "Server error."
        });

    }
};


/* ---------------------------------------
   GET ALL COMPANIES
--------------------------------------- */

const getCompanies = (req, res) => {

    const sql = `
    SELECT
        c.id,
        c.company_name,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.state,
        c.status,
        c.created_at,

        ca.name AS admin_name,
        ca.email AS admin_email,
        ca.phone AS admin_phone,

        COUNT(DISTINCT u.id) AS user_count,
        COUNT(DISTINCT b.id) AS branch_count

    FROM companies c

    LEFT JOIN users ca
        ON c.id = ca.company_id
        AND ca.role = 'COMPANY_ADMIN'

    LEFT JOIN users u
        ON c.id = u.company_id

    LEFT JOIN branches b
        ON c.id = b.company_id

    GROUP BY
        c.id,
        c.company_name,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.state,
        c.status,
        c.created_at,
        ca.name,
        ca.email,
        ca.phone

    ORDER BY c.id DESC
`;


    db.query(sql, (error, results) => {

        if (error) {

            console.error(
                "Get companies error:",
                error
            );

            return res.status(500).json({
                message: "Failed to fetch companies."
            });
        }


        res.json({
            companies: results
        });

    });
};


/* ---------------------------------------
   GET COMPANY / PLATFORM STATISTICS
--------------------------------------- */

const getCompanyStats = (req, res) => {

    const sql = `
        SELECT

            (
                SELECT COUNT(*)
                FROM companies
            ) AS total_companies,

            (
                SELECT COUNT(*)
                FROM suppliers
            ) AS total_suppliers,

            (
                SELECT COUNT(*)
                FROM users
            ) AS total_users,

            (
                SELECT COUNT(*)
                FROM products
                WHERE status = 'ACTIVE'
            ) AS active_products

    `;

    db.query(sql, (error, results) => {

        if (error) {

            console.error(
                "Get platform statistics error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to fetch platform statistics."
            });
        }

        res.json({
            stats: results[0]
        });

    });
};




const updateCompany = (req, res) => {
    const { id } = req.params;

    const {
        company_name,
        email,
        phone,
        address,
        city,
        state
    } = req.body;

    if (
        !company_name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state
    ) {
        return res.status(400).json({
            message: "All company fields are required."
        });
    }

    const sql = `
        UPDATE companies
        SET
            company_name = ?,
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
            company_name.trim(),
            email.trim(),
            phone.trim(),
            address.trim(),
            city.trim(),
            state.trim(),
            id
        ],
        (err, result) => {

            if (err) {
                console.error("Update company error:", err);

                return res.status(500).json({
                    message: "Failed to update company."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Company not found."
                });
            }

            res.json({
                message: "Company updated successfully."
            });
        }
    );
};

/* ---------------------------------------
   Delete Company
--------------------------------------- */

const deleteCompany = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM companies WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Delete company error:", err);

            return res.status(500).json({
                message: "Failed to delete company."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Company not found."
            });
        }

        res.json({
            message: "Company deleted successfully."
        });
    });
};

// ==========================================
// DEACTIVATE COMPANY
// ==========================================

const deactivateCompany = (req, res) => {
    const { id } = req.params;

    const companySql = `
        UPDATE companies
        SET status = 'INACTIVE'
        WHERE id = ?
    `;

    db.query(companySql, [id], (err, result) => {

        if (err) {
            console.error("Deactivate company error:", err);

            return res.status(500).json({
                message: "Failed to deactivate company."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Company not found."
            });
        }

        // Deactivate all users belonging to this company
        const userSql = `
            UPDATE users
            SET status = 'INACTIVE'
            WHERE company_id = ?
        `;

        db.query(userSql, [id], (userErr) => {

            if (userErr) {
                console.error(
                    "Deactivate company users error:",
                    userErr
                );

                return res.status(500).json({
                    message:
                        "Company deactivated, but company users could not be deactivated."
                });
            }

            res.json({
                message:
                    "Company and its users deactivated successfully."
            });
        });
    });
};


// ==========================================
// ACTIVATE COMPANY
// ==========================================

const activateCompany = (req, res) => {
    const { id } = req.params;

    const companySql = `
        UPDATE companies
        SET status = 'ACTIVE'
        WHERE id = ?
    `;

    db.query(companySql, [id], (err, result) => {

        if (err) {
            console.error("Activate company error:", err);

            return res.status(500).json({
                message: "Failed to activate company."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Company not found."
            });
        }

        // Activate all users belonging to this company
        const userSql = `
            UPDATE users
            SET status = 'ACTIVE'
            WHERE company_id = ?
        `;

        db.query(userSql, [id], (userErr) => {

            if (userErr) {
                console.error(
                    "Activate company users error:",
                    userErr
                );

                return res.status(500).json({
                    message:
                        "Company activated, but company users could not be activated."
                });
            }

            res.json({
                message:
                    "Company and its users activated successfully."
            });
        });
    });
};

// ==========================================
// GET MY COMPANY - COMPANY ADMIN
// ==========================================

const getMyCompany = (req, res) => {
    const companyId = req.user.company_id;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found for this user."
        });
    }

    const sql = `
        SELECT
            c.id,
            c.company_name,
            c.email,
            c.phone,
            c.address,
            c.city,
            c.state,
            c.status,
            c.created_at,

            ca.id AS admin_id,
            ca.name AS admin_name,
            ca.email AS admin_email,
            ca.phone AS admin_phone

        FROM companies c

        LEFT JOIN users ca
            ON c.id = ca.company_id
            AND ca.role = 'COMPANY_ADMIN'

        WHERE c.id = ?
    `;

    db.query(sql, [companyId], (error, results) => {

        if (error) {
            console.error("Get my company error:", error);

            return res.status(500).json({
                message: "Failed to fetch company information."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Company not found."
            });
        }

        res.json({
            company: results[0]
        });
    });
};

// ==========================================
// UPDATE MY COMPANY - COMPANY ADMIN
// ==========================================

const updateMyCompany = (req, res) => {

    const companyId = req.user.company_id;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }

    const {
        company_name,
        email,
        phone,
        address,
        city,
        state
    } = req.body;

    if (
        !company_name?.trim() ||
        !email?.trim() ||
        !phone?.trim() ||
        !address?.trim() ||
        !city?.trim() ||
        !state?.trim()
    ) {
        return res.status(400).json({
            message: "All company fields are required."
        });
    }

    const sql = `
        UPDATE companies
        SET
            company_name = ?,
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
            company_name.trim(),
            email.trim(),
            phone.trim(),
            address.trim(),
            city.trim(),
            state.trim(),
            companyId
        ],
        (error, result) => {

            if (error) {
                console.error(
                    "Update my company error:",
                    error
                );

                return res.status(500).json({
                    message: "Failed to update company information."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Company not found."
                });
            }

            res.json({
                message: "Company information updated successfully."
            });
        }
    );
};


module.exports = {
    createCompany,
    getCompanies,
    getCompanyStats,
    updateCompany,
    deleteCompany,
    deactivateCompany,
    activateCompany,
    getMyCompany,
    updateMyCompany
};