import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import '../styles/MealPlanModal.css'
import axios from 'axios'
import Close from '../assets/x.svg'
import CollapsibleForm from './CollapsibleForm.jsx'
import FileDropzone from './FileDropzone.jsx'

function MealPlanModal({isOpen, onClose, plan, refreshList, renderToast}) {
    const modalRoot = document.getElementById("modal-root");
    const server = `${import.meta.env.VITE_API_URL}`;
    const isEditing = Boolean(plan);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
         if (!isEditing || !plan) return;
         setName(plan.name || "");
         setDescription(plan.description || "");
         setPhotos([]);
    }, [isEditing, plan]);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setDescription("");
            setPhotos([]);
            setSubmitted(false);
            setMessage("");
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleAddMealPlan = async (event) => {
        event.preventDefault();
        setLoading(true);
        setSubmitted(true);
        setMessage("");

        if (!isEditing && photos.length === 0) {
            setMessage("Meal photo is required.");
            renderToast?.("Please upload a photo of the meal", "default");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const form = new FormData();

            form.append("name", name);
            form.append("description", description);

            if (photos.length > 0) {
                form.append("image", photos[0]);
            }

            const url = isEditing
                ? `${server}/vendor/ops/meal-plans/${plan._id}`
                : `${server}/vendor/ops/meal-plans`;

            const response = isEditing
                ? await axios.put(url, form, {headers: {Authorization: `Bearer ${token}`}})
                : await axios.post(url, form, {headers: {Authorization: `Bearer ${token}`}});

            if (response.data?.message) {
                refreshList();
                onClose();
                return;
            }

        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Failed to add meal plan.");
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
                            note="Supported file format: .jpeg, .jpg, .png"
                            photos={photos}
                            setPhotos={setPhotos}
                            inputId="meal-image-upload"
                            error={submitted && !isEditing && photos.length === 0 ? "Meal photo is required" : ""}
                            onInvalidFile={(invalidFileMessage) => renderToast(invalidFileMessage, "error")}
                        />
                        <div className="mealplan-footer">
                            <button className="mealplan-cancel" type="button" onClick={onClose}>Cancel</button>
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