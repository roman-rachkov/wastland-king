import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { onAuthStateChange, checkAdminAccess } from '../../../services/firebase';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const access = await checkAdminAccess(user);
          setHasAccess(access);
        } catch (error) {
          console.error('Error checking admin access:', error);
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <h3>Access Denied</h3>
          <p>Your account ({user.email}) is not authorized to access the admin panel.</p>
          <p>Please contact the administrator to get access.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/admin/login'}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 