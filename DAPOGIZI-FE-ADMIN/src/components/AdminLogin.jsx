import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import '../styles/AdminLogin.css'
import EyeOn from '../assets/eye-on.svg'
import EyeOff from '../assets/eye-off.svg'

const AdminLogin = () => {
    const navigate = useNavigate()
    const url = `${import.meta.env.VITE_API_URL}/auth/login-admin`
    const [form, setForm] = useState({email: '', password: ''})
    const [pwVisibility, setPwdVisibility] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const onChange = (e) => {
        const {name, value} = e.target
        setForm({...form, [name]: value})
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const {data} = await axios.post(url, form, {withCredentials: true})
            if (data?.token) {
                localStorage.setItem('token', data.token)
                navigate("/home")
            } else {
                setError(data?.message || 'Admin login failed')
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Please recheck your credentials.'
            setError(msg)
        }
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login">
                <div className="login-form-container">
                    <div className="admin-login-header">
                        <h1 className="title"></h1>
                        <p>Say something broooo</p>
                    </div>
                    <form onSubmit={onSubmit} className="admin-login-form">
                        <div className="email-section">
                            <p className="email-label">Enter an Registered Email</p>
                            <div className="email-input-wrapper">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={onChange}
                                    placeholder="Enter an email address"
                                    required
                                />
                            </div>
                        </div>
                        <div className="password-section">
                            <p className="password-label">Enter password</p>
                            <div className="password-input-wrapper">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="Enter the password"
                                    required
                                />
                                <button className="hide-password" type="button" aria-label={pwVisibility ? 'Hide' : 'Show'} onClick={() => setPwdVisibility((state) => !state)}>
                                    <img src={pwVisibility ? EyeOn : EyeOff} alt={pwVisibility ? 'Hide' : 'Show'} width="18" height="18" />
                                </button>
                            </div>
                        </div>
                        <div className="login-button-wrapper">
                            <button className="login-button" type="submit" disabled={loading}>
                                {loading ? 'Please wait...' : 'Login'}
                            </button>
                        </div>
                        {error && <p className="login-error">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin