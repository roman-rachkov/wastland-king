import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Table, Button, Alert, Badge, Form, ListGroup, Nav, Tab, Dropdown, Pagination } from 'react-bootstrap';
import { fetchScheduleByEventDate, fetchSchedules, fetchDefensePlayers, fetchAttackPlayers } from '../../api/scheduleApi';
import { fetchWastelandDates } from '../../api/fetchWastelandDates';
import { IBuildings, Shift, ISchedule, IAttackPlayer } from '../../types/Buildings';
import { Player } from '../../types/Player';
import _ from 'lodash';

type SortField = 'name' | 'alliance' | 'troopTier' | 'marchSize' | 'isCapitan';
type SortDirection = 'asc' | 'desc';

const SchedulePage = () => {
  const [activeTab, setActiveTab] = useState<'defense' | 'attack'>('defense');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [playerNotFound, setPlayerNotFound] = useState(false);
  
  // Сортировка для атаки
  const [sortField, setSortField] = useState<SortField>('isCapitan');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Загрузка дат события
  const { data: dates, isLoading: datesIsLoading } = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });

  // Загрузка всех расписаний
  const { data: allSchedules } = useQuery({
    queryKey: ['allSchedules'],
    queryFn: fetchSchedules
  });

  // Загрузка текущего расписания
  const { data: currentSchedule, isLoading: scheduleIsLoading } = useQuery({
    queryKey: ['schedule', dates?.nextDate],
    queryFn: () => fetchScheduleByEventDate(dates!.nextDate),
    enabled: !!dates?.nextDate
  });

  // Загрузка игроков для поиска (с ограничениями по датам события)
  const { data: allPlayers, isLoading: playersIsLoading } = useQuery({
    queryKey: ['defensePlayers', dates],
    queryFn: () => fetchDefensePlayers(dates!),
    enabled: !!dates
  });

  // Загрузка игроков атаки для поиска (с ограничениями по датам события)
  const { data: attackPlayers, isLoading: attackPlayersIsLoading } = useQuery({
    queryKey: ['attackPlayers', dates],
    queryFn: () => fetchAttackPlayers(dates!),
    enabled: !!dates
  });

  // Установка текущего расписания при загрузке
  useEffect(() => {
    if (currentSchedule) {
      setSelectedSchedule(currentSchedule);
      setSelectedScheduleDate(currentSchedule.eventDate);
    }
  }, [currentSchedule]);

  const handleScheduleSelect = (schedule: ISchedule) => {
    setSelectedSchedule(schedule);
    setSelectedScheduleDate(schedule.eventDate);
    setCurrentPage(1); // Сбрасываем пагинацию при смене расписания
  };

  const handleReturnToCurrent = () => {
    if (currentSchedule) {
      setSelectedSchedule(currentSchedule);
      setSelectedScheduleDate(currentSchedule.eventDate);
      setCurrentPage(1); // Сбрасываем пагинацию при возврате к текущему
    }
  };

  // Поиск игроков с debounce
  const searchPlayers = _.debounce(async (searchText: string) => {
    if (searchText.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      setPlayerNotFound(false);
      return;
    }

    if (!allPlayers || !attackPlayers) return;

    // Ищем среди всех игроков (защита + атака)
    const allAvailablePlayers = [...allPlayers, ...attackPlayers];
    
    // Добавляем игроков атаки из текущего расписания (если их нет в загруженных)
    if (selectedSchedule?.attackPlayers) {
      selectedSchedule.attackPlayers.forEach(attackPlayer => {
        // Проверяем, нет ли уже такого игрока в списке
        const exists = allAvailablePlayers.some(p => p.id === attackPlayer.id);
        if (!exists) {
          // Конвертируем IAttackPlayer в Player для поиска
          const playerForSearch: Player = {
            id: attackPlayer.id,
            name: attackPlayer.name,
            alliance: attackPlayer.alliance,
            troopTier: attackPlayer.troopTier,
            marchSize: attackPlayer.marchSize,
            rallySize: 0,
            troopFighter: attackPlayer.troopFighter,
            troopShooter: attackPlayer.troopShooter,
            troopRider: attackPlayer.troopRider,
            isCapitan: attackPlayer.isCapitan,
            isAttack: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstShift: false,
            secondShift: false
          };
          allAvailablePlayers.push(playerForSearch);
        }
      });
    }

    const results = allAvailablePlayers.filter(player => 
      player.name.toLowerCase().includes(searchText.toLowerCase()) ||
      player.alliance.toLowerCase().includes(searchText.toLowerCase())
    ).slice(0, 10); // Ограничиваем до 10 результатов

    setSearchResults(results);
    setShowSuggestions(results.length > 0);
  }, 300);

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    
    setSearchPerformed(true);
    setPlayerNotFound(false);
    
    if (!allPlayers || !attackPlayers) return;

    // Ищем точное совпадение
    const allAvailablePlayers = [...allPlayers, ...attackPlayers];
    
    // Добавляем игроков атаки из расписания (если их нет в загруженных)
    if (selectedSchedule?.attackPlayers) {
      selectedSchedule.attackPlayers.forEach(attackPlayer => {
        const exists = allAvailablePlayers.some(p => p.id === attackPlayer.id);
        if (!exists) {
          const playerForSearch: Player = {
            id: attackPlayer.id,
            name: attackPlayer.name,
            alliance: attackPlayer.alliance,
            troopTier: attackPlayer.troopTier,
            marchSize: attackPlayer.marchSize,
            rallySize: 0,
            troopFighter: attackPlayer.troopFighter,
            troopShooter: attackPlayer.troopShooter,
            troopRider: attackPlayer.troopRider,
            isCapitan: attackPlayer.isCapitan,
            isAttack: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstShift: false,
            secondShift: false
          };
          allAvailablePlayers.push(playerForSearch);
        }
      });
    }

    const exactMatch = allAvailablePlayers.find(player => 
      player.name.toLowerCase() === searchQuery.toLowerCase() ||
      player.alliance.toLowerCase() === searchQuery.toLowerCase()
    );

    if (exactMatch) {
      setSelectedPlayer(exactMatch);
      setShowSuggestions(false);
    } else {
      setPlayerNotFound(true);
      setSelectedPlayer(null);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchPlayers(searchQuery);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setPlayerNotFound(false);
    }
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedPlayer(null);
    setSearchResults([]);
    setShowSuggestions(false);
    setPlayerNotFound(false);
    setSearchPerformed(false);
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setSearchQuery(player.name);
    setShowSuggestions(false);
    setPlayerNotFound(false);
    setSearchPerformed(false);
  };

  const getTroopTypes = (player: Player) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  const getAttackPlayerTroopTypes = (player: IAttackPlayer) => {
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

  const findPlayerInSchedule = (player: Player) => {
    if (!selectedSchedule) return null;

    // Ищем как капитана
    const asCaptain = selectedSchedule.buildings.find(building => 
      building.capitan?.id === player.id
    );

    if (asCaptain) {
      return {
        type: 'captain',
        building: asCaptain.buildingName,
        shift: asCaptain.shift === Shift.first ? 'First' : 'Second',
        march: asCaptain.rallySize
      };
    }

    // Ищем как игрока
    for (const building of selectedSchedule.buildings) {
      const playerAssignment = building.players.find(p => p.player.id === player.id);
      if (playerAssignment) {
        return {
          type: 'player',
          building: building.buildingName,
          shift: building.shift === Shift.first ? 'First' : 'Second',
          march: playerAssignment.march
        };
      }
    }

    return null;
  };

  const isPlayerInAttack = (player: Player) => {
    if (!selectedSchedule?.attackPlayers) return false;
    
    // Проверяем по ID игрока
    return selectedSchedule.attackPlayers.some(ap => ap.id === player.id);
  };

  const renderPlayerInfo = () => {
    if (!selectedPlayer) return null;

    const scheduleInfo = findPlayerInSchedule(selectedPlayer);
    const inAttack = isPlayerInAttack(selectedPlayer);

    // Определяем, какие типы войск показывать
    let troopTypesToShow: string[] = [];
    if (scheduleInfo && scheduleInfo.type === 'player') {
      // Если игрок в защите, ищем капитана здания
      const building = selectedSchedule?.buildings.find(b => 
        b.buildingName === scheduleInfo.building && 
        b.shift === (scheduleInfo.shift === 'First' ? Shift.first : Shift.second)
      );
      if (building?.capitan?.id) {
        troopTypesToShow = getMatchingTroopTypes(selectedPlayer, building.capitan);
      } else {
        troopTypesToShow = getTroopTypes(selectedPlayer);
      }
    } else if (scheduleInfo && scheduleInfo.type === 'captain') {
      // Если игрок капитан, показываем все его типы войск
      troopTypesToShow = getTroopTypes(selectedPlayer);
    } else {
      // Если игрок не в расписании или в атаке, показываем все типы
      troopTypesToShow = getTroopTypes(selectedPlayer);
    }

    return (
      <Card className="mt-3">
        <Card.Header>
          <h6>Player Information: {selectedPlayer.name}</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Alliance:</strong> {selectedPlayer.alliance}</p>
              <p><strong>Tier:</strong> {selectedPlayer.troopTier}</p>
              <p><strong>March Size:</strong> {selectedPlayer.marchSize}</p>
              <p><strong>Troop Types:</strong> {troopTypesToShow.map(type => (
                <Badge key={type} bg="primary" className="me-1">{type}</Badge>
              ))}</p>
              {selectedPlayer.isCapitan && (
                <p><Badge bg="warning">Captain</Badge></p>
              )}
            </Col>
            <Col md={6}>
              {scheduleInfo ? (
                <div>
                  <h6>Schedule Assignment:</h6>
                  <p><strong>Building:</strong> {scheduleInfo.building}</p>
                  <p><strong>Shift:</strong> {scheduleInfo.shift}</p>
                  <p><strong>Role:</strong> {scheduleInfo.type === 'captain' ? 'Captain' : 'Player'}</p>
                  <p><strong>March:</strong> {scheduleInfo.march}</p>
                </div>
              ) : inAttack ? (
                <div>
                  <h6>Status:</h6>
                  <Badge bg="danger">Attack Player</Badge>
                  <p className="mt-2">This player is assigned to attack, not defense.</p>
                </div>
              ) : (
                <div>
                  <h6>Status:</h6>
                  <Badge bg="secondary">Not Assigned</Badge>
                  <p className="mt-2">This player is not assigned to any building or attack.</p>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // Компонент здания с пагинацией
  const BuildingWithPagination: React.FC<{
    building: IBuildings;
    shiftType: string;
    itemsPerPage: number;
  }> = ({ building, shiftType, itemsPerPage }) => {
    const [buildingPage, setBuildingPage] = useState(1);
    const totalPlayers = building.players.length;
    const needsPagination = totalPlayers > itemsPerPage;
    
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

    if (!needsPagination) {
      return (
        <Card key={`${building.buildingName}-${shiftType}`} className="mb-3">
          <Card.Header>
            <h6>{building.buildingName}</h6>
            {building.capitan?.id && (
              <div>
                <strong>Captain:</strong> ({building.capitan.alliance}) {building.capitan.name}
                <Badge bg="warning" className="ms-2">Rally: {building.rallySize}</Badge>
              </div>
            )}
          </Card.Header>
          <Card.Body>
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Troop Type</th>
                  <th>Tier</th>
                  <th>March</th>
                </tr>
              </thead>
              <tbody>
                {building.players.map(player => (
                  <tr key={player.player.id}>
                    <td>({player.player.alliance}) {player.player.name}</td>
                    <td>
                      {building.capitan?.id ? 
                        getMatchingTroopTypes(player.player, building.capitan).map(type => (
                          <Badge key={type} bg="primary" className="me-1">{type}</Badge>
                        )) :
                        getTroopTypes(player.player).map(type => (
                          <Badge key={type} bg="primary" className="me-1">{type}</Badge>
                        ))
                      }
                    </td>
                    <td>{player.player.troopTier}</td>
                    <td>{player.march}</td>
                  </tr>
                ))}
                {building.players.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">No players assigned</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      );
    }

    const startIndex = (buildingPage - 1) * itemsPerPage;
    const paginatedPlayers = building.players.slice(startIndex, startIndex + itemsPerPage);

    return (
      <Card key={`${building.buildingName}-${shiftType}`} className="mb-3">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6>{building.buildingName}</h6>
              {building.capitan?.id && (
                <div>
                  <strong>Captain:</strong> ({building.capitan.alliance}) {building.capitan.name}
                  <Badge bg="warning" className="ms-2">Rally: {building.rallySize}</Badge>
                </div>
              )}
            </div>
            <small className="text-muted">
              {totalPlayers} players - Page {buildingPage} of {getTotalPages(totalPlayers)}
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped bordered size="sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>Troop Type</th>
                <th>Tier</th>
                <th>March</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map(player => (
                <tr key={player.player.id}>
                  <td>({player.player.alliance}) {player.player.name}</td>
                  <td>
                    {building.capitan?.id ? 
                      getMatchingTroopTypes(player.player, building.capitan).map(type => (
                        <Badge key={type} bg="primary" className="me-1">{type}</Badge>
                      )) :
                      getTroopTypes(player.player).map(type => (
                        <Badge key={type} bg="primary" className="me-1">{type}</Badge>
                      ))
                    }
                  </td>
                  <td>{player.player.troopTier}</td>
                  <td>{player.march}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {renderPagination(totalPlayers, buildingPage, setBuildingPage)}
        </Card.Body>
      </Card>
    );
  };

  const renderDefenseSchedule = () => {
    if (!selectedSchedule) {
      return <Alert variant="info">No schedule available for the current event.</Alert>;
    }

    const firstShiftBuildings = selectedSchedule.buildings.filter(b => b.shift === Shift.first);
    const secondShiftBuildings = selectedSchedule.buildings.filter(b => b.shift === Shift.second);

    return (
      <div>
        <Row>
          <Col md={6}>
            <h4>First Shift</h4>
            {firstShiftBuildings.map(building => (
              <BuildingWithPagination key={building.buildingName} building={building} shiftType="first" itemsPerPage={itemsPerPage} />
            ))}
          </Col>
          <Col md={6}>
            <h4>Second Shift</h4>
            {secondShiftBuildings.map(building => (
              <BuildingWithPagination key={building.buildingName} building={building} shiftType="second" itemsPerPage={itemsPerPage} />
            ))}
          </Col>
        </Row>
      </div>
    );
  };

  const renderAttackPlayers = () => {
    if (!selectedSchedule?.attackPlayers || selectedSchedule.attackPlayers.length === 0) {
      return <Alert variant="info">No attack players available for this schedule.</Alert>;
    }

    const paginatedPlayers = getPaginatedAttackPlayers();
    const totalPlayers = selectedSchedule.attackPlayers.length;

    const renderSortableHeader = (field: SortField, label: string) => (
      <th 
        style={{ cursor: 'pointer' }}
        onClick={() => handleSort(field)}
        className="sortable-header"
      >
        {label}
        {sortField === field && (
          <span className="ms-1">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </th>
    );

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Attack Players ({totalPlayers} total)</h5>
          <small className="text-muted">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalPlayers)} of {totalPlayers}
          </small>
        </div>
        
        <Table striped bordered hover>
          <thead>
            <tr>
              {renderSortableHeader('name', 'Player')}
              <th>Troop Type</th>
              {renderSortableHeader('troopTier', 'Tier')}
              {renderSortableHeader('marchSize', 'March Size')}
              {renderSortableHeader('isCapitan', 'Captain')}
            </tr>
          </thead>
          <tbody>
            {paginatedPlayers.map(player => (
              <tr key={player.id}>
                <td>({player.alliance}) {player.name}</td>
                <td>
                  {getAttackPlayerTroopTypes(player).map(type => (
                    <Badge key={type} bg="primary" className="me-1">{type}</Badge>
                  ))}
                </td>
                <td>{player.troopTier}</td>
                <td>{player.marchSize}</td>
                <td>
                  {player.isCapitan ? (
                    <Badge bg="warning">Captain</Badge>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {renderPagination(totalPlayers, currentPage, setCurrentPage)}
      </div>
    );
  };

  // Функции сортировки и пагинации
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Сбрасываем на первую страницу при сортировке
  };

  const getSortedAttackPlayers = () => {
    if (!selectedSchedule?.attackPlayers) return [];
    
    return [...selectedSchedule.attackPlayers].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'alliance':
          aValue = a.alliance.toLowerCase();
          bValue = b.alliance.toLowerCase();
          break;
        case 'troopTier':
          aValue = a.troopTier;
          bValue = b.troopTier;
          break;
        case 'marchSize':
          aValue = a.marchSize;
          bValue = b.marchSize;
          break;
        case 'isCapitan':
          aValue = a.isCapitan ? 1 : 0;
          bValue = b.isCapitan ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getPaginatedAttackPlayers = () => {
    const sortedPlayers = getSortedAttackPlayers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPlayers.slice(startIndex, startIndex + itemsPerPage);
  };

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

    // Кнопка "Предыдущая"
    pages.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Первая страница
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

    // Страницы
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

    // Последняя страница
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

    // Кнопка "Следующая"
    pages.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return <Pagination className="justify-content-center mt-3">{pages}</Pagination>;
  };

  if (datesIsLoading || scheduleIsLoading || playersIsLoading || attackPlayersIsLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>Event Schedule</h2>
            {selectedScheduleDate && (
              <p className="text-muted">
                Event Date: {selectedScheduleDate.toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="d-flex gap-2">
            {allSchedules && allSchedules.length > 0 && (
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="schedule-dropdown">
                  Select Schedule
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {allSchedules.map(schedule => (
                    <Dropdown.Item
                      key={schedule.id}
                      onClick={() => handleScheduleSelect(schedule)}
                      active={selectedSchedule?.id === schedule.id}
                    >
                      {schedule.eventDate.toLocaleDateString()}
                      {schedule.id === currentSchedule?.id && (
                        <Badge bg="success" className="ms-2">Current</Badge>
                      )}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
            {selectedSchedule?.id !== currentSchedule?.id && currentSchedule && (
              <Button variant="primary" onClick={handleReturnToCurrent}>
                Return to Current
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Search Player</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Label>Player Name or Alliance</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Start typing player name or alliance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <Button 
                variant="primary" 
                onClick={handleManualSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
              {searchQuery && (
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClearSearch}
                >
                  Clear
                </Button>
              )}
            </div>
            {showSuggestions && (
              <ListGroup className="mt-2" style={{ position: 'absolute', zIndex: 1000, width: '100%' }}>
                {searchResults.map(player => (
                  <ListGroup.Item
                    key={player.id}
                    action
                    onClick={() => handleSelectPlayer(player)}
                    style={{ cursor: 'pointer' }}
                  >
                    ({player.alliance}) {player.name}
                    {player.isAttack && <Badge bg="danger" className="ms-2">Attack</Badge>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {playerNotFound && searchPerformed && (
              <Alert variant="warning" className="mt-2">
                Player "{searchQuery}" not found. Please check the spelling or try a different search term.
              </Alert>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Player Information */}
      {renderPlayerInfo()}

      {/* Tabs */}
      <Nav variant="tabs" className="mb-3">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'defense'} 
            onClick={() => setActiveTab('defense')}
          >
            Defense
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'attack'} 
            onClick={() => setActiveTab('attack')}
          >
            Attack
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Content */}
      <Tab.Content>
        <Tab.Pane active={activeTab === 'defense'}>
          {renderDefenseSchedule()}
        </Tab.Pane>
        <Tab.Pane active={activeTab === 'attack'}>
          {renderAttackPlayers()}
        </Tab.Pane>
      </Tab.Content>
    </div>
  );
};

// Стили для сортируемых заголовков
const styles = `
  .sortable-header:hover {
    background-color: #f8f9fa;
  }
  
  .sortable-header {
    user-select: none;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default SchedulePage;