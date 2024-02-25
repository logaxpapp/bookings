import {
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import css from './styles.module.css';
import {
  loadAppointmentsForWekAsync,
  selectWeeklyAppointments,
} from '../../../redux/companySlice';
import { currencyHelper, dateUtils } from '../../../utils';
import WeeklyCalendar from '../../WeeklyCalendar';
import { paths } from '../../../components/svg';
import { appointmentProps } from '../../../utils/propTypes';
import Aside, { Heading } from '../../Aside';

/**
 * @param {Object} props
 * @param {import('../../../types').Appointment} props.appointment
 */
const AppointmentPanel = ({ appointment }) => {
  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [payment, setPayment] = useState({
    price: '',
    deposit: '',
    balance: '',
  });
  const [time, setTime] = useState('');

  useEffect(() => {
    const {
      customer: { firstname, lastname },
      timeSlot: {
        service: {
          name,
          price,
          minDeposit,
          company: { country },
        },
        time,
      },
    } = appointment;

    setServiceName(name);
    setUsername(`${firstname} ${lastname}`);
    setPayment({
      price: `Price: ${currencyHelper.toString(price, country.currencySymbol)}`,
      deposit: `Deposit: ${currencyHelper.toString(minDeposit, country.currencySymbol)}`,
      balance: `Balance: ${currencyHelper.toString((price - minDeposit), country.currencySymbol)}`,
    });
    setTime(new Date(time).toLocaleTimeString());
  }, []);

  return (
    <article className={css.appointment_panel}>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Service</title>
          <path
            fill="currentColor"
            d={paths.roomService}
          />
        </svg>
        <span>{serviceName}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Client</title>
          <path
            fill="currentColor"
            d={paths.account}
          />
        </svg>
        <span>{username}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Time</title>
          <path
            fill="currentColor"
            d={paths.clock}
          />
        </svg>
        <span>{time}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Price</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{payment.price}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Deposit</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{payment.deposit}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Balance</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{payment.balance}</span>
      </div>
    </article>
  );
};

AppointmentPanel.propTypes = {
  appointment: appointmentProps.isRequired,
};

const Dashboard = () => {
  const [date] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [state] = useState({
    mini: false,
    isDrawerOpen: true,
    asideClass: css.dashboard_aside,
  });
  const appointments = useSelector(selectWeeklyAppointments);
  const [sunday, setSunday] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    const sunday = dateUtils.getWeekStartDate(date);
    setSunday(dateUtils.toNormalizedString(sunday));
  }, [date, setSunday]);

  useEffect(() => {
    if (sunday) {
      dispatch(loadAppointmentsForWekAsync(sunday, () => {}));
    }
  }, [sunday]);

  // useEffect(() => {
  //   const dateString = dateUtils.toNormalizedString(date);
  //   setSelectedDateAppointments(appointments[dateString] || []);
  // }, [date, appointments]);

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
    <div className="flex-1 h-full flex">
      <Aside>
        <Heading>My calendars</Heading>
      </Aside>
      <div className={`${css.dashboard_main} ${state.mini ? css.mini : ''}`}>
        <WeeklyCalendar date={date} events={events} />
      </div>
    </div>
  );
};

export default Dashboard;
