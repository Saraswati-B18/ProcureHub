import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { useEffect, useState } from "react";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import PurchaseRequests from "./pages/PurchaseRequests";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import DashboardLayout from "./layouts/DashboardLayout";

import PendingApprovals from "./pages/PendingApprovals";
import RequestDetails from "./pages/RequestDetails";
import ApprovedRequests from "./pages/ApprovedRequests";
import RejectedRequests from "./pages/RejectedRequests";
import ManagerOrders from "./pages/ManagerOrders";
import ManagerReports from "./pages/ManagerReports";

import FinanceInvoices from "./pages/FinanceInvoices";
import FinancePayments from "./pages/FinancePayments";
import FinanceReports from "./pages/FinanceReports";

import SupplierProducts from "./pages/SupplierProducts";
import SupplierOrders from "./pages/SupplierOrders";
import SupplierDeliveries from "./pages/SupplierDeliveries";
import SupplierInvoices from "./pages/SupplierInvoices";
import SupplierReports from "./pages/SupplierReports";

import Users from "./pages/Users";
import Suppliers from "./pages/Suppliers";
import Companies from "./pages/Companies";
import Categories from "./pages/Categories";

import SuperAdminProducts from "./pages/SuperAdminProducts";
import SuperAdminOrders from "./pages/SuperAdminOrders";
import SuperAdminInvoices from "./pages/SuperAdminInvoices";
import SuperAdminReports from "./pages/SuperAdminReports";
import SuperAdminSettings from "./pages/SuperAdminSettings";
import CompanyAdminCompany from "./pages/CompanyAdminCompany";
import Branches from "./pages/Branches";
import Employees from "./pages/Employees";
import Wishlist from "./pages/Wishlist";
import CompanyAdminOrders from "./pages/CompanyAdminOrders";

import "./App.css";


/* =========================================================
   APP CONTENT
========================================================= */

function AppContent() {

  const location = useLocation();

  const [user, setUser] = useState(() => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to read logged-in user:", error);
      return null;
    }

  });


  /*
   * Whenever the URL changes after login,
   * get the latest user from localStorage.
   *
   * Example:
   *
   * Supplier Login
   *      ↓
   * localStorage.user = SUPPLIER
   *      ↓
   * navigate("/supplier/dashboard")
   *      ↓
   * location changes
   *      ↓
   * user is updated
   */

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

    } catch (error) {

      console.error(
        "Failed to update logged-in user:",
        error
      );

      setUser(null);

    }

  }, [location.pathname]);


  return (
    

    <Routes>

      <Route
    path="/"
    element={<LandingPage />}
/>

<Route
    path="/login"
    element={<Login />}
/>


      {/* =====================================================
          LOGIN
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =====================================================
          EMPLOYEE ROUTES
      ====================================================== */}

      <Route
        path="/employee"
        element={
          <DashboardLayout user={user}>
            <Dashboard user={user} />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/dashboard"
        element={
          <DashboardLayout user={user}>
            <Dashboard user={user} />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/products"
        element={
          <DashboardLayout user={user}>
            <Products />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/cart"
        element={
          <DashboardLayout user={user}>
            <Cart />
          </DashboardLayout>
        }
      />

      <Route
  path="/employee/wishlist"
  element={
    <DashboardLayout user={user}>
      <Wishlist />
    </DashboardLayout>
  }
/>

      <Route
        path="/employee/requests"
        element={
          <DashboardLayout user={user}>
            <PurchaseRequests />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/orders"
        element={
          <DashboardLayout user={user}>
            <Orders />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/invoices"
        element={
          <DashboardLayout user={user}>
            <Invoices />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/notifications"
        element={
          <DashboardLayout user={user}>
            <Notifications />
          </DashboardLayout>
        }
      />

      <Route
        path="/employee/profile"
        element={
          <DashboardLayout user={user}>
            <Profile
              user={user}
              setUser={setUser}
            />
          </DashboardLayout>
        }
      />


      {/* =====================================================
          MANAGER ROUTES
      ====================================================== */}

      <Route
        path="/manager/dashboard"
        element={
          <DashboardLayout user={user}>
            <Dashboard user={user} />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/approvals"
        element={
          <DashboardLayout user={user}>
            <PendingApprovals />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/request/:id"
        element={
          <DashboardLayout user={user}>
            <RequestDetails />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/approved-requests"
        element={
          <DashboardLayout user={user}>
            <ApprovedRequests />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/rejected-requests"
        element={
          <DashboardLayout user={user}>
            <RejectedRequests />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/orders"
        element={
          <DashboardLayout user={user}>
            <ManagerOrders />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <DashboardLayout user={user}>
            <ManagerReports />
          </DashboardLayout>
        }
      />

      <Route
        path="/manager/profile"
        element={
          <DashboardLayout user={user}>
            <Profile
              user={user}
              setUser={setUser}
            />
          </DashboardLayout>
        }
      />


      {/* =====================================================
          FINANCE ROUTES
      ====================================================== */}

      <Route
        path="/finance/dashboard"
        element={
          <DashboardLayout user={user}>
            <Dashboard user={user} />
          </DashboardLayout>
        }
      />

      <Route
        path="/finance/profile"
        element={
          <DashboardLayout user={user}>
            <Profile
              user={user}
              setUser={setUser}
            />
          </DashboardLayout>
        }
      />

      <Route
        path="/finance/invoices"
        element={
          <DashboardLayout user={user}>
            <FinanceInvoices />
          </DashboardLayout>
        }
      />

      <Route
        path="/finance/payments"
        element={
          <DashboardLayout user={user}>
            <FinancePayments />
          </DashboardLayout>
        }
      />

      <Route
        path="/finance/reports"
        element={
          <DashboardLayout user={user}>
            <FinanceReports />
          </DashboardLayout>
        }
      />


      {/* =====================================================
          SUPPLIER ROUTES
      ====================================================== */}

      <Route
        path="/supplier/dashboard"
        element={
          <DashboardLayout user={user}>
            <Dashboard user={user} />
          </DashboardLayout>
        }
      />

      <Route
        path="/supplier/products"
        element={
          <DashboardLayout user={user}>
            <SupplierProducts />
          </DashboardLayout>
        }
      />

      <Route
        path="/supplier/orders"
        element={
          <DashboardLayout user={user}>
            <SupplierOrders />
          </DashboardLayout>
        }
      />

      <Route
        path="/supplier/deliveries"
        element={
          <DashboardLayout user={user}>
            <SupplierDeliveries />
          </DashboardLayout>
        }
      />

      <Route
        path="/supplier/invoices"
        element={
          <DashboardLayout user={user}>
            <SupplierInvoices />
          </DashboardLayout>
        }
      />

      <Route
        path="/supplier/reports"
        element={
          <DashboardLayout user={user}>
            <SupplierReports />
          </DashboardLayout>
        }
      />

      <Route
        path="/supplier/profile"
        element={
          <DashboardLayout user={user}>
            <Profile
              user={user}
              setUser={setUser}
            />
          </DashboardLayout>
        }
      />


      {/* =====================================================
          SUPER ADMIN ROUTES
      ====================================================== */}

      <Route
        path="/super-admin/dashboard"
        element={
          <DashboardLayout user={user}>
            <Dashboard user={user} />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/companies"
        element={
          <DashboardLayout user={user}>
            <Companies />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/suppliers"
        element={
          <DashboardLayout user={user}>
            <Suppliers />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/users"
        element={
          <DashboardLayout user={user}>
            <Users />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/categories"
        element={
          <DashboardLayout user={user}>
            <Categories />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/products"
        element={
          <DashboardLayout user={user}>
            <SuperAdminProducts />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/orders"
        element={
          <DashboardLayout user={user}>
            <SuperAdminOrders />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/invoices"
        element={
          <DashboardLayout user={user}>
            <SuperAdminInvoices />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/reports"
        element={
          <DashboardLayout user={user}>
            <SuperAdminReports />
          </DashboardLayout>
        }
      />

      <Route
        path="/super-admin/settings"
        element={
          <DashboardLayout user={user}>
            <SuperAdminSettings />
          </DashboardLayout>
        }
      />


{/* =====================================================
    COMPANY ADMIN ROUTES
====================================================== */}

<Route
  path="/company-admin/dashboard"
  element={
    <DashboardLayout user={user}>
      <Dashboard user={user} />
    </DashboardLayout>
  }
/>

<Route
  path="/company-admin/company"
  element={
    <DashboardLayout user={user}>
      <CompanyAdminCompany />
    </DashboardLayout>
  }
/>

<Route
  path="/company-admin/profile"
  element={
    <DashboardLayout user={user}>
      <Profile
        user={user}
        setUser={setUser}
      />
    </DashboardLayout>
  }
/>

<Route
  path="/company-admin/branches"
  element={
    <DashboardLayout user={user}>
      <Branches />
    </DashboardLayout>
  }
/>

<Route
  path="/company-admin/employees"
  element={
    <DashboardLayout user={user}>
      <Employees />
    </DashboardLayout>
  }
/>

<Route
  path="/company-admin/orders"
  element={
    <DashboardLayout user={user}>
      <CompanyAdminOrders />
    </DashboardLayout>
  }
/>


      {/* =====================================================
          DEFAULT
      ====================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =====================================================
          UNKNOWN PAGE
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );

}


export default App;