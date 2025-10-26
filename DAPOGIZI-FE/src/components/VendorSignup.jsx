import {useState} from 'react'
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'
import '../styles/VendorSignup.css'
import EyeOpen from '../assets/eye-open.svg'
import EyeClose from '../assets/eye-close.svg'
import ChevronLeft from '../assets/chevron-back.svg'

const VendorSignup = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ vendor_name: '', email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [msg, setMsg] = useState('')

    const onChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setErr('')
        setMsg('')
        setLoading(true)
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/signup`,
                {
                    vendor_name: form.vendor_name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                },
                { withCredentials: true }
            )

            if (data?.message === 'Signup success') {
                setMsg('Signup successful! Redirecting...')
                setTimeout(() => navigate('/'), 1500)
            } else {
                setErr(data?.message || 'Signup failed.')
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
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="signup-page">
            <section className="signup-container">
                <button type="button" className="button-back" aria-label="Close" onClick={() => navigate(-1)}>
                    <img src={ChevronLeft} alt="Close" width="26" height="26" />
                </button>
                <div className="signup-header">
                    <div className="signup-title">Welcome, Vendor</div>
                    <span className="signup-subtitle">Let's Get You Started</span>
                </div>
                <form onSubmit={onSubmit} className="signup-form">
                    <div className="signup-field vendorname-field">
                        <p className="signup-label">Vendor Name</p>
                        <input
                            id="vendor_name"
                            name="vendor_name"
                            type="text"
                            placeholder="Enter your name"
                            value={form.vendor_name}
                            onChange={onChange}
                        />
                    </div>
                    <div className="signup-field email-field">
                        <p className="signup-label">Email Address</p>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={onChange}
                        />
                    </div>
                    <div className="signup-field password-field">
                        <p className="signup-label">Password</p>
                        <div className="signup-password-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPw ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={form.password}
                                onChange={onChange}
                                autoComplete="new-password"
                            />
                            <button type="button" className="signup-eye-btn" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((s) => !s)}>
                                <img src={showPw ? EyeOpen : EyeClose} alt={showPw ? 'Hide' : 'Show'} />
                            </button>
                        </div>
                    </div>
                    <div className="signup-button-wrap">
                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>
                    {err && <p className="signup-error">{err}</p>}
                    {msg && <p className="signup-success">{msg}</p>}
                    <div className="signup-links">
                        <span>Already have an account?</span>
                        <Link to="/" className="signup-link"><b>Log In</b></Link>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default VendorSignup;