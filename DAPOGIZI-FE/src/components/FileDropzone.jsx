import { useState } from 'react'
import Close from '../assets/x.svg'
import '../styles/FileDropzone.css'
import Upload from '../assets/upload.svg'
import Load from '../assets/download.svg'

const FileDropzone = ({label, note, photos, setPhotos, inputId, error, onInvalidFile}) => {
    const [isDragging, setIsDragging] = useState(false);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    const mergePhotos = (prev, incoming) => {
        const map = new Map();
        [...prev, ...incoming].forEach((photo) => map.set(`${photo.name}-${photo.size}`, photo));
        return Array.from(map.values());
    };

    const handleSelectPhoto = (event) => {
        const selected = Array.from(event.target.files || []);

        const validFiles = [];
        let hasInvalid = false;

        selected.forEach(file => {
            if (allowedTypes.includes(file.type)) {
                validFiles.push(file);
            } else {
                hasInvalid = true;
            }
        });

        if (hasInvalid && onInvalidFile) {
            onInvalidFile("Please upload only .jpeg, .jpg, or .png images");
        }

        if (validFiles.length > 0) {
            setPhotos(prev => mergePhotos(prev, validFiles));
        }
        event.target.value = "";
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const dropped = Array.from(event.dataTransfer.files);

        const validFiles = [];
        let hasInvalid = false;

        dropped.forEach(file => {
            if (allowedTypes.includes(file.type)) {
                validFiles.push(file);
            } else {
                hasInvalid = true;
            }
        });

        if (hasInvalid && onInvalidFile) {
            onInvalidFile("Please upload only .jpeg, .jpg, or .png images");
        }

        if (validFiles.length > 0) {
            setPhotos(prev => mergePhotos(prev, validFiles));
        }
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((photo, i) => i !== index));
    };

    return (
        <div className="signup-zone">
            <div className="signup-zone-header">
                <p className="signup-zone-label">{label}</p>
                {note && <span className="signup-zone-note">{note}</span>}
            </div>
            <label
                className={`signup-dropzone ${isDragging ? 'dragover' : ''} ${photos.length > 0 ? 'has-photos' : ''} ${error ? 'error' : ''}`}
                htmlFor={inputId}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectPhoto}
                    style={{display: "none"}}
                />
                {photos.length === 0 ? (
                    <div className="signup-dropzone-inner">
                        <img src={Load} alt="Upload" />
                        <p><b>Click to upload</b> or drag files here</p>
                        <span className="signup-dropzone-hint">You can add multiple photos</span>
                    </div>
                ) : (
                    <div className="signup-photo-preview">
                        {photos.map((photo, idx) => (
                            <div className="signup-photo-item" key={`${photo.name}-${idx}`}>
                                <img src={URL.createObjectURL(photo)} alt={`Preview ${idx + 1}`} className="signup-photo-thumb" />
                                <button
                                    className="signup-photo-remove"
                                    type="button"
                                    title="Remove photo"
                                    onClick={(event) => {event.preventDefault();removePhoto(idx);}}
                                >
                                    <img src={Close} alt="" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </label>
            {error && <span className="signup-zone-error">{error}</span>}
        </div>
    );
}

export default FileDropzone;