import '../styles/MealPlanDetailsModal.css'
import Close from '../assets/x.svg'

function MealPlanDetailsModal({isOpen, onClose, meal}) {
    if (!isOpen || !meal) {
        return null;
    }

    const {name, description, image_url, status, nutrition, created_at, approved_at} = meal;

    const formattedCreated = created_at ? new Date(created_at).toLocaleString() : "-";

    const formattedApproved = approved_at ? new Date(approved_at).toLocaleString() : null;

    return (
        <div className="mpdm-backdrop" onClick={onClose}>
            <div className="mpdm-container" onClick={(event) => event.stopPropagation()}>
                <button className="mpdm-close" onClick={onClose}>
                    <img src={Close} alt="Close" />
                </button>
                <img className="mpdm-image" src={image_url} alt={name} />
                <div className="mpdm-content">
                    <div className="mpdm-header-row">
                        <h1 className="mpdm-title">{name}</h1>
                        <span className={`mpdm-status mpdm-status--${status}`}>
                            {status}
                        </span>
                    </div>
                    <p className="mpdm-desc">{description}</p>
                    <div className="mpdm-meta">
                        <div>
                            <span className="mpdm-meta-label">Submitted</span>
                            <span className="mpdm-meta-value">{formattedCreated}</span>
                        </div>
                        {formattedApproved && (
                            <div>
                                <span className="mpdm-meta-label">Approved</span>
                                <span className="mpdm-meta-value">{formattedApproved}</span>
                            </div>
                        )}
                    </div>
                    <h2 className="mpdm-subtitle">Nutrition Summary (Per 100g)</h2>
                    {nutrition ? (
                        <div className="mpdm-nutrition-grid">
                            <div className="mpdm-nutri-item">
                                <span className="mpdm-nutri-label">Calories</span>
                                <span className="mpdm-nutri-value">
                                    {nutrition.overall_calories}
                                </span>
                            </div>
                            <div className="mpdm-nutri-item">
                                <span className="mpdm-nutri-label">Protein</span>
                                <span className="mpdm-nutri-value">{nutrition.protein}g</span>
                            </div>
                            <div className="mpdm-nutri-item">
                                <span className="mpdm-nutri-label">Fat</span>
                                <span className="mpdm-nutri-value">{nutrition.fat}g</span>
                            </div>
                            <div className="mpdm-nutri-item">
                                <span className="mpdm-nutri-label">Carbs</span>
                                <span className="mpdm-nutri-value">{nutrition.carbs}g</span>
                            </div>
                            <div className="mpdm-nutri-item">
                                <span className="mpdm-nutri-label">Sugar</span>
                                <span className="mpdm-nutri-value">{nutrition.sugar}g</span>
                            </div>
                            <div className="mpdm-nutri-item">
                                <span className="mpdm-nutri-label">Fiber</span>
                                <span className="mpdm-nutri-value">{nutrition.fiber}g</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mpdm-nutri-empty">
                            No nutrition data available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MealPlanDetailsModal;