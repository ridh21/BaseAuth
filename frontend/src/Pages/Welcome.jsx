import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'

const Welcome = () => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const token = params.get('token');
    
  //   if (token) {
  //     localStorage.setItem('token', token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     // Clear URL parameters
  //     window.history.replaceState({}, document.title, window.location.pathname);
  //   } else {
  //     navigate('/login');
  //   }
  // }, [navigate]);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">BaseAuth</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to BaseAuth! 🚀
          </h1>
          <p className="text-xl text-white/80 mb-12">
            Your authentication journey starts here
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
              <p className="text-white/70">
                Industry-standard security practices to protect your data
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast</h3>
              <p className="text-white/70">
                Lightning-fast authentication process
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-4">🛠️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Reliable</h3>
              <p className="text-white/70">
                Built with modern technologies for reliability
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 w-full py-6 text-center text-white/60">
        <p>© 2024 BaseAuth. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Welcome
