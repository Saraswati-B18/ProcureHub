import { Bell, UserCircle, LogOut } from "lucide-react";
import "./Header.css";

const Header = ({ user }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Dashboard</h1>
      </div>

      <div className="header-right">
        <button className="header-icon" type="button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="header-user">
          <UserCircle size={34} />

          <div className="header-user-info">
            <strong>
    {user?.role === "SUPPLIER"
        ? user?.supplier_name || user?.name || "Supplier"
        : user?.name || "User"}
</strong>
            <span>{user?.role?.replace("_", " ") || "Employee"}</span>
          </div>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;