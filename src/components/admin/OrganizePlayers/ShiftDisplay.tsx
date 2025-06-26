import React from 'react';
import { IBuildings, IAttackPlayer } from '../../../types/Buildings';
import { calculateShiftTime } from '../../../utils/organizeHelpers';
import BuildingCard from './BuildingCard';

interface ShiftDisplayProps {
  buildingName: string;
  buildings: IBuildings[];
  settings: { shiftDuration: number };
  dates: { nextDate: Date } | null;
  attackPlayers: IAttackPlayer[];
  itemsPerPage: number;
  onEdit?: (building: IBuildings) => void;
  onClear?: (building: IBuildings) => void;
}

const ShiftDisplay: React.FC<ShiftDisplayProps> = ({
  buildingName,
  buildings,
  settings,
  dates,
  attackPlayers,
  itemsPerPage,
  onEdit,
  onClear,
}) => {
  const shiftNumbers = [1, 2, 3, 4].slice(0, settings.shiftDuration === 2 ? 4 : 2);

  return (
    <div className='row'>
      {shiftNumbers.map(shiftNum => {
        const building = buildings.find(b => b.buildingName === buildingName && b.shift === shiftNum);
        if (!building) return null;

        const shiftTime = calculateShiftTime(shiftNum, settings.shiftDuration, dates?.nextDate || new Date());

        return (
          <div className='col-12 col-md-6 mb-4' key={shiftNum}>
            <h5>
              Shift {shiftNum}: {shiftTime.utcStart}:00–{shiftTime.utcEnd}:00 UTC
              {' '}(<span title="Local time">{shiftTime.localStart}–{shiftTime.localEnd} local</span>)
            </h5>
            <BuildingCard
              building={building}
              keyPostfix={`-${shiftNum}-shift`}
              onEdit={onEdit}
              onClear={onClear}
              attackPlayers={attackPlayers}
              itemsPerPage={itemsPerPage}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ShiftDisplay; 