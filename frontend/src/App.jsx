import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import AuthCallback from './components/AuthCallback'
import SetupUsername from './components/SetupUsername'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import ProfileDashboard from './components/ProfileDashboard'
import CodebustersHub from './components/CodebustersHub'
import Settings from './components/Settings'
import Layout from './components/Layout'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('scioly-theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('scioly-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/setup-username" element={<SetupUsername />} />
        
        {/* Protected Routes - User must be logged in */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Layout theme={theme} onThemeChange={handleThemeChange}>
                <Home theme={theme} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Layout theme={theme} onThemeChange={handleThemeChange}>
                <ProfileDashboard theme={theme} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Layout theme={theme} onThemeChange={handleThemeChange}>
                <Settings theme={theme} onThemeChange={handleThemeChange} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/codebusters" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Layout theme={theme} onThemeChange={handleThemeChange}>
                <CodebustersHub theme={theme} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Layout theme={theme} onThemeChange={handleThemeChange}>
                <Home theme={theme} />
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
