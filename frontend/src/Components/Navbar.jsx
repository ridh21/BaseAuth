import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">BaseAuth</span>
            </Link>

            <div className="flex space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/welcome"
                    className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all font-medium"
                  >
                    Welcome
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/50 text-white px-4 py-2 rounded-lg hover:bg-red-500/70 transition-all font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
