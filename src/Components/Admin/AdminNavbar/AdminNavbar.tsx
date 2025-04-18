import {Container, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router";

const AdminNavbar = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container className={'flex-row'}>
        <Navbar.Brand as={Link} to="/admin">s841 WK</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin">Sheet</Nav.Link>
            <Nav.Link as={Link} to="/admin/settings">Settings</Nav.Link>
            <Nav.Link as={Link} to="/admin/organize-players">Calculate Players</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;