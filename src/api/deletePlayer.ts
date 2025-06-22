import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase.ts";

export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    const playerRef = doc(db, 'players', playerId);
    await deleteDoc(playerRef);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}; 