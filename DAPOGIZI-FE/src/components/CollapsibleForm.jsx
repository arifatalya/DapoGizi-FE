import {useState, useRef, useEffect} from 'react'
import Dropdown from '../assets/arrow.svg'
import '../styles/CollapsibleForm.css'

function CollapsibleForm({title, subtitle, children, defaultExpanded = true}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [maxHeight, setMaxHeight] = useState(0);
    const ref = useRef();

    useEffect(() => {
        if (isExpanded) {
            setMaxHeight(ref.current.scrollHeight)
        } else {
            setMaxHeight(0);
        }
    }, [isExpanded]);

    return (
        <>
            <div className="collapsible-form">
                <button className="collapsible-form-open" type="button" onClick={() => setIsExpanded(prev => !prev)}>
                    <div className="collapsible-form-header">
                        <span className='collapsible-form-title'>
                            {title}
                        </span>
                        <span className='collapsible-form-subtitle'>
                            {subtitle}
                        </span>
                    </div>
                    <span className={`collapsible-form-dropdown ${isExpanded ? "rotate" : ""}`}>
                        <img src={Dropdown} alt="dropdown" />
                    </span>
                </button>
                <div className="collapsible-form-body" ref={ref} style={{maxHeight: isExpanded ? `${maxHeight}px` : "0"}}>
                    <div className="collapsible-form-content">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

export default CollapsibleForm;