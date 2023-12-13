import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { useWindowSize } from '../../lib/hooks';
import {
  currencyHelper,
  // currencyHelper,
  d2,
  dateUtils,
  range,
  TIMEZONE,
  weekdays,
} from '../../utils';
import { appointmentProps } from '../../utils/propTypes';
import { paths } from '../../components/svg';

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

/**
 * @param {Object} props
 * @param {Object} props.eventWrapper
 * @param {import('../../types').Appointment} props.eventWrapper.event
 */
const EventPanel = ({ eventWrapper, onClose }) => {
  const [event, setEvent] = useState({
    serviceName: '',
    clientName: '',
    companyName: '',
    venue: '',
    time: '',
    price: '',
    deposit: '',
    balance: '',
  });

  useEffect(() => {
    const appointment = eventWrapper.event;
    setEvent({
      serviceName: appointment.timeSlot.service.name,
      clientName: `${appointment.customer.lastname} ${appointment.customer.firstname}`,
      companyName: appointment.timeSlot.service.company.name,
      venue: appointment.timeSlot.service.company.address,
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
    });
  }, [eventWrapper, setEvent]);

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
    <section
      role="alertdialog"
      onMouseDown={onClose}
      className={css.event_panel_window}
    >
      <article
        ref={popup}
        style={style}
        className={css.event_panel}
        onMouseDown={stopPropagation}
      >
        <header className={css.event_panel_header}>
          <h1 className={css.event_panel_heading}>Appointment Event</h1>
        </header>
        <div className={css.appointment_body}>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Service</title>
              <path
                fill="currentColor"
                d={paths.roomService}
              />
            </svg>
            <span>{event.serviceName}</span>
          </div>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Client</title>
              <path
                fill="currentColor"
                d={paths.account}
              />
            </svg>
            <span>{event.clientName}</span>
          </div>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Service Provider</title>
              <path
                fill="currentColor"
                d={paths.domain}
              />
            </svg>
            <span>{event.companyName}</span>
          </div>
          <div className={`${css.appointment_row} ${css.venue_row}`}>
            <svg viewBox="0 0 24 24">
              <title>Location</title>
              <path
                fill="currentColor"
                d={paths.mapMarker}
              />
            </svg>
            <span>{event.venue}</span>
          </div>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Time</title>
              <path
                fill="currentColor"
                d={paths.clock}
              />
            </svg>
            <span>{event.time}</span>
          </div>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Price</title>
              <path
                fill="currentColor"
                d={paths.dollarSign}
              />
            </svg>
            <span>{event.price}</span>
          </div>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Deposit</title>
              <path
                fill="currentColor"
                d={paths.dollarSign}
              />
            </svg>
            <span>{event.deposit}</span>
          </div>
          <div className={css.appointment_row}>
            <svg viewBox="0 0 24 24">
              <title>Balance</title>
              <path
                fill="currentColor"
                d={paths.dollarSign}
              />
            </svg>
            <span>{event.balance}</span>
          </div>
        </div>
      </article>
    </section>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
};

EventPanel.propTypes = {
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
};

const WeeklyCalendar = ({ date, events }) => {
  const [currentWeekEvents, setCurrentWeekEvents] = useState([]);
  const [eventWrapper, setEventWrapper] = useState(null);
  const panel = useRef(null);
  const { width } = useWindowSize();
  const [mini, setMini] = useState(false);

  const clearEventWrapper = useCallback(() => setEventWrapper(null));

  useEffect(() => {
    setMini(panel.current.clientWidth < 420);
  }, [width, setMini]);

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
  }, [mini, date, events, setCurrentWeekEvents]);

  const handleViewEvent = useCallback((event, rect) => {
    setEventWrapper({ event: event.appointment, elementRect: rect });
  }, []);

  return (
    <div ref={panel} className={css.horizontal_scroller}>
      <section className={`${css.main} ${mini ? css.mini : ''}`}>
        <div className={css.weekly_calendar}>
          <div className={css.weekly_calendar_header} data-timezone={TIMEZONE}>
            {currentWeekEvents.map((evt) => (
              <div key={evt.key} className={css.week_header}>
                <span className={css.week_day}>{weekdays[evt.date.getDay()]}</span>
                <span className={css.week_date}>{evt.date.getDate()}</span>
              </div>
            ))}
          </div>
          <div
            className={css.weekly_calendar_body}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className={css.weekly_calendar_row}
                data-hour={hour ? d2(hour) : ''}
              >
                {currentWeekEvents.map((dEvents) => {
                  const filtered = dEvents.events.filter(({ time: { start } }) => (
                    start.hour === hour
                  ));
                  return (
                    <div key={dEvents.key} className={css.weekly_calendar_cell}>
                      {filtered.map((evt) => (
                        <EventLabel
                          key={evt.id}
                          event={evt}
                          onClick={handleViewEvent}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      {eventWrapper ? (
        <EventPanel eventWrapper={eventWrapper} onClose={clearEventWrapper} />
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
};

WeeklyCalendar.defaultProps = {
  date: new Date(),
  events: [],
};

export default WeeklyCalendar;
