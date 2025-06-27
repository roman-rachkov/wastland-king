import { useState, useMemo, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { IBuildings, Shift, TBuildingName, IAttackPlayer, ISchedule } from "../types/Buildings";
import { Player } from "../types/Player";
import { getCurrentUser } from "../services/firebase";
import { useScheduleStore } from '../store/ScheduleStore';
import { fetchWastelandDates } from "../services/api/fetchWastelandDates";
import { fetchDefensePlayers, fetchAttackPlayers, fetchScheduleByEventDate, saveSchedule, updateSchedule } from "../services/api/scheduleApi";
import { autoAssignToBuildings } from "../utils/organizeUtils";
import { getShiftText } from "../utils/organizeHelpers";

export const useOrganizePlayers = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<IBuildings | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [saveNotification, setSaveNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [itemsPerPage] = useState(15);
  
  const {
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
  } = useScheduleStore();

  // useQuery for loading data from backend
  const { data: datesData, isLoading: datesIsLoading, isError: datesIsError } = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });
  const { data: playersData, isLoading: playersIsLoading, isError: playersIsError } = useQuery({
    queryKey: ['defensePlayers', datesData],
    queryFn: () => fetchDefensePlayers(datesData!),
    enabled: !!datesData
  });
  const { data: attackPlayersData } = useQuery({
    queryKey: ['attackPlayers', datesData],
    queryFn: () => fetchAttackPlayers(datesData!),
    enabled: !!datesData
  });
  const { data: existingScheduleData, isLoading: scheduleIsLoading } = useQuery({
    queryKey: ['schedule', datesData?.nextDate],
    queryFn: () => fetchScheduleByEventDate(datesData!.nextDate),
    enabled: !!datesData
  });

  // Synchronize data from useQuery to store
  useEffect(() => {
    if (datesData) setDates(datesData);
  }, [datesData, setDates]);
  useEffect(() => {
    if (playersData) setPlayers(playersData);
  }, [playersData, setPlayers]);
  useEffect(() => {
    if (attackPlayersData) setAttackPlayers(attackPlayersData);
  }, [attackPlayersData, setAttackPlayers]);
  useEffect(() => {
    if (existingScheduleData) setExistingSchedule(existingScheduleData);
  }, [existingScheduleData, setExistingSchedule]);

  // Debug: Log schedule loading
  useEffect(() => {
    console.log('useOrganizePlayers Debug:', {
      datesData,
      existingScheduleData: !!existingScheduleData,
      existingSchedule: !!existingSchedule,
      scheduleIsLoading
    });
  }, [datesData, existingScheduleData, existingSchedule, scheduleIsLoading]);

  // Apply settings from existing schedule when loaded
  useEffect(() => {
    if (existingSchedule?.settings) {
      setSettings(existingSchedule.settings);
    }
  }, [existingSchedule, setSettings]);

  // Generate initial data or use existing
  const initialData = useMemo(() => {
    if (existingSchedule) {
      return existingSchedule.buildings;
    }
    // Create buildings by shift count
    const emptyBuildings: IBuildings[] = [];
    const buildingNames: TBuildingName[] = ['HUB', 'North', 'South', 'West', 'East'];
    const shiftCount = settings.shiftDuration === 4 ? 2 : 4;
    for (const buildingName of buildingNames) {
      for (let i = 0; i < shiftCount; i++) {
        emptyBuildings.push({
          buildingName,
          capitan: {} as Player,
          shift: (i + 1) as Shift,
          rallySize: 0,
          players: []
        });
      }
    }
    return emptyBuildings;
  }, [existingSchedule, settings.shiftDuration]);

  // Update data when changed
  useEffect(() => {
    setBuildings(initialData);
    // Set attack players from existing schedule or from loaded data
    if (existingSchedule?.attackPlayers && existingSchedule.attackPlayers.length > 0) {
      setAttackPlayersSchedule(existingSchedule.attackPlayers);
    } else if (attackPlayers && attackPlayers.length > 0) {
      // Convert attack players to required format
      const convertedAttackPlayers: IAttackPlayer[] = attackPlayers.map(player => ({
        id: player.id,
        name: player.name,
        alliance: player.alliance,
        troopTier: player.troopTier,
        marchSize: player.marchSize,
        isCapitan: player.isCapitan,
        troopFighter: player.troopFighter,
        troopShooter: player.troopShooter,
        troopRider: player.troopRider
      }));
      setAttackPlayersSchedule(convertedAttackPlayers);
    } else {
      setAttackPlayersSchedule([]);
    }
  }, [initialData, existingSchedule, attackPlayers]);

  // Get list of available defenders considering settings
  const availableDefensePlayers = useMemo(() => {
    if (!players || !attackPlayers) {
      return [];
    }
    
    if (settings.allowAttackPlayersInDefense) {
      // Combine players and attackPlayers without duplicates by id
      const all = [...players, ...attackPlayers];
      const unique = all.filter((p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx);
      return unique;
    }
    return players;
  }, [players, attackPlayers, settings.allowAttackPlayersInDefense]);

  // Event handlers
  const handleEditBuilding = (building: IBuildings) => {
    setSelectedBuilding(building);
    setShowEditModal(true);
  };

  const handleSaveBuilding = (updatedBuilding: IBuildings) => {
    setBuildings(buildings.map(b =>
      b.buildingName === updatedBuilding.buildingName && b.shift === updatedBuilding.shift
        ? updatedBuilding
        : b
    ));
  };

  const handleAutoAllocate = () => {
    const shiftCount = settings.shiftDuration === 4 ? 2 : 4;
    const newData = autoAssignToBuildings(buildings, availableDefensePlayers ?? [], shiftCount);
    setBuildings(newData);
  };

  const handleClearSchedule = () => {
    if (window.confirm('Are you sure you want to clear the entire schedule? This action cannot be undone.')) {
      const emptyBuildings: IBuildings[] = [];
      const buildingNames: TBuildingName[] = ['HUB', 'North', 'South', 'West', 'East'];
      const shiftCount = settings.shiftDuration === 4 ? 2 : 4;
      
      for (const buildingName of buildingNames) {
        for (let i = 0; i < shiftCount; i++) {
          emptyBuildings.push({ 
            buildingName, 
            capitan: {} as Player, 
            shift: (i + 1) as Shift, 
            rallySize: 0, 
            players: [] 
          });
        }
      }
      setBuildings(emptyBuildings);
      setAttackPlayersSchedule([]);
    }
  };

  const handleClearBuilding = (building: IBuildings) => {
    const shiftText = getShiftText(building.shift);
    if (window.confirm(`Are you sure you want to clear the ${building.buildingName} building (${shiftText} Shift UTC)?`)) {
      setBuildings(buildings.map(b =>
        b.buildingName === building.buildingName && b.shift === building.shift
          ? { ...b, capitan: {} as Player, rallySize: 0, players: [] }
          : b
      ));
    }
  };

  // Утилита для удаления undefined из объекта (только для settings.tabInfo)
  function cleanSettings(settings: any) {
    const cleaned = { ...settings };
    if (cleaned.tabInfo === undefined) {
      delete cleaned.tabInfo;
    } else if (cleaned.tabInfo) {
      // Если tabInfo есть, но внутри есть undefined
      const tabInfo = { ...cleaned.tabInfo };
      Object.keys(tabInfo).forEach(key => {
        if (tabInfo[key] === undefined) {
          delete tabInfo[key];
        }
      });
      cleaned.tabInfo = tabInfo;
      // Если tabInfo стал пустым, удаляем
      if (Object.keys(tabInfo).length === 0) {
        delete cleaned.tabInfo;
      }
    }
    return cleaned;
  }

  const handleSaveSchedule = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.email) {
      setSaveNotification({ type: 'error', message: 'You need to be logged in to save schedules' });
      return;
    }
    
    if (!dates?.nextDate) {
      setSaveNotification({ type: 'error', message: 'No event date available' });
      return;
    }
    
    try {
      const allAttackPlayers: IAttackPlayer[] = attackPlayers.map(player => ({
        id: player.id,
        name: player.name,
        alliance: player.alliance,
        troopTier: player.troopTier,
        marchSize: player.marchSize,
        isCapitan: player.isCapitan,
        troopFighter: player.troopFighter,
        troopShooter: player.troopShooter,
        troopRider: player.troopRider
      }));
      
      if (existingSchedule?.id) {
        // Update existing schedule
        await updateSchedule(existingSchedule.id, buildings, allAttackPlayers);
        
        // Update local state
        const updatedSchedule: ISchedule = {
          ...existingSchedule,
          buildings: buildings,
          attackPlayers: allAttackPlayers,
          settings: cleanSettings({
            shiftDuration: settings.shiftDuration,
            allowAttackPlayersInDefense: settings.allowAttackPlayersInDefense,
            tabInfo: settings.tabInfo
          }),
          updatedAt: new Date()
        };
        
        setAttackPlayersSchedule(allAttackPlayers);
        setExistingSchedule(updatedSchedule);
        setSaveNotification({ type: 'success', message: 'Schedule updated successfully!' });
      } else {
        // Create new schedule
        const scheduleData = {
          eventDate: dates.nextDate,
          buildings: buildings,
          attackPlayers: allAttackPlayers,
          settings: cleanSettings({
            shiftDuration: settings.shiftDuration,
            allowAttackPlayersInDefense: settings.allowAttackPlayersInDefense,
            tabInfo: settings.tabInfo
          }),
          createdBy: currentUser.email,
        };
        
        const newScheduleId = await saveSchedule(scheduleData);
        
        // Create full schedule object for local state
        const newSchedule: ISchedule = {
          id: newScheduleId,
          eventDate: dates.nextDate,
          buildings: buildings,
          attackPlayers: allAttackPlayers,
          settings: cleanSettings({
            shiftDuration: settings.shiftDuration,
            allowAttackPlayersInDefense: settings.allowAttackPlayersInDefense,
            tabInfo: settings.tabInfo
          }),
          createdBy: currentUser.email,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setAttackPlayersSchedule(allAttackPlayers);
        setExistingSchedule(newSchedule);
        setSaveNotification({ type: 'success', message: 'Schedule saved successfully!' });
      }
      
      setShowSaveModal(false);
      setTimeout(() => setSaveNotification(null), 3000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSaveNotification({ 
        type: 'error', 
        message: `Failed to save schedule: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  return {
    // Состояние
    showEditModal,
    selectedBuilding,
    showSaveModal,
    showPlayersList,
    showStats,
    saveNotification,
    itemsPerPage,
    
    // Данные
    dates,
    players,
    attackPlayers,
    buildings,
    attackPlayersSchedule,
    existingSchedule,
    settings,
    availableDefensePlayers,
    
    // Состояния загрузки
    datesIsLoading,
    playersIsLoading,
    scheduleIsLoading,
    datesIsError,
    playersIsError,
    
    // Обработчики
    setShowEditModal,
    setSelectedBuilding,
    setShowSaveModal,
    setShowPlayersList,
    setShowStats,
    setSaveNotification,
    setSettings,
    handleEditBuilding,
    handleSaveBuilding,
    handleAutoAllocate,
    handleClearSchedule,
    handleClearBuilding,
    handleSaveSchedule,
  };
}; 