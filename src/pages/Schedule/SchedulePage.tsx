import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Badge, Nav } from 'react-bootstrap';
import { fetchSchedules, fetchDefensePlayers, fetchAttackPlayers } from '../../services/api/scheduleApi';
import { fetchWastelandDates } from '../../services/api/fetchWastelandDates';
import { ISchedule, IAttackPlayer } from '../../types/Buildings';
import { Player } from '../../types/Player';
import { useScheduleStore } from '../../store/ScheduleStore';
import ScheduleDisplay from '../../components/common/ScheduleDisplay';
import { ScheduleHeader, PlayerSearch } from '../../components/schedule';
import AttackPlayersTable from '../../components/schedule/AttackPlayersTable';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const SchedulePage = () => {
  const { existingSchedule } = useScheduleStore();
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState('defense');

  // Load event dates
  const { data: dates, isLoading: datesIsLoading } = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates,
  });

  // Load all schedules
  const { data: allSchedules, isLoading: scheduleIsLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
  });

  // Load defense players (with event date restrictions)
  const { data: allPlayers, isLoading: playersIsLoading } = useQuery({
    queryKey: ['defensePlayers', dates],
    queryFn: () => fetchDefensePlayers(dates!),
    enabled: !!dates
  });

  // Load attack players for search (with event date restrictions)
  const { data: attackPlayers, isLoading: attackPlayersIsLoading } = useQuery({
    queryKey: ['attackPlayers', dates],
    queryFn: () => fetchAttackPlayers(dates!),
    enabled: !!dates
  });

  // Set current schedule when loading
  useEffect(() => {
    if (existingSchedule) {
      setSelectedSchedule(existingSchedule);
      setSelectedScheduleDate(existingSchedule.eventDate);
    } else if (allSchedules && allSchedules.length > 0 && dates) {
      // If no existing schedule in store, find the current one from API
      const currentSchedule = allSchedules.find(schedule => {
        // Compare dates by day (ignore time)
        const scheduleDate = new Date(schedule.eventDate);
        const nextEventDate = new Date(dates.nextDate);
        
        return scheduleDate.getFullYear() === nextEventDate.getFullYear() &&
               scheduleDate.getMonth() === nextEventDate.getMonth() &&
               scheduleDate.getDate() === nextEventDate.getDate();
      });
      
      if (currentSchedule) {
        console.log('Found current schedule:', currentSchedule);
        setSelectedSchedule(currentSchedule);
        setSelectedScheduleDate(currentSchedule.eventDate);
      } else {
        // If no exact match, use the most recent schedule
        const mostRecentSchedule = allSchedules[0];
        console.log('Using most recent schedule:', mostRecentSchedule);
        setSelectedSchedule(mostRecentSchedule);
        setSelectedScheduleDate(mostRecentSchedule.eventDate);
      }
    }
  }, [existingSchedule, allSchedules, dates]);

  const handleScheduleSelect = (schedule: ISchedule) => {
    setSelectedSchedule(schedule);
    setSelectedScheduleDate(schedule.eventDate);
  };

  const handleReturnToCurrent = () => {
    if (existingSchedule) {
      setSelectedSchedule(existingSchedule);
      setSelectedScheduleDate(existingSchedule.eventDate);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  // Use settings from the selected schedule, fallback to store settings
  const scheduleSettings = selectedSchedule?.settings || { shiftDuration: 4, allowAttackPlayersInDefense: false };

  // Debug: Log tabInfo when schedule changes
  useEffect(() => {
    if (selectedSchedule?.settings?.tabInfo) {
      console.log('Schedule tabInfo:', selectedSchedule.settings.tabInfo);
    }
  }, [selectedSchedule]);

  // Debug: Log data loading status
  useEffect(() => {
    console.log('SchedulePage Debug:', {
      dates,
      allSchedules: allSchedules?.length,
      existingSchedule: !!existingSchedule,
      selectedSchedule: !!selectedSchedule,
      selectedScheduleDate,
      datesIsLoading,
      scheduleIsLoading
    });
  }, [dates, allSchedules, existingSchedule, selectedSchedule, selectedScheduleDate, datesIsLoading, scheduleIsLoading]);

  // Helper functions
  const isPlayerInAttack = (player: Player) => {
    return selectedSchedule?.attackPlayers?.some(ap => ap.id === player.id) || false;
  };

  const isPlayerInDefense = (player: Player) => {
    return selectedSchedule?.buildings?.some(building => 
      building.players.some(p => p.player.id === player.id) ||
      building.capitan?.id === player.id
    ) || false;
  };

  const isAttackPlayerInDefense = (attackPlayer: IAttackPlayer) => {
    return selectedSchedule?.buildings?.some(building => 
      building.players.some(p => p.player.id === attackPlayer.id) ||
      building.capitan?.id === attackPlayer.id
    ) || false;
  };

  const renderPlayerInfo = () => {
    if (!selectedPlayer) return null;

    const isInAttack = isPlayerInAttack(selectedPlayer);
    const isInDefense = isPlayerInDefense(selectedPlayer);
    
    // Find specific buildings and shifts where player is assigned
    const defenseAssignments: Array<{building: string, shift: number, role: 'captain' | 'player', march: number}> = [];
    
    if (selectedSchedule?.buildings) {
      selectedSchedule.buildings.forEach(building => {
        // Check if player is captain
        if (building.capitan?.id === selectedPlayer.id) {
          // Попробуем найти капитана в массиве players (иногда капитан тоже там есть)
          const captainInPlayers = building.players.find(p => p.player.id === selectedPlayer.id);
          defenseAssignments.push({
            building: building.buildingName,
            shift: building.shift,
            role: 'captain',
            march: captainInPlayers ? captainInPlayers.march || 0 : selectedPlayer.marchSize || 0
          });
        }
        // Check if player is in building players
        const playerInBuilding = building.players.find(p => p.player.id === selectedPlayer.id);
        if (playerInBuilding) {
          defenseAssignments.push({
            building: building.buildingName,
            shift: building.shift,
            role: 'player',
            march: playerInBuilding.march || 0
          });
        }
      });
    }

    const getTroopTypes = (player: Player) => {
      const types = [];
      if (player.troopFighter) types.push('Fighter');
      if (player.troopShooter) types.push('Shooter');
      if (player.troopRider) types.push('Rider');
      return types;
    };

    return (
      <Alert variant={isInAttack && isInDefense ? "warning" : isInAttack ? "danger" : isInDefense ? "success" : "info"}>
        <div>
          <strong>({selectedPlayer.alliance}) {selectedPlayer.name}</strong>
          <br />
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Player's troop tier level</Tooltip>}
          >
            <Badge bg="secondary" className="me-1">Tier: {selectedPlayer.troopTier}</Badge>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Player's march size capacity</Tooltip>}
          >
            <Badge bg="secondary" className="me-1">March: {selectedPlayer.marchSize}</Badge>
          </OverlayTrigger>
          {getTroopTypes(selectedPlayer).map(type => (
            <OverlayTrigger
              key={type}
              placement="top"
              overlay={<Tooltip>Player has {type} troops</Tooltip>}
            >
              <Badge bg="primary" className="me-1">{type}</Badge>
            </OverlayTrigger>
          ))}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Player registered for attack</Tooltip>}
          >
            <Badge bg={isInAttack ? "danger" : "secondary"} className="me-1">Attack: {isInAttack ? "Yes" : "No"}</Badge>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Player assigned to defense</Tooltip>}
          >
            <Badge bg={isInDefense ? "success" : "secondary"}>Defense: {isInDefense ? "Yes" : "No"}</Badge>
          </OverlayTrigger>
        </div>
        
        {defenseAssignments.length > 0 && (
          <div className="mt-2">
            <strong>Defense Assignments:</strong>
            <div className="mt-1">
              {defenseAssignments.map((assignment, index) => (
                <OverlayTrigger
                  key={index}
                  placement="top"
                  overlay={<Tooltip>
                    Player assigned to {assignment.building} in shift {assignment.shift} as {assignment.role}.<br/>
                    March: {assignment.march}
                  </Tooltip>}
                >
                  <Badge 
                    bg={assignment.role === 'captain' ? "warning" : "info"}
                    className="me-1"
                  >
                    {assignment.building} Shift {assignment.shift} ({assignment.role}) — March: {assignment.march}
                  </Badge>
                </OverlayTrigger>
              ))}
            </div>
          </div>
        )}
      </Alert>
    );
  };

  const renderDefenseSchedule = () => {
    if (!selectedSchedule) {
      return <Alert variant="info">No schedule available for the current event.</Alert>;
    }

    return (
      <ScheduleDisplay
        buildings={selectedSchedule.buildings}
        settings={scheduleSettings}
        dates={dates || null}
        attackPlayers={selectedSchedule.attackPlayers}
        itemsPerPage={itemsPerPage}
      />
    );
  };

  if (datesIsLoading || scheduleIsLoading || attackPlayersIsLoading || playersIsLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <ScheduleHeader
        selectedScheduleDate={selectedScheduleDate}
        allSchedules={allSchedules}
        selectedSchedule={selectedSchedule}
        currentSchedule={existingSchedule}
        onScheduleSelect={handleScheduleSelect}
        onReturnToCurrent={handleReturnToCurrent}
      />

      {/* Search Section */}
      <PlayerSearch
        allPlayers={allPlayers}
        attackPlayers={attackPlayers}
        selectedSchedule={selectedSchedule}
        onPlayerSelect={handlePlayerSelect}
      />

      {/* Selected Player Info */}
      {renderPlayerInfo()}

      {/* Schedule Tabs */}
      <div className="mt-4">
        <Nav variant="tabs" defaultActiveKey="defense" className="mb-3">
          <Nav.Item>
            <Nav.Link 
              eventKey="defense" 
              onClick={() => setActiveTab('defense')}
              className={activeTab === 'defense' ? 'active' : ''}
            >
              Defense Schedule
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="attack" 
              onClick={() => setActiveTab('attack')}
              className={activeTab === 'attack' ? 'active' : ''}
            >
              Attack Players
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        {activeTab === 'defense' && (
          <div>
            {/* Defense Tab Info */}
            {selectedSchedule?.settings?.tabInfo?.defense && (
              <Alert variant="info" className="mb-3">
                <i className="fas fa-info-circle me-2"></i>
                {selectedSchedule.settings.tabInfo.defense}
              </Alert>
            )}
            {renderDefenseSchedule()}
          </div>
        )}
        
        {activeTab === 'attack' && (
          <div>
            {/* Attack Tab Info */}
            {selectedSchedule?.settings?.tabInfo?.attack && (
              <Alert variant="warning" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {selectedSchedule.settings.tabInfo.attack}
              </Alert>
            )}
            {selectedSchedule?.attackPlayers && (
              <AttackPlayersTable
                attackPlayers={selectedSchedule.attackPlayers}
                scheduleSettings={scheduleSettings}
                isAttackPlayerInDefense={isAttackPlayerInDefense}
                itemsPerPage={itemsPerPage}
              />
            )}
            {!selectedSchedule?.attackPlayers && (
              <div>No attack players found in selectedSchedule</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;