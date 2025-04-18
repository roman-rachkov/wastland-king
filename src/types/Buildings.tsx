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