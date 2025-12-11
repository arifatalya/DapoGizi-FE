import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import axios from 'axios'
import '../styles/VendorDetailsModal.css'
import Close from '../assets/x.svg'
import CheckMark from '../assets/check-mark.svg'
import CrossCircle from '../assets/cross-circle.svg'
import Placeholder from '../assets/image-placeholder.svg'
import Info from '../assets/info.svg'
import ViewKitchenModal from '../components/ViewKitchenModal.jsx'
import ViewKitchenPhotosOnlyModal from './ViewKitchenPhotosOnlyModal.jsx'
import ToastProvider from './ToastProvider.jsx'

function VendorDetailsModal({vendor, isOpen, onClose, renderToast}) {
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

                const checks = vendorRes.data?.data?.kitchen_checks || kitchenRes.data?.data || [];
                setKitchenChecks(checks);

                const allMealPlans = vendorRes.data?.data?.meal_plans;
                const filteredMealPlans = allMealPlans.filter((meal) => meal.vendor_name === vendor.vendor_name);
                setMealPlans(filteredMealPlans);

            } catch (err) {
                console.log("Failed to load vendor details:", err);
                renderToast("Unable to load vendor details.", "error");

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
        const pendingMealIds = mealPlans.filter(meal => meal.status === "pending").map(meal => meal.id);
        setIsSelectAll(pendingMealIds.length > 0 && pendingMealIds.every(id => selectedMealPlans.includes(id)));
    }, [selectedMealPlans, mealPlans]);

    const hasPending = mealPlans.some(m => m.status === "pending");
    const mealPlanColSpan = hasPending ? 4 : 3;

    if (!isOpen) return null;

    const handleBackdrop = (event) => {
        if (kitchenModalOpen) return;
        if (!kitchenModalOpen && event.target.classList.contains("vendor-modal-backdrop")) {
            onClose?.();
        }
    };

    const renderScoreBadge = (score, status) => {
        const percentage = score*100;
        let scoreBadge = "score-badge ";

        if (status === "dirty" && percentage < 70) {
            scoreBadge += "score-red";
        }  else {
            scoreBadge += "score-green";
        }

        return (
            <span className={scoreBadge}>{percentage.toFixed(1)}</span>
        );
    }

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
        const pendingMealIds = mealPlans.filter((meal) => meal.status === "pending").map((meal) => meal.id);

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

            setMealPlans(prev =>
                prev.map(meal => ids.includes(meal.id) ? {...meal, status: "approved"} : meal)
            );
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

            setMealPlans(prev =>
                prev.map(meal => ids.includes(meal.id) ? {...meal, status: "rejected"} : meal)
            );
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

    const calculateKitchenStats = () => {
        if (kitchenChecks.length === 0) return null;

        const scores = kitchenChecks.map(c => c.score * 100);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const latest = scores[0];
        const trend = scores.length > 1 ? latest - scores[1] : 0;
        const cleanCount = kitchenChecks.filter(c => c.status === 'clean').length;

        return {
            average: avg.toFixed(1),
            latest: latest.toFixed(1),
            trend: trend.toFixed(1),
            total: kitchenChecks.length,
            cleanRate: ((cleanCount / kitchenChecks.length) * 100).toFixed(0),
            scores: scores.slice(0, 6).reverse()
        };
    };

    const kitchenStats = calculateKitchenStats();

    const MiniScoreChart = ({ scores }) => {
        const maxScore = 100;
        return (
            <div className="mini-score-chart">
                {scores.map((score, i) => (
                    <div key={i} className="chart-bar-wrapper">
                        <div
                            className={`chart-bar ${score >= 75 ? 'bar-green' : score >= 60 ? 'bar-yellow' : 'bar-red'}`}
                            style={{ height: `${(score / maxScore) * 100}%` }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const openPhotoOnlyModal = (photos) => {
        setPhotoModalImages(Array.isArray(photos) ? photos : []);
        setPhotoModalOpen(true);
    };

    const closePhotoOnlyModal = () => {
        setPhotoModalOpen(false);
        setPhotoModalImages([]);
    };

    const getAddressDisplay = (address) => {
        if (!address) {
            return
        }
        if (typeof address === "string") {
            return address;
        }
        return address.full_address || address.address_line_2 || `${address.district || ""} ${address.city || ""}`.trim() || "";
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
                                    <div className="vendor-name-label">
                                        <h3>Vendor Name</h3>
                                    </div>
                                    <h2>{vendorDetails?.vendor_name || vendor.vendor_name}</h2>
                                    <div className="vendor-target-label">
                                        <h3>Target Schools</h3>
                                    </div>
                                    <div className="vendor-target-wrapper">
                                        {vendorDetails?.target_schools?.length > 0 ? (
                                            vendorDetails.target_schools.map((school, idx) => (
                                                <span key={idx} className="vendor-target-chip">
                                                    {school.name}
                                                </span>
                                            ))
                                        ) : (
                                            <div className="target-placeholder">
                                                <img src={Info} alt="info" className="target-info-icon" />
                                                <p className="target-info-text">This vendor has no assigned target schools</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="vendor-info-wrapper">
                                        <div className="vendor-info-block">
                                            <p className="vendor-details-label">Email</p>
                                            <p className="vendor-info-value">{vendorDetails?.email || vendor.email}</p>
                                        </div>
                                        <div className="vendor-info-block">
                                            <p className="vendor-details-label">Address</p>
                                            <p className="vendor-info-value">
                                                {getAddressDisplay(vendor.address)}
                                            </p>
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
                                    {kitchenStats && (
                                        <div className="kitchen-overview-card">
                                            <div className="kitchen-score-circle">
                                                <div className="score-circle-wrapper">
                                                    <svg viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="45" className="score-circle-bg" />
                                                        <circle
                                                            cx="50" cy="50" r="45"
                                                            className={`score-circle-progress ${parseFloat(kitchenStats.average) >= 75 ? 'progress-green' : parseFloat(kitchenStats.average) >= 60 ? 'progress-yellow' : 'progress-red'}`}
                                                            strokeDasharray={`${(parseFloat(kitchenStats.average) / 100) * 283} 283`}
                                                        />
                                                    </svg>
                                                    <div className="score-circle-text">
                                                        <span className="score-circle-number">{kitchenStats.average}</span>
                                                        <span className="score-circle-percent">%</span>
                                                    </div>
                                                </div>
                                                <p className="score-circle-label">Average Score</p>
                                            </div>
                                            <div className="kitchen-stats-grid">
                                                <div className="kitchen-stat-item">
                                                    <span className="kitchen-stat-value">{kitchenStats.latest}%</span>
                                                    <span className="kitchen-stat-label">Latest Score</span>
                                                </div>
                                                <div className="kitchen-stat-item">
                                                    <span className={`kitchen-stat-value ${parseFloat(kitchenStats.trend) >= 0 ? 'trend-up' : 'trend-down'}`}>
                                                        {parseFloat(kitchenStats.trend) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(kitchenStats.trend))}%
                                                    </span>
                                                    <span className="kitchen-stat-label">vs Previous</span>
                                                </div>
                                                <div className="kitchen-stat-item">
                                                    <span className="kitchen-stat-value">{kitchenStats.cleanRate}%</span>
                                                    <span className="kitchen-stat-label">Clean Rate</span>
                                                </div>
                                                <div className="kitchen-stat-item">
                                                    <span className="kitchen-stat-value">{kitchenStats.total}</span>
                                                    <span className="kitchen-stat-label">Total Checks</span>
                                                </div>
                                            </div>
                                            <div className="kitchen-chart-section">
                                                <span className="kitchen-chart-label">Score History</span>
                                                <MiniScoreChart scores={kitchenStats.scores} />
                                            </div>
                                        </div>
                                    )}
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
                                                    <td>{renderScoreBadge(check.score, check.status)}</td>
                                                    <td>
                                                        {renderStatusBadge(check.status)}
                                                    </td>
                                                    <td>{new Date(check.check_date).toLocaleDateString()}</td>
                                                    <td>{check.checked_by}</td>
                                                    <td>
                                                        <button className="view-kitchen-details-button" onClick={() => {openPhotoOnlyModal(check.kitchen_photos);}}>
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
                                        {selectedMealPlans.length > 1 && (
                                            <div className="details-action-bar">
                                                <span>{selectedMealPlans.length} selected</span>
                                                <div className="bulk-buttons">
                                                    <button className="bulk-reject" onClick={() => handleRejectMealPlan(selectedMealPlans)}>
                                                        Reject
                                                    </button>
                                                    <button className="bulk-approve" onClick={() => handleApproveMealPlan(selectedMealPlans)}>
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="vendor-details-wrapper">
                                            <table className="meal-plans-table">
                                                <thead>
                                                <tr>
                                                    {hasPending && (
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelectAll}
                                                                onChange={toggleSelectPendingMeals}
                                                            />
                                                        </th>
                                                    )}
                                                    <th>Meal Plan</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {mealPlans.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={mealPlanColSpan} className="empty-row">
                                                            No meal plans submitted.
                                                        </td>
                                                    </tr>
                                                ) : (mealPlans.map((meal, idx) => (
                                                        <tr key={idx}>
                                                            {hasPending && (
                                                                <td>
                                                                    {meal.status === "pending" ? (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedMealPlans.includes(meal.id)}
                                                                            onChange={() => toggleSelectOneMeal(meal.id)}
                                                                        />
                                                                    ) : (
                                                                        <span className="no-check"></span>
                                                                    )}
                                                                </td>
                                                            )}
                                                            <td>
                                                                <div className="mealplan-cell">
                                                                    <img
                                                                        src={meal.image_url || Placeholder}
                                                                        onError={(error) => { error.target.src = Placeholder; }}
                                                                        alt="meal"
                                                                        className="mealplan-thumb"
                                                                    />
                                                                    <div className="mealplan-text">
                                                                        <p className="mealplan-title">{meal.name}</p>
                                                                        <p className="mealplan-desc">{meal.description || "No description provided."}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{renderStatusBadge(meal.status)}</td>
                                                            <td>
                                                                {meal.status === "pending" ? (
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
                                                                    <span className="disabled-action">{meal.status}</span>
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
            <ViewKitchenModal isOpen={kitchenModalOpen} onClose={closeKitchenModal} renderToast={renderToast} vendorId={vendorDetails?._id || vendor?.id} photos={selectedKitchenPhotos}
                              onSubmitted={(newCheck) => {
                                  setKitchenChecks(prev => [newCheck, ...prev]);
                              }}
            />
            <ViewKitchenPhotosOnlyModal isActive={photoModalOpen} onClose={closePhotoOnlyModal} photos={photoModalImages}/>
        </>, modalRoot
    );
}

export default VendorDetailsModal;