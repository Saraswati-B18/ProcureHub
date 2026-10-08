# ProcureHub

A full-stack B2B Procurement Management System built to manage companies, branches, products, suppliers, purchase requests, orders, approvals, payments, and invoices.

## Features

- Company and branch management
- User management
- Product and category management
- Supplier management
- Purchase request management
- Manager approval and rejection
- Order management
- Finance payment management
- Invoice management
- Reports
- Notifications
- Cart and wishlist
- Product image upload
- JWT authentication

## User Roles

- Super Admin
- Manager
- Employee
- Finance
- Supplier

## Procurement Flow

```text
Employee
   ↓
Purchase Request
   ↓
Manager Approval
   ↓
Order Processing
   ↓
Finance Payment
   ↓
Invoice
   ↓
Order Completion


🛠️ Technologies Used
Frontend
- React
- JavaScript
- CSS
- Vite
- Axios
- React Router
Backend
- Node.js
- Express.js
- JavaScript
- JWT Authentication
- Multer
Database
- MySQL
Development Tools
- Visual Studio Code
- Git
- GitHub
- npm

📁 Project Structure
ProcureHub/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md

⚙️ Installation and Setup
1. Clone the Repository
git clone https://github.com/Saraswati-B18/ProcureHub.git

cd ProcureHub

2. Backend Setup
Navigate to the backend folder:
cd backend

Install dependencies:
npm install

Create a .env file and configure the required environment variables.
Then start the backend:
node server.js

3. Frontend Setup
Open another terminal and navigate to:
cd frontend

Install dependencies:
npm install

Start the frontend:
npm run dev

🔐 Environment Variables
Environment variables are required for configuration such as database connection and authentication.
The .env file is intentionally excluded from the repository for security reasons.
Create your own .env file locally before running the backend.

🚀 Future Improvements
Potential improvements include deployment, additional reporting capabilities, enhanced notifications, and further UI/UX enhancements.
