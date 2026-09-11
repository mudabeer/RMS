import MainLayout from "../../components/layout/Mainlayout";
import SideNavbar from "../../components/layout/SideNavbar";

import './DashboardPage.css'

function DashboardPage() {
  return (
    <div className="bg-background text-on-surface h-full font-body-md flex overflow-hidden">
        <SideNavbar />
        <MainLayout />
    </div>
  );
}

export default DashboardPage