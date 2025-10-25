import VendorSignup from '../components/VendorSignup.jsx'
import {FadeInHorizontal} from '../components/FadeIns.jsx'
import Sidebar from '../components/Sidebar.jsx'

const VendorSignupPage = () => {
    return(
        <>
            <Sidebar />
            <FadeInHorizontal>
                <VendorSignup />
            </FadeInHorizontal>
        </>
    )
}

export default VendorSignupPage;