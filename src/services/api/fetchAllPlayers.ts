import {Player} from "../../types/Player.ts";
import {collection, getDocs} from "firebase/firestore";
import {db} from "../firebase.ts";

export const fetchAllPlayers = async (): Promise<Player[]> => {
  const querySnapshot = await getDocs(collection(db, 'players'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
}; 