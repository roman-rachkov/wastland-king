import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { signOutUser, onAuthStateChange, checkAdminAccess } from "../../../services/firebase";
import { User } from "firebase/auth";

const PublicNavbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const hasAdminAccess = await checkAdminAccess(user);
          setIsAdmin(hasAdminAccess);
        } catch (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
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
              Registration
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/players" 
              active={isActive('/players')}
              className="fw-medium"
            >
              <i className="fas fa-users me-1"></i>
              Players List
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/schedule" 
              active={isActive('/schedule')}
              className="fw-medium"
            >
              <i className="fas fa-calendar me-1"></i>
              Schedule
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/forum" 
              active={isActive('/forum')}
              className="fw-medium"
            >
              <i className="fas fa-comments me-1"></i>
              Forum
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
                {isAdmin && (
                  <Nav.Link 
                    as={Link}
                    to="/admin"
                    className="btn btn-warning btn-sm me-2"
                  >
                    <i className="fas fa-cog me-1"></i>
                    Admin Panel
                  </Nav.Link>
                )}
                <Button variant="outline-secondary" size="sm" onClick={handleSignOut}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </Button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Nav.Link 
                  as={Link}
                  to="/forum/auth"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link}
                  to="/forum/auth"
                  className="btn btn-primary btn-sm"
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Registration
                </Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PublicNavbar; 