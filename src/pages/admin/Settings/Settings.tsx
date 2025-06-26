import {Col, Row} from "react-bootstrap";
import PlayerCleanup from "../../../components/admin/Settings/PlayerCleanup";

const Settings = () => {
    return (
        <Row>
            <Col>
                <h2>Настройки</h2>
                <PlayerCleanup/>
            </Col>
        </Row>
    );
};

export default Settings;