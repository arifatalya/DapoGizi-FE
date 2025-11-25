import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import axios from 'axios'
import '../styles/VendorDetailsModal.css'
import Close from '../assets/x.svg'

function VendorDetailsModal({vendor, isOpen, onClose}) {
    const server = `${import.meta.env.VITE_API_URL}`;
    const modalRoot = document.getElementById("modal-root") || document.body;
    const [vendorDetails, setVendorDetails] = useState(null);
    const [kitchenChecks, setKitchenChecks] = useState([]);
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setVendorDetails(null);
            setKitchenChecks([]);
            setMealPlans([]);
            setMessage("");
            setLoading(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !vendor?.id) return;
        let canceled = false;

        const retrieveVendorData = async () => {
            setLoading(true);
            setMessage("");

            try {
                const token = localStorage.getItem("token");
                const headers = token ? {Authorization: `Bearer ${token}`} : {};
                const [vendorRes, kitchenRes, mealPlansRes] = await Promise.all([
                    axios.get(`${server}/admin/view-vendor/${vendor.id}`, {headers}),
                    axios.get(`${server}/admin/kitchen-checks/vendor/${vendor.id}`, {headers}),
                    axios.get(`${server}/admin/vendors-meal-plans`, {headers}),
                ]);

                if (canceled) return;

                setVendorDetails(vendorRes.data?.data || vendor);
                const checks = kitchenRes.data?.data || [];
                setKitchenChecks(checks);

                const allMealPlans = mealPlansRes.data?.data || [];
                const filteredMealPlans = allMealPlans.filter((meal) => meal.vendor_name === vendor.vendor_name);
                setMealPlans(filteredMealPlans);

            } catch (err) {
                console.log("Failed to load vendor details:", err);

                if (!canceled) {
                    setMessage("Something went wrong while retrieving vendor details. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        retrieveVendorData();

        return () => {
            canceled = true;
        };
    }, [isOpen, vendor, server]);

    if (!isOpen) return null;

    const handleBackdrop = (event) => {
        if (event.target.classList.contains("vendor-modal-backdrop")) {
            onClose?.();
        }
    };

    return createPortal(
        <>
            <div className="vendor-modal-backdrop" onClick={handleBackdrop}>
                <div className="vendor-modal-container">
                    <div className="vendor-modal-header">
                        <h2>Vendor Details</h2>
                        <button className="vendor-modal-close" title="Close details" onClick={onClose}>
                            <img src={Close} alt="Close"/>
                        </button>
                    </div>
                    <div className="vendor-modal-content">
                        {loading ? (
                            <div className="load-vendor-details">
                                Loading details...
                            </div>
                        ) : message ? (
                            <p className="error-vendor-details">
                                {message}
                            </p>
                        ) : (
                            <>
                                <div className="vendor-identity">
                                    <h3>{vendorDetails?.vendor_name || vendor.vendor_name}</h3>
                                    <div className="vendor-info-wrapper">
                                        <div className="vendor-info-block">
                                            <p className="vendor-info-label">Email</p>
                                            <p className="vendor-info-value">{vendorDetails?.email || vendor.email}</p>
                                        </div>
                                        <div className="vendor-info-block">
                                            <p className="vendor-info-label">Address</p>
                                            <p className="vendor-info-value">{vendorDetails?.address || vendor.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="vendor-sections">
                                    <div className="vendor-section-item">
                                        <h2>Kitchen Status</h2>
                                        <table className="kitchen-status-table">
                                            <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Score</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Checked By</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {kitchenChecks.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="empty-table-message">
                                                        No kitchen checks found for this vendor.
                                                    </td>
                                                </tr>
                                            )}
                                            {kitchenChecks.map((check) => (
                                                <tr key={check.id}>
                                                    <td>{check.id}</td>
                                                    <td>
                                                        <span className={`kitchen-status-badge ${check.status.toLocaleLowerCase()}`}>
                                                            {check.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(check.check_date).toLocaleDateString()}</td>
                                                    <td>{check.checked_by}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="vendor-section-item">
                                        <h2>Meal Plans Status</h2>
                                        <table className="meal-plans-table">
                                            <thead>
                                            <tr>
                                                <th>Meal Plan</th>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

}