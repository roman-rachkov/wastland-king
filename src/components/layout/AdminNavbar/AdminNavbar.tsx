import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';

const AdminNavbar: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    // Here you can add logout logic
    window.location.href = '/admin/login';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/admin" style={{ cursor: 'pointer' }}>
          Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin" active={location.pathname === '/admin'}>Home</Nav.Link>
            <Nav.Link as={Link} to="/">Main Site</Nav.Link>
            <Nav.Link as={Link} to="/admin/admin-users" active={location.pathname === '/admin/admin-users'}>Users</Nav.Link>
            <Nav.Link as={Link} to="/admin/organize-players" active={location.pathname === '/admin/organize-players'}>Organize Players</Nav.Link>
            <Nav.Link as={Link} to="/admin/forum" active={location.pathname === '/admin/forum'}>Forum</Nav.Link>
            <Nav.Link as={Link} to="/admin/settings" active={location.pathname === '/admin/settings'}>Settings</Nav.Link>
          </Nav>
          <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar; 