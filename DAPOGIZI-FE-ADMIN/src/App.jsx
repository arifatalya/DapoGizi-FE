import './App.css'
import {Routes, Route} from 'react-router-dom'
import AdminLogin from './components/AdminLogin.jsx'

function App() {

    return (
        <Routes>
            <Route path="/" element={<AdminLogin />} />
        </Routes>
    )
}

export default App;
