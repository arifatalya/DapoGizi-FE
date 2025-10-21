import {useEffect, useRef, useState} from 'react'
import '../styles/FadeIns.css'

function FadeInHorizontal({children}) {
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
        <div className={`fade-in-horizontal ${isVisible ? 'is-visible' : ''}`} ref={domRef}>
            {children}
        </div>
    )
}

function FadeInVertical({children}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                setIsVisible(entry.isIntersecting);
            })
        });
        const {current} = ref;
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
        <div className={`fade-in-vertical ${isVisible ? 'is-visible' : '' }`} ref={ref}>
            {children}
        </div>
    )
}

export {
    FadeInHorizontal,
    FadeInVertical,
}