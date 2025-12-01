import {useState} from 'react'
import {createPortal} from 'react-dom'
import Close from '../assets/x.svg'

function ViewKitchenPhotosOnlyModal({isActive, onClose, photos}) {
    const [zoomPhoto, setZoomPhoto] = useState(null);

    if (!isActive) {
        return null;
    }

    return createPortal(
        <>
            <div className="photo-only-backdrop" onClick={onClose}>
                <div className="photo-only-container" onClick={event => event.stopPropagation()}>
                    <button className="photo-only-close" onClick={onClose}>
                        <img src={Close} alt="close" />
                    </button>
                    <div className="photo-only-grid">
                        {photos.map((url, index) => (
                            <img key={index} src={url} className="photo-only-preview" title="Click to enlarge" onClick={() => setZoomPhoto(url)} alt="Photo preview" />
                        ))}
                    </div>
                </div>
            </div>
            {zoomPhoto &&
            <div className="photo-zoom-overlay" onClick={() => setZoomPhoto(null)}>
                <img src={zoomPhoto} alt="Zoomed photo" className="zoomed-photo" />
            </div>}
        </>, document.body
    );
}

export default ViewKitchenPhotosOnlyModal;