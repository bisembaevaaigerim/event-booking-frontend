import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAuth } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <span>EventBook</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Events
          </Link>

          {isAuth ? (
            <>
              <Link to="/my-bookings" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                My Bookings
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1"
                >
                  Admin
                </Link>
              )}

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {user?.username}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
