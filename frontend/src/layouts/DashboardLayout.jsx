import Sidebar from "./Sidebar";
import Header from "./Header";
import "./DashboardLayout.css";

const DashboardLayout = ({ children, user }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar role={user?.role} />

      <div className="dashboard-main">
        <Header user={user} />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;