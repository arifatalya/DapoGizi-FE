import {Link} from 'react-router-dom'
import '../styles/QuickAccessCard.css'
import Expand from '../assets/expand.svg'

function QuickAccessCard({title, image, to, badge, description}) {
    return (
        <>
            <Link className="quick-access-card" to={to}>
                <img src={image} alt={title} className="quick-access-background"/>
                <div className="quick-access-overlay">
                    {badge && <span className="quick-access-badge">{badge}</span>}
                </div>
                <div className="quick-access-content">
                    <h3 className="quick-access-title">{title}</h3>
                    <p className="quick-access-desc">{description}</p>
                </div>
                <button className="quick-access-expand" type="button" onClick={(event) => event.preventDefault()}>
                    <img src={Expand} alt="expand" height={16} width={16} />
                </button>
            </Link>
        </>
    );
}

export default QuickAccessCard;