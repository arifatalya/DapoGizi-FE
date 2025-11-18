import {useState, useImperativeHandle, forwardRef} from 'react'
import axios from 'axios'
import '../styles/SignupStep.css'
import ChevronLeft from '../assets/chevron-back.svg'

const SignupStepOperational = forwardRef(({next, prev}, ref) => {
    const server = import.meta.env.VITE_API_URL;
    const [address, setAddress] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [operatingDays, setOperatingDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const days = [
        {label: "Monday", value: "Mon"},
        {label: "Tuesday", value: "Tue"},
        {label: "Wednesday", value: "Wed"},
        {label: "Thursday", value: "Thu"},
        {label: "Friday", value: "Fri"},
        {label: "Saturday", value: "Sat"},
        {label: "Sunday", value: "Sun"},
    ];

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
            const payload = {address, operating_days: operatingDays, location: longitude && latitude ? {lon: Number(longitude), lat: Number(latitude)} : null}

            if (payload.location) {
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
                        <p className="signup-label">Kitchen Address</p>
                        <input
                            type="text"
                            placeholder="Jl. Lingkar, Pondok Cina, Kecamatan Beji, Kota Depok, Jawa Barat 16424"
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Longitude (optional)</p>
                        <input
                            type="text"
                            placeholder="10.789"
                            value={longitude}
                            onChange={(event) => setLongitude(event.target.value)}
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Latitude (optional)</p>
                        <input
                            type="text"
                            placeholder="10.789"
                            value={latitude}
                            onChange={(event) => setLatitude(event.target.value)}
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Operating Days</p>
                        <div className="signup-days-container">
                            {days.map((day) => (
                                <label className="signup-day-item" key={day.value}>
                                    <input type="checkbox" checked={operatingDays.includes(day.value)} onChange={()=> toggleDays(day.value)}/>
                                    {day.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    {message && <p className="signup-status-message">{message}</p>}
                    <div className="signup-next-wrapper">
                        <button className="signup-next-button" type="submit" disabled={loading}>
                            {loading ? 'Saving details...' : 'Next'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default SignupStepOperational;