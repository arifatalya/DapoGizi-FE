import HomeNavbar from '../components/HomeNavbar.jsx'
import QuickAccessCard from '../components/QuickAccessCard.jsx'
import Sidebar from '../components/Sidebar.jsx'
import MealPlanModal from '../components/MealPlanModal.jsx'
import Guidelines from '../assets/guideline.png'
import MealPlan from '../assets/mealplan.png'
import Feedbacks from '../assets/feedback.png'
import '../styles/VendorHomePage.css'
import {useState} from "react";

function VendorHomePage() {
    const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
    const selectedPlan = null;
    const refreshList = () => {};

    return (
        <>
            <div className="homepage-wrapper">
                <HomeNavbar />
                <div className="homepage-qa-wrapper">
                    <QuickAccessCard
                        title="Guidelines"
                        image={Guidelines}
                        to="/guidelines"
                        description="Review kitchen hygiene rules, nutritional standards, and submission procedures for your daily operations."
                    />
                    <QuickAccessCard
                        title="View Your Meal Plans"
                        image={MealPlan}
                        to="/plans"
                        description="Track, submit, and monitor your submitted meal plans and nutritional breakdowns for each school."
                    />
                    <QuickAccessCard
                        title="Check the Latest Feedbacks"
                        image={Feedbacks}
                        to="/feedback"
                        badge="NEW"
                        description="Read feedback from nutrition teams and schools, and find improvement notes on your recent submissions."
                    />
                </div>
                <Sidebar isMealModalOpen={mealPlanModalOpen} openMealModal={() => setMealPlanModalOpen(true)}/>
                <MealPlanModal isOpen={mealPlanModalOpen} onClose={() => setMealPlanModalOpen(false)} plan={selectedPlan} refreshList={refreshList} />
            </div>
        </>
    );
}

export default VendorHomePage;