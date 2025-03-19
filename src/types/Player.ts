export type Player = {
  id: string;
  name: string;
  alliance: string;
  createdAt: Date;
  updatedAt: Date;
  firstShift: boolean;
  secondShift: boolean;
  troopTier: number;
  troopFighter: boolean;
  troopShooter: boolean;
  troopRider: boolean;
  isCapitan: boolean;
  marchSize: number;
  rallySize: number;
};