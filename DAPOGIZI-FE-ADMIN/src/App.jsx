import './App.css'
import {Routes, Route} from 'react-router-dom'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'

function App() {

    return (
        <Routes>
            <Route path="/" element={<AdminLoginPage />} />
            <Route path="/home" element={<AdminDashboardPage />} />
        </Routes>
    )
}

export default App;
