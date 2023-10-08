import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import css from './style.module.css';
import DatePicker from '../../components/DatePicker';
import WeeklyCalendar from '../WeeklyCalendar';
import { dateUtils } from '../../utils';
import {
  loadAppointmentsAsync,
  selectAppointments,
} from '../../redux/userSlice';
import AppointmentsPanel from './AppointmentsPanel';
import { useWindowSize } from '../../lib/hooks';
import { DateButton } from '../../components/Buttons';

const UserDashboard = () => {
  const [mini, setMini] = useState(false);
  const [dateString, setDateString] = useState('');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [sunday, setSunday] = useState();
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const appointments = useSelector(selectAppointments);
  const [, showDashboardLink, handleOpenMessages] = useOutletContext();
  const dashboard = useRef(null);
  const dispatch = useDispatch();
  const { width } = useWindowSize();

  useEffect(() => {
    showDashboardLink(false);
  }, []);

  useEffect(() => setMini(dashboard.current.clientWidth < 600), [width, setMini]);

  useEffect(() => {
    if (dateString) {
      setDate(new Date(dateString));
    }
  }, [dateString, setDate]);

  useEffect(() => {
    const sunday = dateUtils.toNormalizedString(dateUtils.getWeekStartDate(date));
    setSunday(sunday);
  }, [date, setSunday]);

  useEffect(() => {
    if (sunday) {
      dispatch(loadAppointmentsAsync({ from: sunday, days: 7 }, () => {}));
    }
  }, [sunday]);

  useEffect(() => {
    const dateString = dateUtils.toNormalizedString(date);
    setSelectedDateAppointments(appointments[dateString] || []);
  }, [date, appointments, setSelectedDateAppointments]);

  // useEffect(() => {
  //   setOpenMessages((messages) => selectedDateAppointments.filter(({ id }) => (
  //     messages.find((msg) => msg.id === id)
  //   )));
  // }, [selectedDateAppointments, setOpenMessages]);

  useEffect(() => {
    setEvents(Object.keys(appointments).reduce((memo, key) => {
      const date = new Date(key);
      const result = [...memo];
      appointments[key].forEach((appointment) => {
        result.push({
          id: appointment.id,
          title: appointment.timeSlot.service.name,
          date,
          time: {
            start: {
              hour: new Date(appointment.timeSlot.time).getHours(),
            },
          },
          appointment,
        });
      });
      return result;
    }, []));
  }, [appointments]);

  return (
    <section className="table-wrap">
      <div ref={dashboard} className={`${css.dashboard} ${mini ? css.mini : ''}`}>
        {mini ? (
          <div className={css.dashboard_mini_header}>
            <DateButton date={dateString} onChange={setDateString} />
          </div>
        ) : null}
        <div className={css.dashboard_aside}>
          <DatePicker initialDate={date} onDateChange={setDate} />
          <AppointmentsPanel
            date={date.toLocaleDateString()}
            appointments={selectedDateAppointments}
            onOpenMessages={handleOpenMessages}
          />
        </div>
        <div className={css.dashboard_main}>
          <WeeklyCalendar date={date} events={events} />
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;
