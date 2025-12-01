import {useState} from 'react'
import {createPortal} from 'react-dom'
import Close from '../assets/x.svg'
import Placeholder from '../assets/image-placeholder.svg'
import '../styles/ViewKitchenPhotosOnlyModal.css'

function ViewKitchenPhotosOnlyModal({isActive, onClose, photos = []}) {
    const [zoomPhoto, setZoomPhoto] = useState(null);
    const modalRoot = document.getElementById("modal-root") || document.body;

    if (!isActive) {
        return null;
    }

    return createPortal(
        <>
            <div className="photo-only-backdrop"
                 onClick={(event) => {event.stopPropagation(); onClose();}}>
                <div className="photo-only-container" onClick={event => event.stopPropagation()}>
                    <div className="photo-only-header">
                        <button className="photo-only-close" onClick={onClose}>
                            Done
                        </button>
                    </div>
                    <div className={`photo-only-grid ${photos.length === 0 ? "no-photos" : ""}`}>
                        {photos.length > 0 ? (
                            photos.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    className="photo-only-preview"
                                    title="Click to enlarge"
                                    onClick={() => setZoomPhoto(url)}
                                    alt="Photo preview"
                                />
                            ))
                        ) : (
                            <div className="photo-empty-state">
                                <img src={Placeholder} className="photo-empty-icon" alt="no photos" />
                                <p>No kitchen photos available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {zoomPhoto &&
            <div className="photo-zoom-overlay" onClick={() => setZoomPhoto(null)}>
                <img src={zoomPhoto} alt="Zoomed photo" className="zoomed-photo" />
            </div>}
        </>, modalRoot
    );
}

export default ViewKitchenPhotosOnlyModal;