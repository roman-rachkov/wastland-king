import React from 'react';
import { Accordion } from 'react-bootstrap';
import { IBuildings, IAttackPlayer } from '../../types/Buildings';
import ShiftDisplay from '../admin/OrganizePlayers/ShiftDisplay';

interface ScheduleDisplayProps {
  buildings: IBuildings[];
  settings: { shiftDuration: number };
  dates: { nextDate: Date } | null;
  attackPlayers: IAttackPlayer[];
  itemsPerPage: number;
  onEdit?: (building: IBuildings) => void;
  onClear?: (building: IBuildings) => void;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  buildings,
  settings,
  dates,
  attackPlayers,
  itemsPerPage,
  onEdit,
  onClear,
}) => {
  const buildingNames = ['HUB', 'North', 'South', 'West', 'East'];

  return (
    <Accordion defaultActiveKey={buildings.length > 0 ? `accordion-${buildings[0].buildingName}` : undefined}>
      {buildingNames.map((buildingName) => (
        <Accordion.Item eventKey={`accordion-${buildingName}`} key={buildingName}>
          <Accordion.Header>{buildingName}</Accordion.Header>
          <Accordion.Body>
            <ShiftDisplay
              buildingName={buildingName}
              buildings={buildings}
              settings={settings}
              dates={dates}
              attackPlayers={attackPlayers}
              itemsPerPage={itemsPerPage}
              onEdit={onEdit}
              onClear={onClear}
            />
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default ScheduleDisplay; 