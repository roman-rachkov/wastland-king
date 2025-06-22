import { Player } from "../types/Player.ts";
import { updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase.ts";

export const updatePlayer = async (playerId: string, updatedData: Partial<Player>): Promise<void> => {
  try {
    // Ищем игрока по пользовательскому ID (например, "PLAYER-000001")
    const q = query(collection(db, 'players'), where('id', '==', playerId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Player not found');
    }
    
    // Получаем Firestore document ID
    const playerDoc = querySnapshot.docs[0];
    const currentData = playerDoc.data();
    
    // Обновляем данные, сохраняя createdAt и updatedAt неизменными
    const { createdAt, updatedAt, ...dataToUpdate } = updatedData;
    
    await updateDoc(playerDoc.ref, {
      ...currentData,
      ...dataToUpdate,
      createdAt: currentData.createdAt, // Сохраняем оригинальную дату создания
      updatedAt: currentData.updatedAt   // Сохраняем оригинальную дату обновления
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}; 