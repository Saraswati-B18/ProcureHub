const db = require("../config/db");


// =====================================================
// GET ALL BRANCHES FOR LOGGED-IN COMPANY
// =====================================================

const getMyBranches = (req, res) => {

    const companyId = req.user.company_id;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }

    const sql = `
        SELECT
            id,
            company_id,
            branch_name,
            address,
            city,
            state,
            phone,
            status,
            created_at
        FROM branches
        WHERE company_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [companyId], (error, results) => {

        if (error) {
            console.error("Get branches error:", error);

            return res.status(500).json({
                message: "Failed to fetch branches."
            });
        }

        res.json({
            branches: results
        });
    });
};


// =====================================================
// CREATE BRANCH
// =====================================================

const createBranch = (req, res) => {

    const companyId = req.user.company_id;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }

    const {
        branch_name,
        address,
        city,
        state,
        phone
    } = req.body;


    if (!branch_name?.trim()) {
        return res.status(400).json({
            message: "Branch name is required."
        });
    }


    const sql = `
        INSERT INTO branches
        (
            company_id,
            branch_name,
            address,
            city,
            state,
            phone,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `;


    db.query(
        sql,
        [
            companyId,
            branch_name.trim(),
            address?.trim() || null,
            city?.trim() || null,
            state?.trim() || null,
            phone?.trim() || null
        ],
        (error, result) => {

            if (error) {
                console.error("Create branch error:", error);

                return res.status(500).json({
                    message: "Failed to create branch."
                });
            }


            res.status(201).json({
                message: "Branch created successfully.",
                branchId: result.insertId
            });
        }
    );
};


// =====================================================
// UPDATE BRANCH
// =====================================================

const updateBranch = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }


    const {
        branch_name,
        address,
        city,
        state,
        phone
    } = req.body;


    if (!branch_name?.trim()) {
        return res.status(400).json({
            message: "Branch name is required."
        });
    }


    const sql = `
        UPDATE branches
        SET
            branch_name = ?,
            address = ?,
            city = ?,
            state = ?,
            phone = ?
        WHERE id = ?
        AND company_id = ?
    `;


    db.query(
        sql,
        [
            branch_name.trim(),
            address?.trim() || null,
            city?.trim() || null,
            state?.trim() || null,
            phone?.trim() || null,
            id,
            companyId
        ],
        (error, result) => {

            if (error) {
                console.error("Update branch error:", error);

                return res.status(500).json({
                    message: "Failed to update branch."
                });
            }


            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Branch not found."
                });
            }


            res.json({
                message: "Branch updated successfully."
            });
        }
    );
};


// =====================================================
// DEACTIVATE BRANCH
// =====================================================

const deactivateBranch = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }


    const sql = `
        UPDATE branches
        SET status = 'INACTIVE'
        WHERE id = ?
        AND company_id = ?
    `;


    db.query(
        sql,
        [id, companyId],
        (error, result) => {

            if (error) {
                console.error(
                    "Deactivate branch error:",
                    error
                );

                return res.status(500).json({
                    message: "Failed to deactivate branch."
                });
            }


            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Branch not found."
                });
            }


            res.json({
                message: "Branch deactivated successfully."
            });
        }
    );
};


// =====================================================
// ACTIVATE BRANCH
// =====================================================

const activateBranch = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }


    const sql = `
        UPDATE branches
        SET status = 'ACTIVE'
        WHERE id = ?
        AND company_id = ?
    `;


    db.query(
        sql,
        [id, companyId],
        (error, result) => {

            if (error) {
                console.error(
                    "Activate branch error:",
                    error
                );

                return res.status(500).json({
                    message: "Failed to activate branch."
                });
            }


            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Branch not found."
                });
            }


            res.json({
                message: "Branch activated successfully."
            });
        }
    );
};

const getBranchDetails = (req, res) => {

    const companyId = req.user.company_id;
    const { id } = req.params;

    if (!companyId) {
        return res.status(400).json({
            message: "Company information not found."
        });
    }

    const branchSql = `
        SELECT
            id,
            company_id,
            branch_name,
            address,
            city,
            state,
            phone,
            status,
            created_at
        FROM branches
        WHERE id = ?
        AND company_id = ?
    `;

    db.query(
        branchSql,
        [id, companyId],
        (branchError, branchResults) => {

            if (branchError) {
                console.error(
                    "Get branch details error:",
                    branchError
                );

                return res.status(500).json({
                    message: "Failed to fetch branch details."
                });
            }

            if (branchResults.length === 0) {
                return res.status(404).json({
                    message: "Branch not found."
                });
            }

            const usersSql = `
                SELECT
                    id,
                    name,
                    role
                FROM users
                WHERE branch_id = ?
                AND company_id = ?
                ORDER BY
                    CASE role
                        WHEN 'MANAGER' THEN 1
                        WHEN 'FINANCE' THEN 2
                        WHEN 'EMPLOYEE' THEN 3
                        ELSE 4
                    END,
                    name ASC
            `;

            db.query(
                usersSql,
                [id, companyId],
                (usersError, usersResults) => {

                    if (usersError) {
                        console.error(
                            "Get branch users error:",
                            usersError
                        );

                        return res.status(500).json({
                            message:
                                "Failed to fetch branch users."
                        });
                    }

                    res.json({
                        branch: branchResults[0],
                        users: usersResults
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
    getMyBranches,
    getBranchDetails,
    createBranch,
    updateBranch,
    deactivateBranch,
    activateBranch
};