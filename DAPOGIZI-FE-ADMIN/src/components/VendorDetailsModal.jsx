import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import axios from 'axios'
import '../styles/VendorDetailsModal.css'
import Close from '../assets/x.svg'
import CheckMark from '../assets/check-mark.svg'
import CrossCircle from '../assets/cross-circle.svg'
import ViewKitchenModal from '../components/ViewKitchenModal.jsx'
import ViewKitchenPhotosOnlyModal from './ViewKitchenPhotosOnlyModal.jsx'

function VendorDetailsModal({vendor, isOpen, onClose}) {
    const server = `${import.meta.env.VITE_API_URL}`;
    const modalRoot = document.getElementById("modal-root") || document.body;
    const [vendorDetails, setVendorDetails] = useState(null);
    const [kitchenChecks, setKitchenChecks] = useState([]);
    const [mealPlans, setMealPlans] = useState([]);
    const [selectedMealPlans, setSelectedMealPlans] = useState([]);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [kitchenModalOpen, setKitchenModalOpen] = useState(false);
    const [selectedKitchenPhotos, setSelectedKitchenPhotos] = useState([]);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [photoModalImages, setPhotoModalImages] = useState([]);

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
                    axios.get(`${server}/admin/vendor-profile/${vendor.id}`, {headers}),
                    axios.get(`${server}/admin/kitchen-checks/vendor/${vendor.id}`, {headers}),
                    axios.get(`${server}/admin/vendors-meal-plans`, {headers}),
                ]);

                if (canceled) return;

                setVendorDetails(vendorRes.data?.data?.vendor_details || vendor);

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

    useEffect(() => {
        const pendingMealIds = mealPlans.filter(meal => meal.meal_plan?.status === "pending").map(meal => meal.id);
        setIsSelectAll(pendingMealIds.length > 0 && pendingMealIds.every(id => selectedMealPlans.includes(id)));
    }, [selectedMealPlans, mealPlans]);

    if (!isOpen) return null;

    const handleBackdrop = (event) => {
        if (kitchenModalOpen) return;
        if (!kitchenModalOpen && event.target.classList.contains("vendor-modal-backdrop")) {
            onClose?.();
        }
    };

    const renderStatusBadge = (status) => {
        const stat = status.toLowerCase();
        return <span className={`status-badge ${stat}`}>{status}</span>;
    };

    const toggleSelectOneMeal = (id) => {
        setSelectedMealPlans((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectPendingMeals = () => {
        const pendingMealIds = mealPlans.filter((meal) => meal.meal_plan?.status === "pending").map((meal) => meal.id);

        if (isSelectAll) {
            setSelectedMealPlans([]);
            setIsSelectAll(false);
        } else {
            setSelectedMealPlans(pendingMealIds);
            setIsSelectAll(true);
        }
    };

    const handleApproveMealPlan = async (ids) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${server}/admin/meal-plans/approve`, {ids}, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setMealPlans(prev => prev.map(meal => ids.includes(meal.id) ? {...meal, meal_plan: {...meal.meal_plan, status: "approved"}} : meal));
            setSelectedMealPlans([]);
            setIsSelectAll(false);

        } catch (err) {
            console.error("Error approving meal plans:", err);
        }
    };

    const handleRejectMealPlan = async (ids) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${server}/admin/meal-plans/reject`, {ids}, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setMealPlans(prev => prev.map(meal => ids.includes(meal.id) ? {...meal, meal_plan: {...meal.meal_plan, status: "rejected"}} : meal));
            setSelectedMealPlans([]);
            setIsSelectAll(false);

        } catch (err) {
            console.error("Error rejecting meal plans:", err);
        }
    };

    const openKitchenModal = (photos) => {
        setSelectedKitchenPhotos(photos);
        setKitchenModalOpen(true);
    };

    const closeKitchenModal = () => {
        setKitchenModalOpen(false);
        setSelectedKitchenPhotos([]);
    };

    const alreadyAssessed = kitchenChecks.some(check =>
        JSON.stringify(check.kitchen_photos) === JSON.stringify(vendorDetails?.kitchen_photos)
    );

    const openPhotoOnlyModal = (photos) => {
        setPhotoModalImages(photos);
        setPhotoModalOpen(true);
    };

    const closePhotoOnlyModal = () => {
        setPhotoModalOpen(false);
        setPhotoModalImages([]);
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
                                    <div className="vendor-section-header">
                                        <h2 className="vendor-section-label">Kitchen Status</h2>
                                        <button className="manual-kitchen-assess" disabled={alreadyAssessed} onClick={() => !alreadyAssessed && openKitchenModal(vendorDetails?.kitchen_photos)}>
                                            {alreadyAssessed ? "Kitchen Approved" : "Evaluate Current State"}
                                        </button>
                                    </div>
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
                                                    <td>{check.id || check._id}</td>
                                                    <td>{check.score}</td>
                                                    <td>
                                                        {renderStatusBadge(check.status)}
                                                    </td>
                                                    <td>{new Date(check.check_date).toLocaleDateString()}</td>
                                                    <td>{check.checked_by}</td>
                                                    <td>
                                                        <button className="view-kitchen-details-button" onClick={() => openPhotoOnlyModal(check.kitchen_photos)}>
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
                                                    <th>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelectAll}
                                                            onChange={toggleSelectPendingMeals}
                                                        />
                                                    </th>
                                                    <th>Meal Plan</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {mealPlans.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="empty-row">
                                                            No meal plans submitted.
                                                        </td>
                                                    </tr>
                                                ) : (mealPlans.map((meal, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                {meal.meal_plan?.status === "pending" ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedMealPlans.includes(meal.id)}
                                                                        onChange={() => toggleSelectOneMeal(meal.id)}
                                                                    />
                                                                ) : (
                                                                    <span className="no-check">—</span>
                                                                )}
                                                            </td>
                                                            <td>{meal.meal_plan?.name || "Meal Plan"}</td>
                                                            <td>{renderStatusBadge(meal.meal_plan?.status)}</td>
                                                            <td>
                                                                {meal.meal_plan?.status === "pending" ? (
                                                                    <div className="action-buttons">
                                                                        <button className="reject-button" onClick={() => handleRejectMealPlan([meal.id])}>
                                                                            <img src={CrossCircle} alt="reject" />
                                                                        </button>
                                                                        <button className="approve-button" onClick={() => handleApproveMealPlan([meal.id])}>
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
            <ViewKitchenModal isOpen={kitchenModalOpen} onClose={closeKitchenModal} vendorId={vendorDetails?._id || vendor?.id} photos={selectedKitchenPhotos}
                              onSubmitted={(newCheck) => {
                                  setKitchenChecks(prev => [newCheck, ...prev]);
                              }}
            />
            <ViewKitchenPhotosOnlyModal isActive={photoModalOpen} onClose={closePhotoOnlyModal} photos={photoModalImages}/>
        </>, modalRoot
    );
}

export default VendorDetailsModal;