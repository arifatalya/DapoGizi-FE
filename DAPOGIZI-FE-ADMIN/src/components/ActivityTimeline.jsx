import {useState, useEffect} from 'react'
import axios from 'axios'
import '../styles/ActivityTimeline.css'
import NextPage from '../assets/next-page.svg'
import PrevPage from '../assets/prev-page.svg'

function ActivityTimeline() {
    const server = `${import.meta.env.VITE_API_URL}`;
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const LOG_PER_PAGE = 5;

    const totalPages = Math.ceil(events.length/LOG_PER_PAGE);
    const paginatedEvents = events.slice((page-1)*LOG_PER_PAGE, page*LOG_PER_PAGE);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = (now - new Date(date)) / 1000;

        if (diff < 60) {
            return "just now";
        }
        if (diff < 3600) {
            return `${Math.floor(diff / 60)} minutes ago`;
        }
        if (diff < 86400) {
            return `${Math.floor(diff / 3600)} hours ago`;
        }
        return `${Math.floor(diff / 86400)} days ago`;
    };

    useEffect(() => {
        let cancel = false;

        const loadTimeline = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");

                const vendorResponse = await axios.get(`${server}/admin/view-vendors`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                const vendors = vendorResponse.data?.data || [];
                let allEvents = [];

                for (const vendor of vendors) {
                    const profileResponse = await axios.get(`${server}/admin/vendor-profile/${vendor.id}`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    const profile = profileResponse.data?.data;

                    if (!profile) continue;

                    allEvents.push({
                        type: "vendor",
                        title: "New Vendor Registered",
                        detail: profile.vendor_details.vendor_name,
                        timestamp: profile.vendor_details.created_at,
                    });

                    for (const mealplan of profile.meal_plans) {
                        allEvents.push({
                            type: "meal-submitted",
                            title: "Meal Plan Submitted",
                            detail: mealplan.name,
                            timestamp: mealplan.created_at,
                        });

                        if (mealplan.status === "approved") {
                            allEvents.push({
                                type: "meal-approved",
                                title: "Meal Plan Approved",
                                detail: mealplan.name,
                                timestamp: mealplan.approved_at,
                            });
                        }

                        if (mealplan.status === "rejected") {
                            allEvents.push({
                                type: "meal-rejected",
                                title: "Meal Plan Rejected",
                                detail: mealplan.name,
                                timestamp: mealplan.approved_at,
                            });
                        }
                    }

                    for (const check of profile.kitchen_checks) {
                        allEvents.push({
                            type: "kitchen-check",
                            title: "Kitchen Check Completed",
                            detail: `Score: ${(check.score*100).toFixed(1)}%`,
                            timestamp: check.check_date,
                        });
                    }
                }
                allEvents.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );

                if (!cancel) {
                    setEvents(allEvents);
                    setPage(1);
                }
            } catch (err) {
                console.error("Failed loading timeline:", err);
            } finally {
                setLoading(false);
            }
        };

        loadTimeline();
        return () => (cancel = true);

    }, [server]);

    return (
        <div className="timeline-container">
            <h3 className="timeline-title">Recent Activity</h3>
            {loading ? (
                <div className="timeline-skeleton-list">
                    <div className="timeline-skeleton"></div>
                    <div className="timeline-skeleton"></div>
                    <div className="timeline-skeleton"></div>
                </div>
            ) : (
                <>
                    <div className="timeline-list">
                        {paginatedEvents.map((event, idx) => (
                            <div key={idx} className={`timeline-item ${event.type}`}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <p className="timeline-title-text">{event.title}</p>
                                    <p className="timeline-detail">{event.detail}</p>
                                    <p className="timeline-time">
                                        {formatTimeAgo(event.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && (
                            <p className="timeline-empty">No recent activity.</p>
                        )}
                    </div>
                    {events.length > LOG_PER_PAGE && (
                        <div className="timeline-pagination">
                            <button className="timeline-page-button" disabled={page === 1} onClick={() => setPage(page-1)}>
                                <img src={PrevPage} alt="Previous page"/> Previous
                            </button>
                            <span>{page}</span>
                            <button className="timeline-page-button" disabled={page === totalPages} onClick={() => setPage(page+1)}>
                                Next <img src={NextPage} alt="Next page"/>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ActivityTimeline;
