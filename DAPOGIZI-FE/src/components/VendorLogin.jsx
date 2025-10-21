import {useState, useEffect} from 'react'
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'
import '../styles/VendorLogin.css'
import EyeOpen from '../assets/eye-open.svg'
import EyeClose from '../assets/eye-close.svg'
import X from '../assets/x.svg'

const VendorLogin = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [vendorName, setVendorName] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        axios.get(
            `${import.meta.env.VITE_API_URL}/auth/vendor/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }).then((res) => {
                const name = res?.data?.vendor?.vendor_name
                if (name) setVendorName(name)
            })
            .catch(() => localStorage.removeItem('token'))
    }, [])

    const onChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email: form.email.trim(), password: form.password
                }, {withCredentials: true }
            )
            if (data?.token) {
                localStorage.setItem('token', data.token)
                const profile = await axios.get(`${import.meta.env.VITE_API_URL}/auth/vendor/me`, {
                    headers: { Authorization: `Bearer ${data.token}` },
                    withCredentials: true,
                });
                setVendorName(profile?.data?.vendor?.vendor_name || '')
                navigate('/home');

            } else setErr(data?.message || 'Login failed.')
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Login failed. Please check your credentials.'
            setErr(msg)
        }
    }

    return (
        <main className="login-page">
            <section className="login-container">
                <button type="button" className="button-close" aria-label="Close" onClick={() => navigate(-1)}>
                    <img src={X} alt="Close" width="26" height="26" />
                </button>
                <div className="login-header">
                    <div className="welcome-back">Welcome Back,</div>
                    <span className="vendor-greet">{vendorName || '[Vendor Name]'}</span>
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
                            required
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
                                required
                            />
                            <button className="button-eye" type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((s) => !s)}>
                                <img src={showPw ? EyeOpen : EyeClose} alt={showPw ? 'Hide' : 'Show'} width="22" height="22"/>
                            </button>
                        </div>
                    </div>
                    <div className="submit-button">
                        <button type="submit" className="button-submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                    {err && <p className="form-error">{err}</p>}
                    <div className="form-links">
                        <span>Already have an account?</span>
                        <Link to="/signup" className="link"><b>Create Account</b></Link>
                    </div>
                </form>
            </section>
        </main>
    )
}

export default VendorLogin;