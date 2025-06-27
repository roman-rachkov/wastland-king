import React from 'react';
import { Form, Alert } from 'react-bootstrap';
import { Player } from '../../../types/Player';
import { IAttackPlayer } from '../../../types/Buildings';

interface CaptainSelectorProps {
  selectedCaptain: string;
  captains: Player[];
  attackPlayers: IAttackPlayer[];
  onCaptainChange: (captainId: string) => void;
  getTroopTypes: (player: Player) => string[];
  getCaptainInfo: (captain: Player) => React.ReactNode;
}

const CaptainSelector: React.FC<CaptainSelectorProps> = ({
  selectedCaptain,
  captains,
  attackPlayers,
  onCaptainChange,
  getTroopTypes,
  getCaptainInfo,
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Available Captains</Form.Label>
      <Form.Select 
        value={selectedCaptain} 
        onChange={(e) => onCaptainChange(e.target.value)}
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
  );
};

export default CaptainSelector; 