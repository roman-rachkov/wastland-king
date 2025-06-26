import {Col, Image, Row} from "react-bootstrap";
import headerBg from "../../../assets/images/header.jpg";
import CountdownTimer from "./Countdowntimer.tsx";
import {DateTime} from "luxon";
import {db} from "../../../services/firebase.ts";
import {doc, updateDoc} from "firebase/firestore";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {EventDates, fetchWastelandDates} from "../../../services/api/fetchWastelandDates.ts";


// Function to get dates

// Function to update date
const updateWastelandDates = async (newDates: EventDates) => {
  const docRef = doc(db, 'counters', 'wasteland_event');
  await updateDoc(docRef, {
    lastDate: newDates.lastDate,
    nextDate: newDates.nextDate
  });
};

const HeaderBanner = () => {
  const queryClient = useQueryClient();

  // Get data
  const { data: dates, isLoading, isError, error } = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });

  // Mutation for update
  const { mutate } = useMutation({
    mutationFn: updateWastelandDates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastelandDates'] });
    }
  });

  // Check condition and update
  if (dates) {
    const now = DateTime.now();
    const nextDate = DateTime.fromJSDate(dates.nextDate);
    const hoursSinceNext = now.diff(nextDate, 'hours').hours;

    if (hoursSinceNext >= 24) {
      const newLastDate = dates.nextDate; // Take previous nextDate
      const newNextDate = DateTime.fromJSDate(dates.nextDate)
        .plus({ days: 14 }) // Add 14 days to previous nextDate
        .toJSDate();

      mutate({
        lastDate: newLastDate,
        nextDate: newNextDate
      });
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
                      targetDate={DateTime.fromJSDate(dates?.nextDate ?? new Date)}/>
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