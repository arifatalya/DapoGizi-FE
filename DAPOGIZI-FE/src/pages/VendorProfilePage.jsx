import {useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import Select from 'react-select'
import '../styles/VendorMonitoringPage.css'
import '../styles/VendorProfilePage.css'
import ArrowLeft from '../assets/chevron-back.svg'
import CameraIcon from '../assets/image-check.svg'
import PlusSquare from '../assets/add.svg'
import Close from '../assets/x.svg'
import cities from '../data/cities.json'
import Sidebar from '../components/Sidebar.jsx'
import MealPlanModal from '../components/MealPlanModal.jsx'
import ToastProvider from '../components/ToastProvider.jsx'

const OPERATING_DAY_OPTIONS = [
    { label: "Monday", short: "Mon", value: "Mon" },
    { label: "Tuesday", short: "Tue", value: "Tue" },
    { label: "Wednesday", short: "Wed", value: "Wed" },
    { label: "Thursday", short: "Thu", value: "Thu" },
    { label: "Friday", short: "Fri", value: "Fri" },
    { label: "Saturday", short: "Sat", value: "Sat" },
    { label: "Sunday", short: "Sun", value: "Sun" },
];

function VendorProfilePage() {
    const server = import.meta.env.VITE_API_URL;
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [kitchenPhotos, setKitchenPhotos] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("default");
    const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxFileSize = 3*1024*1024;
    const selectedPlan = null;
    const refreshList = () => {};

    const renderToast = (message, type= "default") => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    }

    const [form, setForm] = useState({
        vendor_name: "",
        address_line_1: "",
        address_line_2: "",
        district: "",
        city: "",
        province: "",
        postal_code: "",
        operating_days: [],
    });

    const handleBack = () => {
        if (window.history.length > 1) window.history.back();
    };

    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${server}/vendor/my-profile`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                if (response.data?.success && response.data.vendor) {
                    const v = response.data.vendor;

                    setProfile(v);
                    setForm({
                        vendor_name: v.vendor_name || "",
                        address_line_1: v.address?.address_line_1 || "",
                        address_line_2: v.address?.address_line_2 || "",
                        district: v.address?.district || "",
                        city: v.address?.city || "",
                        province: v.address?.province || "",
                        postal_code: v.address?.postal_code || "",
                        operating_days: Array.isArray(v.operating_days)
                            ? v.operating_days
                            : [],
                    });
                    setKitchenPhotos(v.kitchen_photos || []);
                }
            } catch (err) {
                console.error("Failed to load vendor profile:", err);
                renderToast("Unable to load vendor profile", "error");
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [server]);

    const provinceOptions = useMemo(() => Object.keys(cities).map((province) => ({
                label: province,
                value: province,
            })),
        []
    );

    const cityOptions = useMemo(() => form.province
                ? (cities[form.province] || []).map((city) => ({
                    label: city,
                    value: city,
                }))
                : [],
        [form.province]
    );

    const handleInputChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const toggleOperatingDay = (day) => {
        setForm((prev) => {
            const exists = prev.operating_days.includes(day);
            return {...prev,
                operating_days: exists
                    ? prev.operating_days.filter((d) => d !== day)
                    : [...prev.operating_days, day],
            };
        });
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        setSavingProfile(true);

        try {
            const token = localStorage.getItem("token");
            const payload = {
                vendor_name: form.vendor_name,
                operating_days: form.operating_days,
                address: {
                    address_line_1: form.address_line_1,
                    address_line_2: form.address_line_2,
                    district: form.district,
                    city: form.city,
                    province: form.province,
                    postal_code: form.postal_code,
                },
                skip_geo: false,
                skip_auto_schools: false,
            };

            const response = await axios.put(`${server}/vendor/profile`, payload, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (response.data?.vendor) {
                setProfile(response.data.vendor);
                renderToast("Profile has been updated successfully!", "success");
            }
        } catch (err) {
            console.error("Failed to update vendor profile: ", err);
            renderToast("Unable to update vendor profile", "error");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleFileChange = (event) => {
        const selected = Array.from(event.target.files || []);
        if (!selected.length) return;

        const validFiles = [];
        let hasInvalidType = false;
        let hasInvalidSize = false;

        selected.forEach(file => {
            const isValidType = allowedTypes.includes(file.type);
            const isValidSize = file.size <= maxFileSize;

            if (isValidType && isValidSize) {
                validFiles.push(file);
            } else {
                if (!isValidType) hasInvalidType = true;
                if (!isValidSize) hasInvalidSize = true;
            }
        });

        if (hasInvalidType) {
            renderToast("Only .jpeg, .jpg, or .png images are allowed", "error");
        }

        if (hasInvalidSize) {
            renderToast("Each image must be under 3 MB", "error");
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }

        event.target.value = "";
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadPhotos = async (replace = false) => {
        if (!selectedFiles.length) {
            return;
        }
        setUploadingPhotos(true);

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append('photos', file);
            });

            const response = await axios.put(`${server}/vendor/kitchen/photos?replace=${replace}`, formData, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (Array.isArray(response.data?.kitchen_photos)) {
                setKitchenPhotos(response.data.kitchen_photos);
                renderToast("Successfully updated kitchen photos!", "success");

            }
            setSelectedFiles([]);
        } catch (err) {
            console.error("Failed to upload kitchen photos: ", err);
            renderToast("Unable to update kitchen photos", "error");
        } finally {
            setUploadingPhotos(false);
        }
    };

    return (
        <>
            <ToastProvider message={toastMessage} type={toastType} duration={5000} show={showToast} onClose={setShowToast} />
            <div className="vmp-wrapper">
                <div className="vmp-inner vpr-inner">
                    <header className="vmp-header vpr-header">
                        <div className="vmp-header-left">
                            <button className="vmp-back-btn" onClick={handleBack}>
                                <img src={ArrowLeft} alt="Back" />
                            </button>
                            <div className="vmp-header-text">
                                <h1>Profile</h1>
                                <p>Manage your vendor information</p>
                            </div>
                        </div>
                        <div className="vpr-header-pill">
                            <span className="vpr-header-dot" />
                            {/*<img src={Smile} alt="smile" className="vpr-header-dot"/>*/}
                            <span className="vpr-header-label">
                            {profile?.vendor_name || 'Vendor'}
                        </span>
                        </div>
                    </header>
                    <section className="vpr-section">
                        <div className="vpr-section-heading">
                            <div>
                                <h2>Kitchen Photos</h2>
                                <p>Show your current kitchen condition</p>
                            </div>
                            <span className="vpr-chip">
                            <img src={CameraIcon} alt="" />
                                {kitchenPhotos.length} photos
                        </span>
                        </div>
                        <div className="vpr-kitchen-gallery">
                            {loadingPhotos && (
                                <div className="vpr-kitchen-skeleton-row">
                                    {Array.from({length: 3}).map((_, i) => (
                                        <div key={i} className="vpr-kitchen-skeleton" />
                                    ))}
                                </div>
                            )}
                            {!loadingPhotos && kitchenPhotos.length === 0 && (
                                <div className="vpr-kitchen-empty">
                                    No kitchen photos yet. Upload some to get started.
                                </div>
                            )}
                            {!loadingPhotos &&
                                kitchenPhotos.length > 0 &&
                                kitchenPhotos.map((url, idx) => (
                                    <figure key={`${url}-${idx}`} className="vpr-kitchen-photo">
                                        <img src={url} alt={`Kitchen ${idx + 1}`} />
                                    </figure>
                                ))}
                        </div>
                        <div className="vpr-upload-row">
                            <label className="vpr-upload-btn">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(event) => {handleFileChange(event); event.target.value = "";}}
                                />
                                <img src={PlusSquare} alt="" />
                                <span>Update photos</span>
                            </label>
                            {/*{selectedFiles.length > 0 && (*/}
                            {/*    <div className="vpr-upload-actions">*/}
                            {/*    <span className="vpr-upload-info">*/}
                            {/*        {selectedFiles.length} file {selectedFiles.length > 1 ? "s" : ""} selected*/}
                            {/*    </span>*/}
                            {/*        <button type="button" className="vpr-upload-btn-secondary" disabled={uploadingPhotos} onClick={() => handleUploadPhotos(false)}>*/}
                            {/*            Add on top*/}
                            {/*        </button>*/}
                            {/*        <button type="button" className="vpr-upload-btn-primary" disabled={uploadingPhotos} onClick={() => handleUploadPhotos(true)}>*/}
                            {/*            Replace all*/}
                            {/*        </button>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                            {selectedFiles.length > 0 && (
                                <div className="vpr-upload-list">
                                    <div className="vpr-upload-items">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="vpr-upload-item">
                                                <div className="vpr-upload-item-info">
                                                    <span className="vpr-file-name">{file.name}</span>
                                                    <span className="vpr-file-size">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </span>
                                                </div>
                                                <button type="button" className="vpr-remove-file" onClick={() => removeSelectedFile(index)}>
                                                    <img src={Close} alt="Close" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="vpr-upload-actions">
                                        <button className="vpr-upload-btn-secondary" type="button" onClick={() => setSelectedFiles([])} disabled={uploadingPhotos}>
                                            Clear all
                                        </button>
                                        <button className="vpr-upload-btn-secondary" type="button" disabled={uploadingPhotos} onClick={() => handleUploadPhotos(false)}>
                                            Add on top
                                        </button>
                                        <button className="vpr-upload-btn-primary" type="button" disabled={uploadingPhotos} onClick={() => handleUploadPhotos(true)}>
                                            Replace all
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <section className="vpr-section">
                        <h2 className="vpr-section-title">Vendor information</h2>
                        <form className="vpr-form" onSubmit={handleSaveProfile}>
                            <div className="vpr-form-card">
                                <div className="vpr-field-group">
                                    <label className="vpr-field-label">Vendor name</label>
                                    <input
                                        type="text"
                                        className="vpr-input"
                                        value={form.vendor_name}
                                        onChange={handleInputChange("vendor_name")}
                                        placeholder="Your vendor name"
                                    />
                                </div>
                                <div className="vpr-field-group">
                                    <label className="vpr-field-label">Address line 1</label>
                                    <input
                                        type="text"
                                        className="vpr-input"
                                        value={form.address_line_1}
                                        onChange={handleInputChange("address_line_1")}
                                        placeholder="Street / building"
                                    />
                                </div>
                                <div className="vpr-field-group">
                                    <label className="vpr-field-label">Address line 2</label>
                                    <input
                                        type="text"
                                        className="vpr-input"
                                        value={form.address_line_2}
                                        onChange={handleInputChange("address_line_2")}
                                        placeholder="Apartment / additional info"
                                    />
                                </div>
                                <div className="vpr-field-grid">
                                    <div className="vpr-field-group">
                                        <label className="vpr-field-label">District</label>
                                        <input
                                            type="text"
                                            className="vpr-input"
                                            value={form.district}
                                            onChange={handleInputChange("district")}
                                            placeholder="District"
                                        />
                                    </div>
                                    <div className="vpr-field-group">
                                        <label className="vpr-field-label">City / Regency</label>
                                        <Select
                                            classNamePrefix="rs"
                                            placeholder={form.province ? "Select city" : "Select province first"}
                                            options={cityOptions}
                                            value={form.city ? { label: form.city, value: form.city } : null}
                                            onChange={(opt) => setForm((prev) => ({...prev, city: opt?.value || '',}))}
                                            isDisabled={!form.province}
                                        />
                                    </div>
                                </div>
                                <div className="vpr-field-grid">
                                    <div className="vpr-field-group">
                                        <label className="vpr-field-label">Province</label>
                                        <Select
                                            classNamePrefix="rs"
                                            placeholder="Select province"
                                            options={provinceOptions}
                                            value={form.province ? {label: form.province, value: form.province} : null}
                                            onChange={(opt) => setForm((prev) => ({...prev, province: opt?.value || "", city: "",}))}
                                        />
                                    </div>
                                    <div className="vpr-field-group">
                                        <label className="vpr-field-label">Postal code</label>
                                        <input
                                            type="text"
                                            className="vpr-input"
                                            placeholder="Postal code"
                                            value={form.postal_code}
                                            onChange={handleInputChange('postal_code')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="vpr-form-card">
                                <div className="vpr-field-group">
                                    <label className="vpr-field-label">Operating days</label>
                                    <p className="vpr-field-helper">
                                        Select the days when your kitchen is open.
                                    </p>
                                    <div className="vpr-days-grid">
                                        {OPERATING_DAY_OPTIONS.map((day) => {
                                            const active = form.operating_days.includes(day.value);
                                            return (
                                                <button key={day.value} type="button" className={`vpr-day-pill ${active ? "vpr-day-pill-active" : ""}`} onClick={() => toggleOperatingDay(day.value)}>
                                                    {day.short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="vpr-form-footer">
                                <button className="vpr-save-btn" type="submit" disabled={savingProfile}>
                                    {savingProfile ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                    {loadingProfile && (
                        <div className="vpr-loading-overlay">Loading profile…</div>
                    )}
                </div>
            </div>
            <Sidebar isMealModalOpen={mealPlanModalOpen} openMealModal={() => setMealPlanModalOpen(true)} />
            <MealPlanModal isOpen={mealPlanModalOpen} onClose={() => setMealPlanModalOpen(false)} plan={selectedPlan} refreshList={refreshList} renderToast={renderToast} />
        </>
    );
}

export default VendorProfilePage;
