import {useState, useRef, forwardRef, useImperativeHandle} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import '../styles/SignupStep.css'
import EyeOpen from '../assets/eye-open.svg'
import EyeClose from '../assets/eye-close.svg'
import ChevronLeft from '../assets/chevron-back.svg'
import Close from '../assets/x.svg'

const SignupStepIdentity = forwardRef(({next}, ref) => {
    const navigate = useNavigate();
    const server = import.meta.env.VITE_API_URL;
    const [vendorName, setVendorName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useImperativeHandle(ref, () => ({
        getIdentity: () => ({vendor_name: vendorName, email, password}),
    }));

    const handleSignup = async (event) => {
        event.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const response = await axios.post(`${server}/user/auth/signup`,
                {vendorName, email, password},
                {withCredentials: true}
            );
            if (response.data?.message === 'Signup success') {
                setMessage('Signup successful! Redirecting...')
                setTimeout(() => navigate('/'), 1500)
            } else {
                setMessage(response.data?.message || 'Signup failed.')
            }
        } catch (err) {
            console.log(err);
            let msg = "Please fill in all fields.";
            if (err.code === "ERR_NETWORK" || err.message.includes("Network Error")) {
                msg = "Server is down.";
            } if (err.code === "ERR_BAD_REQUEST" || err.message.includes("Request failed with status code 400")) {
                msg = "400: Please fill in all the required fields.";
            } else {
                msg = err.message;
            }
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-steps-global">
            <div className="signup-steps-wrapper">
                <button className="signup-close" title="Close Signup card">
                    <img src={Close} alt="close" />
                </button>
                <div className="signup-header">
                    <div className="signup-title">Welcome,</div>
                    <span className="signup-subtitle">Let's Get You Started</span>
                </div>
                <form className="signup-form" onSubmit={handleSignup}>
                    <div className="signup-field">
                        <p className="signup-label">Enter kitchen name</p>
                        <input
                            type="text"
                            placeholder="SPPG 03 Jagakarsa"
                            value={vendorName}
                            onChange={(event) => setVendorName(event.target.value)}
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Register an email</p>
                        <input
                            type="email"
                            placeholder="e.g., exampleemail@gmail.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <div className="signup-field">
                        <p className="signup-label">Make a password</p>
                        <div className="signup-password-wrapper">
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <button className="button-eye" type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((s) => !s)}>
                                <img src={showPw ? EyeOpen : EyeClose} alt={showPw ? 'Hide' : 'Show'} />
                            </button>
                        </div>
                    </div>
                    {message && <p className="signup-status-message">{message}</p>}
                    <div className="signup-next-wrapper">
                        <button className="signup-next-button" type="submit" disabled={loading}>
                            {loading ? 'Signing up...' : 'Next'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default SignupStepIdentity;