import {useState, useEffect} from 'react'
import axios from 'axios'
import '../styles/VendorsOverviewCards.css'
import Placeholder from '../assets/camera-slash.svg'

function VendorsOverviewCards() {
    const server = `${import.meta.env.VITE_API_URL}`;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect( () => {
        let cancel = false;

        const loadStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                let totalKitchenChecks = 0;

                const vendorsResponse = await axios.get(`${server}/admin/view-vendors`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const vendors = vendorsResponse.data?.data || [];

                for (const vendor of vendors) {
                    const checksResponse = await axios.get(`${server}/admin/view-vendor/${vendor.id}`, {
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    totalKitchenChecks +=(checksResponse.data?.data?.length || 0);
                }

                if (cancel) {
                    return;
                }

                const mealResponse = await axios.get(`${server}/admin/vendors-meal-plans`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const meals = mealResponse.data?.data || [];

                setStats({
                    totalVendors: vendors.length,
                    totalKitchenChecks,
                    totalMealPlans: meals.length,
                    pendingMealPlans: meals.filter((meal) => meal.meal_plan.status === "pending").length,
                });

            } catch (err) {
                console.error("Failed to load statistics: ", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
        return () => {
            cancel = true;
        }
    }, [server]);

    if (loading) {
        return (
            <div className="overview-cards-strip">
                <div className="overview-card-skeleton"></div>
                <div className="overview-card-skeleton"></div>
                <div className="overview-card-skeleton"></div>
                <div className="overview-card-skeleton"></div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="overview-cards-strip">
            <div className="overview-card">
                <div className="overview-icon-wrapper green">
                    <img src={Placeholder} alt="icon" />
                </div>
                <div className="overview-card-info">
                    <p className="overview-card-label">Registered Vendors</p>
                    <h2 className="overview-card-value">{stats.totalVendors}</h2>
                </div>
            </div>
            <div className="overview-card">
                <div className="overview-icon-wrapper blue">
                    <img src={Placeholder} alt="icon" />
                </div>
                <div className="overview-card-info">
                    <p className="overview-card-label">Submitted Meal Plans</p>
                    <h2 className="overview-card-value">{stats.totalMealPlans}</h2>
                </div>
            </div>
            <div className="overview-card">
                <div className="overview-icon-wrapper yellow">
                    <img src={Placeholder} alt="icon" />
                </div>
                <div className="overview-card-info">
                    <p className="overview-card-label">Pending Meal Plans</p>
                    <h2 className="overview-card-value">{stats.pendingMealPlans}</h2>
                </div>
            </div>
        </div>
    );

}

export default VendorsOverviewCards;
