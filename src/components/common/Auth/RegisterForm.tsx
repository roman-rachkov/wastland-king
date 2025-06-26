import React, { useState } from 'react';
import { Button, Form, Alert, Card } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../services/firebase';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSuccess?.();
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess?.();
    } catch (error: any) {
      console.error('Google registration error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'User with this email already exists';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/popup-closed-by-user':
        return 'Google registration was cancelled';
      case 'auth/popup-blocked':
        return 'Popup was blocked by browser';
      default:
        return 'Registration error. Please try again';
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <h4 className="mb-0">Registration in forum</h4>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleEmailRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              disabled={loading}
              minLength={3}
            />
            <Form.Text className="text-muted">
              Minimum 3 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
              minLength={6}
            />
            <Form.Text className="text-muted">
              Minimum 6 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Repeat password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
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
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="mb-3"
            >
              <i className="fab fa-google me-2"></i>
              Register with Google
            </Button>
          </div>
        </Form>

        <hr />

        <div className="text-center">
          <p className="mb-0">
            Already have an account?{' '}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="p-0"
              disabled={loading}
            >
              Login
            </Button>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RegisterForm; 