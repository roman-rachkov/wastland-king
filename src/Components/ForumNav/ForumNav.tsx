import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { auth } from '../../services/firebase';

const ForumNav: React.FC = () => {
  const location = useLocation();
  const user = auth.currentUser;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/forum">
          <i className="fas fa-comments me-2"></i>
          Форум Wasteland
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="forum-navbar-nav" />
        <Navbar.Collapse id="forum-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/forum" 
              active={isActive('/forum')}
            >
              <i className="fas fa-home me-1"></i>
              Главная
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/forum/sections" 
              active={isActive('/forum/sections')}
            >
              <i className="fas fa-list me-1"></i>
              Разделы
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/forum/recent" 
              active={isActive('/forum/recent')}
            >
              <i className="fas fa-clock me-1"></i>
              Последние
            </Nav.Link>
          </Nav>
          
          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/forum/profile">
                  <i className="fas fa-user me-1"></i>
                  {user.displayName || user.email}
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => window.location.href = '/forum/auth'}
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Выйти
                </Button>
              </>
            ) : (
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => window.location.href = '/forum/auth'}
              >
                <i className="fas fa-sign-in-alt me-1"></i>
                Войти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ForumNav; 