import { useEffect, useState } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { signInWithGoogle, getCurrentUser } from '../../../services/firebase';
import { User } from 'firebase/auth';

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      navigate('/admin');
    }
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
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
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-100"
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 