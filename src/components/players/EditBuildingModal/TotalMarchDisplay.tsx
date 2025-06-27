import React from 'react';
import { Alert } from 'react-bootstrap';

interface TotalMarchDisplayProps {
  totalMarch: number;
  rallySize: number;
}

const TotalMarchDisplay: React.FC<TotalMarchDisplayProps> = ({
  totalMarch,
  rallySize,
}) => {
  return (
    <Alert variant="info">
      <strong>Total March Size:</strong> {totalMarch} / {rallySize}
      {totalMarch > rallySize && (
        <div className="text-danger mt-1">
          Overflow by {totalMarch - rallySize} units!
        </div>
      )}
    </Alert>
  );
};

export default TotalMarchDisplay; 