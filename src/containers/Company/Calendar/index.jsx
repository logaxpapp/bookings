import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import css from './style.module.css';
import {
  loadAppointmentsForWekAsync,
  selectWeeklyAppointments,
} from '../../../redux/companySlice';
import { currencyHelper, dateUtils } from '../../../utils';
import DatePicker from '../../../components/DatePicker';
import WeeklyCalendar from '../../WeeklyCalendar';
import { SvgButton, colors, paths } from '../../../components/svg';
import { appointmentProps } from '../../../utils/propTypes';
import { useWindowSize } from '../../../lib/hooks';

const CLOSE = 'close';
const OPEN = 'open';

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

const Calendar = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const [state, setState] = useState({
    mini: false,
    isDrawerOpen: true,
    asideClass: css.dashboard_aside,
  });
  const appointments = useSelector(selectWeeklyAppointments);
  const [sunday, setSunday] = useState();
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const dispatch = useDispatch();
  const dashboard = useRef(null);
  const { width } = useWindowSize();

  useEffect(() => {
    setState((state) => {
      const mini = dashboard.current.clientWidth < 820;
      if (state.mini === mini && state.isDrawerOpen === isDrawerOpen) {
        return state;
      }

      const asideClass = `${css.dashboard_aside} ${mini ? css.drawer : ''} ${isDrawerOpen ? css.open : ''}`;
      return {
        mini,
        isDrawerOpen,
        asideClass,
      };
    });
  }, [width, isDrawerOpen, setState]);

  useEffect(() => {
    const sunday = dateUtils.getWeekStartDate(date);
    setSunday(dateUtils.toNormalizedString(sunday));
  }, [date, setSunday]);

  useEffect(() => {
    if (sunday) {
      dispatch(loadAppointmentsForWekAsync(sunday, () => {}));
    }
  }, [sunday]);

  useEffect(() => {
    const dateString = dateUtils.toNormalizedString(date);
    setSelectedDateAppointments(appointments[dateString] || []);
  }, [date, appointments]);

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

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN) {
      setDrawerOpen(true);
    } else if (name === CLOSE) {
      setDrawerOpen(false);
    }
  }, []);

  return (
    <section className="table-wrap">
      <div ref={dashboard} className={css.dashboard}>
        {state.mini ? (
          <div className={css.mini_aside}>
            <SvgButton
              type="button"
              name={OPEN}
              title="Open"
              path={paths.backBurger}
              style={{ transform: 'rotate(180deg' }}
              onClick={handleClick}
            />
          </div>
        ) : null}
        <div className={state.asideClass}>
          {state.mini ? (
            <div className={css.drawer_header}>
              <SvgButton
                type="button"
                name={CLOSE}
                title="Close"
                color={colors.delete}
                path={paths.close}
                onClick={handleClick}
              />
            </div>
          ) : null}
          <DatePicker initialDate={date} onDateChange={setDate} />
          <h1 className={`${css.h1} ${css.appointments_heading}`}>Appointments</h1>
          <div className={css.appointments_date}>
            {date.toDateString()}
          </div>
          <section className={css.appointments_panel}>
            {selectedDateAppointments.map((appointment) => (
              <AppointmentPanel key={appointment.id} appointment={appointment} />
            ))}
          </section>
        </div>
        <div className={`${css.dashboard_main} ${state.mini ? css.mini : ''}`}>
          <WeeklyCalendar date={date} events={events} />
        </div>
      </div>
    </section>
  );
};

export default Calendar;
