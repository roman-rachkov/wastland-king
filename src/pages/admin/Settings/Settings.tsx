import {Col, Row} from "react-bootstrap";
import PlayerCleanup from "../../../Components/Admin/Settings/PlayerCleanup";

const Settings = () => {
  return (
    <Row className={'flex-column'}>
      <Col>
        <PlayerCleanup/>

      </Col>
    </Row>
  );
};

export default Settings;