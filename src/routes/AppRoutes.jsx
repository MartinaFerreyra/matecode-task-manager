// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import App from '../App'
import Tasks from '../pages/Tasks'
import ForgotPassword from '../pages/ForgotPassword'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
    return (
        <Routes>
            <Route path='/login' element={<App />} />
            <Route path='/forgot-password' element={<ForgotPassword />} /> {/* 👈 nueva ruta */}

            <Route
                path='/tasks'
                element={
                    <ProtectedRoute>
                        <Tasks />
                    </ProtectedRoute>
                }
            />

            <Route path='/' element={<Navigate to='/tasks' />} />
        </Routes>
    )
}

export default AppRoutes