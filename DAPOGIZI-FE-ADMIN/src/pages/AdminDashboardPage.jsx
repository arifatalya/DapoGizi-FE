import {useState} from 'react'
import '../styles/AdminDashboardPage.css'
import VendorsTable from '../components/VendorsTable'
import VendorDetailsModal from '../components/VendorDetailsModal.jsx'
import VendorsOverviewCards from '../components/VendorsOverviewCards.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import ProvinceChart from '../components/ProvinceChart.jsx'

function AdminDashboardPage() {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isVendorDetailsOpen, setVendorDetailsOpen] = useState(false);

    const handleOpenVendorDetails = (vendor) => {
        setSelectedVendor(vendor);
        setVendorDetailsOpen(true);
    };
    const handleCloseVendorDetails = () => {
        setSelectedVendor(null);
        setVendorDetailsOpen(false);
    }

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-label">Dashboard</h2>
            <VendorsOverviewCards />
            <div className="dashboard-grid">
                <div className="dashboard-left">
                    <ActivityTimeline />
                    <ProvinceChart />
                </div>
                <div className="dashboard-right">
                    <VendorsTable onOpenVendorModal={handleOpenVendorDetails} />
                </div>
            </div>
            <VendorDetailsModal vendor={selectedVendor} isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)}/>
        </div>
    );
}

export default AdminDashboardPage;