import {useState, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import '../styles/Sidebar.css'
import ChevronRight from '../assets/chevron-right.svg'
import Close from '../assets/back.svg'
import UserPlaceholder from '../assets/user-circle.svg'
import Home from '../assets/home.svg'
import UserHappy from '../assets/user-happy.svg'
import Monitor from '../assets/monitoring.svg'
import Feedback from '../assets/feedback.svg'
import Settings from '../assets/settings.svg'
import Logout from '../assets/logout.svg'
import Login from '../assets/login.svg'

function Sidebar() {
    const [isActive, setIsActive] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const url = `${import.meta.env.VITE_API_URL}`;

    const handleActive = () => {
        setIsActive(true);
    }
    const handleInactive = () => {
        setIsActive(false);
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoggedIn(true);
            getVendor(token);
        }
    }, [])

    const getVendor = async (token) => {
        try {
            const { data } = await axios.get(`${url}/user/auth/me`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setLoggedIn(Boolean(data?.vendor))
            setUser({vendor_name: data.vendor.vendor_name ?? 'Vendor'});
        } catch (error) {
            console.log(error.message);
            setLoggedIn(false);
            setUser(null);
        }
    }
    const handleLogout = async () => {
        localStorage.removeItem('token')
        setLoggedIn(false)
        setUser(null)
        navigate('/login')
    }

    return (
        <div>
            {!isActive && (
                <div className="sidebar-toggle-wrapper">
                    <button className="sidebar-toggle" onClick={handleActive} aria-expanded={isActive} aria-controls="sidebar-menu">
                        <img src={ChevronRight} alt="chevron-right" height={18} width={18} />
                    </button>
                </div>
            )}
            {isActive && <div className="sidebar-backdrop" onClick={handleInactive}/>}
            <aside className={`sidebar ${isActive ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <button className="sidebar-close" onClick={handleInactive}>
                        <img src={Close} alt="close" height={18} width={18} />
                    </button>
                    <div className="vendor-info">
                        <img src={UserPlaceholder} alt="user-avatar" />
                        <h2>{user?.vendor_name || 'Guest'}</h2>
                    </div>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-wrapper">
                        <Link to="/home" className="sidebar-menu-link" onClick={handleInactive}>
                            <img src={Home} alt="home" height={18} width={18}/> Home
                        </Link>
                    </div>
                    <div className="menu-wrapper">
                        <Link to="/monitor" className="sidebar-menu-link" onClick={handleInactive}>
                            <img src={Monitor} alt="monitoring" height={18} width={18}/> Monitoring
                        </Link>
                    </div>
                    <div className="menu-wrapper">
                        <Link to="/profile" className="sidebar-menu-link" onClick={handleInactive}>
                            <img src={UserHappy} alt="profile-menu" height={18} width={18}/> Profile
                        </Link>
                    </div>
                    <div className="menu-wrapper">
                        <Link to="/feedback" className="sidebar-menu-link" onClick={handleInactive}>
                            <img src={Feedback} alt="feedbacks" height={18} width={18}/> Feedbacks
                        </Link>
                    </div>
                </div>
                <div className="sidebar-footer">
                    <div className="footer-item-wrapper">
                        <Link to="/settings" className="sidebar-settings" onClick={handleInactive}>
                            <img src={Settings} alt="settings" height={18} width={18}/> Settings
                        </Link>
                    </div>
                    {loggedIn ? (
                        <div className="footer-item-wrapper">
                            <button className="sidebar-logout" onClick={handleLogout}>
                                <img src={Logout} alt="logout" height={18} width={18}/> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="footer-item-wrapper">
                            <Link to="/" className="sidebar-login" onClick={handleInactive}>
                                <img src={Login} alt="login" height={18} width={18}/> Login
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default Sidebar;
