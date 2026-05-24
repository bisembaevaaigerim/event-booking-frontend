import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBookings from './pages/MyBookings'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"            element={<Events />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/events/:id"  element={<EventDetail />} />
          <Route path="/my-bookings" element={
            <PrivateRoute><MyBookings /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute><AdminPanel /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
