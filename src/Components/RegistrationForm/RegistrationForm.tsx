
import {
  Button,
  Card,
  Col,
  Form,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
  Image,
  Row
} from "react-bootstrap";
import wak from "../../assets/images/wak.png";
import fighter from "../../assets/images/fighter.jpg";
import shooter from "../../assets/images/shooter.jpg";
import rider from "../../assets/images/rider.jpg";
import marchSize from "../../assets/images/marchSize.png";
import firstShift from "../../assets/images/1-shift.png";
import secondShift from "../../assets/images/2-shift.png";
import capitan from "../../assets/images/capitan.png";
import rallySize from "../../assets/images/rally-size.jpg";

const RegistrationForm = () => {
  return (
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <h2>Registration Form</h2>
          </Card.Header>
          <Card.Body className={'z-0'}>
            <Form>
              <FormGroup className={'mb-4'}>
                <Row>
                  <Col md={4}>
                    <FormLabel>Whats your name?</FormLabel>
                    <FormControl name={'name'}/>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className={'mb-4'}>
                <Row>
                  <Col className={'d-flex flex-column'} md={4}>
                    <FormLabel>Please enter your alliance alias</FormLabel>
                    <Image src={wak} className={'w-100 mb-2'} loading="lazy"/>
                    <FormControl name={'alliance'}/>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row className={'mb-4'}>
                  <FormLabel>Troop type</FormLabel>
                  <Col className={'d-flex flex-column'} md={1} xs={4}>
                    <Row>
                      <Col xs={1}>
                        <FormCheck name={'troop-fighter'} label={'Fighter'}/>
                      </Col>
                    </Row>
                    <Image src={fighter} className={'w-100 mb-2'} loading="lazy"/>
                  </Col>
                  <Col className={'d-flex flex-column'} md={1} xs={4}>
                    <Row>
                      <Col xs={1}>
                        <FormCheck name={'troop-shooter'} label={'Shooter'}/>
                      </Col>
                    </Row>
                    <Image src={shooter} className={'w-100 mb-2'} loading="lazy"/>
                  </Col>
                  <Col className={'d-flex flex-column'} md={1} xs={4}>
                    <Row>
                      <Col xs={1}>
                        <FormCheck name={'troop-rider'} label={'Rider'}/>
                      </Col>
                    </Row>
                    <Image src={rider} className={'w-100 mb-2'} loading="lazy"/>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className={'mb-4'}>
                <Row>
                  <Col>
                    <FormLabel>Troop Tier</FormLabel>
                    <FormCheck name={'troop-tier'} type={'radio'} label={'T10'}/>
                    <FormCheck name={'troop-tier'} type={'radio'} label={'T11'}/>
                    <FormCheck name={'troop-tier'} type={'radio'} label={'T12'}/>
                    <FormCheck name={'troop-tier'} type={'radio'} label={'T13'}/>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className={'mb-4'}>
                <Row>
                  <Col md={4}>
                    <FormLabel>March size?</FormLabel>
                    <Image src={marchSize} className={'w-100 mb-2'} loading="lazy"/>
                    <FormControl name={'size'}/>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className={'mb-4'}>
                <Row>
                  <FormLabel>Availability </FormLabel>
                  <FormText>Stronger players encoraged to take 1st shift</FormText>
                  <Col className={'d-flex flex-column'} md={3} xs={6}>
                    <Row>
                      <Col>
                        <FormCheck name={'shift-first'} label={'First shift'}/>
                      </Col>
                      <Image src={firstShift} className={'w-100 mb-2'} loading="lazy"/>

                    </Row>
                  </Col>
                  <Col className={'d-flex flex-column'} md={3} xs={6}>
                    <Row>
                      <Col>
                        <FormCheck name={'shift-second'} label={'Second shift'}/>
                      </Col>
                      <Image src={secondShift} className={'w-100 mb-2'} loading="lazy"/>
                    </Row>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className={'mb-4'}>
                <Row className={'flex-column'}>
                  <FormLabel>
                    Are you available to captain a turret?
                  </FormLabel>
                  <FormText>
                    Captains are required to spend 2000 Diamonds for super reinforcement at minimum.
                  </FormText>
                  <Col className={'d-flex mb-2'} md={3}>
                    <FormCheck name={'troop-tier'} className={'me-2'} type={'radio'} label={'Yes'}/>
                    <FormCheck name={'troop-tier'} type={'radio'} label={'No'}/>
                  </Col>
                  <Image src={capitan} className={'w-50 mb-2'} loading="lazy"/>
                </Row>

              </FormGroup>
              <Row className={'mb-4'}>
                <Col className={'d-flex flex-column'} md={4}>
                  <FormLabel>Rally Size - Correct Size</FormLabel>
                  <Image src={rallySize} className={'w-100 mb-2'} loading="lazy"/>
                  <FormControl name={'rally-size'}/>
                </Col>
              </Row>
            </Form>

          </Card.Body>
          <Card.Footer className={'sticky-bottom'}>
            <Row>
              <Col className={'d-flex'}>
                <Button className={'ms-auto'} type={'submit'}>Submit</Button>
              </Col>
            </Row>
          </Card.Footer>
        </Card>
      </Col>
    </Row>

  );
};

export default RegistrationForm;