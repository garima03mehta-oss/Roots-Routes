import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type Role } from '../../services/auth'

export default function ProtectedRoute({ role }: { role: Role }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'hotel' ? '/hotel' : '/dashboard'} replace />
  }
  return <Outlet />
}