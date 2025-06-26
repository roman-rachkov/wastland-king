import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { LoginForm, RegisterForm } from '../../components/common';
import { useNavigate } from 'react-router';

const ForumAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Redirect to forum after successful authorization
    navigate('/forum');
  };

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <div className="text-center mb-4">
            <h1 className="h3">Forum Wasteland</h1>
            <p className="text-muted">
              {isLogin ? 'Login to your account' : 'Create a new account'}
            </p>
          </div>

          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ForumAuth; 