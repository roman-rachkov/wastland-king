import React, { useState, useMemo } from 'react';
import { Table, Form, Badge, Alert } from 'react-bootstrap';
import { Player } from '../../../types/Player';
import { IAttackPlayer } from '../../../types/Buildings';
import { normalizeMarchSize } from '../../../utils/organizeUtils';
import './PlayersTable.scss';

interface PlayersTableProps {
  players: Player[];
  selectedPlayers: { playerId: string; march: number }[];
  attackPlayers: IAttackPlayer[];
  selectedCaptain: string;
  onPlayerToggle: (playerId: string) => void;
  onMarchChange: (playerId: string, march: number) => void;
  getTroopTypes: (player: Player) => string[];
}

type SortField = 'id' | 'name' | 'troopType' | 'tier' | 'marchSize' | 'assignedMarch';
type SortDirection = 'asc' | 'desc';

const PlayersTable: React.FC<PlayersTableProps> = ({
  players,
  selectedPlayers,
  attackPlayers,
  selectedCaptain,
  onPlayerToggle,
  onMarchChange,
  getTroopTypes,
}) => {
  const [sortField, setSortField] = useState<SortField>('tier');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Функция для получения короткого ID (последние 4 символа)
  const getShortId = (id: string) => {
    return id.length > 4 ? id.slice(-4) : id;
  };

  // Функция для сортировки
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Функция для получения значения для сортировки
  const getSortValue = (player: Player, field: SortField) => {
    switch (field) {
      case 'id':
        return player.id;
      case 'name':
        return player.name.toLowerCase();
      case 'troopType':
        return getTroopTypes(player).join(', ').toLowerCase();
      case 'tier':
        return player.troopTier || 0;
      case 'marchSize':
        return normalizeMarchSize(player.marchSize).value;
      case 'assignedMarch':
        const selectedPlayer = selectedPlayers.find(p => p.playerId === player.id);
        return selectedPlayer?.march || 0;
      default:
        return '';
    }
  };

  // Сортированные игроки
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aValue = getSortValue(a, sortField);
      const bValue = getSortValue(b, sortField);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [players, sortField, sortDirection, selectedPlayers, getTroopTypes]);

  // Компонент для заголовка с сортировкой
  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={() => handleSort(field)}
      className="sortable-header"
    >
      {children}
      {sortField === field && (
        <span className="ms-1">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </th>
  );

  if (players.length === 0) {
    return (
      <Alert variant="info">
        {selectedCaptain ? 
          'No available players or captains for this shift with matching troop types to the selected captain.' :
          'No available players for this shift. All players and captains are already assigned to other buildings in this shift.'
        }
      </Alert>
    );
  }

  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>Select</th>
          <SortableHeader field="id">ID</SortableHeader>
          <SortableHeader field="name">Player</SortableHeader>
          <SortableHeader field="troopType">Troop Type</SortableHeader>
          <SortableHeader field="tier">Tier</SortableHeader>
          <SortableHeader field="marchSize">March Size</SortableHeader>
          <SortableHeader field="assignedMarch">Assigned March</SortableHeader>
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map(player => {
          const isSelected = selectedPlayers.find(p => p.playerId === player.id);
          const assignedMarch = isSelected?.march || 0;
          
          return (
            <tr key={player.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={!!isSelected}
                  onChange={() => onPlayerToggle(player.id)}
                />
              </td>
              <td>
                <small className="text-muted" title={player.id}>
                  {getShortId(player.id)}
                </small>
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
                    onChange={(e) => onMarchChange(player.id, Number(e.target.value))}
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
  );
};

export default PlayersTable; 