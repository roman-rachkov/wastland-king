import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWastelandDates } from "../../../api/fetchWastelandDates.ts";
import { fetchAllDefensePlayers } from "../../../api/scheduleApi.ts";
import { fetchScheduleByEventDate, saveSchedule, updateSchedule } from "../../../api/scheduleApi.ts";
import { Card, Col, Row, Table, Button, Alert, Badge, Modal, Form } from "react-bootstrap";
import { allocatePlayersToBuildings } from "./utils.tsx";
import { IBuildings, Shift, ISchedule, TBuildingName } from "../../../types/Buildings.tsx";
import { Player } from "../../../types/Player.ts";
import EditBuildingModal from "../../../Components/EditBuildingModal";
import AvailablePlayersList from "../../../Components/AvailablePlayersList";
import ExportPlayersList from "../../../Components/ExportPlayersList";
import PlayersStats from "../../../Components/PlayersStats";
import { getCurrentUser } from "../../../services/firebase.ts";

const OrganizePlayers = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<IBuildings | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  const queryClient = useQueryClient();

  // Загрузка дат события
  const { data: dates, isLoading: datesIsLoading, isError: datesIsError, error: datesError } = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });

  // Загрузка ВСЕХ игроков для защиты (без ограничений по датам)
  const { data: playersData, isLoading: playersIsLoading, isError: playersIsError, error: playersError } = useQuery({
    queryKey: ['allDefensePlayers'],
    queryFn: fetchAllDefensePlayers
  });

  // Загрузка существующего расписания
  const { data: existingSchedule, isLoading: scheduleIsLoading } = useQuery({
    queryKey: ['schedule', dates?.nextDate],
    queryFn: () => fetchScheduleByEventDate(dates!.nextDate),
    enabled: !!dates
  });

  // Мутация для сохранения расписания
  const saveScheduleMutation = useMutation({
    mutationFn: (schedule: Omit<ISchedule, 'id' | 'createdAt' | 'updatedAt'>) => saveSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      setShowSaveModal(false);
      setScheduleName('');
    }
  });

  // Мутация для обновления расписания
  const updateScheduleMutation = useMutation({
    mutationFn: ({ scheduleId, buildings }: { scheduleId: string; buildings: IBuildings[] }) => 
      updateSchedule(scheduleId, buildings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    }
  });

  // Генерируем начальные данные или используем существующие
  const initialData = useMemo(() => {
    if (existingSchedule) {
      return existingSchedule.buildings;
    }
    // Создаем пустые здания без автоматического заполнения
    const emptyBuildings: IBuildings[] = [];
    const buildingNames: TBuildingName[] = ['HUB', 'North', 'South', 'West', 'East'];
    
    for (const buildingName of buildingNames) {
      emptyBuildings.push({
        buildingName,
        capitan: {} as Player,
        shift: Shift.first,
        rallySize: 0,
        players: []
      });
      emptyBuildings.push({
        buildingName,
        capitan: {} as Player,
        shift: Shift.second,
        rallySize: 0,
        players: []
      });
    }
    
    return emptyBuildings;
  }, [existingSchedule]);

  const [buildings, setBuildings] = useState<IBuildings[]>(initialData);

  // Обновляем данные при изменении
  React.useEffect(() => {
    setBuildings(initialData);
  }, [initialData]);

  const handleEditBuilding = (building: IBuildings) => {
    setSelectedBuilding(building);
    setShowEditModal(true);
  };

  const handleSaveBuilding = (updatedBuilding: IBuildings) => {
    setBuildings(prev => 
      prev.map(b => 
        b.buildingName === updatedBuilding.buildingName && b.shift === updatedBuilding.shift 
          ? updatedBuilding 
          : b
      )
    );
  };

  const handleAutoAllocate = () => {
    const newData = allocatePlayersToBuildings(playersData ?? []);
    setBuildings(newData);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleName.trim()) return;

    const currentUser = getCurrentUser();
    if (!currentUser?.email) {
      alert('You need to be logged in');
      return;
    }

    if (existingSchedule) {
      // Обновляем существующее расписание
      await updateScheduleMutation.mutateAsync({
        scheduleId: existingSchedule.id,
        buildings
      });
    } else {
      // Создаем новое расписание
      await saveScheduleMutation.mutateAsync({
        eventDate: dates!.nextDate,
        buildings,
        createdBy: currentUser.email
      });
    }
  };

  const getTroopTypes = (player: Player) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  const getCaptainTroopTypes = (player: Player) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  function printData(item: IBuildings, keyPostfix: string) {
    const totalUnits = item.players.reduce((acc, pl) => acc += pl.march, 0);
    const hasCaptain = item.capitan && item.capitan.id;
    
    return (
      <Card key={item.buildingName + keyPostfix} className={'mb-3'}>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6>{item.buildingName}</h6>
              {hasCaptain ? (
                <div>
                  <div>
                    <strong>Captain:</strong> ({item.capitan.alliance}){item.capitan.name}
                    <Badge bg="warning" className="ms-2">Rally: {item.rallySize}</Badge>
                    <Badge bg="info" className="ms-2">March: {item.capitan.marchSize}</Badge>
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">
                      <strong>Captain Troop Types:</strong> {getCaptainTroopTypes(item.capitan).map(type => (
                        <Badge key={type} bg="primary" className="me-1">
                          {type}
                        </Badge>
                      ))}
                      <Badge bg="secondary" className="ms-2">Tier: {item.capitan.troopTier}</Badge>
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-danger">Captain not assigned</div>
              )}
            </div>
            <Button 
              size="sm" 
              variant="outline-primary"
              onClick={() => handleEditBuilding(item)}
            >
              Edit
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped size="sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>Troop Type</th>
                <th>Tier</th>
                <th>March</th>
              </tr>
            </thead>
            <tbody>
              {item.players.map(pl => (
                <tr key={pl.player.id}>
                  <td>({pl.player.alliance}){pl.player.name}</td>
                  <td>
                    {getTroopTypes(pl.player).map(type => (
                      <Badge key={type} bg="primary" className="me-1">
                        {type}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <Badge bg="secondary">{pl.player.troopTier}</Badge>
                  </td>
                  <td>{pl.march}</td>
                </tr>
              ))}
              {item.players.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No players assigned
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between">
            <div>
              <strong>Rally Size:</strong> {item.rallySize}<br/>
              <strong>Player Units:</strong> {totalUnits}<br/>
              <strong>Difference:</strong> {item.rallySize - totalUnits}
            </div>
            <div>
              {item.rallySize - totalUnits < 0 && (
                <Badge bg="danger">Overflow</Badge>
              )}
              {item.rallySize - totalUnits === 0 && (
                <Badge bg="success">Optimal</Badge>
              )}
              {item.rallySize - totalUnits > 0 && (
                <Badge bg="warning">Insufficient</Badge>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    );
  }

  if (playersIsLoading || datesIsLoading || scheduleIsLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (datesIsError) {
    return <Alert variant="danger">Error loading dates: {datesError.message}</Alert>;
  }

  if (playersIsError) {
    return <Alert variant="danger">Error loading players: {playersError.message}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Player Organization</h2>
        <div>
          <Button 
            variant="outline-info" 
            className="me-2"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          <Button 
            variant="outline-info" 
            className="me-2"
            onClick={() => setShowPlayersList(!showPlayersList)}
          >
            {showPlayersList ? 'Hide' : 'Show'} Players List
          </Button>
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={handleAutoAllocate}
          >
            Auto Fill Schedule
          </Button>
          <ExportPlayersList players={playersData || []} buildings={buildings} />
          <Button 
            variant="primary"
            className="ms-2"
            onClick={() => setShowSaveModal(true)}
          >
            Save Schedule
          </Button>
        </div>
      </div>

      {showStats && playersData && (
        <div className="mb-4">
          <PlayersStats players={playersData} buildings={buildings} />
        </div>
      )}

      {!existingSchedule && buildings.every(b => !b.capitan.id) && (
        <Alert variant="info" className="mb-4">
          <strong>Welcome!</strong> Your schedule is empty. Click "Auto Fill Schedule" to automatically assign players and captains, or manually edit each building.
        </Alert>
      )}

      {showPlayersList && playersData && (
        <div className="mb-4">
          <AvailablePlayersList players={playersData} buildings={buildings} />
        </div>
      )}

      <Row>
        <Col md={6}>
          <h3>First Shift</h3>
          {buildings
            .filter(item => item.shift === Shift.first)
            .sort((itemA, itemB) => itemB.buildingName.localeCompare(itemA.buildingName))
            .map(item => printData(item, '-first-shift'))}
        </Col>
        <Col md={6}>
          <h3>Second Shift</h3>
          {buildings
            .filter(item => item.shift === Shift.second)
            .sort((itemA, itemB) => itemB.buildingName.localeCompare(itemA.buildingName))
            .map(item => printData(item, '-second-shift'))}
        </Col>
      </Row>

      {/* Модальное окно редактирования здания */}
      {selectedBuilding && (
        <EditBuildingModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          building={selectedBuilding}
          availablePlayers={playersData || []}
          onSave={handleSaveBuilding}
          allBuildings={buildings}
        />
      )}

      {/* Модальное окно сохранения расписания */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Schedule Name</Form.Label>
              <Form.Control
                type="text"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="Enter schedule name"
              />
            </Form.Group>
            <Alert variant="info" className="mt-3">
              <strong>Event Date:</strong> {dates?.nextDate.toLocaleDateString()}
              <br />
              <strong>Status:</strong> {existingSchedule ? 'Update existing' : 'Create new'}
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSchedule}
            disabled={!scheduleName.trim() || saveScheduleMutation.isPending}
          >
            {saveScheduleMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrganizePlayers;