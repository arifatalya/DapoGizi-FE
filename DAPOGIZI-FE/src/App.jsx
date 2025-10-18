import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import VendorLoginPage from "./pages/VendorLoginPage.jsx";
import VendorSignupPage from "./pages/VendorSignupPage.jsx";

function App() {

  return (
      <Routes>
          <Route path="/" element={<VendorLoginPage />} />
          <Route path="/signup" element={<VendorSignupPage />} />
      </Routes>
  )
}

export default App;
