import React, { useState } from 'react';
import { Button, Form, Alert, Card } from 'react-bootstrap';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../services/firebase';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess?.();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess?.();
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'User with this email not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Try again later';
      case 'auth/popup-closed-by-user':
        return 'Google login was cancelled';
      case 'auth/popup-blocked':
        return 'Popup was blocked by browser';
      default:
        return 'Login error. Please try again';
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <h4 className="mb-0">Login to forum</h4>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleEmailLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mb-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mb-3"
            >
              <i className="fab fa-google me-2"></i>
              Login with Google
            </Button>
          </div>
        </Form>

        <hr />

        <div className="text-center">
          <p className="mb-0">
            Don't have an account?{' '}
            <Button
              variant="link"
              onClick={onSwitchToRegister}
              className="p-0"
              disabled={loading}
            >
              Register
            </Button>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoginForm; 