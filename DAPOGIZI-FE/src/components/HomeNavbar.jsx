import {Link} from 'react-router-dom'
import '../styles/HomeNavbar.css'
import UserProfile from '../assets/user-circle.svg'
import Settings from '../assets/settings.svg'

function HomeNavbar({vendorName}) {
    return (
        <>
            <div className="navbar-wrapper">
                <div className="navbar-header">
                    <div className="navbar-greeting-wrapper">
                        <h1 className="navbar-greeting">Hello :3, {vendorName || 'Vendor'}</h1>
                    </div>
                    <div className="navbar-icons">
                        <Link className="navbar-buttons" to="/profile">
                            <img src={UserProfile} alt="user profile" height={18} width={18} />
                        </Link>
                        <Link className="navbar-buttons" to="/settings">
                            <img src={Settings}  alt="settings" height={18} width={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomeNavbar;