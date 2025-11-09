import Close from '../assets/x.svg'
import '../styles/FileDropzone.css'

const FileDropzone = ({label, note, photos, setPhotos, inputId}) => {

    const mergePhotos = (prev, incoming) => {
        const map = new Map();
        [...prev, ...incoming].forEach((photo) => map.set(`${photo.name}-${photo.size}`, photo));
        return Array.from(map.values());
    };

    const handleSelectPhoto =  (event) => {
        const selected = Array.from(event.target.files || []);
        setPhotos((prev) => mergePhotos(prev, selected));
        event.target.value = '';
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((photo, i) => i !== index));
    };

    return (
        <div className="signup-zone">
            <div className="signup-zone-header">
                <p className="signup-label">{label}</p>
                {note && <span className="signup-zone-note">{note}</span>}
            </div>

            <label className="signup-dropzone" htmlFor={inputId}>
                <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectPhoto}
                    style={{display: "none"}}
                />
                <div className="signup-dropzone-inner">
                    <p><b>Click to upload</b> or drag files here</p>
                    <span className="signup-dropzone-hint">You can add multiple photos</span>
                </div>
            </label>
            {photos.length > 0 && (
                <div className="signup-photo-preview">
                    {photos.map((photo, idx) => (
                        <div className="signup-photo-item" key={`${photo.name}-${idx}`}>
                            <img src={URL.createObjectURL(photo)} alt="preview" className="signup-photo-thumb" />
                            <button className="signup-photo-remove" title="Remove photo" onClick={() => removePhoto(idx)}>
                                <img src={Close} alt="remove" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FileDropzone;