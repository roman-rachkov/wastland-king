import {Col, Image, Row} from "react-bootstrap";
import headerBg from "../../assets/images/header.jpg";
import CountdownTimer from "./Countdowntimer.tsx";
import {DateTime} from "luxon";

const HeaderBanner = () => {

  return (
    <Row className={'mb-5 position-relative'}>
      <Col>
        <Image src={headerBg} className={'w-100 rounded-bottom-2'} loading="lazy"/>
      </Col>
      <div className={'position-absolute top-50 start-0 w-auto translate-middle-y ps-5'}>
        <h1 className={'text-white text-uppercase'}>Wasteland king</h1>
        <div className={'text-white'}>Event start: <CountdownTimer className={'text-success fw-bold'} expireClassName={'text-danger fw-bold'} targetDate={DateTime.fromFormat('2025-03-22', 'yyyy-MM-dd')}/></div>
      </div>
    </Row>
  );
};

export default HeaderBanner;