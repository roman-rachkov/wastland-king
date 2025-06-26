import React, { createContext, useContext, useState, useCallback } from 'react';
import { IBuildings, ISchedule, IAttackPlayer } from '../types/Buildings';
import { Player } from '../types/Player';

// Types for settings
export type ShiftDuration = 2 | 4;

export interface ScheduleSettings {
  shiftDuration: ShiftDuration; // 2 or 4 hours
  allowAttackPlayersInDefense: boolean;
  tabInfo?: {
    defense?: string;
    attack?: string;
  };
}

interface ScheduleStoreState {
  dates: { lastDate: Date; nextDate: Date } | null;
  players: Player[];
  attackPlayers: Player[];
  buildings: IBuildings[];
  attackPlayersSchedule: IAttackPlayer[];
  existingSchedule: ISchedule | null;
  settings: ScheduleSettings;
  setSettings: (settings: Partial<ScheduleSettings>) => void;
  setBuildings: (buildings: IBuildings[]) => void;
  setAttackPlayersSchedule: (players: IAttackPlayer[]) => void;
  setPlayers: (players: Player[]) => void;
  setAttackPlayers: (players: Player[]) => void;
  setDates: (dates: { lastDate: Date; nextDate: Date }) => void;
  setExistingSchedule: (schedule: ISchedule | null) => void;
  resetAll: () => void;
}

const defaultSettings: ScheduleSettings = {
  shiftDuration: 4,
  allowAttackPlayersInDefense: false,
};

const ScheduleStoreContext = createContext<ScheduleStoreState | undefined>(undefined);

export const ScheduleStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dates, setDates] = useState<{ lastDate: Date; nextDate: Date } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attackPlayers, setAttackPlayers] = useState<Player[]>([]);
  const [buildings, setBuildings] = useState<IBuildings[]>([]);
  const [attackPlayersSchedule, setAttackPlayersSchedule] = useState<IAttackPlayer[]>([]);
  const [existingSchedule, setExistingSchedule] = useState<ISchedule | null>(null);
  const [settings, setSettingsState] = useState<ScheduleSettings>(defaultSettings);

  const setSettings = useCallback((newSettings: Partial<ScheduleSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetAll = useCallback(() => {
    setDates(null);
    setPlayers([]);
    setAttackPlayers([]);
    setBuildings([]);
    setAttackPlayersSchedule([]);
    setExistingSchedule(null);
    setSettingsState(defaultSettings);
  }, []);

  return (
    <ScheduleStoreContext.Provider
      value={{
        dates,
        players,
        attackPlayers,
        buildings,
        attackPlayersSchedule,
        existingSchedule,
        settings,
        setSettings,
        setBuildings,
        setAttackPlayersSchedule,
        setPlayers,
        setAttackPlayers,
        setDates,
        setExistingSchedule,
        resetAll,
      }}
    >
      {children}
    </ScheduleStoreContext.Provider>
  );
};

export const useScheduleStore = () => {
  const ctx = useContext(ScheduleStoreContext);
  if (!ctx) throw new Error('useScheduleStore must be used within ScheduleStoreProvider');
  return ctx;
}; 