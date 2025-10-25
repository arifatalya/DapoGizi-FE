import {Routes, Route} from 'react-router-dom'
import './App.css'
import VendorSignupPage from './pages/VendorSignupPage.jsx'
import VendorLoginPage from './pages/VendorLoginPage.jsx'
import VendorHome from './components/VendorHome.jsx'

function App() {

  return (
      <Routes>
          <Route path="/" element={<VendorLoginPage />} />
          <Route path="/login" element={<VendorLoginPage />} />
          <Route path="/signup" element={<VendorSignupPage />} />
          <Route path="/home" element={<VendorHome />} />
      </Routes>
  )
}

export default App;
