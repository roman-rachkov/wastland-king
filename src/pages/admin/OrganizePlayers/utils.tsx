import {Player} from "../../../types/Player.ts";
import {IBuildings, Shift, TBuildingName} from "../../../types/Buildings.tsx";

export function allocatePlayersToBuildings(players: Player[]): IBuildings[] {
  const buildings: IBuildings[] = [];
  const buildingNames: TBuildingName[] = ['HUB', 'North', 'South', 'West', 'East'];

  // Фильтруем обычных игроков (не капитанов) с выбранными сменами
  const eligiblePlayers = players.filter(p => !p.isCapitan && (p.firstShift || p.secondShift));

  // Получаем всех капитанов
  const allCaptains = players.filter(p => p.isCapitan);

  // Разделяем капитанов по доступности смен
  const firstShiftOnlyCaptains = allCaptains.filter(c => c.firstShift && !c.secondShift);
  const secondShiftOnlyCaptains = allCaptains.filter(c => !c.firstShift && c.secondShift);
  const bothShiftsCaptains = allCaptains.filter(c => c.firstShift && c.secondShift);

  // Помечаем использованных капитанов
  const usedCaptains = new Set<string>();

  // Сначала создаем все возможные комбинации зданий и смен
  const buildingSlots: {buildingName: TBuildingName, shift: Shift}[] = [];
  for (const buildingName of buildingNames) {
    buildingSlots.push({buildingName, shift: Shift.first});
    buildingSlots.push({buildingName, shift: Shift.second});
  }

  // Распределяем капитанов по зданиям
  for (const slot of buildingSlots) {
    if (buildings.length >= 10) break;

    const shiftKey = slot.shift === Shift.first ? 'firstShift' : 'secondShift';
    let captain: Player | undefined;

    // 1. Пробуем найти капитана только для этой смены
    if (slot.shift === Shift.first) {
      captain = firstShiftOnlyCaptains.find(c => !usedCaptains.has(c.id));
    } else {
      captain = secondShiftOnlyCaptains.find(c => !usedCaptains.has(c.id));
    }

    // 2. Если не нашли, пробуем капитана на две смены
    if (!captain) {
      captain = bothShiftsCaptains.find(c =>
        c[shiftKey] && !usedCaptains.has(c.id)
      );
    }

    // 3. Если капитана нет - оставляем здание пустым
    if (!captain) {
      buildings.push({
        buildingName: slot.buildingName,
        capitan: {} as Player, // Пустой объект для ручного заполнения
        shift: slot.shift,
        rallySize: 0,
        players: []
      });
      continue;
    }

    usedCaptains.add(captain.id);

    // Создаем здание с распределением игроков
    const building = createBuilding(
      slot.buildingName,
      captain,
      slot.shift,
      eligiblePlayers,
      buildings
    );

    buildings.push(building);
  }

  return buildings.slice(0, 10);
}

// Вспомогательная функция для создания здания
function createBuilding(
  buildingName: TBuildingName,
  captain: Player,
  shift: Shift,
  eligiblePlayers: Player[],
  existingBuildings: IBuildings[]
): IBuildings {
  const shiftKey = shift === Shift.first ? 'firstShift' : 'secondShift';

  const building: IBuildings = {
    buildingName,
    capitan: captain,
    shift,
    rallySize: captain.rallySize,
    players: []
  };

  // Определяем нужные типы войск
  const neededTroopTypes: (keyof Player)[] = [];
  if (captain.troopFighter) neededTroopTypes.push('troopFighter');
  if (captain.troopShooter) neededTroopTypes.push('troopShooter');
  if (captain.troopRider) neededTroopTypes.push('troopRider');

  if (neededTroopTypes.length === 0 || captain.rallySize <= 0) {
    return building;
  }

  // Фильтруем подходящих игроков
  const shiftPlayers = eligiblePlayers.filter(p =>
    (p[shiftKey] || (p.firstShift && p.secondShift)) &&
    neededTroopTypes.some(type => p[type]) &&
    !isPlayerAssigned(p.id, existingBuildings)
  ).sort((a, b) => {
    // Сортируем по убыванию: тир -> marchSize
    if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
    return b.marchSize - a.marchSize;
  });

  let remainingRallySize = captain.rallySize;

  // Распределяем игроков
  for (const player of shiftPlayers) {
    if (remainingRallySize <= 0) break;

    const assignedSize = Math.min(player.marchSize, remainingRallySize);
    building.players.push({
      player: player,
      march: assignedSize
    });
    remainingRallySize -= assignedSize;
  }

  return building;
}

// Проверяет, назначен ли игрок уже в какое-то здание
function isPlayerAssigned(
  playerId: string,
  existingBuildings: IBuildings[]
): boolean {
  return existingBuildings.some(b =>
    b.players.some(p => p.player.id === playerId)
  );
}