import {Col, Row} from "react-bootstrap";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import {Outlet} from "react-router";

const AdminLayout = () => {
  return (
    <Row className={'flex-column flex-grow-1'}>
      <Col className={'flex-grow-0 mb-4'}><AdminNavbar/></Col>
      <Col className={'flex-grow-1'}>
        <Outlet/>
      </Col>
    </Row>
  );
};

export default AdminLayout;