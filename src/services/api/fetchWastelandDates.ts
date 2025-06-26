import {doc, getDoc} from "firebase/firestore";
import {db} from "../firebase.ts";
export interface EventDates {
  lastDate: Date;
  nextDate: Date;
}
export const fetchWastelandDates = async (): Promise<EventDates> => {
  const docRef = doc(db, 'counters','wasteland_event');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Document not found');
  }

  const data = docSnap.data();
  return {
    lastDate: data.lastDate.toDate(),
    nextDate: data.nextDate.toDate()
  };
};
