import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface SaveScheduleModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  dates: { nextDate: Date } | null;
  existingSchedule: any;
  saveNotification: { type: 'success' | 'error', message: string } | null;
}

const SaveScheduleModal: React.FC<SaveScheduleModalProps> = ({
  show,
  onHide,
  onSave,
  dates,
  existingSchedule,
  saveNotification,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Save Schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          <strong>Event Date:</strong> {dates?.nextDate.toLocaleDateString()}
          <br />
          <strong>Status:</strong> {existingSchedule ? 'Update existing schedule' : 'Create new schedule'}
        </Alert>
        {saveNotification && (
          <Alert variant={saveNotification.type === 'success' ? 'success' : 'danger'} className="mb-3">
            {saveNotification.message}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SaveScheduleModal; 