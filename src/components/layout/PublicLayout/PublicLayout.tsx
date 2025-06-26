import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import PublicNavbar from "../PublicNavbar";

const PublicLayout = () => {
  return (
    <>
      <PublicNavbar />
      <Container className="mt-4 flex-grow-1 d-flex flex-column">
        <Outlet/>
      </Container>
    </>
  );
};

export default PublicLayout; 