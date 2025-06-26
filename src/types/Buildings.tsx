import {Player} from "./Player.ts";

export type TBuildingName = 'HUB' | 'North' | 'South' | 'West' | 'East'

export enum Shift {
  first = 1,
  second = 2,
  third = 3,
  fourth = 4
}

export interface IBuildings {
  buildingName: TBuildingName;
  capitan: Player;
  shift: Shift;
  rallySize: Player['rallySize']; // Captain's rally size
  players: { 
    player: Player; 
    march: Player['marchSize'];
    wasNormalized?: boolean; // Flag indicating that marchSize was normalized
  }[];
}

// New type for attack players
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

// New types for schedule
export interface ISchedule {
  id: string;
  eventDate: Date;
  buildings: IBuildings[];
  attackPlayers: IAttackPlayer[]; // New field for attack players
  settings: {
    shiftDuration: 2 | 4; // 2 or 4 hours
    allowAttackPlayersInDefense: boolean;
    tabInfo?: {
      defense?: string; // Additional info for defense tab
      attack?: string;  // Additional info for attack tab
    };
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // email admin
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