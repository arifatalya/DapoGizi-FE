import {useState} from 'react'
import '../styles/AdminDashboardPage.css'
import VendorsTable from '../components/VendorsTable'
import VendorDetailsModal from '../components/VendorDetailsModal.jsx'
import VendorsOverviewCards from '../components/VendorsOverviewCards.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import ProvinceChart from '../components/ProvinceChart.jsx'
import ToastProvider from '../components/ToastProvider.jsx'

function AdminDashboardPage() {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isVendorDetailsOpen, setVendorDetailsOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("default");

    const handleOpenVendorDetails = (vendor) => {
        setSelectedVendor(vendor);
        setVendorDetailsOpen(true);
    };
    const handleCloseVendorDetails = () => {
        setSelectedVendor(null);
        setVendorDetailsOpen(false);
    }

    const renderToast = (message, type= "default") => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    }

    return (
        <>
            <ToastProvider message={toastMessage} type={toastType} duration={5000} show={showToast} onClose={setShowToast} />
            <div className="dashboard-container">
                <h2 className="dashboard-label"><b>DapoGizi</b> Dashboard</h2>
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
                <VendorDetailsModal vendor={selectedVendor} isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)} renderToast={renderToast} />
            </div>
        </>
    );
}

export default AdminDashboardPage;