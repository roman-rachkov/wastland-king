import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { signOutUser, onAuthStateChange } from "../../services/firebase";
import { User } from "firebase/auth";

const PublicNavbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="fas fa-crown me-2 text-warning"></i>
          Wasteland King
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={isActive('/')}
              className="fw-medium"
            >
              <i className="fas fa-user-plus me-1"></i>
              Регистрация
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/players" 
              active={isActive('/players')}
              className="fw-medium"
            >
              <i className="fas fa-users me-1"></i>
              Список игроков
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/schedule" 
              active={isActive('/schedule')}
              className="fw-medium"
            >
              <i className="fas fa-calendar me-1"></i>
              Расписание
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/forum" 
              active={isActive('/forum')}
              className="fw-medium"
            >
              <i className="fas fa-comments me-1"></i>
              Форум
            </Nav.Link>
          </Nav>
          
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-muted">
                    <i className="fas fa-user me-1"></i>
                    {user.displayName || user.email}
                  </span>
                </Nav.Item>
                <Button variant="outline-secondary" size="sm" onClick={handleSignOut}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Выйти
                </Button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/forum/auth')}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Войти
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/forum/auth')}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Регистрация
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PublicNavbar; 