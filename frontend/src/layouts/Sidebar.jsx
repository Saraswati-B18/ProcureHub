import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  CreditCard,
  Users,
  Building2,
  Truck,
  BarChart3,
  Settings,
  Bell,
  UserCircle
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = ({ role }) => {
  const menuItems = {
    EMPLOYEE: [
      
      { name: "Products", path: "/employee/products", icon: Package },
      { name: "Cart", path: "/employee/cart", icon: ShoppingCart },
      { name: "Purchase Requests", path: "/employee/requests", icon: ClipboardList },
      { name: "My Orders", path: "/employee/orders", icon: Truck },
      { name: "Notifications", path: "/employee/notifications", icon: Bell },
      { name: "Profile", path: "/employee/profile", icon: UserCircle }
    ],

    MANAGER: [
  
  { name: "Pending Approvals", path: "/manager/approvals", icon: ClipboardList },
  { name: "Approved Requests", path: "/manager/approved-requests", icon: ClipboardList },
  { name: "Rejected Requests", path: "/manager/rejected-requests", icon: ClipboardList },
  { name: "Orders", path: "/manager/orders", icon: Truck },
  { name: "Reports", path: "/manager/reports", icon: BarChart3 },
  { name: "Profile", path: "/manager/profile", icon: UserCircle }
],

    FINANCE: [
  { name: "Approved Requests", path: "/finance/invoices", icon: FileText },
  { name: "Payments", path: "/finance/payments", icon: CreditCard },
  { name: "Reports", path: "/finance/reports", icon: BarChart3 },
  { name: "Profile", path: "/finance/profile", icon: UserCircle }
],

    COMPANY_ADMIN: [
  { name: "Company", path: "/company-admin/company", icon: Building2 },
  { name: "Branches", path: "/company-admin/branches", icon: Building2 },
  { name: "Employees", path: "/company-admin/employees", icon: Users },
  { name: "Orders", path: "/company-admin/orders", icon: Truck },
  { name: "Invoices", path: "/company-admin/invoices", icon: FileText },
  { name: "Payments", path: "/company-admin/payments", icon: CreditCard },
  { name: "Reports", path: "/company-admin/reports", icon: BarChart3 },
  { name: "Settings", path: "/company-admin/settings", icon: Settings }
],

    SUPPLIER: [
      
      { name: "Products", path: "/supplier/products", icon: Package },
      { name: "Orders", path: "/supplier/orders", icon: Truck },
      { name: "Deliveries", path: "/supplier/deliveries", icon: Truck },
      { name: "Invoices", path: "/supplier/invoices", icon: FileText },
      { name: "Reports", path: "/supplier/reports", icon: BarChart3 },
      { name: "Profile", path: "/supplier/profile", icon: UserCircle }
    ],

    SUPER_ADMIN: [
      { name: "Companies", path: "/super-admin/companies", icon: Building2 },
      { name: "Suppliers", path: "/super-admin/suppliers", icon: Truck },
      { name: "Users", path: "/super-admin/users", icon: Users },
      { name: "Categories", path: "/super-admin/categories", icon: Package },
      { name: "Products", path: "/super-admin/products", icon: Package },
      { name: "Orders", path: "/super-admin/orders", icon: ClipboardList },
      { name: "Invoices", path: "/super-admin/invoices", icon: FileText },
      { name: "Reports", path: "/super-admin/reports", icon: BarChart3 },
      { name: "Settings", path: "/super-admin/settings", icon: Settings }
    ]
  };

  const items = menuItems[role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>

        <div>
          <h2>ProcureHub</h2>
          <span>B2B Procurement</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-role">
          
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;