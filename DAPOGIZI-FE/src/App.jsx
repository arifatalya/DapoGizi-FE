import {Routes, Route} from 'react-router-dom'
import './App.css'
import VendorSignupPage from './pages/VendorSignupPage.jsx'
import VendorLoginPage from './pages/VendorLoginPage.jsx'
import VendorHomePage from './pages/VendorHomePage.jsx'
import VendorMonitoringPage from './pages/VendorMonitoringPage.jsx'
import VendorProfilePage from './pages/VendorProfilePage.jsx'

function App() {

  return (
      <Routes>
          <Route path="/" element={<VendorLoginPage />} />
          <Route path="/login" element={<VendorLoginPage />} />
          <Route path="/signup" element={<VendorSignupPage />} />
          <Route path="/home" element={<VendorHomePage />} />
          <Route path="/monitor" element={<VendorMonitoringPage />} />
          <Route path="/profile" element={<VendorProfilePage />} />
      </Routes>
  )
}

export default App;
