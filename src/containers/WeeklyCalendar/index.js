import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import css from './style.module.css';
import { useWindowSize } from '../../lib/hooks';
import {
  addressText,
  currencyHelper,
  // currencyHelper,
  d2,
  dateUtils,
  range,
  TIMEZONE,
  toWords,
  weekdays,
} from '../../utils';
import { appointmentProps } from '../../utils/propTypes';
import { SvgButton, paths } from '../../components/svg';

const CLOSE = 'close';
const NEW_APPOINTMENT = 'new_appointment';
const NEW_LINK = 'new_link';
const VIEW = 'view';

const hours = range(24);

const stopPropagation = (e) => e.stopPropagation();

const EventLabel = ({ event, onClick }) => {
  const btn = useRef();

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === VIEW) {
      onClick(event, btn.current.getBoundingClientRect());
    }
  }, [event, onClick]);

  return (
    <div className={css.weekly_calendar_event_view_btn_wrap}>
      <button
        key={event.id}
        ref={btn}
        type="button"
        name={VIEW}
        title={event.title}
        className={`ellipsis ${css.weekly_calendar_event_view_btn}`}
        onClick={handleClick}
      >
        {event.title}
      </button>
    </div>
  );
};

EventLabel.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export const AppointmentPanel = ({
  appointment,
  onCreateAppointment,
  onCreateLink,
}) => {
  const event = useMemo(() => ({
    serviceName: appointment.timeSlot.service.name,
    clientName: `${appointment.customer.lastname} ${appointment.customer.firstname}`,
    companyName: appointment.timeSlot.service.company.name,
    venue: addressText(appointment.timeSlot.service.company.address),
    time: new Date(appointment.timeSlot.time).toLocaleString(),
    price: currencyHelper.toString(
      appointment.timeSlot.service.price,
      appointment.timeSlot.service.company.country.currencySymbol,
    ),
    deposit: currencyHelper.toString(
      appointment.deposit,
      appointment.timeSlot.service.company.country.currencySymbol,
    ),
    balance: currencyHelper.toString(
      appointment.timeSlot.service.price - appointment.deposit,
      appointment.timeSlot.service.company.country.currencySymbol,
    ),
  }));
  const [appointmentLink, setAppointmentLink] = useState(appointment?.link);

  useEffect(() => {
    if (appointment) {
      setAppointmentLink(appointment.link);
    }
  }, [appointment]);

  const handleClick = ({ target: { name } }) => {
    if (name === NEW_LINK) {
      if (onCreateLink) {
        onCreateLink(appointment, setAppointmentLink);
      }
    } else if (name === NEW_APPOINTMENT) {
      onCreateAppointment(appointment.timeSlot.time);
    }
  };

  return (
    <section className="w-full pb-0 text-[#011c39] dark:text-white">
      <header
        className="pb-4 mb-4 border-b border-dotted border-slate-200 dark:border-slate-600 flex items-center justify-between"
      >
        <h1 className="text-[#0a214b] dark:text-white text-xl text-ellipsis flex-1 whitespace-nowrap">
          Appointment Event
        </h1>
        {onCreateAppointment ? (
          <SvgButton
            type="button"
            name={NEW_APPOINTMENT}
            onClick={handleClick}
            path={paths.plus}
            color="currentColor"
            title="New Appointment"
          />
        ) : null}
      </header>
      <div className="flex flex-col gap-4">
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Service</title>
            <path
              fill="currentColor"
              d={paths.roomService}
            />
          </svg>
          <span>{event.serviceName}</span>
        </div>
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Client</title>
            <path
              fill="currentColor"
              d={paths.account}
            />
          </svg>
          <span>{event.clientName}</span>
        </div>
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Service Provider</title>
            <path
              fill="currentColor"
              d={paths.domain}
            />
          </svg>
          <span>{event.companyName}</span>
        </div>
        <div className={`${css.appointment_row} ${css.venue_row}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Location</title>
            <path
              fill="currentColor"
              d={paths.mapMarker}
            />
          </svg>
          <span>{event.venue}</span>
        </div>
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Time</title>
            <path
              fill="currentColor"
              d={paths.clock}
            />
          </svg>
          <span>{event.time}</span>
        </div>
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Price</title>
            <path
              fill="currentColor"
              d={paths.dollarSign}
            />
          </svg>
          <span>{event.price}</span>
        </div>
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Deposit</title>
            <path
              fill="currentColor"
              d={paths.dollarSign}
            />
          </svg>
          <span>{event.deposit}</span>
        </div>
        <div className={css.appointment_row}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <title>Balance</title>
            <path
              fill="currentColor"
              d={paths.dollarSign}
            />
          </svg>
          <span>{event.balance}</span>
        </div>
        {appointmentLink ? (
          <a
            href={appointment.link}
            target="_blank"
            rel="noreferrer"
            className={`${css.appointment_row} text-[#4040c5]`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <title>Balance</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                d={paths.link}
              />
            </svg>
            <span>{appointmentLink}</span>
          </a>
        ) : (
          <>
            {onCreateLink ? (
              <button
                type="button"
                name={NEW_LINK}
                onClick={handleClick}
                className="bg-transparent text-blue-700 text-lg p-0 cursor-pointer flex items-center gap-2"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-[18px] h-[18px] pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={paths.plus}
                  />
                </svg>
                <span className="pointer-events-none">
                  Add a link
                </span>
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
};

AppointmentPanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onCreateAppointment: PropTypes.func,
  onCreateLink: PropTypes.func,
};

AppointmentPanel.defaultProps = {
  onCreateAppointment: null,
  onCreateLink: null,
};

let prevAppointments = [];

const SidebarPanel = ({
  appointments,
  onClose,
  onCreateAppointment,
  onCreateLink,
}) => {
  const events = useMemo(() => {
    if (appointments) {
      prevAppointments = appointments;
      return appointments;
    }

    return prevAppointments;
  }, [appointments]);

  const handleClick = ({ target: { name } }) => {
    if (name === CLOSE) {
      onClose();
    } else if (name === NEW_APPOINTMENT) {
      if (onCreateAppointment) {
        onCreateAppointment(appointments[0].timeSlot.time);
      }
    }
  };

  return (
    <section className="h-full w-full flex flex-col overflow-hidden">
      <header className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
        <span className="capitalize">
          {`${toWords(events.length)} Appointments`}
        </span>
        <div className="flex gap-5">
          {onCreateAppointment ? (
            <SvgButton
              type="button"
              name={NEW_APPOINTMENT}
              onClick={handleClick}
              path={paths.plus}
              color="#5c5c5c"
              title="New Appointment"
            />
          ) : null}
          <SvgButton
            type="button"
            name={CLOSE}
            onClick={handleClick}
            path={paths.close}
            color="#5c5c5c"
            title="Close"
          />
        </div>
      </header>
      <div className="flex flex-col gap-5 py-4 px-5 flex-1 overflow-auto">
        {events.map((appointment) => (
          <AppointmentPanel
            key={appointment.id}
            appointment={appointment}
            onCreateLink={onCreateLink}
          />
        ))}
      </div>
    </section>
  );
};

SidebarPanel.propTypes = {
  appointments: PropTypes.arrayOf(appointmentProps),
  onClose: PropTypes.func.isRequired,
  onCreateAppointment: PropTypes.func,
  onCreateLink: PropTypes.func,
};

SidebarPanel.defaultProps = {
  appointments: null,
  onCreateAppointment: null,
  onCreateLink: null,
};

/**
 * @param {Object} props
 * @param {Object} props.eventWrapper
 * @param {import('../../types').Appointment} props.eventWrapper.event
 */
const EventPopup = ({
  eventWrapper,
  onClose,
  onCreateAppointment,
  onCreateLink,
}) => {
  const [style, setStyle] = useState({ opacity: 0, transform: 'translate(0,0)' });

  const popup = useRef(null);
  const windowSize = useWindowSize();

  useEffect(() => {
    /** @type {DOMRect} */
    const refRect = eventWrapper.elementRect;
    /** @type {DOMRect} */
    const rect = popup.current.getBoundingClientRect();

    if (rect.width + 20 >= windowSize.width || rect.height + 20 >= windowSize.height) {
      return;
    }

    let dx = 0;
    let dy = 0;

    if (refRect.right + rect.width + 10 <= windowSize.width) {
      dx = rect.left - (refRect.right + 10);
    } else if (refRect.left - 10 >= rect.width) {
      dx = rect.right - (refRect.left - 10);
    }

    if (dx < 0) {
      dx = 0;
    } else {
      dx *= -1;
    }

    if (refRect.top + rect.height - 10 <= windowSize.height) {
      dy = rect.top - refRect.top + 10;
    } else if (refRect.bottom + 10 >= rect.height) {
      dy = rect.bottom - (refRect.bottom + 10);
    }

    if (dy < 0) {
      dy = 0;
    } else {
      dy *= -1;
    }

    setStyle({ opacity: 1, transform: `translate(${dx}px,${dy}px)` });
  }, [eventWrapper, windowSize, setStyle]);

  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <div
      role="alertdialog"
      onMouseDown={onClose}
      className="fixed left-0 top-0 w-full h-full pointer-events-auto z-9 bg-transparent"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={popup}
        style={style}
        className={`absolute right-2.5 bottom-2.5 w-90 pt-4 pb-8 px-8 bg-white dark:bg-[#1a222c] ${css.event_panel}`}
        onMouseDown={stopPropagation}
      >
        <AppointmentPanel
          appointment={eventWrapper.event}
          onCreateAppointment={onCreateAppointment}
          onCreateLink={onCreateLink}
        />
      </div>
    </div>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
};

EventPopup.propTypes = {
  eventWrapper: PropTypes.shape({
    event: appointmentProps,
    elementRect: PropTypes.shape({
      right: PropTypes.number,
      left: PropTypes.number,
      top: PropTypes.number,
      bottom: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateAppointment: PropTypes.func,
  onCreateLink: PropTypes.func,
};

EventPopup.defaultProps = {
  onCreateAppointment: null,
  onCreateLink: null,
};

const CalendarCell = ({
  hour,
  date,
  events,
  onViewEvent,
  onCreateAppointment,
}) => {
  const state = useMemo(() => {
    const filtered = events.filter(({ time: { start } }) => (
      start.hour === hour
    ));
    let title = '';
    let period = '';

    if (filtered.length >= 1) {
      title = filtered[0].title;
      period = `${filtered[0].time.start.text} - ${filtered[0].time.end.text}`;
    }

    return {
      events: filtered,
      period,
      title,
    };
  }, [events]);
  const container = useRef(null);
  const time = useMemo(
    () => new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).toUTCString(),
    [date],
  );

  const handleClick = () => {
    onViewEvent(state.events, container.current.getBoundingClientRect());
  };

  return (
    <div
      ref={container}
      className="relative w-full h-21 p-1 border-l border-[#eee] dark:border-[#2b3949]"
      data-hour={hour ? d2(hour) : ''}
    >
      {state.events.length ? (
        <button
          type="button"
          className="flex flex-col gap-2 justify-center items-start p-3 text-left w-full h-full rounded bg-[#E9EBF8]"
          onClick={handleClick}
        >
          <span className="font-medium text-sm text-[#171717]">
            {state.title}
          </span>
          <span className="font-normal text-xs text-[#171717]">
            {state.period}
          </span>
          {state.events.length > 1 ? (
            <div className="flex justify-end w-full">
              <EllipsisHorizontalIcon className="w-4 h-4 text-[#5c5c5c]" />
            </div>
          ) : null}
        </button>
      ) : (
        <>
          {onCreateAppointment ? (
            <button
              type="button"
              aria-label="create event"
              onClick={() => onCreateAppointment(time, () => {})}
              className="block w-full h-full bg-transparent"
            />
          ) : null}
        </>
      )}
    </div>
  );
};

CalendarCell.propTypes = {
  hour: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    time: PropTypes.shape({
      start: PropTypes.shape({
        hour: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        text: PropTypes.string,
      }),
      end: PropTypes.shape({
        text: PropTypes.string,
      }),
    }),
  })).isRequired,
  onViewEvent: PropTypes.func.isRequired,
  onCreateAppointment: PropTypes.func,
};

CalendarCell.defaultProps = {
  onCreateAppointment: null,
};

const WeeklyCalendar = ({
  date,
  events,
  onCreateAppointment,
  onCreateLink,
}) => {
  const [currentWeekEvents, setCurrentWeekEvents] = useState([]);
  const [eventWrapper, setEventWrapper] = useState(null);
  const [sidebarEvents, setSidebarEvents] = useState(null);
  const sidebarRef = useRef(null);
  const panel = useRef(null);
  const { width } = useWindowSize();
  const [mini, setMini] = useState(false);

  const clearEventWrapper = useCallback(() => setEventWrapper(null));

  useEffect(() => {
    setMini(panel.current.clientWidth < 520);
  }, [width]);

  useEffect(() => {
    let currentWeekEvents;

    if (mini) {
      currentWeekEvents = [{
        key: 0,
        date,
        events: events.filter((e) => dateUtils.dateEquals(date, e.date)),
      }];
    } else {
      const currentDate = date.getDate();
      const currentWeekDay = date.getDay();

      currentWeekEvents = range(7).map((i) => {
        const d = new Date(date);
        d.setDate(currentDate - (currentWeekDay - i));

        return {
          key: i,
          date: d,
          events: events.filter((e) => dateUtils.dateEquals(d, e.date)),
        };
      });
    }

    setCurrentWeekEvents(currentWeekEvents);
  }, [mini, date, events]);

  const handleViewEvent = useCallback((events, rect) => {
    if (events.length === 1) {
      setEventWrapper({ event: events[0].appointment, elementRect: rect });
    } else if (events.length > 1) {
      setSidebarEvents(events.map(({ appointment }) => appointment));
    }
  }, []);

  return (
    <div ref={panel} className={css.horizontal_scroller} id="weekly-calendar-panel">
      <section className={`${css.main} ${mini ? css.mini : ''}`}>
        <div className={css.weekly_calendar}>
          <div
            className={`${mini ? 'block' : 'grid grid-cols-7'} sticky top-0 w-full pl-12 z-[3] bg-white dark:bg-[#24303f] border-b border-[#eee] dark:border-[#2b3949] before:content-[attr(data-timezone)] before:absolute before:left-0 before:bottom-1 before:text-[0.6rem] before:text-right before:px-[5px] before:z-[2] before:text-[#888] before:dark:text-[#ccc]`}
            data-timezone={TIMEZONE}
          >
            {currentWeekEvents.map((evt) => (
              <div
                key={evt.key}
                className={`${mini ? 'items-start -translate-x-8 -translate-y-2' : 'items-center'} relative min-w-16 flex flex-col gap-2 font-bold py-4 text-[#888] dark:text-[#ccc] before:absolute before:left-0 before:bottom-0 before:h-4 before:border-l before:border-[#eee] before:dark:border-[#2b3949]`}
              >
                <span className="uppercase text-xs">
                  {weekdays[evt.date.getDay()]}
                </span>
                <span className="text-2xl">
                  {evt.date.getDate()}
                </span>
              </div>
            ))}
          </div>
          <div
            className="w-auto"
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className={`${mini ? 'block' : 'grid grid-cols-7'} relative w-full pl-12 border-b border-[#eee] dark:border-[#2b3949] text-[#888] dark:text-[#ccc] before:content-[attr(data-hour)] before:absolute before:-top-2 before:left-0 before:w-9 before:text-xs before:text-right before:pr-2.5 before:z-[2] before:bg-white before:dark:bg-[#24303f]`}
                data-hour={hour ? d2(hour) : ''}
              >
                {currentWeekEvents.map((dEvents) => (
                  <CalendarCell
                    key={dEvents.key}
                    hour={hour}
                    date={dEvents.date}
                    events={dEvents.events}
                    onViewEvent={handleViewEvent}
                    onCreateAppointment={onCreateAppointment}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      <div
        aria-hidden={!sidebarEvents}
        ref={sidebarRef}
        className="fixed right-0 top-0 h-screen w-80 pointer-events-none overflow-hidden z-10"
      >
        <div
          className={`w-full h-full overflow-hidden bg-[#f1f1f1] transition-transform ease-linear duration-[.3s] ${sidebarEvents ? 'translate-x-0' : 'translate-x-full'} relative pointer-events-auto`}
        >
          <SidebarPanel
            appointments={sidebarEvents}
            onClose={() => setSidebarEvents(null)}
            onCreateAppointment={onCreateAppointment}
            onCreateLink={onCreateLink}
          />
        </div>
      </div>
      {eventWrapper ? (
        <EventPopup
          eventWrapper={eventWrapper}
          onClose={clearEventWrapper}
          onCreateAppointment={onCreateAppointment}
          onCreateLink={onCreateLink}
        />
      ) : null}
    </div>
  );
};

WeeklyCalendar.propTypes = {
  date: PropTypes.instanceOf(Date),
  events: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    appointment: PropTypes.shape({}),
  })),
  onCreateAppointment: PropTypes.func,
  onCreateLink: PropTypes.func,
};

WeeklyCalendar.defaultProps = {
  date: new Date(),
  events: [],
  onCreateAppointment: null,
  onCreateLink: null,
};

export default WeeklyCalendar;
