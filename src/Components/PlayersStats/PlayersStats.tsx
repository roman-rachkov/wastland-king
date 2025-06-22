import React from 'react';
import { Card, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Player } from '../../types/Player';
import { IBuildings, IAttackPlayer } from '../../types/Buildings';

interface PlayersStatsProps {
  players: Player[];
  buildings: IBuildings[];
  attackPlayers?: IAttackPlayer[];
}

const PlayersStats: React.FC<PlayersStatsProps> = ({ players, buildings, attackPlayers = [] }) => {
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

    // Captains assigned as regular players
    const captainsAsPlayers = captains.filter(p => 
      buildings.some(building => 
        building.players.some(pl => pl.player.id === p.id)
      )
    );

    // Attack players statistics
    const attackCaptains = attackPlayers.filter(p => p.isCapitan);
    const attackRegular = attackPlayers.filter(p => !p.isCapitan);

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
        unassigned: captains.length - assignedCaptains.length,
        asPlayers: captainsAsPlayers.length
      },
      regular: {
        total: regularPlayers.length,
        assigned: assignedRegular.length,
        unassigned: regularPlayers.length - assignedRegular.length
      },
      attack: {
        total: attackPlayers.length,
        captains: attackCaptains.length,
        regular: attackRegular.length
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
  }, [players, buildings, attackPlayers]);

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
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="total-players-tooltip">Total number of players</Tooltip>}
                >
                  <Badge bg="success" className="me-1">{stats.assigned}</Badge>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="unassigned-players-tooltip">Unassigned players</Tooltip>}
                >
                  <Badge bg="light" text="dark">{stats.unassigned}</Badge>
                </OverlayTrigger>
              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.captains.total}</h4>
              <small className="text-muted">Captains</small>
              <div className="mt-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="assigned-captains-tooltip">Assigned captains</Tooltip>}
                >
                  <Badge bg="warning" className="me-1">{stats.captains.assigned}</Badge>
                </OverlayTrigger>
               
                {stats.captains.asPlayers > 0 && (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="captains-as-players-tooltip">Captains assigned as regular players</Tooltip>}
                  >
                    <Badge bg="info" className="me-1">{stats.captains.asPlayers}</Badge>              
                  </OverlayTrigger>
                )}
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="unassigned-captains-tooltip">Unassigned captains</Tooltip>}
                >
                  <Badge bg="light" text="dark">{stats.captains.unassigned}</Badge>
                </OverlayTrigger>

              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.regular.total}</h4>
              <small className="text-muted">Regular Players</small>
              <div className="mt-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="assigned-regular-players-tooltip">Assigned regular players</Tooltip>}
                >
                  <Badge bg="primary" className="me-1">{stats.regular.assigned}</Badge>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="unassigned-regular-players-tooltip">Unassigned regular players</Tooltip>}
                >
                  <Badge bg="light" text="dark">{stats.regular.unassigned}</Badge>
                </OverlayTrigger>
              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="text-center">
              <h4>{stats.buildings.total}</h4>
              <small className="text-muted">Buildings</small>
              <div className="mt-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="with-captains-tooltip">Buildings with captains</Tooltip>}
                >
                  <Badge bg="info" className="me-1">{stats.buildings.withCaptains}</Badge>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="without-captains-tooltip">Buildings without captains</Tooltip>}
                >
                  <Badge bg="light" text="dark">{stats.buildings.withoutCaptains}</Badge>
                </OverlayTrigger>
              </div>
            </div>
          </Col>
        </Row>
        
        {stats.attack.total > 0 && (
          <>
            <hr />
            <Row>
              <Col md={12}>
                <div className="text-center">
                  <h6>Attack Players</h6>
                  <div>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="attack-total-tooltip">Total attack players</Tooltip>}
                    >
                      <Badge bg="danger" className="me-2">Total: {stats.attack.total}</Badge>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="attack-captains-tooltip">Attack captains</Tooltip>}
                    >
                      <Badge bg="warning" className="me-2">Captains: {stats.attack.captains}</Badge>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="attack-regular-tooltip">Attack regular players</Tooltip>}
                    >
                      <Badge bg="primary">Regular: {stats.attack.regular}</Badge>
                    </OverlayTrigger>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}
        
        <hr />
        
        <Row>
          <Col md={4}>
            <h6>Troop Types</h6>
            <div>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="fighters-tooltip">Fighters</Tooltip>}
              >
                <Badge bg="primary" className="me-2">Fighter: {stats.troopTypes.fighters}</Badge>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="shooters-tooltip">Shooters</Tooltip>}
              >
                <Badge bg="success" className="me-2">Shooter: {stats.troopTypes.shooters}</Badge>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="riders-tooltip">Riders</Tooltip>}
              >
                <Badge bg="warning">Rider: {stats.troopTypes.riders}</Badge>
              </OverlayTrigger>
            </div>
          </Col>
          
          <Col md={4}>
            <h6>Shifts</h6>
            <div>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="first-shift-only-tooltip">First shift only</Tooltip>}
              >
                <Badge bg="info" className="me-2">First Only: {stats.shifts.firstOnly}</Badge>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="second-shift-only-tooltip">Second shift only</Tooltip>}
              >
                <Badge bg="info" className="me-2">Second Only: {stats.shifts.secondOnly}</Badge>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="both-shifts-tooltip">Both shifts</Tooltip>}
              >
                <Badge bg="info">Both: {stats.shifts.both}</Badge>
              </OverlayTrigger>
            </div>
          </Col>
          
          <Col md={4}>
            <h6>Troop Tiers</h6>
            <div>
              {Object.entries(stats.tiers)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([tier, count]) => (
                  <OverlayTrigger
                    key={tier}
                    placement="top"
                    overlay={<Tooltip id={`tier-${tier}-tooltip`}>Troop tier {tier}</Tooltip>}
                  >
                    <Badge bg="secondary" className="me-1 mb-1">
                      T{tier}: {count}
                    </Badge>
                  </OverlayTrigger>
                ))}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PlayersStats; 