import { useEffect, useState } from 'react';
import { Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { signInWithGoogle, getCurrentUser, checkAdminAccess } from '../../../services/firebase';
import { User } from 'firebase/auth';

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      checkAccessAndRedirect(currentUser);
    }
  }, [navigate]);

  const checkAccessAndRedirect = async (user: User) => {
    try {
      const hasAccess = await checkAdminAccess(user);
      if (hasAccess) {
        navigate('/admin');
      } else {
        setError(`Access denied. Your account (${user.email}) is not authorized.`);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setError('Error checking access. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      await checkAccessAndRedirect(user);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <Card>
            <Card.Header>
              <h2 className="text-center mb-0">Admin Login</h2>
            </Card.Header>
            <Card.Body className="text-center">
              <p className="mb-4">Please sign in with your Google account to access the admin panel.</p>
              
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-100"
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
              
              <div className="mt-3">
                <small className="text-muted">
                  Only authorized users can access the admin panel.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 