import { useAuth } from '../contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children, requireProfile = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading... 🔬
      </div>
    )
  }

  if (!user) {
    // Redirect to login page, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireProfile && !profile) {
    // User is authenticated but doesn't have a profile
    return <Navigate to="/setup-username" replace />
  }

  return children
}

export default ProtectedRoute
