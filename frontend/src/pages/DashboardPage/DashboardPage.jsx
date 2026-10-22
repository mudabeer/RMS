import MainLayout from "../../components/layout/MainLayout";
import SideNavbar from "../../components/layout/SideNavbar";


import "./DashboardPage.css";

function DashboardPage() {
  const activeNav = "Dashboard";
  return (
      <div className="bg-background text-on-surface h-full font-body-md flex overflow-hidden">
        <SideNavbar activeNav={activeNav} />
        <MainLayout />
      </div>
  );
}

export default DashboardPage;
