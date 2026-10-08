const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const superAdminProductRoutes = require("./routes/superAdminProductRoutes");

const branchRoutes = require("./routes/branchRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const employeeProductRoutes = require("./routes/employeeProductRoutes");
const purchaseRequestRoutes = require("./routes/purchaseRequestRoutes");
const financeRoutes = require("./routes/financeRoutes");
const supplierProductRoutes = require("./routes/supplierProductRoutes");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

app.use(
    "/api/employee-products",
    employeeProductRoutes
);

app.use(
    "/api/purchase-requests",
    purchaseRequestRoutes
);

app.use("/api/finance", financeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/super-admin/products", superAdminProductRoutes);
app.use("/api/supplier-products", supplierProductRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/employees", employeeRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "ProcureHub backend is running!"
    });
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`ProcureHub server running on http://localhost:${PORT}`);
});