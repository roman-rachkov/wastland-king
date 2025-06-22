import {Player} from "../../../types/Player.ts";
import {IBuildings, Shift, TBuildingName} from "../../../types/Buildings.tsx";

// Вспомогательная функция для сортировки по приоритету: сначала тир, потом размер марша
function sortByPriority(a: Player, b: Player): number {
  // Сначала по уровню войск (тиру), потом по размеру марша
  if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
  return normalizeMarchSize(b.rallySize || 0) - normalizeMarchSize(a.rallySize || 0);
}

// Функция для нормализации размера марша - если число меньше 100000, умножаем на 1000
function normalizeMarchSize(size: number): number {
  if (size < 100000 && size > 0) {
    return size * 1000;
  }
  return size;
}

export function allocatePlayersToBuildings(players: Player[]): IBuildings[] {
  const buildings: IBuildings[] = [];
  const buildingNames: TBuildingName[] = ['HUB', 'North', 'South', 'West', 'East'];

  // Фильтруем обычных игроков (не капитанов) с выбранными сменами для защиты
  const eligiblePlayers = players.filter(p => 
    !p.isCapitan && 
    !p.isAttack && // Только игроки для защиты
    (p.firstShift || p.secondShift)
  );

  // Получаем всех капитанов для защиты
  const allCaptains = players.filter(p => p.isCapitan && !p.isAttack);

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

    // 1. Сначала ищем лучшего капитана для этой смены (включая капитанов на две смены)
    const availableCaptains = allCaptains.filter(c => 
      c[shiftKey] && !usedCaptains.has(c.id)
    ).sort(sortByPriority);
    
    captain = availableCaptains[0]; // Берем лучшего доступного капитана

    // 2. Если капитана нет - оставляем здание пустым
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
    rallySize: normalizeMarchSize(captain.rallySize),
    players: []
  };

  // Определяем нужные типы войск
  const neededTroopTypes: (keyof Player)[] = [];
  if (captain.troopFighter) neededTroopTypes.push('troopFighter');
  if (captain.troopShooter) neededTroopTypes.push('troopShooter');
  if (captain.troopRider) neededTroopTypes.push('troopRider');

  if (neededTroopTypes.length === 0 || normalizeMarchSize(captain.rallySize) <= 0) {
    return building;
  }

  // Фильтруем подходящих игроков
  const shiftPlayers = eligiblePlayers.filter(p =>
    (p[shiftKey] || (p.firstShift && p.secondShift)) &&
    neededTroopTypes.some(type => p[type]) &&
    !isPlayerAssigned(p.id, existingBuildings)
  ).sort((a, b) => {
    // Сортируем по приоритету: сначала тир (уровень войск), потом размер марша
    if (b.troopTier !== a.troopTier) return b.troopTier - a.troopTier;
    return normalizeMarchSize(b.marchSize) - normalizeMarchSize(a.marchSize);
  });

  let remainingRallySize = normalizeMarchSize(captain.rallySize);

  // Распределяем игроков
  for (const player of shiftPlayers) {
    if (remainingRallySize <= 0) break;

    const playerMarchSize = normalizeMarchSize(player.marchSize);
    const assignedSize = Math.min(playerMarchSize, remainingRallySize);
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