import {useRef, useState} from 'react'
// import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'
import '../styles/VendorSignup.css'
// import EyeOpen from '../assets/eye-open.svg'
// import EyeClose from '../assets/eye-close.svg'
// import ChevronLeft from '../assets/chevron-back.svg'
import SignupStepIdentity from "./SignupStepIdentity.jsx";
import SignupStepOperational from "./SignupStepOperational.jsx";
import SignupStepKitchen from "./SignupStepKitchen.jsx";

const VendorSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const identityRef = useRef();
    const operationalRef = useRef();
    const kitchenRef = useRef();

    const nextStep = () => setStep((step) => step + 1);
    const prevStep = () => setStep((step) => step - 1);
    const finish = () => {
        console.log('Onboarding completed!');
        navigate('/login');
    };

    return (
        <div className="signup-page-container">
            {step === 1 && <SignupStepIdentity ref={identityRef} next={nextStep} />}
            {step === 2 && <SignupStepOperational ref={operationalRef} next={nextStep} prev={prevStep} />}
            {step === 3 && <SignupStepKitchen ref={kitchenRef} prev={prevStep} finish={finish} />}
        </div>
    );
}

export default VendorSignup;