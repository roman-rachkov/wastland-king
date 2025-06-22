import {Container, Nav, Navbar} from "react-bootstrap";
import {Link, Outlet} from "react-router";

const PublicLayout = () => {
  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav"/>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Registration</Nav.Link>
              <Nav.Link as={Link} to="/players">Players List</Nav.Link>
              <Nav.Link as={Link} to="/schedule">Schedule</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4 flex-grow-1 d-flex flex-column">
        <Outlet/>
      </Container>
    </>
  );
};

export default PublicLayout; 