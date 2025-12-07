import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-simple';
import type { UserRole } from '../../types';


interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
}

export default function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user, hasAnyRole } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  if (user.role === 'ADMIN') {
    return <>{children}</>;
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

