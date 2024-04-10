import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import {
  createCustomAppointmentAsync,
  loadAppointmentsForWekAsync,
  selectCustomers,
  selectServiceCategories,
  selectWeeklyAppointments,
  updateAppointmentAsync,
} from '../../../redux/companySlice';
import { currencyHelper, dateUtils, notification } from '../../../utils';
import WeeklyCalendar from '../../WeeklyCalendar';
import { paths } from '../../../components/svg';
import { appointmentProps } from '../../../utils/propTypes';
import Aside, { Heading } from '../../Aside';
import { DatePicker2 } from '../../../components/DatePicker';
import Modal from '../../../components/Modal';
import { Input } from '../../../components/TextBox';

const CUSTOMER = 'customer';
const LINK = 'link';
const SERVICE = 'service';
const TIME = 'time';

/**
 * @param {Date} date
 */
const formatter = (date) => date.toLocaleDateString('en-us', {
  year: 'numeric',
  month: 'long',
});

/**
 * @param {Date} date
 */
const timeText = (date) => {
  let parts = date.toLocaleTimeString().split(' ');
  const md = parts.pop();
  parts = parts[0].split(':');
  parts.pop();

  return `${parts.join(':')} ${md}`;
};

const NewAppointmentEditor = ({
  date,
  busy,
  setBusy,
  onClose,
}) => {
  const categories = useSelector(selectServiceCategories);
  const customers = useSelector(selectCustomers);
  const [customer, setCustomer] = useState(customers[0]);
  const services = useMemo(() => categories.reduce(
    (memo, current) => ([...memo, ...current.services]),
    [],
  ), [categories]);
  const [service, setService] = useState(services[0]);
  const [time, setTime] = useState(() => {
    const newDate = new Date(date);
    const timeParts = newDate.toLocaleTimeString('en-US', { hour: '2-digit' }).split(' ');
    const mer = timeParts.pop();
    let hr = Number.parseInt(timeParts[0], 10);
    if (mer.toLocaleLowerCase() === 'pm' && hr !== 12) {
      hr += 12;
    }

    newDate.setHours(hr);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    return dateUtils.dateTimeToInputString(newDate);
  });
  const [link, setLink] = useState('');
  const timeRef = useRef(null);
  const dispatch = useDispatch();

  const handleChange = ({ target: { name, value } }) => {
    if (name === TIME) {
      setTime(value);
    } else if (name === LINK) {
      setLink(value);
    } else if (name === CUSTOMER) {
      setCustomer(customers.find(({ id }) => id === Number.parseInt(value, 10)));
    } else if (name === SERVICE) {
      setService(services.find(({ id }) => id === Number.parseInt(value, 10)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      service_id: service?.id,
      customer_id: customer?.id,
      time: time ? new Date(time).toUTCString() : null,
      link,
    };

    if (!data.customer_id) {
      notification.showError('Please select a customer!');
      return;
    }

    if (!data.service_id) {
      notification.showError('Please select a service!');
      return;
    }

    if (!data.time) {
      notification.showError('Date CANNOT be empty!');
      return;
    }

    if (data.link) {
      if (!(data.link.startsWith('http://') || data.link.startsWith('https://'))) {
        data.link = `https://${data.link}`;
      }
    }

    setBusy(true);
    dispatch(createCustomAppointmentAsync(data, (err) => {
      if (err) {
        setBusy(false);
      } else {
        onClose();
      }
    }));
  };

  return (
    <section className="p-6 max-h-[90vh] overflow-auto">
      <h1 className="pb-6 border-b border-b-gray-200 font-semibold text-lg">
        New Appointment
      </h1>
      <form className="flex flex-col gap-5 pt-6" onSubmit={handleSubmit}>
        <label htmlFor={CUSTOMER} className="bold-select-wrap">
          <span className="label">Select Customer</span>
          <div className="bold-select caret">
            <select name={CUSTOMER} id={CUSTOMER} value={customer?.id || ''} onChange={handleChange}>
              <option value="">-- Select Customer --</option>
              {customers.map((cus) => (
                <option key={cus.id} value={cus.id}>{`${cus.firstname} ${cus.lastname}`}</option>
              ))}
            </select>
          </div>
        </label>
        <label htmlFor={SERVICE} className="bold-select-wrap">
          <span className="label">Select Service</span>
          <div className="bold-select caret">
            <select name={SERVICE} id={SERVICE} value={service?.id || ''} onChange={handleChange}>
              <option value="">-- Select Service --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
        </label>
        <div className="bold-select-wrap">
          <span className="label">Date</span>
          <div className="bold-select relative max-w-80">
            <input
              ref={timeRef}
              type="datetime-local"
              name={TIME}
              value={time}
              id={TIME}
              className="clip"
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => timeRef.current.showPicker()}
              className="font-semibold text-lg text-[#5c5c5c] bg-transparent block py-3 px-4 w-full text-left caret"
            >
              {new Date(time).toLocaleString()}
            </button>
          </div>
        </div>
        <Input
          name={LINK}
          type="text"
          value={link}
          label="Link"
          onChange={handleChange}
        />
        <div className="flex justify-center pt-4">
          <button type="submit" className={`btn ${busy ? 'busy' : ''}`}>
            Submit
          </button>
        </div>
      </form>
    </section>
  );
};

NewAppointmentEditor.propTypes = {
  date: PropTypes.string.isRequired,
  busy: PropTypes.bool,
  setBusy: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

NewAppointmentEditor.defaultProps = {
  busy: false,
};

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
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const appointments = useSelector(selectWeeklyAppointments);
  const [sunday, setSunday] = useState();
  const [link, setLink] = useState('');
  const [newModal, setNewModal] = useState({
    date: null,
    busy: false,
  });
  const [linkModal, setLinkModal] = useState({ appointment: null, busy: false, onCreated: null });
  const dispatch = useDispatch();

  useEffect(() => {
    const sunday = dateUtils.getWeekStartDate(date);
    setSunday(dateUtils.toNormalizedString(sunday));
  }, [date]);

  useEffect(() => {
    if (sunday) {
      dispatch(loadAppointmentsForWekAsync(sunday, () => {}));
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
              text: timeText(time),
            },
            end: {
              text: timeText(new Date(
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

  const handleCreateAppointment = (date) => setNewModal({ date, busy: false });

  const handleCreateAppointmentLink = (appointment, onCreated) => setLinkModal({
    appointment,
    onCreated,
    busy: false,
  });

  const handleSubmitLink = (e) => {
    e.preventDefault();
    if (!linkModal.appointment) {
      return;
    }

    if (!link) {
      notification.showError('Please enter a link');
    }

    let url = link;

    if (!(url.startsWith('https://') || url.startsWith('http://'))) {
      url = `https://${url}`;
    }

    setLinkModal({ isOpen: true, busy: true });
    dispatch(updateAppointmentAsync({ link: url }, linkModal.appointment, (err) => {
      let isOpen = true;
      if (!err) {
        linkModal.onCreated(url);
        isOpen = false;
      }

      setLinkModal({ isOpen, busy: false });
    }));
  };

  return (
    <div className="flex-1 h-full w-full flex overflow-hidden">
      <Aside>
        <Heading>My calendars</Heading>
      </Aside>
      <div className="overflow-hidden flex-1 h-full flex flex-col">
        <div className="w-full py-3 px-6 flex justify-end relative">
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
          />
        </div>
        <div className="flex-1 overflow-hidden w-full">
          <WeeklyCalendar
            date={date}
            events={events}
            onCreateAppointment={handleCreateAppointment}
            onCreateLink={handleCreateAppointmentLink}
          />
        </div>
      </div>
      <Modal
        isOpen={!!newModal.date || newModal.busy}
        parentSelector={() => document.querySelector('#root')}
        onRequestClose={() => {
          if (!newModal.busy) {
            setNewModal({ date: null, busy: false });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        {newModal.date ? (
          <NewAppointmentEditor
            date={newModal.date}
            busy={newModal.busy}
            setBusy={(busy) => setNewModal((modal) => ({ ...modal, busy }))}
            onClose={() => setNewModal({ date: null, busy: false })}
          />
        ) : null}
      </Modal>
      <Modal
        isOpen={!!linkModal.appointment || linkModal.busy}
        parentSelector={() => document.querySelector('#root')}
        onRequestClose={() => {
          if (!linkModal.busy) {
            setLinkModal({ busy: false, appointment: null, onCreated: null });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <form onSubmit={handleSubmitLink} className="flex flex-col p-10 gap-6">
          <h1 className="pb-6 border-b border-b-gray-200 font-semibold text-lg">
            Add Appointment Link
          </h1>
          <Input
            type="text"
            name={`appointment-${linkModal.appointment?.id}`}
            value={link}
            onChange={({ target: { value } }) => setLink(value)}
            label="Enter Link"
          />
          <div className="form-controls pad">
            <button
              type="submit"
              className={`btn ${linkModal.busy ? 'busy' : ''}`}
              disabled={linkModal.busy}
            >
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
