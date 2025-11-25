import VendorsTable from '../components/VendorsTable'
import VendorDetailsModal from '../components/VendorDetailsModal.jsx'
import {useState} from 'react'

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
        <>
            <VendorsTable onOpenVendorModal={handleOpenVendorDetails} />
            <VendorDetailsModal vendor={selectedVendor} isOpen={isVendorDetailsOpen} onClose={handleCloseVendorDetails} />
        </>
    )
}

export default AdminDashboardPage;
