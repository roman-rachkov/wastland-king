import { Player } from "../types/Player.ts";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase.ts";

export const updatePlayer = async (playerId: string, updatedData: Partial<Player>): Promise<void> => {
  try {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      ...updatedData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}; 