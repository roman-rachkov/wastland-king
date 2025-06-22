import {Container, Nav, Navbar, Button} from "react-bootstrap";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {getCurrentUser, signOutUser, onAuthStateChange} from "../../../services/firebase";
import {User} from "firebase/auth";

const AdminNavbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container className={'flex-row'}>
        <Navbar.Brand as={Link} to="/admin">s841 WK</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin">Sheet</Nav.Link>
            <Nav.Link as={Link} to="/admin/settings">Settings</Nav.Link>
            <Nav.Link as={Link} to="/admin/admin-users">Admin Users</Nav.Link>
            <Nav.Link as={Link} to="/admin/organize-players">Calculate Players</Nav.Link>
          </Nav>
          {user && (
            <Nav className="ms-auto">
              <Nav.Item className="d-flex align-items-center me-3">
                <span className="text-muted">Welcome, {user.displayName || user.email}</span>
              </Nav.Item>
              <Button variant="outline-secondary" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;