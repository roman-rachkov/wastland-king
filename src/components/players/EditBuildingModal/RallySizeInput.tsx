import React from 'react';
import { Form } from 'react-bootstrap';

interface RallySizeInputProps {
  rallySize: number;
  onRallySizeChange: (value: number) => void;
}

const RallySizeInput: React.FC<RallySizeInputProps> = ({
  rallySize,
  onRallySizeChange,
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Rally Size</Form.Label>
      <Form.Control
        type="number"
        value={rallySize}
        onChange={(e) => onRallySizeChange(Number(e.target.value))}
        min="0"
      />
    </Form.Group>
  );
};

export default RallySizeInput; 