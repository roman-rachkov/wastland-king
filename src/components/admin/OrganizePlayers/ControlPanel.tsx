import React from 'react';
import { Button, Form, Card, Badge } from 'react-bootstrap';
import ExportPlayersList from '../../players/ExportPlayersList';
import { IBuildings } from '../../../types/Buildings';

interface ControlPanelProps {
  settings: { 
    shiftDuration: number; 
    allowAttackPlayersInDefense: boolean;
    tabInfo?: {
      defense?: string;
      attack?: string;
    };
  };
  setSettings: (settings: any) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  showPlayersList: boolean;
  setShowPlayersList: (show: boolean) => void;
  handleAutoAllocate: () => void;
  handleClearSchedule: () => void;
  setShowSaveModal: (show: boolean) => void;
  availableDefensePlayers: any[];
  buildings: IBuildings[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  setSettings,
  showStats,
  setShowStats,
  showPlayersList,
  setShowPlayersList,
  handleAutoAllocate,
  handleClearSchedule,
  setShowSaveModal,
  availableDefensePlayers,
  buildings,
}) => {
  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-primary text-white">
        <h6 className="mb-0">
          <i className="fas fa-cog me-2"></i>
          Control Panel
        </h6>
      </Card.Header>
      <Card.Body className="p-3">
        {/* Settings Section */}
        <div className="mb-4">
          <h6 className="text-muted mb-3">
            <i className="fas fa-sliders-h me-1"></i>
            Settings
          </h6>
          <Form.Check 
            type="switch"
            id="shift-duration-switch"
            label={`Shift duration: ${settings.shiftDuration}h`}
            checked={settings.shiftDuration === 4}
            onChange={() => setSettings({ shiftDuration: settings.shiftDuration === 4 ? 2 : 4 })}
            className="mb-2"
          />
          <Form.Check 
            type="switch"
            id="allow-attack-in-defense-switch"
            label="Allow attack players in defense"
            checked={settings.allowAttackPlayersInDefense}
            onChange={() => setSettings({ allowAttackPlayersInDefense: !settings.allowAttackPlayersInDefense })}
            className="mb-3"
          />
        </div>

        {/* Tab Information Section */}
        <div className="mb-4">
          <h6 className="text-muted mb-3">
            <i className="fas fa-info-circle me-1"></i>
            Tab Information
          </h6>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Defense Tab Info</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Additional information for defense tab..."
              value={settings.tabInfo?.defense || ''}
              onChange={(e) => setSettings({
                ...settings,
                tabInfo: {
                  ...settings.tabInfo,
                  defense: e.target.value
                }
              })}
              className="form-control-sm"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="small text-muted">Attack Tab Info</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Additional information for attack tab..."
              value={settings.tabInfo?.attack || ''}
              onChange={(e) => setSettings({
                ...settings,
                tabInfo: {
                  ...settings.tabInfo,
                  attack: e.target.value
                }
              })}
              className="form-control-sm"
            />
          </Form.Group>
        </div>

        {/* View Controls */}
        <div className="mb-4">
          <h6 className="text-muted mb-3">
            <i className="fas fa-eye me-1"></i>
            View Options
          </h6>
          <Button 
            variant={showStats ? "info" : "outline-info"}
            size="sm"
            className="w-100 mb-2"
            onClick={() => setShowStats(!showStats)}
          >
            <i className="fas fa-chart-bar me-1"></i>
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          <Button 
            variant={showPlayersList ? "info" : "outline-info"}
            size="sm"
            className="w-100"
            onClick={() => setShowPlayersList(!showPlayersList)}
          >
            <i className="fas fa-list me-1"></i>
            {showPlayersList ? 'Hide' : 'Show'} Players
          </Button>
        </div>

        {/* Actions */}
        <div className="mb-4">
          <h6 className="text-muted mb-3">
            <i className="fas fa-tools me-1"></i>
            Actions
          </h6>
          <Button 
            variant="primary"
            size="sm"
            className="w-100 mb-2"
            onClick={handleAutoAllocate}
          >
            <i className="fas fa-magic me-1"></i>
            Auto Fill Schedule
          </Button>
          <Button 
            variant="outline-danger"
            size="sm"
            className="w-100 mb-2"
            onClick={handleClearSchedule}
          >
            <i className="fas fa-trash me-1"></i>
            Clear Schedule
          </Button>
          <Button 
            variant="success"
            size="sm"
            className="w-100"
            onClick={() => setShowSaveModal(true)}
          >
            <i className="fas fa-save me-1"></i>
            Save Schedule
          </Button>
        </div>

        {/* Export */}
        <div className="mb-3">
          <h6 className="text-muted mb-3">
            <i className="fas fa-download me-1"></i>
            Export
          </h6>
          <ExportPlayersList players={availableDefensePlayers || []} buildings={buildings} />
        </div>

        {/* Stats */}
        <div className="border-top pt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small">Available Players:</span>
            <Badge bg="primary">{availableDefensePlayers?.length || 0}</Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Buildings:</span>
            <Badge bg="secondary">{buildings.length}</Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ControlPanel; 