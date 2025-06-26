import {Player} from "../types/Player";
import {IBuildings, Shift, TBuildingName} from "../types/Buildings";

// Helper function for sorting by priority: first tier, then march size
function sortByPriority(a: Player, b: Player): number {
  // First by troop level (tier), then by march size
  if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
  return normalizeMarchSize(b.marchSize || 0).value - normalizeMarchSize(a.marchSize || 0).value;
}

// Function to normalize march size - if number is less than 100000, multiply by 1000
export function normalizeMarchSize(size: number): { value: number; wasNormalized: boolean } {
  let normalizedSize = size;
  let wasNormalized = false;
  
  if (size < 100000 && size > 0) {
    normalizedSize = size * 1000;
    wasNormalized = true;
  }
  
  return { value: normalizedSize, wasNormalized };
}

export function normalizeRallySize(size: number): { value: number; wasNormalized: boolean } {
  return { value: size, wasNormalized: false };
}

export function allocatePlayersToBuildings(players: Player[], shiftCount: number = 2): IBuildings[] {
  const buildings: IBuildings[] = [];
  const buildingNames: TBuildingName[] = ['HUB', 'North', 'South', 'West', 'East'];

  // Get all captains
  const captains = players.filter(p => p.isCapitan).sort(sortByPriority);
  
  // Create buildings for each shift
  for (const buildingName of buildingNames) {
    for (let shift = 1; shift <= shiftCount; shift++) {
      const shiftEnum = shift as Shift;
      
      // Find suitable captain for this shift
      const shiftKey = shiftCount === 2 
        ? (shift === 1 ? 'firstShift' : 'secondShift')
        : (shift <= 2 ? 'firstShift' : 'secondShift');
      
      const availableCaptain = captains.find(c => c[shiftKey]);
      
      if (availableCaptain) {
        // Create building with captain
        const building = createBuilding(
          buildingName,
          availableCaptain,
          shiftEnum,
          players,
          buildings,
          shiftCount
        );
        buildings.push(building);
        
        // Remove captain from available list
        const captainIndex = captains.indexOf(availableCaptain);
        if (captainIndex > -1) {
          captains.splice(captainIndex, 1);
        }
      } else {
        // Create empty building without captain
        buildings.push({
          buildingName,
          capitan: {} as Player,
          shift: shiftEnum,
          rallySize: 0,
          players: []
        });
      }
    }
  }

  return buildings;
}

// Helper function for creating building
function createBuilding(
  buildingName: TBuildingName,
  captain: Player,
  shift: Shift,
  eligiblePlayers: Player[],
  existingBuildings: IBuildings[],
  shiftCount: number
): IBuildings {
  const shiftKey =
    shift === Shift.first ? 'firstShift' :
    shift === Shift.second ? 'secondShift' : '';

  const building: IBuildings = {
    buildingName,
    capitan: captain,
    shift,
    rallySize: captain.rallySize,
    players: []
  };

  // Determine needed troop types
  const neededTroopTypes: (keyof Player)[] = [];
  if (captain.troopFighter) neededTroopTypes.push('troopFighter');
  if (captain.troopShooter) neededTroopTypes.push('troopShooter');
  if (captain.troopRider) neededTroopTypes.push('troopRider');

  if (neededTroopTypes.length === 0 || captain.rallySize <= 0) {
    return building;
  }

  // Collect player IDs already assigned to other buildings in the same shift (as regular players)
  const assignedPlayerIds = new Set(
    existingBuildings
      .filter(b => b.shift === shift)
      .flatMap(b => b.players.map(p => p.player.id))
  );

  // Collect captain IDs assigned to other buildings in the same shift
  const assignedCaptainPlayerIds = new Set(
    existingBuildings
      .filter(b => b.shift === shift && b.capitan && b.capitan.id)
      .map(b => b.capitan.id)
  );

  // Combine all player IDs already occupied in this shift
  const allAssignedInShift = new Set([...assignedPlayerIds, ...assignedCaptainPlayerIds]);

  // Filter suitable players
  const shiftPlayers = eligiblePlayers.filter(p => {
    const shiftAvailable = shiftCount === 2
      ? (shiftKey && p[shiftKey])
      : (
          (shift === 1 || shift === 2) ? p.firstShift : p.secondShift
        );
    
    const hasNeededTroopType = neededTroopTypes.some(type => p[type]);
    const notAssignedInShift = !allAssignedInShift.has(p.id); // Exclude players already assigned to this shift
    
    return shiftAvailable && hasNeededTroopType && notAssignedInShift;
  }).sort((a, b) => {
    // Sort by priority: first tier (troop level), then march size
    if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
    return normalizeMarchSize(b.marchSize).value - normalizeMarchSize(a.marchSize).value;
  });

  let remainingRallySize = building.rallySize;

  // Distribute players
  for (const player of shiftPlayers) {
    if (remainingRallySize <= 0) {
      break;
    }

    const playerMarchSize = normalizeMarchSize(player.marchSize);
    const assignedSize = Math.min(playerMarchSize.value, remainingRallySize);
    
    building.players.push({
      player: player,
      march: assignedSize,
      wasNormalized: playerMarchSize.wasNormalized
    });
    remainingRallySize -= assignedSize;
  }

  return building;
}

/**
 * Returns available players for building (shift) considering all rules
 */
export function getAvailablePlayersForBuilding(
  building: IBuildings,
  allBuildings: IBuildings[],
  allPlayers: Player[],
  selectedCaptainId?: string,
  shiftCount: number = 2
): Player[] {
  // Get building captain
  const currentCaptain = selectedCaptainId
    ? allPlayers.find(p => p.id === selectedCaptainId)
    : building.capitan && building.capitan.id
      ? allPlayers.find(p => p.id === building.capitan.id)
      : undefined;
  
  // Captain troop types
  const captainTroopTypes = currentCaptain
    ? [
        currentCaptain.troopFighter && 'Fighter',
        currentCaptain.troopShooter && 'Shooter',
        currentCaptain.troopRider && 'Rider',
      ].filter(Boolean)
    : [];
  
  // Determine shiftKey - use the same logic as in autoAssignToBuildings
  const shift = building.shift;
  const shiftKey =
    shiftCount === 2
      ? (shift === Shift.first ? 'firstShift' : 'secondShift')
      : (shift === 1 || shift === 2 ? 'firstShift' : 'secondShift');
  
  // Collect player IDs already assigned to other buildings in the same shift (as regular players)
  const assignedPlayerIds = new Set(
    allBuildings
      .filter(b => b.shift === shift)
      .flatMap(b => b.players.map(p => p.player.id))
  );

  // Collect captain IDs assigned to other buildings in the same shift
  const assignedCaptainPlayerIds = new Set(
    allBuildings
      .filter(b => b.shift === shift && b.capitan && b.capitan.id)
      .map(b => b.capitan.id)
  );

  // Combine all player IDs already occupied in this shift
  const allAssignedInShift = new Set([...assignedPlayerIds, ...assignedCaptainPlayerIds]);

  // Filter suitable players
  const filteredPlayers = allPlayers.filter(p => {
    if (!p.id) {
      return false;
    }
    
    // Exclude selected captain
    if (selectedCaptainId && p.id === selectedCaptainId) {
      return false;
    }
    
    // Exclude players already assigned in any building in the same shift (as captains or regular players)
    if (allAssignedInShift.has(p.id)) {
      return false;
    }
    
    // Check availability for the shift
    if (!(shiftKey && p[shiftKey] || (p.firstShift && p.secondShift))) {
      return false;
    }
    
    // If captain is not selected, show all
    if (!currentCaptain || captainTroopTypes.length === 0) {
      return true;
    }
    
    // Filter by troop type
    const playerTroopTypes = [
      p.troopFighter && 'Fighter',
      p.troopShooter && 'Shooter',
      p.troopRider && 'Rider',
    ].filter(Boolean);
    
    const hasMatchingTroopType = playerTroopTypes.some(type => captainTroopTypes.includes(type));
    
    return hasMatchingTroopType;
  });
  
  return filteredPlayers;
}

/**
 * Automatically distributes captains and players to buildings:
 * - if captain is already assigned — distributes only players
 * - if captain is not there — assigns the best available captain and players
 * @param buildings current array of buildings (with manual captains)
 * @param players list of all available players (defense + attack)
 * @param shiftCount number of shifts (2 or 4)
 * @returns new array of buildings with distributed captains and players
 */
export function autoAssignToBuildings(
  buildings: IBuildings[],
  players: Player[],
  shiftCount: number = 2
): IBuildings[] {
  // Copy buildings to not mutate original
  const updatedBuildings: IBuildings[] = buildings.map(b => ({ ...b, players: [], capitan: { ...b.capitan } }));

  // List of available captains (not yet assigned to other buildings)
  const usedCaptainIds = new Set(updatedBuildings.filter(b => b.capitan && b.capitan.id).map(b => b.capitan.id));
  const allCaptains = players.filter(p => p.isCapitan);

  // FIRST PASS: Assign captains to all buildings
  for (const building of updatedBuildings) {
    // If captain is not assigned — assign the best available
    if (!building.capitan || !building.capitan.id) {
      // Determine shift
      const shift = building.shift;
      const shiftKey =
        shiftCount === 2
          ? (shift === Shift.first ? 'firstShift' : 'secondShift')
          : (shift === 1 || shift === 2 ? 'firstShift' : 'secondShift');
      
      const availableCaptains = allCaptains.filter(c =>
        c[shiftKey] && !usedCaptainIds.has(c.id)
      ).sort(sortByPriority);
      
      const captain = availableCaptains[0];
      if (captain) {
        // Take rallySize from original object
        const fullCaptain = players.find(p => p.id === captain.id) || captain;
        building.capitan = { ...fullCaptain };
        usedCaptainIds.add(captain.id);
      } else {
        building.capitan = {} as Player;
      }
    }
  }

  // SECOND PASS: Distribute players for all buildings with captains
  for (const building of updatedBuildings) {
    // For building with captain — distribute players
    if (building.capitan && building.capitan.id) {
      // Set rallySize from captain only if he was assigned in this pass
      // If captain was already assigned earlier, keep existing rallySize
      const wasCaptainJustAssigned = !buildings.find(b => 
        b.buildingName === building.buildingName && 
        b.shift === building.shift && 
        b.capitan && b.capitan.id === building.capitan.id
      );
      
      if (wasCaptainJustAssigned) {
        building.rallySize = building.capitan.rallySize;
      }
      
      // Determine needed troop types
      const neededTroopTypes: (keyof Player)[] = [];
      if (building.capitan.troopFighter) neededTroopTypes.push('troopFighter');
      if (building.capitan.troopShooter) neededTroopTypes.push('troopShooter');
      if (building.capitan.troopRider) neededTroopTypes.push('troopRider');
      
      if (neededTroopTypes.length === 0 || building.rallySize <= 0) {
        building.players = [];
        continue;
      }
      
      // Filter suitable players
      const shiftPlayers = getAvailablePlayersForBuilding(
        building,
        updatedBuildings,
        players,
        building.capitan.id,
        shiftCount
      ).sort((a, b) => {
        if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
        return normalizeMarchSize(b.marchSize).value - normalizeMarchSize(a.marchSize).value;
      });
      
      let remainingRallySize = building.rallySize;
      
      building.players = [];
      for (const player of shiftPlayers) {
        if (remainingRallySize <= 0) {
          break;
        }
        
        const playerMarchSize = normalizeMarchSize(player.marchSize);
        const assignedSize = Math.min(playerMarchSize.value, remainingRallySize);
        
        building.players.push({ player, march: assignedSize, wasNormalized: playerMarchSize.wasNormalized });
        remainingRallySize -= assignedSize;
      }
    } else {
      building.players = [];
    }
  }
  
  return updatedBuildings;
}