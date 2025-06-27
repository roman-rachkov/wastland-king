import React from 'react';
import { Form } from 'react-bootstrap';

interface PlayerFiltersProps {
  playerFilter: string;
  playerIdFilter: string;
  troopTypeFilter: string;
  onPlayerFilterChange: (value: string) => void;
  onPlayerIdFilterChange: (value: string) => void;
  onTroopTypeFilterChange: (value: string) => void;
}

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
  playerFilter,
  playerIdFilter,
  troopTypeFilter,
  onPlayerFilterChange,
  onPlayerIdFilterChange,
  onTroopTypeFilterChange,
}) => {
  return (
    <>
      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Filter by Name/Alliance</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name or alliance..."
              value={playerFilter}
              onChange={(e) => onPlayerFilterChange(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Filter by Troop Type</Form.Label>
            <Form.Select
              value={troopTypeFilter}
              onChange={(e) => onTroopTypeFilterChange(e.target.value)}
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
              onChange={(e) => onPlayerIdFilterChange(e.target.value)}
            />
          </Form.Group>
        </div>
      </div>
    </>
  );
};

export default PlayerFilters; 