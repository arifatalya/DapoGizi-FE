import {useState} from 'react'
import '../styles/VendorHomePage.css'
import HomeNavbar from '../components/HomeNavbar.jsx'
import QuickAccessCard from '../components/QuickAccessCard.jsx'
import Sidebar from '../components/Sidebar.jsx'
import MealPlanModal from '../components/MealPlanModal.jsx'
import ToastProvider from '../components/ToastProvider.jsx'
import Guidelines from '../assets/guideline.png'
import MealPlan from '../assets/mealplan.png'
import Feedbacks from '../assets/feedback.png'

function VendorHomePage() {
    const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("default");
    const selectedPlan = null;
    const refreshList = () => {};

    const renderToast = (message, type= "default") => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    }

    return (
        <>
            <ToastProvider message={toastMessage} type={toastType} duration={5000} show={showToast} onClose={setShowToast} />
            <div className="homepage-layout">
                <Sidebar isMealModalOpen={mealPlanModalOpen} openMealModal={() => setMealPlanModalOpen(true)} />
                <div className="homepage-main">
                    <HomeNavbar />
                    <div className="homepage-content">
                        <div className="homepage-qa-wrapper">
                            <QuickAccessCard
                                title="View Your Meal Plans"
                                image={MealPlan}
                                to="/monitor"
                                description="Track, submit, and monitor your submitted meal plans and nutritional breakdowns for each school."
                            />
                            <QuickAccessCard
                                title="Check the Latest Feedbacks"
                                image={Feedbacks}
                                to="/monitor"
                                description="Read feedback from nutrition teams and schools, and find improvement notes on your recent submissions."
                            />
                        </div>
                    </div>
                </div>
            </div>
            <MealPlanModal isOpen={mealPlanModalOpen} onClose={() => setMealPlanModalOpen(false)} plan={selectedPlan} refreshList={refreshList} renderToast={renderToast} />
        </>
    );
}

export default VendorHomePage;