import {useState, useEffect, useCallback} from 'react';
import {DateTime, Settings, Interval} from 'luxon';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: DateTime;
  expireText?: string;
  className?: string;
  expireClassName?: string;
}

const CountdownTimer = ({targetDate, className, expireClassName, expireText = 'Event on fire!'}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [locale, setLocale] = useState('en-US');

  // Set locale and language change handler
  useEffect(() => {
    const updateLocale = () => {
      const browserLocale = navigator?.language || 'en-US';
      Settings.defaultLocale = browserLocale;
      setLocale(browserLocale);
    };

    updateLocale();
    window.addEventListener('languagechange', updateLocale);
    return () => window.removeEventListener('languagechange', updateLocale);
  }, []);

  // Calculate remaining time
  const calculateTimeLeft = useCallback(() => {
    const now = DateTime.local();
    const interval = Interval.fromDateTimes(now, targetDate);

    if (!interval.isValid || interval.length('seconds') <= 0) {
      return {days: 0, hours: 0, minutes: 0, seconds: 0};
    }

    const duration = interval.toDuration(['days', 'hours', 'minutes', 'seconds']);

    return {
      days: Math.floor(duration.days),
      hours: Math.floor(duration.hours),
      minutes: Math.floor(duration.minutes),
      seconds: Math.floor(duration.seconds),
    };
  }, [targetDate]);

  // Обновление таймера
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Форматирование чисел с учетом локали
  const formatNumber = (num: number, digits: number) => {
    return num.toLocaleString(locale, {
      minimumIntegerDigits: digits,
      useGrouping: false
    });
  };

  // Форматирование времени в нужный формат
  const formatTime = () => {
    const {days, hours, minutes, seconds} = timeLeft;
    const hasDays = days > 0;

    const daysPart = hasDays ? `${days}d ` : '';
    const timePart = [
      formatNumber(hours, 2),
      formatNumber(minutes, 2),
      formatNumber(seconds, 2)
    ].join(':');

    return `${daysPart}${timePart}`;
  };

  const hasExpired = Object.values(timeLeft).every(val => val <= 0);

  if (!targetDate.isValid) {
    console.error('Invalid date:', targetDate.invalidReason);
    return null;
  }

  if (hasExpired) {
    return <span className={["expired-message", expireClassName].join(' ')}>{expireText}</span>;
  }

  return (
    <span className={["countdown-timer", className].join(' ')}>
      {formatTime()}
    </span>
  );
};

export default CountdownTimer;