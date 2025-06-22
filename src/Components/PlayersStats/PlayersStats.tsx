import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Player } from '../../types/Player';
import { IBuildings } from '../../types/Buildings';

interface PlayersStatsProps {
  players: Player[];
  buildings: IBuildings[];
}

const PlayersStats: React.FC<PlayersStatsProps> = ({ players, buildings }) => {
  const stats = React.useMemo(() => {
    const assignedPlayers = players.filter(p => 
      buildings.some(building => 
        building.capitan?.id === p.id || 
        building.players.some(pl => pl.player.id === p.id)
      )
    );

    const captains = players.filter(p => p.isCapitan);
    const regularPlayers = players.filter(p => !p.isCapitan);
    
    const assignedCaptains = captains.filter(p => 
      buildings.some(building => building.capitan?.id === p.id)
    );
    
    const assignedRegular = regularPlayers.filter(p => 
      buildings.some(building => 
        building.players.some(pl => pl.player.id === p.id)
      )
    );

    // Troop type statistics
    const fighters = players.filter(p => p.troopFighter);
    const shooters = players.filter(p => p.troopShooter);
    const riders = players.filter(p => p.troopRider);

    // Tier statistics
    const tierStats = players.reduce((acc, player) => {
      acc[player.troopTier] = (acc[player.troopTier] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Shift statistics
    const firstShiftOnly = players.filter(p => p.firstShift && !p.secondShift);
    const secondShiftOnly = players.filter(p => !p.firstShift && p.secondShift);
    const bothShifts = players.filter(p => p.firstShift && p.secondShift);

    return {
      total: players.length,
      assigned: assignedPlayers.length,
      unassigned: players.length - assignedPlayers.length,
      captains: {
        total: captains.length,
        assigned: assignedCaptains.length,
        unassigned: captains.length - assignedCaptains.length
      },
      regular: {
        total: regularPlayers.length,
        assigned: assignedRegular.length,
        unassigned: regularPlayers.length - assignedRegular.length
      },
      troopTypes: {
        fighters: fighters.length,
        shooters: shooters.length,
        riders: riders.length
      },
      tiers: tierStats,
      shifts: {
        firstOnly: firstShiftOnly.length,
        secondOnly: secondShiftOnly.length,
        both: bothShifts.length
      },
      buildings: {
        total: buildings.length,
        withCaptains: buildings.filter(b => b.capitan?.id).length,
        withoutCaptains: buildings.filter(b => !b.capitan?.id).length
      }
    };
  }, [players, buildings]);

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0">📊 Players Statistics</h6>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.total}</h4>
              <small className="text-muted">Total Players</small>
              <div className="mt-2">
                <Badge bg="success" className="me-1">{stats.assigned}</Badge>
                <Badge bg="light" text="dark">{stats.unassigned}</Badge>
              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.captains.total}</h4>
              <small className="text-muted">Captains</small>
              <div className="mt-2">
                <Badge bg="warning" className="me-1">{stats.captains.assigned}</Badge>
                <Badge bg="light" text="dark">{stats.captains.unassigned}</Badge>
              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.regular.total}</h4>
              <small className="text-muted">Regular Players</small>
              <div className="mt-2">
                <Badge bg="primary" className="me-1">{stats.regular.assigned}</Badge>
                <Badge bg="light" text="dark">{stats.regular.unassigned}</Badge>
              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.buildings.total}</h4>
              <small className="text-muted">Buildings</small>
              <div className="mt-2">
                <Badge bg="info" className="me-1">{stats.buildings.withCaptains}</Badge>
                <Badge bg="light" text="dark">{stats.buildings.withoutCaptains}</Badge>
              </div>
            </div>
          </Col>
        </Row>
        
        <hr />
        
        <Row>
          <Col md={4}>
            <h6>Troop Types</h6>
            <div>
              <Badge bg="primary" className="me-2">Fighter: {stats.troopTypes.fighters}</Badge>
              <Badge bg="success" className="me-2">Shooter: {stats.troopTypes.shooters}</Badge>
              <Badge bg="warning">Rider: {stats.troopTypes.riders}</Badge>
            </div>
          </Col>
          
          <Col md={4}>
            <h6>Shifts</h6>
            <div>
              <Badge bg="info" className="me-2">First Only: {stats.shifts.firstOnly}</Badge>
              <Badge bg="info" className="me-2">Second Only: {stats.shifts.secondOnly}</Badge>
              <Badge bg="info">Both: {stats.shifts.both}</Badge>
            </div>
          </Col>
          
          <Col md={4}>
            <h6>Top Tiers</h6>
            <div>
              {Object.entries(stats.tiers)
                .sort(([a], [b]) => Number(b) - Number(a))
                .slice(0, 3)
                .map(([tier, count]) => (
                  <Badge key={tier} bg="secondary" className="me-2">
                    T{tier}: {count}
                  </Badge>
                ))}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PlayersStats; 