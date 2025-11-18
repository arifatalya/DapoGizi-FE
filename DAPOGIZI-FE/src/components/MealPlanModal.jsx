import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import '../styles/MealPlanModal.css'
import axios from 'axios'
import Close from '../assets/x.svg'
import CollapsibleForm from './CollapsibleForm.jsx'
import FileDropzone from './FileDropzone.jsx'

function MealPlanModal({isOpen, onClose, plan, refreshList}) {
    const modalRoot = document.getElementById("modal-root");
    const server = `${import.meta.env.VITE_API_URL}`;
    const isEditing = Boolean(plan);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [photos, setPhotos] = useState([]);
    const [overallKcal, setOverallKcal] = useState("");
    const [protein, setProtein] = useState("");
    const [fat, setFat] = useState("");
    const [carbs, setCarbs] = useState("");
    const [sugar, setSugar] = useState("");
    const [fiber, setFiber] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
         if (!isEditing || !plan) return;
         setName(plan.name || "");
         setDescription(plan.description || "");
         if (plan.detail) {
             setOverallKcal(plan.detail.overall_calories || "");
             setProtein(plan.protein || "");
             setFat(plan.fat || "");
             setCarbs(plan.carbs || "");
             setSugar(plan.sugar || "");
             setFiber(plan.fiber || "");
         }
    }, [plan]);

    if (!isOpen) {
        return null;
    }

    const handleAddMealPlan = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        if (!isEditing && photos.length === 0) {
            setMessage("Meal photo is required.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const form = new FormData();
            form.append("name", name);
            form.append("description", description);
            if (plan.detail) {
                form.append("overall_calories", overallKcal);
                form.append("protein", protein);
                form.append("fat", fat);
                form.append("carbs", carbs);
                form.append("sugar", sugar);
                form.append("fiber", fiber);
            }
            if (photos.length > 0) {
                form.append("photos", photos[0]);
            }

            const url = isEditing ? `${server}/vendor/ops/meal-plans/${plan._id}` : `${server}/vendor/ops/meal-plans`;
            const method = isEditing ? "PUT" : "POST";
            const response = await axios[method](url, form, {
                headers: {Authorization: `Bearer ${token}`}
            });
            if (response.data?.message) {
                refreshList();
                onClose();
            }
        } catch (err) {
            console.error(err);
            setMessage(err.response.data.message || "Failed to add meal plan.");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <>
            <div className="mealplan-modal-wrapper">
                <div className="mealplan-backdrop" onClick={onClose}></div>
                <div className="mealplan-modal">
                    <button className="mealplan-modal-close" type="button" onClick={onClose}>
                        <img src={Close} alt="close" />
                    </button>
                    <h2 className="mealplan-title">
                        {isEditing ? "Edit Meal Plan" : "Add Meal Plan"}
                    </h2>
                    <form className="mealplan-form" onSubmit={handleAddMealPlan}>
                        <div className="mealplan-field">
                            <label>Meal Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Nasi Padang dengan Ayam Sayur dan Sayur Singkong"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>
                        <div className="mealplan-field">
                            <label>Description</label>
                            <small>Write down a simple explanation (e.g., main ingredients, cooking methods) about this meal</small>
                            <textarea
                                value={description}
                                placeholder="e.g., Hidangan Nasi Padang dengan ayam sayur berempah, dilengkapi sayur singkong bumbu santan sebagai pelengkap"
                                rows={5}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </div>
                        <FileDropzone
                            label="Meal Photo"
                            note="Upload at least one clear photo of the meal."
                            photos={photos}
                            setPhotos={setPhotos}
                            inputId="meal-image-upload"
                            error={!isEditing && photos.length === 0 ? "Meal photo is required" : ""}
                        />
                        <CollapsibleForm
                            title="Meal Nutritions Details"
                            subtitle="Kcal and Macronutrients Info (optional)"
                            defaultExpanded={true}
                        >
                            <div className="nutrition-grid">
                                <div className="nutrition-field">
                                    <label>Overall Calories (Kcal)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 720 kcal"
                                        value={overallKcal}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === "" || Number(val) >= 0) {
                                                setOverallKcal(val);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="nutrition-field">
                                    <label>Protein (g)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10 g"
                                        value={protein}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === "" || Number(val) >= 0) {
                                                setProtein(val);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="nutrition-field">
                                    <label>Fat (g)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10 g"
                                        value={fat}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === "" || Number(val) >= 0) {
                                                setFat(val);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="nutrition-field">
                                    <label>Carbs (g)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10 g"
                                        value={carbs}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === "" || Number(val) >= 0) {
                                                setCarbs(val);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="nutrition-field">
                                    <label>Sugar (g)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10 g"
                                        value={sugar}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === "" || Number(val) >= 0) {
                                                setSugar(val);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="nutrition-field">
                                    <label>Fiber (g)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10 g"
                                        value={fiber}
                                        onChange={(event) => {
                                            const val = event.target.value;
                                            if (val === "" || Number(val) >= 0) {
                                                setFiber(val);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </CollapsibleForm>
                        <div className="mealplan-footer">
                            <button className="mealplan-cancel" onClick={onClose}>Cancel</button>
                            <button className="mealplan-save" disabled={loading}>
                                {loading ? "Wait..." : (isEditing ? "Save Changes" : "Create")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>, modalRoot
    );
}

export default MealPlanModal;