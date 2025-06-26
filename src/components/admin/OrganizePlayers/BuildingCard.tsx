import React, { useState } from 'react';
import { Card, Table, Button, Badge, Pagination } from 'react-bootstrap';
import { IBuildings, IAttackPlayer } from '../../../types/Buildings';
import { getTroopTypes, getMatchingTroopTypes } from '../../../utils/organizeHelpers';

interface BuildingCardProps {
  building: IBuildings;
  keyPostfix: string;
  onEdit?: (building: IBuildings) => void;
  onClear?: (building: IBuildings) => void;
  attackPlayers: IAttackPlayer[];
  itemsPerPage: number;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ 
  building, 
  keyPostfix, 
  onEdit, 
  onClear, 
  attackPlayers, 
  itemsPerPage
}) => {
  const totalUnits = building.players.reduce((acc, pl) => acc += pl.march, 0);
  const hasCaptain = building.capitan && building.capitan.id;
  const totalPlayers = building.players.length;
  const needsPagination = totalPlayers > itemsPerPage;
  
  const [buildingPage, setBuildingPage] = useState(1);
  const startIndex = (buildingPage - 1) * itemsPerPage;
  const paginatedPlayers = building.players.slice(startIndex, startIndex + itemsPerPage);
  
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

  const playersToDisplay = needsPagination ? paginatedPlayers : building.players;

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
                    <strong>Captain Troop Types:</strong> {getTroopTypes(building.capitan).map(type => (
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
            {onEdit && (
              <Button 
                size="sm" 
                variant="outline-primary"
                onClick={() => onEdit(building)}
                className="me-2"
              >
                Edit
              </Button>
            )}
            {onClear && (
              <Button 
                size="sm" 
                variant="outline-danger"
                onClick={() => onClear(building)}
              >
                Clear
              </Button>
            )}
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
        <Table striped size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Player</th>
              <th>Troop Type</th>
              <th>Tier</th>
              <th>March</th>
            </tr>
          </thead>
          <tbody>
            {playersToDisplay.map(pl => (
              <tr key={pl.player.id}>
                <td>
                  ({pl.player.alliance}){pl.player.name}
                  {Array.isArray(attackPlayers) && attackPlayers.length > 0 && attackPlayers.some(a => String(a.id) === String(pl.player.id)) && (
                    <Badge bg="danger" className="ms-1">Attack</Badge>
                  )}
                </td>
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
                <td>
                  {pl.march}
                  {pl.wasNormalized && (
                    <Badge bg="warning" className="ms-1" title="March size was normalized (multiplied by 1000)">
                      ⚠
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
            {playersToDisplay.length === 0 && (
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
      {needsPagination && renderPagination(totalPlayers, buildingPage, setBuildingPage)}
    </Card>
  );
};

export default BuildingCard; 