import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import axios from 'axios'
import '../styles/VendorDetailsModal.css'
import Close from '../assets/x.svg'
import CheckMark from '../assets/check-mark.svg'
import CrossCircle from '../assets/cross-circle.svg'

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

    const renderStatusBadge = (status) => {
        const stat = status.toLowerCase();
        return <span className={`status-badge ${stat}`}>{status}</span>;
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
                                    <h2>{vendorDetails?.vendor_name || vendor.vendor_name}</h2>
                                    <div className="vendor-info-wrapper">
                                        <div className="vendor-info-block">
                                            <p className="vendor-details-label">Email</p>
                                            <p className="vendor-info-value">{vendorDetails?.email || vendor.email}</p>
                                        </div>
                                        <div className="vendor-info-block">
                                            <p className="vendor-details-label">Address</p>
                                            <p className="vendor-info-value">{vendorDetails?.address || vendor.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="vendor-section">
                                    <h2 className="vendor-section-label">Kitchen Status</h2>
                                    <div className="vendor-details-wrapper">
                                        <table className="kitchen-status-table">
                                            <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Score</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Checked By</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {kitchenChecks.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="empty-table-message">
                                                        No kitchen checks found for this vendor.
                                                    </td>
                                                </tr>
                                            )}
                                            {kitchenChecks.map((check) => (
                                                <tr key={check.id}>
                                                    <td>{check.id}</td>
                                                    <td>{check.score}</td>
                                                    <td>
                                                        {renderStatusBadge(check.status)}
                                                    </td>
                                                    <td>{new Date(check.check_date).toLocaleDateString()}</td>
                                                    <td>{check.checked_by}</td>
                                                    <td>
                                                        <button className="view-kitchen-details-button" onClick={() => console.log("to do: open kitchen image modal")}>
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                    <div className="vendor-section">
                                        <h2 className="vendor-section-label">Meal Plans Status</h2>
                                        <div className="vendor-details-wrapper">
                                            <table className="meal-plans-table">
                                                <thead>
                                                <tr>
                                                    <th>Meal Plan</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {mealPlans.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="empty-row">
                                                            No meal plans submitted.
                                                        </td>
                                                    </tr>
                                                ) : (mealPlans.map((meal, idx) => (
                                                        <tr key={idx}>
                                                            <td>{meal.meal_plan?.name || "Meal Plan"}</td>
                                                            <td>{renderStatusBadge(meal.meal_plan?.status)}</td>
                                                            <td>
                                                                {meal.meal_plan?.status === "pending" ? (
                                                                    <div className="action-buttons">
                                                                        <button className="reject-button" onClick={() => console.log("to do: reject meal plan")}>
                                                                            <img src={CrossCircle} alt="reject" />
                                                                        </button>
                                                                        <button className="approve-button" onClick={() => console.log("to do: approve meal plan")}>
                                                                            <div className="approve-img-wrapper">
                                                                                <img src={CheckMark} alt="approve" />
                                                                            </div>
                                                                            <p>Approve</p>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="disabled-action">
                                                                        {meal.meal_plan?.status}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>, modalRoot
    );
}

export default VendorDetailsModal;