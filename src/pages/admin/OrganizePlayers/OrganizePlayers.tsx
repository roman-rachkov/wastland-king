import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWastelandDates } from "../../../api/fetchWastelandDates.ts";
import { fetchDefensePlayers, fetchAttackPlayers } from "../../../api/scheduleApi.ts";
import { fetchScheduleByEventDate, saveSchedule, updateSchedule } from "../../../api/scheduleApi.ts";
import { Card, Col, Row, Table, Button, Alert, Badge, Modal, Pagination } from "react-bootstrap";
import { allocatePlayersToBuildings } from "./utils.tsx";
import { IBuildings, Shift, ISchedule, TBuildingName, IAttackPlayer } from "../../../types/Buildings.tsx";
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
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [saveNotification, setSaveNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Пагинация для зданий
  const [itemsPerPage] = useState(15);
  
  const queryClient = useQueryClient();

  // Загрузка дат события
  const { data: dates, isLoading: datesIsLoading, isError: datesIsError, error: datesError } = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });

  // Загрузка игроков для защиты (с ограничениями по датам события)
  const { data: playersData, isLoading: playersIsLoading, isError: playersIsError, error: playersError } = useQuery({
    queryKey: ['defensePlayers', dates],
    queryFn: () => fetchDefensePlayers(dates!),
    enabled: !!dates
  });

  // Загрузка игроков для атаки
  const { data: attackPlayersData } = useQuery({
    queryKey: ['attackPlayers', dates],
    queryFn: () => fetchAttackPlayers(dates!),
    enabled: !!dates
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
      setSaveNotification({ type: 'success', message: 'Schedule saved successfully!' });
      setTimeout(() => setSaveNotification(null), 3000);
    },
    onError: (error) => {
      setSaveNotification({ type: 'error', message: `Error saving schedule: ${error.message}` });
    }
  });

  // Мутация для обновления расписания
  const updateScheduleMutation = useMutation({
    mutationFn: ({ scheduleId, buildings, attackPlayers }: { scheduleId: string; buildings: IBuildings[]; attackPlayers: IAttackPlayer[] }) => 
      updateSchedule(scheduleId, buildings, attackPlayers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      setSaveNotification({ type: 'success', message: 'Schedule updated successfully!' });
      setTimeout(() => setSaveNotification(null), 3000);
    },
    onError: (error) => {
      setSaveNotification({ type: 'error', message: `Error updating schedule: ${error.message}` });
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
  const [attackPlayers, setAttackPlayers] = useState<IAttackPlayer[]>([]);

  // Обновляем данные при изменении
  React.useEffect(() => {
    setBuildings(initialData);
    // Устанавливаем игроков атаки из существующего расписания или из загруженных данных
    if (existingSchedule?.attackPlayers && existingSchedule.attackPlayers.length > 0) {
      setAttackPlayers(existingSchedule.attackPlayers);
    } else if (attackPlayersData && attackPlayersData.length > 0) {
      // Конвертируем игроков атаки в нужный формат
      const convertedAttackPlayers: IAttackPlayer[] = attackPlayersData.map(player => ({
        id: player.id,
        name: player.name,
        alliance: player.alliance,
        troopTier: player.troopTier,
        marchSize: player.marchSize,
        isCapitan: player.isCapitan,
        troopFighter: player.troopFighter,
        troopShooter: player.troopShooter,
        troopRider: player.troopRider
      }));
      setAttackPlayers(convertedAttackPlayers);
    } else {
      setAttackPlayers([]);
    }
  }, [initialData, existingSchedule, attackPlayersData]);

  // Отдельный useEffect для обновления attackPlayers при изменении attackPlayersData
  React.useEffect(() => {
    if (attackPlayersData && attackPlayersData.length > 0) {
      const convertedAttackPlayers: IAttackPlayer[] = attackPlayersData.map(player => ({
        id: player.id,
        name: player.name,
        alliance: player.alliance,
        troopTier: player.troopTier,
        marchSize: player.marchSize,
        isCapitan: player.isCapitan,
        troopFighter: player.troopFighter,
        troopShooter: player.troopShooter,
        troopRider: player.troopRider
      }));
      setAttackPlayers(convertedAttackPlayers);
    }
  }, [attackPlayersData]);

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

  const handleClearSchedule = () => {
    if (window.confirm('Are you sure you want to clear the entire schedule? This action cannot be undone.')) {
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
      
      setBuildings(emptyBuildings);
      setAttackPlayers([]); // Очищаем игроков атаки
    }
  };

  const handleClearBuilding = (building: IBuildings) => {
    if (window.confirm(`Are you sure you want to clear the ${building.buildingName} building (${building.shift === Shift.first ? 'First' : 'Second'} Shift)?`)) {
      setBuildings(prev => 
        prev.map(b => 
          b.buildingName === building.buildingName && b.shift === building.shift
            ? {
                ...b,
                capitan: {} as Player,
                rallySize: 0,
                players: []
              }
            : b
        )
      );
    }
  };

  const handleSaveSchedule = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.email) {
      setSaveNotification({ type: 'error', message: 'You need to be logged in to save schedules' });
      return;
    }

    // Используем данные из состояния attackPlayers
    const allAttackPlayers: IAttackPlayer[] = attackPlayers.map(player => ({
      id: player.id,
      name: player.name,
      alliance: player.alliance,
      troopTier: player.troopTier,
      marchSize: player.marchSize,
      isCapitan: player.isCapitan,
      troopFighter: player.troopFighter,
      troopShooter: player.troopShooter,
      troopRider: player.troopRider
    }));

    try {
      if (existingSchedule) {
        // Обновляем существующее расписание
        await updateScheduleMutation.mutateAsync({
          scheduleId: existingSchedule.id,
          buildings,
          attackPlayers: allAttackPlayers
        });
      } else {
        // Создаем новое расписание
        await saveScheduleMutation.mutateAsync({
          eventDate: dates!.nextDate,
          buildings,
          attackPlayers: allAttackPlayers,
          createdBy: currentUser.email
        });
      }
    } catch (error) {
      // Ошибки обрабатываются в onError мутаций
      console.error('Save schedule error:', error);
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

  // Функция для получения типов войск игрока, которые совпадают с капитаном
  const getMatchingTroopTypes = (player: Player, captain: Player) => {
    const playerTypes: string[] = [];
    const captainTypes: string[] = [];
    
    if (player.troopFighter) playerTypes.push('Fighter');
    if (player.troopShooter) playerTypes.push('Shooter');
    if (player.troopRider) playerTypes.push('Rider');
    
    if (captain.troopFighter) captainTypes.push('Fighter');
    if (captain.troopShooter) captainTypes.push('Shooter');
    if (captain.troopRider) captainTypes.push('Rider');
    
    // Возвращаем только те типы войск игрока, которые есть у капитана
    return playerTypes.filter(type => captainTypes.includes(type));
  };

  // Функции пагинации
  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const renderPagination = (totalItems: number, currentPage: number, onPageChange: (page: number) => void) => {
    const totalPages = getTotalPages(totalItems);
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    if (startPage > 1) {
      pages.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pages.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      pages.push(
        <Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    pages.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return <Pagination className="justify-content-center mt-3">{pages}</Pagination>;
  };

  function printData(item: IBuildings, keyPostfix: string) {
    const totalUnits = item.players.reduce((acc, pl) => acc += pl.march, 0);
    const hasCaptain = item.capitan && item.capitan.id;
    const totalPlayers = item.players.length;
    const needsPagination = totalPlayers > itemsPerPage;
    
    // Компонент для здания с пагинацией
    const BuildingWithPagination: React.FC<{ building: IBuildings; keyPostfix: string }> = ({ building, keyPostfix }) => {
      const [buildingPage, setBuildingPage] = useState(1);
      const startIndex = (buildingPage - 1) * itemsPerPage;
      const paginatedPlayers = building.players.slice(startIndex, startIndex + itemsPerPage);
      
      return (
        <Card key={building.buildingName + keyPostfix} className={'mb-3'}>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6>{building.buildingName}</h6>
                {hasCaptain ? (
                  <div>
                    <div>
                      <strong>Captain:</strong> ({building.capitan.alliance}){building.capitan.name}
                      <Badge bg="warning" className="ms-2">Rally: {building.rallySize}</Badge>
                      <Badge bg="info" className="ms-2">March: {building.capitan.marchSize}</Badge>
                    </div>
                    <div className="mt-1">
                      <small className="text-muted">
                        <strong>Captain Troop Types:</strong> {getCaptainTroopTypes(building.capitan).map(type => (
                          <Badge key={type} bg="primary" className="me-1">
                            {type}
                          </Badge>
                        ))}
                        <Badge bg="secondary" className="ms-2">Tier: {building.capitan.troopTier}</Badge>
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="text-danger">Captain not assigned</div>
                )}
              </div>
              <div>
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={() => handleEditBuilding(building)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-danger"
                  onClick={() => handleClearBuilding(building)}
                >
                  Clear
                </Button>
              </div>
            </div>
            {needsPagination && (
              <div className="mt-2">
                <small className="text-muted">
                  {totalPlayers} players - Page {buildingPage} of {getTotalPages(totalPlayers)}
                </small>
              </div>
            )}
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
                {paginatedPlayers.map(pl => (
                  <tr key={pl.player.id}>
                    <td>({pl.player.alliance}){pl.player.name}</td>
                    <td>
                      {building.capitan?.id ? 
                        getMatchingTroopTypes(pl.player, building.capitan).map(type => (
                          <Badge key={type} bg="primary" className="me-1">
                            {type}
                          </Badge>
                        )) :
                        getTroopTypes(pl.player).map(type => (
                          <Badge key={type} bg="primary" className="me-1">
                            {type}
                          </Badge>
                        ))
                      }
                    </td>
                    <td>
                      <Badge bg="secondary">{pl.player.troopTier}</Badge>
                    </td>
                    <td>{pl.march}</td>
                  </tr>
                ))}
                {paginatedPlayers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No players assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {needsPagination && renderPagination(totalPlayers, buildingPage, setBuildingPage)}
          </Card.Body>
          <Card.Footer>
            <div className="d-flex justify-content-between">
              <div>
                <strong>Rally Size:</strong> {building.rallySize}<br/>
                <strong>Player Units:</strong> {totalUnits}<br/>
                <strong>Difference:</strong> {building.rallySize - totalUnits}
              </div>
              <div>
                {building.rallySize - totalUnits < 0 && (
                  <Badge bg="danger">Overflow</Badge>
                )}
                {building.rallySize - totalUnits === 0 && (
                  <Badge bg="success">Optimal</Badge>
                )}
                {building.rallySize - totalUnits > 0 && (
                  <Badge bg="warning">Insufficient</Badge>
                )}
              </div>
            </div>
          </Card.Footer>
        </Card>
      );
    };

    if (!needsPagination) {
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
              <div>
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={() => handleEditBuilding(item)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-danger"
                  onClick={() => handleClearBuilding(item)}
                >
                  Clear
                </Button>
              </div>
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
                      {item.capitan?.id ? 
                        getMatchingTroopTypes(pl.player, item.capitan).map(type => (
                          <Badge key={type} bg="primary" className="me-1">
                            {type}
                          </Badge>
                        )) :
                        getTroopTypes(pl.player).map(type => (
                          <Badge key={type} bg="primary" className="me-1">
                            {type}
                          </Badge>
                        ))
                      }
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

    return <BuildingWithPagination building={item} keyPostfix={keyPostfix} />;
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
      {saveNotification && (
        <Alert 
          variant={saveNotification.type === 'success' ? 'success' : 'danger'} 
          className="mb-3"
          onClose={() => setSaveNotification(null)}
          dismissible
        >
          {saveNotification.message}
        </Alert>
      )}
      
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
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={handleClearSchedule}
          >
            Clear Schedule
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
          <PlayersStats 
            players={playersData} 
            buildings={buildings} 
            attackPlayers={attackPlayers.map(player => ({
              id: player.id,
              name: player.name,
              alliance: player.alliance,
              troopTier: player.troopTier,
              marchSize: player.marchSize,
              isCapitan: player.isCapitan,
              troopFighter: player.troopFighter,
              troopShooter: player.troopShooter,
              troopRider: player.troopRider
            }))} 
          />
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
          <Alert variant="info" className="mb-3">
            <strong>Event Date:</strong> {dates?.nextDate.toLocaleDateString()}
            <br />
            <strong>Status:</strong> {existingSchedule ? 'Update existing schedule' : 'Create new schedule'}
          </Alert>
          {saveNotification && (
            <Alert variant={saveNotification.type === 'success' ? 'success' : 'danger'} className="mb-3">
              {saveNotification.message}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSchedule}
            disabled={saveScheduleMutation.isPending}
          >
            {saveScheduleMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrganizePlayers;