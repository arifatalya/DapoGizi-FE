import {useState, useImperativeHandle, forwardRef} from 'react'
import axios from 'axios'
import '../styles/SignupStep.css'
import ChevronLeft from '../assets/chevron-back.svg'
import Close from '../assets/x.svg'
import FileDropzone from './FileDropzone.jsx'

const SignupStepKitchen = forwardRef(({prev, finish}, ref) => {
    const server = import.meta.env.VITE_API_URL;
    const [cookingPhotos, setCookingPhotos] = useState([]);
    const [storagePhotos, setStoragePhotos] = useState([]);
    const [dishwashingPhotos, setDishwashingPhotos] = useState([]);
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('');

    useImperativeHandle(ref, () => ({
        getKitchen: () => ({
            cooking: cookingPhotos,
            storage: storagePhotos,
            dishwashing: dishwashingPhotos,
        }),
    }));

    const handlePhotoUpload = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        if (cookingPhotos.length === 0 || storagePhotos.length === 0 || dishwashingPhotos.length === 0) {
            setMessage('Please upload at least one photo of each kitchen area.');
            setLoading(false);
            return;
        }

        try {
            const allPhotos = [...cookingPhotos, ...storagePhotos, ...dishwashingPhotos];
            const form = new FormData();
            allPhotos.forEach((photo) => form.append('kitchens', photo));

            const response = await axios.put(`${server}/vendor/kitchen/photos?replace=true`, form,
                {
                    withCredentials: true,
                    headers: {'Content-Type': 'multipart/form-data'}
                });
            if (response.data?.message === 'Kitchen photos updated') {
                finish();
            } else {
                setMessage(response.data?.message || 'Failed to update kitchen photos.');
            }
        } catch (err) {
            console.log(err);
            setMessage('Error uploading kitchen photos. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-steps-global">
            <div className="signup-steps-wrapper">
                <button className="signup-back" onClick={prev}>
                    <img src={ChevronLeft} alt="back" />
                </button>
                <div className="signup-header">
                    <div className="signup-title">Kitchen Documentation</div>
                    <span className="signup-subtitle">Upload Photos</span>
                </div>
                <div className="signup-kitchen-instructions">
                    <p>Please upload clear photos of:</p>
                    <ol>
                        <li>• Cooking area (dapur/kompor)</li>
                        <li>• Storage area (penyimpanan bahan makanan)</li>
                        <li>• Dishwashing area (tempat cuci peralatan)</li>
                    </ol>
                    <p className="signup-small-note">These photos help us verify kitchen hygiene & layout.</p>
                </div>
                <form className="signup-form" onSubmit={handlePhotoUpload}>
                    <FileDropzone
                        label="Cooking Area"
                        note="Upload photos of your stove, prep table, and main cooking area."
                        photos={cookingPhotos}
                        setPhotos={setCookingPhotos}
                        inputId="cooking-upload"
                    />
                    <FileDropzone
                        label="Storage Area"
                        note="Upload photos of ingredients storage, refrigerator, and freezer."
                        photos={storagePhotos}
                        setPhotos={setStoragePhotos}
                        inputId="storage-upload"
                    />
                    <FileDropzone
                        label="Dishwashing Area"
                        note="Upload photos of the sanitation area, sink, and drying racks."
                        photos={dishwashingPhotos}
                        setPhotos={setDishwashingPhotos}
                        inputId="dishwashing-upload"
                    />
                    {message && <p className="signup-status-message">{message}</p>}
                    <div className="signup-next-wrapper">
                        <button className="signup-next-button" type="submit" disabled={loading}>
                            {loading ? "Uploading..." : "Finish Signup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default SignupStepKitchen;

