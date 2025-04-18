import {EventDates} from "./fetchWastelandDates.ts";
import {Player} from "../types/Player.ts";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../services/firebase.ts";
import {DateTime} from "luxon";

export const fetchPlayers = async (dates: EventDates): Promise<Player[]> => {
  const q = query(collection(db, 'players'),
    where('updatedAt', '>=', DateTime.fromJSDate(dates.lastDate).plus({hours: 36}).toJSDate()),
    where('updatedAt', '<=', DateTime.fromJSDate(dates.nextDate).minus({hours: 12}).toJSDate()),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
};