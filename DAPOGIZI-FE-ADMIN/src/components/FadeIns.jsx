import {useEffect, useRef, useState} from 'react'
import '../styles/FadeIns.css'

function FadeInZAxis({children}) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setIsVisible(entry.isIntersecting);
            })
        });
        const{current} = domRef;
        if (current) {
            observer.observe(current);
        }
        return () => {
            if (current) {
                observer.unobserve(current);
            }
        }
    }, []);
    return(
        <div className={`fade-in-z ${isVisible ? 'is-visible' : ''}`} ref={domRef}>
            {children}
        </div>
    )
}

export default FadeInZAxis;