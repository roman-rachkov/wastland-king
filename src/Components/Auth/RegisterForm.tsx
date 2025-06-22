import React, { useState } from 'react';
import { Button, Form, Alert, Card } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase';

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

    // Валидация
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // TODO: Создать запись пользователя в базе данных
      // await createUserInDatabase({
      //   id: userCredential.user.uid,
      //   username,
      //   email,
      // });

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
      const userCredential = await signInWithPopup(auth, provider);
      
      // TODO: Создать запись пользователя в базе данных
      // await createUserInDatabase({
      //   id: userCredential.user.uid,
      //   username: userCredential.user.displayName || 'User',
      //   email: userCredential.user.email || '',
      //   avatar: userCredential.user.photoURL,
      // });

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
        return 'Пользователь с таким email уже существует';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/weak-password':
        return 'Пароль слишком слабый';
      case 'auth/popup-closed-by-user':
        return 'Регистрация через Google была отменена';
      case 'auth/popup-blocked':
        return 'Всплывающее окно было заблокировано браузером';
      default:
        return 'Ошибка регистрации. Попробуйте еще раз';
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <h4 className="mb-0">Регистрация в форуме</h4>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleEmailRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              required
              disabled={loading}
              minLength={3}
            />
            <Form.Text className="text-muted">
              Минимум 3 символа
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              disabled={loading}
              minLength={6}
            />
            <Form.Text className="text-muted">
              Минимум 6 символов
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Подтвердите пароль</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
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
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="mb-3"
            >
              <i className="fab fa-google me-2"></i>
              Регистрация через Google
            </Button>
          </div>
        </Form>

        <hr />

        <div className="text-center">
          <p className="mb-0">
            Уже есть аккаунт?{' '}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="p-0"
              disabled={loading}
            >
              Войти
            </Button>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RegisterForm; 