import {Player} from "./Player.ts";

export type TBuildingName = 'HUB' | 'North' | 'South' | 'West' | 'East'

export enum Shift {
  first,
  second
}

export interface IBuildings {
  buildingName: TBuildingName;
  capitan: Player;
  shift: Shift;
  rallySize: Player['rallySize']; // rallySize капитана
  players: { player: Player; march: Player['marchSize'] }[];
}

// Новый тип для игроков атаки
export interface IAttackPlayer {
  id: string;
  name: string;
  alliance: string;
  troopTier: number;
  marchSize: number;
  isCapitan: boolean;
  troopFighter: boolean;
  troopShooter: boolean;
  troopRider: boolean;
}

// Новые типы для расписания
export interface ISchedule {
  id: string;
  eventDate: Date;
  buildings: IBuildings[];
  attackPlayers: IAttackPlayer[]; // Новое поле для игроков атаки
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // email админа
}

export interface IPlayerAssignment {
  playerId: string;
  buildingName: TBuildingName;
  shift: Shift;
  march: number;
}

export interface IAvailablePlayer extends Player {
  isAssigned: boolean;
  assignedBuildings: IPlayerAssignment[];
}