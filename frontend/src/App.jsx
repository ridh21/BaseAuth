import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import Verify from './Pages/Verify.jsx'
import Welcome from './Pages/Welcome.jsx'
import Navbar from './Components/Navbar.jsx'
import { Toaster } from 'react-hot-toast'
import Profile from './Pages/Profie.jsx'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}

const App = () => {
  return (
    <>
     <Toaster position="bottom-right" />
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/profile" element={<Profile />} />
        <Route 
          path="/welcome" 
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
