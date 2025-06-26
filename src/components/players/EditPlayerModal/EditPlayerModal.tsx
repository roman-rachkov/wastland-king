import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Player } from '../../../types/Player';
import { updatePlayer } from '../../../services/api/updatePlayer';

interface EditPlayerModalProps {
  show: boolean;
  onHide: () => void;
  player: Player | null;
  onPlayerUpdated: () => void;
}

const EditPlayerModal = ({ show, onHide, player, onPlayerUpdated }: EditPlayerModalProps) => {
  const [formData, setFormData] = useState<Partial<Player>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        alliance: player.alliance || '',
        isAttack: player.isAttack || false,
        firstShift: player.firstShift || false,
        secondShift: player.secondShift || false,
        troopTier: player.troopTier || 10,
        troopFighter: player.troopFighter || false,
        troopShooter: player.troopShooter || false,
        troopRider: player.troopRider || false,
        isCapitan: player.isCapitan || false,
        marchSize: player.marchSize || 0,
        rallySize: player.rallySize || 0,
      });
    }
  }, [player]);

  const handleInputChange = (field: keyof Player, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updatePlayer(player.id, formData);
      setSuccess(true);
      setTimeout(() => {
        onPlayerUpdated();
        onHide();
        setSuccess(false);
      }, 1000);
    } catch (error: any) {
      setError(`Failed to update player: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onHide();
  };

  if (!player) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Player: {player.name}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success">
              Player updated successfully!
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alliance</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.alliance || ''}
                  onChange={(e) => handleInputChange('alliance', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Troop Tier</Form.Label>
                <Form.Select
                  value={formData.troopTier || 10}
                  onChange={(e) => handleInputChange('troopTier', parseInt(e.target.value))}
                >
                  <option value={10}>T10</option>
                  <option value={11}>T11</option>
                  <option value={12}>T12</option>
                  <option value={13}>T13</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>March Size</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.marchSize || 0}
                  onChange={(e) => handleInputChange('marchSize', parseInt(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rally Size</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.rallySize || 0}
                  onChange={(e) => handleInputChange('rallySize', parseInt(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Is Attack"
                  checked={formData.isAttack || false}
                  onChange={(e) => handleInputChange('isAttack', e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Is Captain"
                  checked={formData.isCapitan || false}
                  onChange={(e) => handleInputChange('isCapitan', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="First Shift"
                  checked={formData.firstShift || false}
                  onChange={(e) => handleInputChange('firstShift', e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Second Shift"
                  checked={formData.secondShift || false}
                  onChange={(e) => handleInputChange('secondShift', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Fighter"
                  checked={formData.troopFighter || false}
                  onChange={(e) => handleInputChange('troopFighter', e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Shooter"
                  checked={formData.troopShooter || false}
                  onChange={(e) => handleInputChange('troopShooter', e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Rider"
                  checked={formData.troopRider || false}
                  onChange={(e) => handleInputChange('troopRider', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Player'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditPlayerModal; 