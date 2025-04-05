import { Player } from "../../../types/Player.ts";

export type Group = {
  captain: Player;
  firstShift: Player[];
  secondShift: Player[];
  usedCapacity: number;
};

export type Building = {
  id: number;
  group: Group;
};

export type TroopGroups = {
  fighter: Player[];
  shooter: Player[];
  rider: Player[];
};

export type Reserve = {
  firstShift: TroopGroups;
  secondShift: TroopGroups;
};

export function organizePlayers(players: Player[]): { buildings: Building[], reserve: Reserve } {
  const allCaptains = selectAndSortCaptains(players);
  const selectedCaptains = allCaptains.slice(0, 5);
  const reserveCaptains = allCaptains.slice(5);
  const regularPlayers = players.filter(p => !p.isCapitan);
  const usedPlayers = new Set<string>();

  const buildings = selectedCaptains.map((captain, index) => {
    const group = buildGroup(captain, regularPlayers, usedPlayers);
    return { id: index + 1, group };
  });

  const allReservePlayers = [
    ...reserveCaptains,
    ...regularPlayers.filter(p => !usedPlayers.has(p.id))
  ];

  const reserve = organizeReserve(allReservePlayers);

  return { buildings, reserve };
}

function selectAndSortCaptains(players: Player[]): Player[] {
  return players
    .filter(p => p.isCapitan)
    .sort((a, b) => {
      const capacityDiff = b.rallySize - a.rallySize;
      return capacityDiff !== 0 ? capacityDiff : b.troopTier - a.troopTier;
    });
}

function buildGroup(captain: Player, players: Player[], usedPlayers: Set<string>): Group {
  const allowedTypes = getTroopTypes(captain);
  const captainFirst = captain.firstShift ? captain.marchSize : 0;
  const captainSecond = captain.secondShift ? captain.marchSize : 0;
  const availableCapacity = (captain.rallySize - captainFirst) + (captain.rallySize - captainSecond);

  let remaining = availableCapacity;
  const groupPlayers: Player[] = captain.firstShift || captain.secondShift ? [captain] : [];

  const candidates = players
    .filter(p => !usedPlayers.has(p.id) && isPlayerCompatible(p, allowedTypes))
    .sort((a, b) => b.troopTier - a.troopTier);

  for (const player of candidates) {
    if (player.marchSize <= remaining) {
      groupPlayers.push(player);
      usedPlayers.add(player.id);
      remaining -= player.marchSize;
    } else break;
  }

  return assignShifts(captain, groupPlayers);
}

function assignShifts(captain: Player, players: Player[]): Group {
  const firstShift: Player[] = [];
  const secondShift: Player[] = [];
  let usedFirst = 0, usedSecond = 0;

  const capFirst = captain.firstShift ? captain.marchSize : 0;
  const capSecond = captain.secondShift ? captain.marchSize : 0;
  const capInFirst = captain.firstShift;
  const capInSecond = captain.secondShift;

  if (capInFirst) firstShift.push(captain);
  if (capInSecond) secondShift.push(captain);

  const firstCapacity = captain.rallySize - capFirst;
  const secondCapacity = captain.rallySize - capSecond;

  for (const player of players.filter(p => p !== captain)) {
    if (usedFirst + player.marchSize <= firstCapacity) {
      firstShift.push(player);
      usedFirst += player.marchSize;
    } else if (usedSecond + player.marchSize <= secondCapacity) {
      secondShift.push(player);
      usedSecond += player.marchSize;
    }
  }

  return {
    captain,
    firstShift,
    secondShift,
    usedCapacity: usedFirst + usedSecond + (capInFirst ? capFirst : 0) + (capInSecond ? capSecond : 0)
  };
}

function organizeReserve(players: Player[]): Reserve {
  const reserve: Reserve = {
    firstShift: { fighter: [], shooter: [], rider: [] },
    secondShift: { fighter: [], shooter: [], rider: [] }
  };

  for (const player of players) {
    const types = getTroopTypes(player);
    if (player.firstShift) {
      types.forEach(t => reserve.firstShift[t].push(player));
    }
    if (player.secondShift) {
      types.forEach(t => reserve.secondShift[t].push(player));
    }
  }

  Object.values(reserve.firstShift).forEach(arr => arr.sort((a, b) => b.marchSize - a.marchSize));
  Object.values(reserve.secondShift).forEach(arr => arr.sort((a, b) => b.marchSize - a.marchSize));

  return reserve;
}

function getTroopTypes(player: Player): string[] {
  const types = [];
  if (player.troopFighter) types.push('fighter');
  if (player.troopShooter) types.push('shooter');
  if (player.troopRider) types.push('rider');
  return types;
}

function isPlayerCompatible(player: Player, allowed: string[]): boolean {
  return getTroopTypes(player).some(t => allowed.includes(t));
}