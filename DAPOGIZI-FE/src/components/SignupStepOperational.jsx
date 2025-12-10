import {useState, useImperativeHandle, forwardRef, useMemo} from 'react'
import axios from 'axios'
import '../styles/SignupStep.css'
import cities from '../data/cities.json'
import Select from 'react-select'
import ChevronLeft from '../assets/chevron-back.svg'
import Dropdown from '../assets/arrow.svg'

const SignupStepOperational = forwardRef(({next, prev}, ref) => {
    const server = import.meta.env.VITE_API_URL;
    const [address, setAddress] = useState({
        address_line_1: "",
        address_line_2: "",
        district: "",
        city: "",
        province: "",
        postal_code: "",
    });
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [showCoordinates, setShowCoordinates] = useState(false);
    const [operatingDays, setOperatingDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const days = [
        {label: "Monday", value: "Mon"},
        {label: "Tuesday", value: "Tue"},
        {label: "Wednesday", value: "Wed"},
        {label: "Thursday", value: "Thu"},
        {label: "Friday", value: "Fri"},
        {label: "Saturday", value: "Sat"},
        {label: "Sunday", value: "Sun"},
    ];

    const updateAddress = (field, value) => {
        setAddress((prev) => ({...prev, [field]: value}));
    };

    const provinceOptions = Object.keys(cities).map((province) => ({label: province, value: province}));

    const cityOptions = useMemo(() =>
    address.province
        ? cities[address.province].map(city => ({label: city, value: city}))
        : [], [address.province]);

    useImperativeHandle(ref, () => ({
        getOperational: () => ({
            address,
            location: longitude && latitude ? {lon: Number(longitude), lat: Number(latitude)} : null,
            operating_days: operatingDays,
        }),
    }));

    const toggleDays = (day) => {
        setOperatingDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSubmitOps = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem("token");
            const payload = {
                address,
                operating_days: operatingDays,
            }

            if (longitude && latitude) {
                payload.location = {
                    lon: Number(longitude),
                    lat: Number(latitude),
                }
                payload.skip_geo = true;
            }

            const response = await axios.put(`${server}/vendor/profile`, payload,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            if (response.data?.message === 'Vendor updated') {
                next();
            } else {
                setMessage(response.data?.message || 'Failed to update profile.');
            }
        } catch (err) {
            console.log(err);
            setMessage('Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-steps-global">
            <div className="signup-steps-wrapper">
                <button className="signup-back" title="Back to previous step" onClick={prev}>
                    <img src={ChevronLeft} alt="chevron-left" /> Previous
                </button>
                <div className="signup-step-progress">
                    <div className="signup-step-text">Step 2 of 3</div>
                    <div className="signup-step-bar">
                        <div className="signup-step-bar-fill" style={{width: "66%"}}></div>
                    </div>
                </div>
                <div className="signup-header">
                    <div className="signup-title">Provide Your Kitchen Details</div>
                    <span className="signup-subtitle">Operational Information</span>
                </div>
                <form className="signup-form" onSubmit={handleSubmitOps}>
                    <div className="signup-field">
                        <div className="required-label-wrapper">
                            <p className="signup-label">Address Line 1</p>
                            <span className="asterisk" aria-hidden="true">*</span>
                        </div>
                        <input
                            type="text"
                            value={address.address_line_1}
                            onChange={event => updateAddress("address_line_1", event.target.value)}
                            placeholder="Jl. Lontar No. 27, RT 02/RW 01"
                            required
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Address Line 2</p>
                        <input
                            type="text"
                            value={address.address_line_2}
                            onChange={(event) => updateAddress("address_line_2", event.target.value)}
                            placeholder="Lenteng Agung"
                        />
                    </div>
                    <div className="signup-field">
                        <div className="required-label-wrapper">
                            <p className="signup-label">District</p>
                            <span className="asterisk" aria-hidden="true">*</span>
                        </div>
                        <input
                            type="text"
                            value={address.district}
                            onChange={(event) => updateAddress("district", event.target.value)}
                            placeholder="Jagakarsa"
                            required
                        />
                    </div>
                    <div className="signup-field">
                        <div className="required-label-wrapper">
                            <p className="signup-label">Province</p>
                            <span className="asterisk" aria-hidden="true">*</span>
                        </div>
                        <Select
                            classNamePrefix="rs"
                            options={provinceOptions}
                            value={address.province ? {label: address.province, value: address.province} : null}
                            onChange={(opt) => {
                                updateAddress("province", opt?.value || "");
                                updateAddress("city", "");
                            }}
                            placeholder="Select Province"
                        />
                    </div>
                    <div className="signup-field">
                        <div className="required-label-wrapper">
                            <p className="signup-label">City/Regency</p>
                            <span className="asterisk" aria-hidden="true">*</span>
                        </div>
                        <Select
                            classNamePrefix="rs"
                            options={cityOptions}
                            value={address.city ? {label: address.city, value: address.city} : null}
                            onChange={(opt) =>
                                updateAddress("city", opt?.value || "")
                            }
                            placeholder="Select City"
                            isDisabled={!address.province}
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Postal Code</p>
                        <input
                            type="text"
                            value={address.postal_code}
                            onChange={(event) => updateAddress("postal_code", event.target.value)}
                            placeholder="12630"
                        />
                    </div>
                    <div className="signup-field">
                        <div className="coordinate-toggle"  onClick={() => setShowCoordinates(!showCoordinates)}>
                            <span>Coordinates (optional)</span>
                            <img src={Dropdown} alt="dropdown" className={`coordinate-icon ${showCoordinates ? "rotate" : ""}`}/>
                        </div>
                    </div>
                        <div className={`coordinate-content ${showCoordinates ? "open" : ""}`}>
                            <div className="signup-field">
                                <p className="signup-label">Longitude</p>
                                <input
                                    type="text"
                                    value={longitude}
                                    onChange={(event) => setLongitude(event.target.value)}
                                    placeholder="100.67"
                                />
                            </div>
                            <div className="signup-field">
                                <p className="signup-label">Latitude</p>
                                <input
                                    type="text"
                                    value={latitude}
                                    onChange={(event) => setLatitude(event.target.value)}
                                    placeholder="-67.42"
                                />
                            </div>
                        </div>
                    <div className="signup-field">
                        <p className="signup-label">Operating Days</p>
                        <div className="signup-days-container">
                            {days.map((day) => (
                                <label className="signup-day-item" key={day.value}>
                                    <input
                                        type="checkbox"
                                        checked={operatingDays.includes(day.value)}
                                        onChange={() => toggleDays(day.value)}
                                    />
                                    {day.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    {message && <p className="signup-status-message">{message}</p>}
                    <div className="signup-next-wrapper">
                        <button className="signup-next-button" type="submit" disabled={loading}>
                            {loading ? "Saving details..." : "Next"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default SignupStepOperational;