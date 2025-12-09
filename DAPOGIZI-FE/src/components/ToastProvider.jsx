import {useEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import '../styles/ToastProvider.css'
import successIcon from '../assets/success-box.svg'
import errorIcon from '../assets/error-box.svg'
import infoIcon from '../assets/warning-box.svg'
import defaultIcon from '../assets/comment.svg'
import closeIcon from '../assets/x.svg'

const toastConfig = {
    success: {
        icon: successIcon,
        className: "toast-success"
    },
    error: {
        icon: errorIcon,
        className: "toast-error"
    },
    info: {
        icon: infoIcon,
        className: "toast-info"
    },
    default: {
        icon: defaultIcon,
        className: "toast-default"
    }
};

function ToastProvider({ message, type = "default", duration, show, onClose }) {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    const config = toastConfig[type] || toastConfig.default;

    useEffect(() => {
        if (!show) return;
        setVisible(true);
        setProgress(100);

        const intervalTime = 10;
        const step = (100/duration)*intervalTime;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev - step;
                return next <= 0 ? 0 : next;
            });
        }, intervalTime);

        const timer = setTimeout(() => {
            setVisible(false);
            onClose && onClose(false);
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    return createPortal(
        <div className={`toast ${config.className} ${visible ? "show" : ""}`}>
            <div className="toast-icon">
                <img src={config.icon} alt={type} />
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={() => {setVisible(false);onClose && onClose(false);}}>
                <img src={closeIcon} alt="close" />
            </button>
            <div className="toast-progress-bar" style={{width: `${progress}%`}}></div>
        </div>,
        document.body
    );
}

export default ToastProvider;
