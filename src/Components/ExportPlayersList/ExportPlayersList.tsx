import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Player } from '../../types/Player';
import { IBuildings, Shift } from '../../types/Buildings';
import * as XLSX from 'xlsx';

interface ExportPlayersListProps {
  players: Player[];
  buildings: IBuildings[];
}

const ExportPlayersList: React.FC<ExportPlayersListProps> = ({ players, buildings }) => {
  const getTroopTypes = (player: Player) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types.join(', ');
  };

  const getShifts = (player: Player) => {
    const shifts = [];
    if (player.firstShift) shifts.push('First');
    if (player.secondShift) shifts.push('Second');
    return shifts.join(', ');
  };

  const getAssignments = (player: Player) => {
    const assignments = buildings
      .filter(building => 
        building.capitan?.id === player.id || 
        building.players.some(p => p.player.id === player.id)
      )
      .map(building => {
        const isCaptain = building.capitan?.id === player.id;
        const march = building.players.find(p => p.player.id === player.id)?.march || 0;
        const shiftName = building.shift === Shift.first ? 'First' : 'Second';
        return `${building.buildingName} (${shiftName})${isCaptain ? ' - Captain' : ` - March: ${march}`}`;
      });
    
    return assignments.join('; ');
  };

  const exportPlayersToExcel = () => {
    const data = players.map(player => ({
      'Alliance': player.alliance,
      'Name': player.name,
      'Is Captain': player.isCapitan ? 'Yes' : 'No',
      'Troop Tier': player.troopTier,
      'Troop Types': getTroopTypes(player),
      'March Size': player.marchSize,
      'Rally Size': player.rallySize || '',
      'First Shift': player.firstShift ? 'Yes' : 'No',
      'Second Shift': player.secondShift ? 'Yes' : 'No',
      'Shifts': getShifts(player),
      'Assignments': getAssignments(player),
      'Is Assigned': buildings.some(building => 
        building.capitan?.id === player.id || 
        building.players.some(p => p.player.id === player.id)
      ) ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');
    
    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Alliance
      { wch: 20 }, // Name
      { wch: 10 }, // Is Captain
      { wch: 10 }, // Troop Tier
      { wch: 20 }, // Troop Types
      { wch: 12 }, // March Size
      { wch: 12 }, // Rally Size
      { wch: 12 }, // First Shift
      { wch: 12 }, // Second Shift
      { wch: 15 }, // Shifts
      { wch: 50 }, // Assignments
      { wch: 12 }, // Is Assigned
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `players_list_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportBuildingsToExcel = () => {
    const data = buildings.map(building => {
      const captain = building.capitan;
      const totalMarch = building.players.reduce((sum, p) => sum + p.march, 0);
      
      return {
        'Building': building.buildingName,
        'Shift': building.shift === Shift.first ? 'First' : 'Second',
        'Captain': captain?.id ? `(${captain.alliance}) ${captain.name}` : 'Not Assigned',
        'Rally Size': building.rallySize,
        'Total Player March': totalMarch,
        'Difference': building.rallySize - totalMarch,
        'Players Count': building.players.length,
        'Players': building.players.map(p => 
          `(${p.player.alliance}) ${p.player.name} - ${p.march}`
        ).join('; ')
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buildings');
    
    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Building
      { wch: 12 }, // Shift
      { wch: 25 }, // Captain
      { wch: 12 }, // Rally Size
      { wch: 18 }, // Total Player March
      { wch: 12 }, // Difference
      { wch: 15 }, // Players Count
      { wch: 60 }, // Players
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `buildings_list_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportSummaryToExcel = () => {
    const assignedCount = players.filter(p => 
      buildings.some(building => 
        building.capitan?.id === p.id || 
        building.players.some(pl => pl.player.id === p.id)
      )
    ).length;
    
    const captainCount = players.filter(p => p.isCapitan).length;
    const regularPlayerCount = players.filter(p => !p.isCapitan).length;
    
    const summaryData = [
      { 'Metric': 'Total Players', 'Value': players.length },
      { 'Metric': 'Assigned Players', 'Value': assignedCount },
      { 'Metric': 'Unassigned Players', 'Value': players.length - assignedCount },
      { 'Metric': 'Captains', 'Value': captainCount },
      { 'Metric': 'Regular Players', 'Value': regularPlayerCount },
      { 'Metric': 'Buildings', 'Value': buildings.length },
      { 'Metric': 'First Shift Buildings', 'Value': buildings.filter(b => b.shift === Shift.first).length },
      { 'Metric': 'Second Shift Buildings', 'Value': buildings.filter(b => b.shift === Shift.second).length },
    ];

    const ws = XLSX.utils.json_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    
    // Auto-size columns
    ws['!cols'] = [{ wch: 25 }, { wch: 15 }];

    XLSX.writeFile(wb, `schedule_summary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-success" id="export-dropdown">
        📊 Export Data
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={exportPlayersToExcel}>
          📋 Export Players List
        </Dropdown.Item>
        <Dropdown.Item onClick={exportBuildingsToExcel}>
          🏢 Export Buildings List
        </Dropdown.Item>
        <Dropdown.Item onClick={exportSummaryToExcel}>
          📊 Export Summary
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ExportPlayersList; 