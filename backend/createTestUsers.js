const db = require("./config/db");
const bcrypt = require("bcryptjs");

const createUsers = async () => {
    try {
        // Create a test company
        db.query(
            `INSERT INTO companies
            (company_name, email, phone, address, city, state)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                "ABC Foods Pvt Ltd",
                "admin@abcfoods.com",
                "9876543210",
                "MG Road",
                "Bengaluru",
                "Karnataka"
            ],
            async (err, companyResult) => {
                if (err) {
                    console.error("Company creation failed:", err.message);
                    return;
                }

                const companyId = companyResult.insertId;

                // Create a test branch
                db.query(
                    `INSERT INTO branches
                    (company_id, branch_name, address, city, state, phone)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        companyId,
                        "Bengaluru Main Branch",
                        "MG Road",
                        "Bengaluru",
                        "Karnataka",
                        "9876543210"
                    ],
                    async (err, branchResult) => {
                        if (err) {
                            console.error("Branch creation failed:", err.message);
                            return;
                        }

                        const branchId = branchResult.insertId;

                        // Create a test supplier
                        db.query(
                            `INSERT INTO suppliers
                            (supplier_name, email, phone, address, city, state)
                            VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                "ABC Wholesale Supplies",
                                "supplier@abcwholesale.com",
                                "9876501234",
                                "Industrial Area",
                                "Bengaluru",
                                "Karnataka"
                            ],
                            async (err, supplierResult) => {
                                if (err) {
                                    console.error(
                                        "Supplier creation failed:",
                                        err.message
                                    );
                                    return;
                                }

                                const supplierId = supplierResult.insertId;

                                // Password used for all test accounts
                                const hashedPassword = await bcrypt.hash(
                                    "123456",
                                    10
                                );

                                const users = [
                                    [
                                        null,
                                        null,
                                        null,
                                        "Super Admin",
                                        "superadmin@procurehub.com",
                                        hashedPassword,
                                        "SUPER_ADMIN",
                                        "9000000001"
                                    ],
                                    [
                                        companyId,
                                        branchId,
                                        null,
                                        "Company Admin",
                                        "admin@abcfoods.com",
                                        hashedPassword,
                                        "COMPANY_ADMIN",
                                        "9000000002"
                                    ],
                                    [
                                        companyId,
                                        branchId,
                                        null,
                                        "Rahul Employee",
                                        "employee@abcfoods.com",
                                        hashedPassword,
                                        "EMPLOYEE",
                                        "9000000003"
                                    ],
                                    [
                                        companyId,
                                        branchId,
                                        null,
                                        "Manager",
                                        "manager@abcfoods.com",
                                        hashedPassword,
                                        "MANAGER",
                                        "9000000004"
                                    ],
                                    [
                                        companyId,
                                        branchId,
                                        null,
                                        "Finance User",
                                        "finance@abcfoods.com",
                                        hashedPassword,
                                        "FINANCE",
                                        "9000000005"
                                    ],
                                    [
                                        null,
                                        null,
                                        supplierId,
                                        "Supplier User",
                                        "supplier@abcwholesale.com",
                                        hashedPassword,
                                        "SUPPLIER",
                                        "9000000006"
                                    ]
                                ];

                                const sql = `
                                    INSERT INTO users
                                    (company_id, branch_id, supplier_id,
                                    name, email, password, role, phone)
                                    VALUES ?
                                `;

                                db.query(sql, [users], (err) => {
                                    if (err) {
                                        console.error(
                                            "User creation failed:",
                                            err.message
                                        );
                                        return;
                                    }

                                    console.log(
                                        "Test company created successfully!"
                                    );
                                    console.log(
                                        "Test branch created successfully!"
                                    );
                                    console.log(
                                        "Test supplier created successfully!"
                                    );
                                    console.log(
                                        "All 6 test users created successfully!"
                                    );
                                    console.log(
                                        "Password for all users: 123456"
                                    );

                                    db.end();
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error:", error.message);
    }
};

createUsers();