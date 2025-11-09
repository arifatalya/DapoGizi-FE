import {useState, useEffect} from 'react'
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'
import '../styles/VendorLogin.css'
import EyeOpen from '../assets/eye-open.svg'
import EyeClose from '../assets/eye-close.svg'
import X from '../assets/x.svg'
import Warning from '../assets/warning-triangle.svg'

const VendorLogin = () => {
    const navigate = useNavigate()
    const url = `${import.meta.env.VITE_API_URL}`
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [vendorName, setVendorName] = useState('')
    const [tokenExists, setTokenExists] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        axios.get(`${url}/user/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }).then((res) => {
                const name = res?.data?.vendor?.vendor_name
                if (name && token) {
                    setVendorName(name)
                    setTokenExists(true)
                }
            })
            .catch(() => localStorage.removeItem('token'))
    }, [url])

    const onChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            const { data } = await axios.post(`${url}/user/auth/login`, {
                email: form.email.trim(), password: form.password
                }, {withCredentials: true }
            )
            if (data?.token) {
                localStorage.setItem('token', data.token)
                const profile = await axios.get(`${url}/user/auth/me`, {
                    headers: { Authorization: `Bearer ${data.token}` },
                    withCredentials: true,
                });
                setVendorName(profile?.data?.vendor?.vendor_name || '')
                navigate('/home');

            } else setErr(data?.message || 'Login failed.')
        } catch (err) {
            let msg = "Your email and password don't match. Please try again.";
            if (err.code === "ERR_NETWORK" || err.message.includes("Network Error")) {
                msg = "Server is down.";
            } else {
                msg = err.message;
            }
            setErr(msg);
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="login-page">
            <section className="login-container">
                {/*the button here is supposed to close the login thing (then i shouldve made it as a modal i guess but ok later), and show the splash screen with two buttons, login and signup, but i havent made it yet sorry...*/}
                <button type="button" className="button-close" aria-label="Close" onClick={() => navigate(-1)}>
                    <img src={X} alt="Close" width="26" height="26" />
                </button>
                <div className="login-header">
                    {tokenExists ? (
                        <div className="header-token">
                            <h1 className="welcome-back">Welcome Back,</h1>
                            <p className="vendor-greet">{vendorName || 'Dear Vendor'}</p>
                        </div>
                    ) : (
                        <div className="header-no-token">
                            <h1 className="welcome-back">Log In to Your Account</h1>
                            <p className="vendor-greet">
                                Healthy meals start with you.
                            </p>
                        </div>
                    )}
                </div>
                <form onSubmit={onSubmit} className="login-form">
                    <div className="email-section">
                        <p className="email-label">Email Address</p>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={onChange}
                        />
                    </div>
                    <div className="password-section">
                        <p className="password-label">Password</p>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPw ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={onChange}
                            />
                            <button className="button-eye" type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((s) => !s)}>
                                <img src={showPw ? EyeOpen : EyeClose} alt={showPw ? 'Hide' : 'Show'} />
                            </button>
                        </div>
                    </div>
                    <div className="submit-button">
                        <button type="submit" className="button-submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                    {err && (
                        <div className="form-error">
                            <img src={Warning} alt="Warning"/>
                            <p>{err}</p>
                        </div>
                    )}
                    <div className="form-links">
                        <span>Don't have an account?</span>
                        <Link to="/signup" className="link"><b>Create Account</b></Link>
                    </div>
                </form>
            </section>
        </main>
    )
}

export default VendorLogin;