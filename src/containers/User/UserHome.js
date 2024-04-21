import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WeeklyCalendar from '../WeeklyCalendar';
import { DatePicker2 } from '../../components/DatePicker';
import { dateUtils } from '../../utils';
import { loadAppointmentsAsync, selectAppointments } from '../../redux/userSlice';
import UserSearchbarContainer from './UserSearchbarContainer';

/**
 * @param {Date} date
 */
const formatter = (date) => date.toLocaleDateString('en-us', {
  year: 'numeric',
  month: 'long',
});

const UserHome = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [sunday, setSunday] = useState();
  const appointments = useSelector(selectAppointments);
  const dispatch = useDispatch();

  useEffect(() => {
    const sunday = dateUtils.toNormalizedString(dateUtils.getWeekStartDate(date));
    setSunday(sunday);
  }, [date]);

  useEffect(() => {
    if (sunday) {
      dispatch(loadAppointmentsAsync({ from: sunday, days: 7 }, () => {}));
    }
  }, [sunday]);

  useEffect(() => {
    setEvents(Object.keys(appointments).reduce((memo, key) => {
      const date = new Date(key);
      const result = [...memo];
      appointments[key].forEach((appointment) => {
        const time = new Date(appointment.timeSlot.time);
        result.push({
          id: appointment.id,
          title: appointment.timeSlot.service.name,
          date,
          time: {
            start: {
              hour: time.getHours(),
              text: dateUtils.timeText(time),
            },
            end: {
              text: dateUtils.timeText(new Date(
                time.getTime() + (1000 * appointment.timeSlot.service.duration),
              )),
            },
          },
          appointment,
        });
      });
      return result;
    }, []));
  }, [appointments]);

  return (
    <UserSearchbarContainer>
      <div className="overflow-hidden flex-1 h-full flex flex-col">
        <div className="w-full pb-3 pt-6 px-6 flex relative">
          <DatePicker2
            initialDate={date}
            onChange={setDate}
            style={{
              border: 'none',
              fontWeight: 'bold',
              paddingTop: 0,
              paddingBottom: 0,
            }}
            dateFormatter={formatter}
            right
          />
        </div>
        <div className="flex-1 overflow-hidden w-full pb-4 px-4">
          <WeeklyCalendar
            date={date}
            events={events}
          />
        </div>
      </div>
    </UserSearchbarContainer>
  );
};

export default UserHome;
