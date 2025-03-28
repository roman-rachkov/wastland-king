import {Col, Image, Row} from "react-bootstrap";
import headerBg from "../../assets/images/header.jpg";
import CountdownTimer from "./Countdowntimer.tsx";
import {DateTime} from "luxon";
import {db} from "../../services/firebase.ts";
import {doc, getDoc, Timestamp, updateDoc} from "firebase/firestore";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

const fetchLastWastelandDate = async () => {
  const docRef = doc(db, 'counters', 'last_wasteland_event');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Document not found');
  }

  return (docSnap.data().date as Timestamp).toDate(); // Возвращаем значение поля date
};

// Функция обновления даты
const updateWastelandDate = async (newDate: Date) => {
  const docRef = doc(db, 'counters', 'last_wasteland_event');
  await updateDoc(docRef, {
    date: newDate
  });
};

const HeaderBanner = () => {
  const queryClient = useQueryClient();
  const {data: lastDate, isLoading, isError, error} = useQuery({
    queryKey: ['lastWastelandDate'], // Уникальный ключ запроса
    queryFn: fetchLastWastelandDate // Функция запроса
  });

  // Мутация для обновления
  const { mutate } = useMutation({
    mutationFn: updateWastelandDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lastWastelandDate'] });
    }
  });

  if (lastDate) {
    const now = DateTime.now();
    const lastDateLuxon = DateTime.fromJSDate(lastDate);
    const hoursDiff = now.diff(lastDateLuxon, 'hours').hours;

    if (hoursDiff >= 24) {
      const newDate = lastDateLuxon.plus({ days: 14 }).toJSDate();
      mutate(newDate);
    }
  }

  const EventInfo = () => {
    if (isError) {
      return <span className={'text-danger fw-bold'}>Error: ${error.message}</span>
    }
    if (isLoading) {
      return <span className={'text-success fw-bold'}>Loading...</span>
    }
    return (
      <CountdownTimer className={'text-success fw-bold'}
                      expireClassName={'text-danger fw-bold'}
                      targetDate={DateTime.fromJSDate(lastDate!)}/>
    )
  }

  return (
    <Row className={'mb-5 position-relative'}>
      <Col>
        <Image src={headerBg} className={'w-100 rounded-bottom-2'} loading="lazy"/>
      </Col>
      <div className={'position-absolute top-50 start-0 w-auto translate-middle-y ps-5'}>
        <h1 className={'text-white text-uppercase'}>Wasteland king</h1>
        <div className={'text-white'}>Event start: <EventInfo/>
        </div>
      </div>
    </Row>
  );
};

export default HeaderBanner;