import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import '../styles/MealPlansCard.css';
import PendingIcon from '../assets/pending.svg';
import ApprovedIcon from '../assets/approve.svg';
import RejectedIcon from '../assets/no.svg';

function MealPlansCard({ dataOverride, loadingOverride }) {
    const server = `${import.meta.env.VITE_API_URL}`;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dataOverride) {
            return;
        }

        const loadMealPlan = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${server}/vendor/submissions`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data?.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error("Retrieving submitted meal plans failed: ", err);
            } finally {
                setLoading(false);
            }
        };
        loadMealPlan();
    }, [server, dataOverride]);

    const effectiveData = dataOverride ?? data;
    const effectiveLoading = loadingOverride ?? loading;

    const parsedData = useMemo(() => {
        return (effectiveData || []).map((item) => {
            const d = new Date(item.created_at);
            const createdAtFormatted = !Number.isNaN(d)
                ? d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                : '-';

            const statusMapping = {
                pending: {
                    text: "In Progress",
                    icon: PendingIcon,
                    className: "status-pending",
                },
                approved: {
                    text: "Passed",
                    icon: ApprovedIcon,
                    className: "status-approved",
                },
                rejected: {
                    text: "Failed",
                    icon: RejectedIcon,
                    className: "status-rejected",
                },
            };

            const fallbackStatus = {
                text: item.status || "Unknown",
                icon: PendingIcon,
                className: "status-pending",
            };

            const status = statusMapping[item.status] || fallbackStatus;

            const percentage = item.nutrition
                ? Math.min((item.nutrition.overall_calories / 800) * 100, 100)
                : 0;

            return {
                ...item,
                createdAtFormatted,
                statusText: status.text,
                statusIcon: status.icon,
                statusClassName: status.className,
                percentage,
            };
        });

    }, [effectiveData]);

    return (
        <div className="mpc-wrapper">
            {effectiveLoading && (
                <div className="mpc-skeleton-wrapper">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="mpc-skeleton-card">
                            <div className="mpc-skel-bg" />
                        </div>
                    ))}
                </div>
            )}
            {!effectiveLoading && parsedData.length === 0 && (
                <div className="mpc-empty">
                    No meal plans submitted yet.
                </div>
            )}
            {!effectiveLoading &&
                parsedData.map((item) => (
                    <article key={item.id} className="mpc-card" style={{backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',}}>
                        <div className="mpc-card-overlay">
                            <header className="mpc-top">
                                <div className="mpc-title-row">
                                    <span className="mpc-name">{item.name}</span>
                                    <span className="mpc-title-divider">|</span>
                                    <span className="mpc-date">{item.createdAtFormatted}</span>
                                </div>
                                <span className={`mpc-status ${item.statusClassName}`}>
                                    <img src={item.statusIcon} alt="" />
                                    {item.statusText}
                                </span>
                            </header>
                            <div className="mpc-assessment-pill">
                                <div className="mpc-assessment-text">
                                    <span className="mpc-assessment-label">
                                        Assessment Result:
                                    </span>
                                    <span className="mpc-assessment-score">
                                        {item.nutrition
                                            ? `${item.nutrition.overall_calories} / 800 kcal`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="mpc-progress">
                                    <div
                                        className="mpc-progress-bar"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <button className="mpc-details-button">
                                See Details
                            </button>
                        </div>
                    </article>
                ))}
        </div>
    );
}

export default MealPlansCard;
