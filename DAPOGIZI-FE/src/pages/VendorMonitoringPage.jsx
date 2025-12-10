import {useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import MealPlansCard from '../components/MealPlansCard.jsx'
import ToastProvider from '../components/ToastProvider.jsx'
import Sidebar from '../components/Sidebar.jsx'
import MealPlanModal from '../components/MealPlanModal.jsx'
import '../styles/VendorMonitoringPage.css'
import CalendarIcon from '../assets/calendar.svg'
import ArrowLeft from '../assets/chevron-back.svg'
import PlusSquare from '../assets/add.svg'

function VendorMonitoringPage() {
    const server = import.meta.env.VITE_API_URL;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [sortOrder, setSortOrder] = useState("latest");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("default");
    const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
    const selectedPlan = null;
    const refreshList = () => {};

    const renderToast = (message, type= "default") => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    }

    useEffect(() => {
        const fetchMeals = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${server}/vendor/submissions`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (response.data?.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error(err);
                renderToast("Unable to fetch meals", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchMeals();
    }, [server]);

    const monthOptions = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
    ];

    const yearOptions = useMemo(() => {
        const years = new Set();
        data.forEach((item) => {
            const y = new Date(item.created_at).getFullYear();
            if (!Number.isNaN(y)) {
                years.add(y);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [data]);

    const filteredData = useMemo(() => {
        let temp = [...data];

        temp = temp.filter((index) => {
            const date = new Date(index.created_at);
            if (Number.isNaN(date)) {
                return false;
            }

            const matchesYear = selectedYear ? date.getFullYear() === Number(selectedYear) : true;
            const matchesMonth = selectedMonth ? date.getMonth() === monthOptions.indexOf(selectedMonth) : true;

            return matchesYear && matchesMonth;
        });

        temp.sort((a, b)=> {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();

            if (sortOrder === "latest") {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        return temp;

    }, [data, selectedMonth, selectedYear, monthOptions]);

    const currentMonthLabel = useMemo(() => {
        if (!filteredData.length) {
            return "";
        }

        if (selectedMonth && selectedYear) {
            return `${selectedMonth} ${selectedYear}`;
        }

        if (!selectedMonth && selectedYear) {
            return `${selectedYear}`;
        }

        if (selectedMonth && !selectedYear) {
            return selectedMonth;
        }

        const date = new Date(filteredData[0].created_at);
        if (Number.isNaN(date)) {
            return "";
        }
        return `${monthOptions[date.getMonth()]} ${date.getFullYear()}`;
    }, [filteredData, selectedMonth, selectedYear, monthOptions]);


    const handleBack = () => {
        if (window.history.length > 1) window.history.back();
    };

    return (
        <>
            <ToastProvider message={toastMessage} type={toastType} duration={5000} show={showToast} onClose={setShowToast} />
            <div className="vmp-wrapper">
                <div className="vmp-inner">
                    <header className="vmp-header">
                        <div className="vmp-header-left">
                            <button className="vmp-back-btn" onClick={handleBack}>
                                <img src={ArrowLeft} alt="Back" />
                            </button>
                            <div className="vmp-header-text">
                                <h1>Monitoring</h1>
                                <p>Summary of your submissions</p>
                            </div>
                        </div>
                        <button className="vmp-new-btn" onClick={() => setMealPlanModalOpen(true)}>
                            <img src={PlusSquare} alt="Plus" />
                            New
                        </button>
                    </header>
                    <section className="vmp-stat-grid">
                        <div className="vmp-stat-box">
                            <div className="vmp-stat-label">Total submissions</div>
                            <div className="vmp-stat-value">{filteredData.length}</div>
                        </div>
                        <div className="vmp-month-selector">
                            <div className="vmp-month-label-top">Select month</div>
                            <div className="vmp-month-select-row">
                                <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                                    <option value="">All years</option>
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                                    <option value="">All months</option>
                                    {monthOptions.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <img src={CalendarIcon} alt="" className="vmp-calendar-icon" />
                        </div>
                    </section>
                    {!loading && filteredData.length > 0 && (
                        <div className="vmp-sort-row">
                            <span className="vmp-sort-label">Sort by:</span>
                            <select
                                className="vmp-sort-select"
                                value={sortOrder}
                                onChange={(event) => setSortOrder(event.target.value)}
                            >
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    )}
                    {currentMonthLabel && (
                        <div className="vmp-section-title">{currentMonthLabel}</div>
                    )}
                    <MealPlansCard dataOverride={filteredData} loadingOverride={loading}/>
                    {!loading && filteredData.length === 0 && (
                        <div className="vmp-empty-month">
                            No submissions for this selection yet.
                        </div>
                    )}
                    {!loading && filteredData.length > 0 && (
                        <div className="vmp-end">
                            You&apos;ve reached the end of this month&apos;s submission history.
                        </div>
                    )}
                </div>
            </div>
            <Sidebar isMealModalOpen={mealPlanModalOpen} openMealModal={() => setMealPlanModalOpen(true)} />
            <MealPlanModal isOpen={mealPlanModalOpen} onClose={() => setMealPlanModalOpen(false)} plan={selectedPlan} refreshList={refreshList} renderToast={renderToast} />
        </>
    );
}

export default VendorMonitoringPage;
