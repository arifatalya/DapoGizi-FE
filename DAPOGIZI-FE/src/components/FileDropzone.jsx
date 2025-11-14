import { useState } from 'react'
import Close from '../assets/x.svg'
import '../styles/FileDropzone.css'
import Upload from '../assets/upload.svg'
import Load from '../assets/download.svg'

const FileDropzone = ({label, note, photos, setPhotos, inputId, error}) => {
    const [isDragging, setIsDragging] = useState(false);

    const mergePhotos = (prev, incoming) => {
        const map = new Map();
        [...prev, ...incoming].forEach((photo) => map.set(`${photo.name}-${photo.size}`, photo));
        return Array.from(map.values());
    };

    const handleSelectPhoto = (event) => {
        const selected = Array.from(event.target.files || []);
        setPhotos((prev) => mergePhotos(prev, selected));
        event.target.value = '';
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

        const files = Array.from(event.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );

        if (files.length > 0) {
            setPhotos((prev) => mergePhotos(prev, files));
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