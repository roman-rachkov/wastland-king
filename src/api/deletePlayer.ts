import { deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase.ts";

export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    // Ищем игрока по пользовательскому ID (например, "PLAYER-000001")
    const q = query(collection(db, 'players'), where('id', '==', playerId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Player not found');
    }
    
    // Получаем Firestore document ID и удаляем документ
    const playerDoc = querySnapshot.docs[0];
    await deleteDoc(playerDoc.ref);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}; 