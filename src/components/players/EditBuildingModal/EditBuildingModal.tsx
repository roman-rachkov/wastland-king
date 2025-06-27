import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { IBuildings, Shift, IAttackPlayer } from '../../../types/Buildings';
import { Player } from '../../../types/Player';
import { normalizeMarchSize } from '../../../utils/organizeUtils';
import CaptainSelector from './CaptainSelector';
import PlayerFilters from './PlayerFilters';
import PlayersTable from './PlayersTable';
import RallySizeInput from './RallySizeInput';
import TotalMarchDisplay from './TotalMarchDisplay';

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
        // Добавляем капитана в отдельный список только если он не доступен для обеих смен
        if (otherBuilding.capitan?.id) {
          const captain = availablePlayers.find(p => p.id === otherBuilding.capitan.id);
          // Исключаем капитана только если он не доступен для обеих смен
          if (captain && !(captain.firstShift && captain.secondShift)) {
            newAssignedCaptainIds.add(otherBuilding.capitan.id);
          }
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
      .filter(p => {
        if (!p.isCapitan) return false;
        
        // Проверяем доступность для текущей смены
        let isAvailableForShift = false;
        
        if (shiftCount === 2) {
          // Для 2 смен: firstShift = смена 1, secondShift = смена 2
          isAvailableForShift = shiftKey && p[shiftKey] || (p.firstShift && p.secondShift);
        } else {
          // Для 4 смен: firstShift = смены 1-2, secondShift = смены 3-4
          if (building.shift === Shift.first || building.shift === Shift.second) {
            // Смены 1-2
            isAvailableForShift = p.firstShift || (p.firstShift && p.secondShift);
          } else {
            // Смены 3-4
            isAvailableForShift = p.secondShift || (p.firstShift && p.secondShift);
          }
        }
        
        if (!isAvailableForShift) return false;
        
        // Исключаем капитанов, которые уже назначены в другие здания в той же смене
        // Но только если они не доступны для обеих смен
        if (assignedCaptainIds.has(p.id)) {
          // Если капитан доступен для обеих смен, проверяем, назначен ли он в той же смене
          if (p.firstShift && p.secondShift) {
            // Для капитанов, доступных для обеих смен, проверяем только назначения в той же смене
            const isAssignedInSameShift = allBuildings.some(b => 
              b.shift === building.shift && 
              b.capitan?.id === p.id &&
              !(b.buildingName === building.buildingName && b.shift === building.shift)
            );
            if (isAssignedInSameShift) return false;
          } else {
            return false;
          }
        }
        
        // Исключаем капитанов, которые уже назначены как игроки в другие здания
        if (assignedPlayerIds.has(p.id)) return false;
        
        // Исключаем капитанов, которые выбраны как игроки в текущем здании
        if (currentSelectedPlayerIds.has(p.id)) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Сортируем по приоритету: сначала тир, потом размер марша
        if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
        return normalizeMarchSize(b.rallySize || 0).value - normalizeMarchSize(a.rallySize || 0).value;
      });
  }, [building.shift, availablePlayers, assignedCaptainIds, assignedPlayerIds, selectedPlayers, allBuildings, shiftCount]);

  const getCaptainInfo = (captain: Player) => {
    if (!captain) return null;
    
    const troopTypes = getTroopTypes(captain);
    return (
      <div className="mt-2">
        <small className="text-muted">
          <strong>Troop Types:</strong> {troopTypes.map(type => (
            <span key={type} className="badge bg-primary me-1">
              {type}
            </span>
          ))}
          <span className="badge bg-secondary ms-2">Tier: {captain.troopTier}</span>
          <span className="badge bg-info ms-2">March: {captain.marchSize}</span>
          <span className="badge bg-warning ms-2">Rally: {captain.rallySize}</span>
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
      // Но исключаем капитанов, доступных для обеих смен
      const assignedCaptainPlayerIds = new Set(
        allBuildings
          .filter(b => b.shift === shift && b.capitan && b.capitan.id && !(b.buildingName === building.buildingName && b.shift === building.shift))
          .map(b => b.capitan.id)
          .filter(captainId => {
            const captain = allPlayers.find(p => p.id === captainId);
            // Исключаем капитанов, доступных для обеих смен
            return captain && !(captain.firstShift && captain.secondShift);
          })
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
        let isAvailableForShift = false;
        
        if (shiftCount === 2) {
          // Для 2 смен: firstShift = смена 1, secondShift = смена 2
          isAvailableForShift = shiftKey && p[shiftKey] || (p.firstShift && p.secondShift);
        } else {
          // Для 4 смен: firstShift = смены 1-2, secondShift = смены 3-4
          if (shift === Shift.first || shift === Shift.second) {
            // Смены 1-2
            isAvailableForShift = p.firstShift || (p.firstShift && p.secondShift);
          } else {
            // Смены 3-4
            isAvailableForShift = p.secondShift || (p.firstShift && p.secondShift);
          }
        }
        
        if (!isAvailableForShift) {
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

    return filteredPlayers;
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
          <CaptainSelector
            selectedCaptain={selectedCaptain}
            captains={captains}
            attackPlayers={attackPlayers}
            onCaptainChange={handleCaptainChange}
            getTroopTypes={getTroopTypes}
            getCaptainInfo={getCaptainInfo}
          />

          <RallySizeInput
            rallySize={rallySize}
            onRallySizeChange={setRallySize}
          />

          <div className="mb-3">
            <h6>Available Players {!selectedCaptain && '(including available captains)'}</h6>
            
            <PlayerFilters
              playerFilter={playerFilter}
              playerIdFilter={playerIdFilter}
              troopTypeFilter={troopTypeFilter}
              onPlayerFilterChange={setPlayerFilter}
              onPlayerIdFilterChange={setPlayerIdFilter}
              onTroopTypeFilterChange={setTroopTypeFilter}
            />

            <PlayersTable
              players={players}
              selectedPlayers={selectedPlayers}
              attackPlayers={attackPlayers}
              selectedCaptain={selectedCaptain}
              onPlayerToggle={handlePlayerToggle}
              onMarchChange={handleMarchChange}
              getTroopTypes={getTroopTypes}
            />
          </div>

          <TotalMarchDisplay
            totalMarch={totalMarch}
            rallySize={rallySize}
          />
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