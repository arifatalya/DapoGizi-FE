import './App.css'
import {Routes, Route} from 'react-router-dom'
import AdminLoginPage from './pages/AdminLoginPage.jsx'

function App() {

    return (
        <Routes>
            <Route path="/" element={<AdminLoginPage />} />
        </Routes>
    )
}

export default App;
