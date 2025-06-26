import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Alert, Badge } from 'react-bootstrap';
import { IBuildings, Shift, IAttackPlayer } from '../../../types/Buildings';
import { Player } from '../../../types/Player';
import { normalizeMarchSize } from '../../../utils/organizeUtils';

interface EditBuildingModalProps {
  show: boolean;
  onHide: () => void;
  building: IBuildings;
  availablePlayers: Player[];
  onSave: (building: IBuildings) => void;
  allBuildings?: IBuildings[];
  attackPlayers?: IAttackPlayer[];
  shiftCount?: number;
}

const EditBuildingModal: React.FC<EditBuildingModalProps> = ({
  show,
  onHide,
  building,
  availablePlayers,
  onSave,
  allBuildings = [],
  attackPlayers = [],
  shiftCount = 2,
}) => {
  const [editedBuilding, setEditedBuilding] = useState<IBuildings>(building);
  const [selectedCaptain, setSelectedCaptain] = useState<string>(building.capitan?.id || '');
  const [selectedPlayers, setSelectedPlayers] = useState<{ playerId: string; march: number }[]>(
    building.players.map(p => ({ playerId: p.player.id, march: p.march }))
  );
  const [rallySize, setRallySize] = useState<number>(building.rallySize || 0);
  const [error, setError] = useState<string>('');
  const [excludedPlayers, setExcludedPlayers] = useState<string[]>([]);
  const [assignedPlayerIds, setAssignedPlayerIds] = useState<Set<string>>(new Set());
  const [assignedCaptainIds, setAssignedCaptainIds] = useState<Set<string>>(new Set());
  const [playerFilter, setPlayerFilter] = useState<string>('');
  const [playerIdFilter, setPlayerIdFilter] = useState<string>('');
  const [troopTypeFilter, setTroopTypeFilter] = useState<string>('');

  // Функция для обновления списков назначенных игроков и капитанов
  const updateAssignedLists = () => {
    const newAssignedPlayerIds = new Set<string>();
    const newAssignedCaptainIds = new Set<string>();

    allBuildings.forEach(otherBuilding => {
      // Пропускаем текущее здание
      if (otherBuilding.buildingName === building.buildingName && otherBuilding.shift === building.shift) {
        return;
      }
      
      // Если здание в той же смене, добавляем всех игроков в список исключенных
      if (otherBuilding.shift === building.shift) {
        // Добавляем капитана в отдельный список
        if (otherBuilding.capitan?.id) {
          newAssignedCaptainIds.add(otherBuilding.capitan.id);
        }
        // Добавляем обычных игроков
        otherBuilding.players.forEach(p => {
          newAssignedPlayerIds.add(p.player.id);
        });
      }
    });

    setAssignedPlayerIds(newAssignedPlayerIds);
    setAssignedCaptainIds(newAssignedCaptainIds);
  };

  useEffect(() => {
    setEditedBuilding(building);
    setSelectedCaptain(building.capitan?.id || '');
    setSelectedPlayers(building.players.map(p => ({ playerId: p.player.id, march: p.march })));
    setRallySize(building.rallySize || 0);
    setError('');
    setExcludedPlayers([]);
    setPlayerFilter('');
    setPlayerIdFilter('');
    setTroopTypeFilter('');
    updateAssignedLists();
  }, [building, allBuildings]);

  // Пересчитываем список игроков при изменении выбранного капитана
  useEffect(() => {
    // Очищаем список исключенных игроков при смене капитана
    setExcludedPlayers([]);
  }, [selectedCaptain]);

  const getTroopTypes = (player: Player) => {
    if (!player) return [];
    
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  const captains = React.useMemo(() => {
    const shiftKey = building.shift === Shift.first ? 'firstShift' : 'secondShift';
    
    // Получаем ID игроков, выбранных в текущем здании
    const currentSelectedPlayerIds = new Set(selectedPlayers.map(sp => sp.playerId));
    
    return availablePlayers
      .filter(p => 
        p.isCapitan && 
        (p[shiftKey] || (p.firstShift && p.secondShift)) &&
        !assignedCaptainIds.has(p.id) &&
        !assignedPlayerIds.has(p.id) && // Исключаем капитанов, которые уже назначены как игроки в другие здания
        !currentSelectedPlayerIds.has(p.id) // Исключаем капитанов, которые выбраны как игроки в текущем здании
      )
      .sort((a, b) => {
        // Сортируем по приоритету: сначала тир, потом размер марша
        if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
        return normalizeMarchSize(b.rallySize || 0).value - normalizeMarchSize(a.rallySize || 0).value;
      });
  }, [building.shift, availablePlayers, assignedCaptainIds, assignedPlayerIds, selectedPlayers]);

  const getCaptainInfo = (captain: Player) => {
    if (!captain) return null;
    
    const troopTypes = getTroopTypes(captain);
    return (
      <div className="mt-2">
        <small className="text-muted">
          <strong>Troop Types:</strong> {troopTypes.map(type => (
            <Badge key={type} bg="primary" className="me-1">
              {type}
            </Badge>
          ))}
          <Badge bg="secondary" className="ms-2">Tier: {captain.troopTier}</Badge>
          <Badge bg="info" className="ms-2">March: {captain.marchSize}</Badge>
          <Badge bg="warning" className="ms-2">Rally: {captain.rallySize}</Badge>
        </small>
      </div>
    );
  };

  const players = React.useMemo(() => {
    // Создаем специальную функцию для модалки, которая включает игроков из текущего здания
    const getAvailablePlayersForModal = (
      building: IBuildings,
      allBuildings: IBuildings[],
      allPlayers: Player[],
      selectedCaptainId?: string,
      shiftCount: number = 2
    ): Player[] => {
      // Get building captain
      const currentCaptain = selectedCaptainId
        ? allPlayers.find(p => p.id === selectedCaptainId)
        : building.capitan && building.capitan.id
          ? allPlayers.find(p => p.id === building.capitan.id)
          : undefined;
      
      // Captain troop types
      const captainTroopTypes = currentCaptain
        ? [
            currentCaptain.troopFighter && 'Fighter',
            currentCaptain.troopShooter && 'Shooter',
            currentCaptain.troopRider && 'Rider',
          ].filter(Boolean)
        : [];
      
      // Determine shiftKey
      const shift = building.shift;
      const shiftKey =
        shiftCount === 2
          ? (shift === Shift.first ? 'firstShift' : 'secondShift')
          : (shift === 1 || shift === 2 ? 'firstShift' : 'secondShift');
      
      // Collect player IDs already assigned to OTHER buildings in the same shift (as regular players)
      const assignedPlayerIds = new Set(
        allBuildings
          .filter(b => b.shift === shift && !(b.buildingName === building.buildingName && b.shift === building.shift))
          .flatMap(b => b.players.map(p => p.player.id))
      );

      // Collect captain IDs assigned to OTHER buildings in the same shift
      const assignedCaptainPlayerIds = new Set(
        allBuildings
          .filter(b => b.shift === shift && b.capitan && b.capitan.id && !(b.buildingName === building.buildingName && b.shift === building.shift))
          .map(b => b.capitan.id)
      );

      // Combine all player IDs already occupied in OTHER buildings in this shift
      const allAssignedInOtherBuildings = new Set([...assignedPlayerIds, ...assignedCaptainPlayerIds]);

      // Filter suitable players
      const filteredPlayers = allPlayers.filter(p => {
        if (!p.id) {
          return false;
        }
        
        // Exclude selected captain
        if (selectedCaptainId && p.id === selectedCaptainId) {
          return false;
        }
        
        // Exclude players already assigned in OTHER buildings in the same shift
        if (allAssignedInOtherBuildings.has(p.id)) {
          return false;
        }
        
        // Check availability for the shift
        if (!(shiftKey && p[shiftKey] || (p.firstShift && p.secondShift))) {
          return false;
        }
        
        // If captain is not selected, show all
        if (!currentCaptain || captainTroopTypes.length === 0) {
          return true;
        }
        
        // Filter by troop type
        const playerTroopTypes = [
          p.troopFighter && 'Fighter',
          p.troopShooter && 'Shooter',
          p.troopRider && 'Rider',
        ].filter(Boolean);
        
        const hasMatchingTroopType = playerTroopTypes.some(type => captainTroopTypes.includes(type));
        
        return hasMatchingTroopType;
      });
      
      return filteredPlayers;
    };

    let filteredPlayers = getAvailablePlayersForModal(
      building,
      allBuildings,
      availablePlayers,
      selectedCaptain,
      shiftCount
    );

    // Применяем фильтры
    if (playerFilter) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.name.toLowerCase().includes(playerFilter.toLowerCase()) ||
        player.alliance.toLowerCase().includes(playerFilter.toLowerCase())
      );
    }

    if (playerIdFilter) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.id.toLowerCase().includes(playerIdFilter.toLowerCase())
      );
    }

    if (troopTypeFilter) {
      filteredPlayers = filteredPlayers.filter(player => {
        const playerTroopTypes = getTroopTypes(player);
        return playerTroopTypes.some(type => 
          type.toLowerCase().includes(troopTypeFilter.toLowerCase())
        );
      });
    }

    return filteredPlayers.sort((a, b) => (b.troopTier || 0) - (a.troopTier || 0));
  }, [selectedCaptain, building, availablePlayers, allBuildings, shiftCount, playerFilter, playerIdFilter, troopTypeFilter]);

  const handleCaptainChange = (captainId: string) => {
    const newCaptain = availablePlayers.find(p => p.id === captainId);
    const oldCaptainId = selectedCaptain;
    
    setSelectedCaptain(captainId);
    setRallySize(newCaptain ? normalizeMarchSize(newCaptain.rallySize || 0).value : 0);
    
    // Очищаем список исключенных игроков при смене капитана
    setExcludedPlayers([]);
    
    // Удаляем старого капитана из списка выбранных игроков
    setSelectedPlayers(prev => {
      let filtered = prev.filter(sp => sp.playerId !== oldCaptainId);
      
      // Удаляем нового капитана из списка выбранных игроков (если он там был)
      filtered = filtered.filter(sp => sp.playerId !== captainId);
      
      return filtered;
    });
    
    if (newCaptain) {
      const captainTroopTypes = getTroopTypes(newCaptain);
      
      if (captainTroopTypes.length > 0) {
        const excluded: string[] = [];
        
        setSelectedPlayers(prev => {
          const filtered = prev.filter(sp => {
            const player = availablePlayers.find(p => p.id === sp.playerId);
            if (!player) return false;
            
            const playerTroopTypes = getTroopTypes(player);
            const hasMatchingTroopType = playerTroopTypes.some(type => 
              captainTroopTypes.includes(type)
            );
            
            if (!hasMatchingTroopType) {
              excluded.push(player.name);
            }
            
            return hasMatchingTroopType;
          });
          
          setExcludedPlayers(excluded);
          return filtered;
        });
      } else {
        setExcludedPlayers([]);
      }
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => {
      const exists = prev.find(p => p.playerId === playerId);
      if (exists) {
        return prev.filter(p => p.playerId !== playerId);
      } else {
        const player = availablePlayers.find(p => p.id === playerId);
        const marchSize = player ? normalizeMarchSize(player.marchSize).value : 0;
        return [...prev, { playerId, march: marchSize }];
      }
    });
  };

  const handleMarchChange = (playerId: string, march: number) => {
    setSelectedPlayers(prev => 
      prev.map(p => p.playerId === playerId ? { ...p, march } : p)
    );
  };

  const handleSave = () => {
    if (!selectedCaptain) {
      setError('Please select a captain');
      return;
    }

    const captain = availablePlayers.find(p => p.id === selectedCaptain);
    if (!captain) {
      setError('Selected captain not found');
      return;
    }

    const updatedBuilding: IBuildings = {
      ...editedBuilding,
      capitan: captain,
      rallySize,
      players: selectedPlayers.map(sp => {
        const player = availablePlayers.find(p => p.id === sp.playerId);
        if (!player) {
          throw new Error(`Player with id ${sp.playerId} not found`);
        }
        const normalizedMarch = normalizeMarchSize(player.marchSize);
        return { 
          player, 
          march: sp.march,
          wasNormalized: normalizedMarch.wasNormalized
        };
      })
    };

    onSave(updatedBuilding);
    onHide();
  };

  const handleClearBuilding = () => {
    if (window.confirm('Are you sure you want to clear this building? This will remove all captain and player assignments.')) {
      const clearedBuilding: IBuildings = {
        ...editedBuilding,
        capitan: {} as Player,
        rallySize: 0,
        players: []
      };
      onSave(clearedBuilding);
      onHide();
    }
  };

  const totalMarch = selectedPlayers.reduce((sum, p) => sum + p.march, 0);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Building: {building.buildingName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {excludedPlayers.length > 0 && (
          <Alert variant="warning">
            <strong>Players removed due to troop type mismatch:</strong>
            <ul className="mb-0 mt-2">
              {excludedPlayers.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </Alert>
        )}

        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Available Captains</Form.Label>
            <Form.Select 
              value={selectedCaptain} 
              onChange={(e) => handleCaptainChange(e.target.value)}
            >
              <option value="">Select captain</option>
              {captains.map(captain => {
                const troopTypes = getTroopTypes(captain);
                const troopTypesText = troopTypes.length > 0 ? ` - ${troopTypes.join(', ')}` : '';
                return (
                  <option key={captain.id} value={captain.id}>
                    {captain.name} ({captain.alliance}) - Tier: {captain.troopTier}, Rally: {captain.rallySize}
                    {troopTypesText}
                    {attackPlayers.some(a => String(a.id) === String(captain.id)) && ' [Attack]'}
                  </option>
                );
              })}
            </Form.Select>
            {captains.length === 0 && (
              <Alert variant="warning" className="mt-2">
                No available captains for this shift. All captains are already assigned to other buildings.
              </Alert>
            )}
            {selectedCaptain && (
              <div className="mt-2">
                {(() => {
                  const captain = captains.find(c => c.id === selectedCaptain);
                  return captain ? getCaptainInfo(captain) : null;
                })()}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rally Size</Form.Label>
            <Form.Control
              type="number"
              value={rallySize}
              onChange={(e) => setRallySize(Number(e.target.value))}
              min="0"
            />
          </Form.Group>

          <div className="mb-3">
            <h6>Available Players {!selectedCaptain && '(including available captains)'}</h6>
            
            {/* Фильтры для игроков */}
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Filter by Name/Alliance</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or alliance..."
                    value={playerFilter}
                    onChange={(e) => setPlayerFilter(e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Filter by Troop Type</Form.Label>
                  <Form.Select
                    value={troopTypeFilter}
                    onChange={(e) => setTroopTypeFilter(e.target.value)}
                  >
                    <option value="">All troop types</option>
                    <option value="Fighter">Fighter</option>
                    <option value="Shooter">Shooter</option>
                    <option value="Rider">Rider</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Filter by Player ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by ID..."
                    value={playerIdFilter}
                    onChange={(e) => setPlayerIdFilter(e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>

            {players.length === 0 ? (
              <Alert variant="info">
                {selectedCaptain ? 
                  'No available players or captains for this shift with matching troop types to the selected captain.' :
                  'No available players for this shift. All players and captains are already assigned to other buildings in this shift.'
                }
              </Alert>
            ) : (
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Player</th>
                    <th>Troop Type</th>
                    <th>Tier</th>
                    <th>March Size</th>
                    <th>Assigned March</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => {
                    const isSelected = selectedPlayers.find(p => p.playerId === player.id);
                    const assignedMarch = isSelected?.march || 0;
                    
                    return (
                      <tr key={player.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => handlePlayerToggle(player.id)}
                          />
                        </td>
                        <td>
                          {player.name} ({player.alliance})
                          {attackPlayers.some(a => String(a.id) === String(player.id)) && (
                            <Badge bg="danger" className="ms-1">Attack</Badge>
                          )}
                        </td>
                        <td>
                          {getTroopTypes(player).map(type => (
                            <Badge key={type} bg="primary" className="me-1">
                              {type}
                            </Badge>
                          ))}
                        </td>
                        <td>
                          <Badge bg="secondary">{player.troopTier}</Badge>
                        </td>
                        <td>{normalizeMarchSize(player.marchSize).value}</td>
                        <td>
                          {isSelected && (
                            <Form.Control
                              type="number"
                              value={assignedMarch}
                              onChange={(e) => handleMarchChange(player.id, Number(e.target.value))}
                              min="0"
                              max={normalizeMarchSize(player.marchSize).value}
                              size="sm"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>

          <Alert variant="info">
            <strong>Total March Size:</strong> {totalMarch} / {rallySize}
            {totalMarch > rallySize && (
              <div className="text-danger mt-1">
                Overflow by {totalMarch - rallySize} units!
              </div>
            )}
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClearBuilding} className="me-auto">
          Clear Building
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBuildingModal; 