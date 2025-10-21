import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import VendorLogin from './components/VendorLogin.jsx';
import VendorSignup from './components/VendorSignup.jsx';
import VendorSignupPage from './pages/VendorSignupPage.jsx'
import VendorLoginPage from "./pages/VendorLoginPage.jsx";

function App() {

  return (
      <Routes>
          <Route path="/" element={<VendorLoginPage />} />
          <Route path="/signup" element={<VendorSignupPage />} />
      </Routes>
  )
}

export default App;
