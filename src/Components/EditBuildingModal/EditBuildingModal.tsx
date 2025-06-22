import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Alert, Badge } from 'react-bootstrap';
import { IBuildings, Shift } from '../../types/Buildings';
import { Player } from '../../types/Player';

interface EditBuildingModalProps {
  show: boolean;
  onHide: () => void;
  building: IBuildings;
  availablePlayers: Player[];
  onSave: (building: IBuildings) => void;
  allBuildings?: IBuildings[];
}

const EditBuildingModal: React.FC<EditBuildingModalProps> = ({
  show,
  onHide,
  building,
  availablePlayers,
  onSave,
  allBuildings = []
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
  const [previousCaptainId, setPreviousCaptainId] = useState<string>('');

  // Функция для нормализации размера марша - если число меньше 100000, умножаем на 1000
  const normalizeMarchSize = (size: number): number => {
    if (size < 100000 && size > 0) {
      return size * 1000;
    }
    return size;
  };

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
        return normalizeMarchSize(b.rallySize || 0) - normalizeMarchSize(a.rallySize || 0);
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
        </small>
      </div>
    );
  };

  const players = React.useMemo(() => {
    const shiftKey = building.shift === Shift.first ? 'firstShift' : 'secondShift';
    
    // Получаем типы войск выбранного капитана
    const currentCaptain = availablePlayers.find(p => p.id === selectedCaptain);
    const captainTroopTypes = currentCaptain ? getTroopTypes(currentCaptain) : [];

    return availablePlayers.filter(p => {
      if (!p) return false;
      
      // Исключаем выбранного капитана из списка игроков
      if (p.id === selectedCaptain) {
        return false;
      }
      
      const isAvailableForShift = 
        (p[shiftKey] || (p.firstShift && p.secondShift)) &&
        !assignedPlayerIds.has(p.id);
      
      if (!isAvailableForShift) return false;
      
      // Если капитан не выбран, показываем всех игроков (включая капитанов, которые не назначены как капитаны)
      if (!currentCaptain || captainTroopTypes.length === 0) {
        // Исключаем капитанов, которые уже назначены как капитаны в другие здания
        // НО не исключаем предыдущего капитана
        if (p.isCapitan && assignedCaptainIds.has(p.id)) {
          // Проверяем, не является ли это предыдущим капитаном
          if (p.id === previousCaptainId) {
            return true; // Предыдущий капитан должен быть доступен как игрок
          }
          return false;
        }
        return true;
      }
      
      // Если капитан выбран, показываем обычных игроков и капитанов, которые не назначены как капитаны
      if (p.isCapitan) {
        // Исключаем капитанов, которые уже назначены как капитаны в другие здания
        // НО не исключаем предыдущего капитана
        if (assignedCaptainIds.has(p.id)) {
          // Проверяем, не является ли это предыдущим капитаном
          if (p.id === previousCaptainId) {
            // Предыдущий капитан должен подчиняться логике фильтрации по типу войск
            const playerTroopTypes = getTroopTypes(p);
            const hasMatchingTroopType = playerTroopTypes.some(type => 
              captainTroopTypes.includes(type)
            );
            return hasMatchingTroopType;
          }
          return false;
        }
        // Капитаны как игроки должны подчиняться той же логике фильтрации по типу войск
        const playerTroopTypes = getTroopTypes(p);
        const hasMatchingTroopType = playerTroopTypes.some(type => 
          captainTroopTypes.includes(type)
        );
        return hasMatchingTroopType;
      }
      
      // Фильтруем обычных игроков по типу войск капитана
      const playerTroopTypes = getTroopTypes(p);
      const hasMatchingTroopType = playerTroopTypes.some(type => 
        captainTroopTypes.includes(type)
      );
      
      return hasMatchingTroopType;
    }).sort((a, b) => (b.troopTier || 0) - (a.troopTier || 0)); // Сортируем по тиру (по убыванию)
  }, [selectedCaptain, building, availablePlayers, assignedPlayerIds, assignedCaptainIds, previousCaptainId]);

  const handleCaptainChange = (captainId: string) => {
    const newCaptain = availablePlayers.find(p => p.id === captainId);
    const oldCaptainId = selectedCaptain;
    
    setPreviousCaptainId(oldCaptainId);
    setSelectedCaptain(captainId);
    setRallySize(newCaptain ? normalizeMarchSize(newCaptain.rallySize || 0) : 0);
    
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
        return [...prev, { playerId, march: player?.marchSize || 0 }];
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
      setError('Captain must be selected');
      return;
    }

    const captain = availablePlayers.find(p => p.id === selectedCaptain);
    if (!captain) {
      setError('Captain not found');
      return;
    }

    const totalMarch = selectedPlayers.reduce((sum, p) => sum + p.march, 0);
    if (totalMarch > rallySize) {
      setError(`Total march size (${totalMarch}) exceeds rally size (${rallySize})`);
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
        return { player, march: sp.march };
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
                const normalizedRallySize = normalizeMarchSize(captain.rallySize || 0);
                return (
                  <option key={captain.id} value={captain.id}>
                    ({captain.alliance}) {captain.name} - Rally: {normalizedRallySize} - Tier: {captain.troopTier}{troopTypesText}
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
                          ({player.alliance}) {player.name}
                          {player.isCapitan && <Badge bg="warning" className="ms-1">Captain</Badge>}
                          <br />
                          <small className="text-muted">Tier: {player.troopTier}</small>
                        </td>
                        <td>
                          {getTroopTypes(player).map(type => (
                            <Badge key={type} bg="primary" className="me-1">
                              {type}
                            </Badge>
                          ))}
                        </td>
                        <td>{normalizeMarchSize(player.marchSize)}</td>
                        <td>
                          {isSelected && (
                            <Form.Control
                              type="number"
                              value={assignedMarch}
                              onChange={(e) => handleMarchChange(player.id, Number(e.target.value))}
                              min="0"
                              max={normalizeMarchSize(player.marchSize)}
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