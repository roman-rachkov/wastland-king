import {Col, Row} from "react-bootstrap";
import {DateTime} from "luxon";

const SchedulePage = () => {
  return (
    <Row className={'flex-grow-1 h-100'}>
      <Col className="h-100 d-flex flex-column">
        <object 
          data={`/SCHEDULE.pdf?t=${DateTime.now().toUnixInteger()}`} 
          type="application/pdf" 
          width="100%" 
          height="100%"
          style={{ minHeight: '600px', flex: '1' }}
        >
          <p>Dont see file? <a href="/SCHEDULE.pdf">Download it</a></p>
        </object>
      </Col>
    </Row>
  );
};

export default SchedulePage;