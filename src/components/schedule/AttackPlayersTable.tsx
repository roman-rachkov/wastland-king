import React, { useState } from 'react';
import { Table, Badge, Form, Pagination } from 'react-bootstrap';
import { IAttackPlayer } from '../../types/Buildings';

type SortField = 'name' | 'alliance' | 'troopTier' | 'marchSize' | 'isCapitan';
type SortDirection = 'asc' | 'desc';

interface AttackPlayersTableProps {
  attackPlayers: IAttackPlayer[];
  scheduleSettings: { shiftDuration: number; allowAttackPlayersInDefense: boolean };
  isAttackPlayerInDefense: (attackPlayer: IAttackPlayer) => boolean;
  itemsPerPage: number;
}

const AttackPlayersTable: React.FC<AttackPlayersTableProps> = ({
  attackPlayers,
  scheduleSettings,
  isAttackPlayerInDefense,
  itemsPerPage,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showOnlyPureAttackPlayers, setShowOnlyPureAttackPlayers] = useState(false);

  if (!attackPlayers || attackPlayers.length === 0) {
    return <div className="text-center p-4">No attack players available for this schedule.</div>;
  }

  const getAttackPlayerTroopTypes = (player: IAttackPlayer) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortedAttackPlayers = () => {
    let filteredPlayers = [...attackPlayers];
    
    // Фильтруем игроков если включен переключатель
    if (showOnlyPureAttackPlayers) {
      filteredPlayers = filteredPlayers.filter(attackPlayer => !isAttackPlayerInDefense(attackPlayer));
    }
    
    return filteredPlayers.sort((a, b) => {
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

  const paginatedPlayers = getPaginatedAttackPlayers();
  const totalPlayers = getSortedAttackPlayers().length;
  const totalOriginalPlayers = attackPlayers.length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>Attack Players ({totalPlayers} of {totalOriginalPlayers})</h5>
          {scheduleSettings.allowAttackPlayersInDefense && (
            <Form.Check
              type="switch"
              id="show-only-pure-attack"
              label="Show only players not assigned to defense"
              checked={showOnlyPureAttackPlayers}
              onChange={(e) => {
                setShowOnlyPureAttackPlayers(e.target.checked);
                setCurrentPage(1);
              }}
              className="mt-2"
            />
          )}
        </div>
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
          {paginatedPlayers.map(player => {
            const inDefense = isAttackPlayerInDefense(player);
            return (
              <tr key={player.id}>
                <td>
                  ({player.alliance}) {player.name}
                  {inDefense && (
                    <Badge bg="success" className="ms-1">Also in Defense</Badge>
                  )}
                </td>
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
            );
          })}
        </tbody>
      </Table>
      
      {renderPagination(totalPlayers, currentPage, setCurrentPage)}
    </div>
  );
};

export default AttackPlayersTable; 