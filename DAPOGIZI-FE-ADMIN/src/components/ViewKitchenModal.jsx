import {useState, useEffect} from 'react'
import {createPortal} from 'react-dom'
import axios from 'axios'
import '../styles/ViewKitchenModal.css'
import Close from '../assets/x.svg'
import NoPhotos from '../assets/camera-slash.svg'

function ViewKitchenModal({isOpen, onClose, vendorId, photos, onSubmitted}) {
    const server = `${import.meta.env.VITE_API_URL}`;
    const modalRoot = document.getElementById("modal-root") || document.body;
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const hasInput = score !== "" || status !== "" || notes !== "";

    useEffect(() => {
        if (isOpen) {
            setScore(0);
            setStatus("");
            setNotes("");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = () => {
        if (!hasInput) {
            onClose();
            return;
        }
    }

    const submitAssessment = async () => {
        if (!score || !status) {
            setError("Score and status is required");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            const response = await axios.post(`${server}/admin/kitchen-check/assess/${vendorId}`,
                {score, status, notes},
                {headers: {'Authorization': `Bearer ${token}`}}
            );
            onSubmitted(response.data.data);
            onClose();
        } catch (err) {
            setError("Something went wrong while submitting");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <>
            <div className="kitchen-check-backdrop" onClick={handleBackdropClick}>
                <div className="kitchen-check-modal" onClick={(event) => event.stopPropagation()}>
                    <div className="kitchen-check-header">
                        <h2>Kitchen Condition</h2>
                        <button className="kitchen-check-close" title="Close" onClick={handleBackdropClick}>
                            <img src={Close} alt="Close" />
                        </button>
                    </div>
                    <div className="kitchen-check-content">
                        <p className="kc-section-label">Photos</p>
                        <div className="kitchen-photos-wrapper">
                            {photos.length === 0 ? (
                                <div className="no-kitchen-photos-placeholder">
                                    <img src={NoPhotos} alt="No photos submitted" />
                                    <p>No photos available for this submission</p>
                                </div>
                            ) : (
                                photos.map((url,index) => (
                                    <img className="kitchen-check-photo-items" key={index} src={url} alt={`kitchen-${index}`} />
                                ))
                            )}
                        </div>
                        <form className="kitchen-check-form">
                            {/*<label>Score</label>*/}
                            {/*<input*/}
                            {/*    type="number"*/}
                            {/*    value={score}*/}
                            {/*    min="0"*/}
                            {/*    max="100"*/}
                            {/*    onChange={(event) => setScore(event.target.value)}*/}
                            {/*/>*/}
                            <label>Status</label>
                            <select value={status}
                                    onChange={(event) => setStatus(event.target.value)}>
                                <option value="clean">Clean</option>
                                <option value="dirty">Dirty</option>
                            </select>
                            <label>Notes</label>
                            <textarea
                                value={notes}
                                placeholder="Add notes here..."
                                onChange={(event) => setNotes(event.target.value)}
                            />
                        </form>
                        {error && <p className="kitchen-check-error">{error}</p>}
                        <button className="kitchen-check-submit" onClick={submitAssessment} disabled={loading}>
                            {loading ? "Loading..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </>, modalRoot
    );
}

export default ViewKitchenModal;