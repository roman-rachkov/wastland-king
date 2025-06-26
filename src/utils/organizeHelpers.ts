import { Player } from "../types/Player";

// Вспомогательная функция для получения типов войск игрока
export const getTroopTypes = (player: Player) => {
  const types = [];
  if (player.troopFighter) types.push('Fighter');
  if (player.troopShooter) types.push('Shooter');
  if (player.troopRider) types.push('Rider');
  return types;
};

// Функция для получения типов войск игрока, которые совпадают с капитаном
export const getMatchingTroopTypes = (player: Player, captain: Player) => {
  const playerTypes = getTroopTypes(player);
  const captainTypes = getTroopTypes(captain);
  
  // Возвращаем только те типы войск игрока, которые есть у капитана
  return playerTypes.filter(type => captainTypes.includes(type));
};

// Функция для получения текста смены
export const getShiftText = (shift: number): string => {
  switch (shift) {
    case 1: return 'First';
    case 2: return 'Second';
    case 3: return 'Third';
    case 4: return 'Fourth';
    default: return 'Unknown';
  }
};

// Функция для вычисления времени смены
export const calculateShiftTime = (shiftNum: number, shiftDuration: number, eventDate: Date) => {
  const shiftStartUTC = new Date(eventDate);
  shiftStartUTC.setUTCHours(10 + (shiftNum - 1) * shiftDuration, 0, 0, 0);
  const shiftEndUTC = new Date(shiftStartUTC.getTime() + shiftDuration * 60 * 60 * 1000);
  
  const localStart = shiftStartUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const localEnd = shiftEndUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return {
    shiftStartUTC,
    shiftEndUTC,
    localStart,
    localEnd,
    utcStart: shiftStartUTC.getUTCHours(),
    utcEnd: shiftEndUTC.getUTCHours()
  };
}; 