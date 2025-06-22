import { collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ISchedule, IBuildings, IAttackPlayer } from '../types/Buildings';
import { Player } from '../types/Player';

// Получить все расписания
export const fetchSchedules = async (): Promise<ISchedule[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'schedules'), orderBy('eventDate', 'desc'))
  );
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    eventDate: doc.data().eventDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
    attackPlayers: doc.data().attackPlayers || [], // Добавляем игроков атаки
  })) as ISchedule[];
};

// Получить расписание по дате события
export const fetchScheduleByEventDate = async (eventDate: Date): Promise<ISchedule | null> => {
  const q = query(
    collection(db, 'schedules'),
    where('eventDate', '==', eventDate)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    eventDate: doc.data().eventDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
    attackPlayers: doc.data().attackPlayers || [], // Добавляем игроков атаки
  } as ISchedule;
};

// Сохранить расписание
export const saveSchedule = async (schedule: Omit<ISchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'schedules'), {
    ...schedule,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return docRef.id;
};

// Обновить расписание
export const updateSchedule = async (scheduleId: string, buildings: IBuildings[], attackPlayers: IAttackPlayer[]): Promise<void> => {
  await updateDoc(doc(db, 'schedules', scheduleId), {
    buildings,
    attackPlayers,
    updatedAt: new Date(),
  });
};

// Удалить расписание
export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await deleteDoc(doc(db, 'schedules', scheduleId));
};

// Получить игроков для защиты (не атаки) с ограничениями по датам события
export const fetchDefensePlayers = async (dates: { lastDate: Date; nextDate: Date }): Promise<Player[]> => {
  const { DateTime } = await import('luxon');
  
  const q = query(
    collection(db, 'players'),
    where('updatedAt', '>=', DateTime.fromJSDate(dates.lastDate).plus({hours: 36}).toJSDate()),
    where('updatedAt', '<=', DateTime.fromJSDate(dates.nextDate).minus({hours: 36}).toJSDate()),
    where('isAttack', '==', false) // Только игроки для защиты
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
};

// Получить ВСЕХ игроков для защиты (без ограничений по датам) - для тестирования
export const fetchAllDefensePlayers = async (): Promise<Player[]> => {
  const q = query(
    collection(db, 'players'),
    where('isAttack', '==', false) // Только игроки для защиты
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
};

// Получить игроков для атаки с ограничениями по датам события
export const fetchAttackPlayers = async (dates?: { lastDate: Date; nextDate: Date }): Promise<Player[]> => {
  const { DateTime } = await import('luxon');
  
  let q;
  if (dates) {
    // С ограничениями по датам
    q = query(
      collection(db, 'players'),
      where('updatedAt', '>=', DateTime.fromJSDate(dates.lastDate).plus({hours: 36}).toJSDate()),
      where('updatedAt', '<=', DateTime.fromJSDate(dates.nextDate).minus({hours: 36}).toJSDate()),
      where('isAttack', '==', true) // Только игроки для атаки
    );
  } else {
    // Без ограничений по датам (для обратной совместимости)
    q = query(
      collection(db, 'players'),
      where('isAttack', '==', true) // Только игроки для атаки
    );
  }
  
  const querySnapshot = await getDocs(q);
  const attackPlayers = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
  
  return attackPlayers;
}; 