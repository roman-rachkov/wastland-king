import {useQuery} from "@tanstack/react-query";
import {fetchWastelandDates} from "../../../api/fetchWastelandDates.ts";
import {fetchPlayers} from "../../../api/fetchPlayers.ts";
import {Card, Col, Row, Table} from "react-bootstrap";
import {allocatePlayersToBuildings} from "./utils.tsx";
import {IBuildings, Shift} from "../../../types/Buildings.tsx";

const OrganizePlayers = () => {
  const {data: dates, isLoading: datesIsloading, isError: datesIsError, error: datesError} = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });

  const {data: playersData, isLoading: playersIsLoading, isError: playersIsError, error: playersError} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(dates!),
    enabled: !!dates
  });

  const data = allocatePlayersToBuildings(playersData ?? [])

  function printData(item: IBuildings, keyPostfix: string) {
    const totalUnits = item.players.reduce((acc, pl) => acc += pl.march, 0);
    return (<Card key={item.buildingName + keyPostfix} className={'mb-3'}>
      <Card.Header><h6>{item.buildingName}</h6> Capitan:
        ({item.capitan.alliance}){item.capitan.name} march: {item.capitan.marchSize}</Card.Header>
      <Card.Body>
        <Table striped>
          <thead>
          <tr>
            <th>
              Nickname
            </th>
            <th>Troop type</th>
            <th>March size</th>
          </tr>
          </thead>
          <tbody>
          {item.players.map(pl => (
            <tr key={pl.player.id}>
              <td>({pl.player.alliance}){pl.player.name}</td>
              <td></td>
              <td>{pl.march}</td>
            </tr>
          ))}
          </tbody>
        </Table>
      </Card.Body>
      <Card.Footer>
        Rally size: {item.rallySize}<br/>Players units: {totalUnits}<br/>Difference: {item.rallySize - totalUnits}
      </Card.Footer>
    </Card>);
  }

  console.log(playersData, data);
  if (playersIsLoading || datesIsloading) {
    return 'Loading....';
  }
  if (datesIsError) {
    return datesError.message;
  }
  if (playersIsError) {
    return playersError.message;
  }

  return (
    <Row>
      <Col md={6}>
        <h3>Fist shift</h3>
        {data.filter(item => item.shift === Shift.first).sort((itemA, itemB) => itemB.buildingName.localeCompare(itemA.buildingName)).map(item => printData(item, '-first-shift'))}
      </Col>
      <Col md={6}>
        <h3>Second shift</h3>
        {data.filter(item => item.shift === Shift.second).sort((itemA, itemB) => itemB.buildingName.localeCompare(itemA.buildingName)).map(item => printData(item, '-second-shift'))}
      </Col>
    </Row>
  );
};

export default OrganizePlayers;