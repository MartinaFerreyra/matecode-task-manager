import { Navigate, Route, Routes } from "react-router-dom"
import ForgotPassword from "../pages/ForgotPassword"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Tasks from "../pages/Tasks"
import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/tasks" replace />} />
    </Routes>
  )
}

export default AppRoutes
