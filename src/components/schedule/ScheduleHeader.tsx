import React from 'react';
import { Button, Badge, Dropdown } from 'react-bootstrap';
import { ISchedule } from '../../types/Buildings';

interface ScheduleHeaderProps {
  selectedScheduleDate: Date | null;
  allSchedules: ISchedule[] | undefined;
  selectedSchedule: ISchedule | null;
  currentSchedule: ISchedule | null;
  onScheduleSelect: (schedule: ISchedule) => void;
  onReturnToCurrent: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  selectedScheduleDate,
  allSchedules,
  selectedSchedule,
  currentSchedule,
  onScheduleSelect,
  onReturnToCurrent,
}) => {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2>Event Schedule</h2>
          {selectedScheduleDate && (
            <p className="text-muted">
              Event Date: {selectedScheduleDate.toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="d-flex gap-2">
          {allSchedules && allSchedules.length > 0 && (
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="schedule-dropdown">
                Select Schedule
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {allSchedules.map(schedule => (
                  <Dropdown.Item
                    key={schedule.id}
                    onClick={() => onScheduleSelect(schedule)}
                    active={selectedSchedule?.id === schedule.id}
                  >
                    {schedule.eventDate.toLocaleDateString()}
                    {schedule.id === currentSchedule?.id && (
                      <Badge bg="success" className="ms-2">Current</Badge>
                    )}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
          {selectedSchedule?.id !== currentSchedule?.id && currentSchedule && (
            <Button variant="primary" onClick={onReturnToCurrent}>
              Return to Current
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeader; 