import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import {
  Svg,
  SvgButton,
  SvgLink,
  colors,
  paths,
} from '../../../components/svg';
import { DateButton, NewLink, TimePicker } from '../../../components/Buttons';
import {
  dateToNormalizedString,
  dateUtils,
  notification,
} from '../../../utils';
import { useConfirmDialog, useDialog } from '../../../lib/Dialog';
import {
  createTimeSlotsAsync,
  deleteTimeSlotAsync,
  deleteTimeSlotsAsync,
  getTimeSlotsAsync,
  loadTimeSlotsAsync,
  selectCompany,
  selectEmployees,
  selectPermissions,
  selectServiceCategories,
  selectTimeSlots,
  updateTimeSlotAsync,
} from '../../../redux/companySlice';
import SlideDialog from '../../../components/SlideInDialog';
import routes from '../../../routing/routes';
import { useBusyDialog } from '../../../components/LoadingSpinner';
import AlertComponent from '../../../components/AlertComponents';
import { useOnHoverContextMenu } from '../../../components/ContextMenu';
import PageHeader from '../../PageHeader';
import GridPanel from '../../../components/GridPanel';
import { useHover } from '../../../lib/hooks';
import { FieldEditor } from '../../../components/TextBox';

const AUTO = 'auto';
const CATEGORY = 'category';
const CHECK_ALL_SLOTS = 'check_all_slots';
const CHECK_SLOT = 'check_slot';
const CLEAR = 'clear';
const CLOSE = 'close';
const DATE = 'date';
const DELETE = 'delete';
const DELETE_TIMESLOTS = 'delete_timeslots';
const EDIT = 'edit';
const END_DATE = 'end_date';
const GENERATE = 'generate';
const LOAD = 'load';
const NEW = 'new';
const REPEATS = 'repeats';
const SAVE = 'save';
const SERVICE = 'service';
const START_DATE = 'start_date';
const TIME = 'time';
const UPDATE = 'update';

const TimeSlotRow = ({
  slot,
  checked,
  onEdit,
  onDelete,
  onCheckedChanged,
  excludeActions,
}) => {
  const [datetime, setDateTime] = useState({ date: '', time: '' });

  useEffect(() => {
    const date = new Date(slot.time);
    setDateTime({ date: date.toLocaleDateString(), time: date.toLocaleTimeString() });
  }, [slot, setDateTime]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === EDIT) {
      onEdit(slot);
    } else if (name === DELETE) {
      onDelete(slot);
    }
  }, [slot, onEdit, onDelete]);

  return (
    <>
      <td className={css.timeslots_date_column}>
        {onCheckedChanged ? (
          <input
            type="checkbox"
            name={CHECK_SLOT}
            value={slot.id}
            checked={checked}
            onChange={onCheckedChanged}
          />
        ) : null}
        <span>{datetime.date}</span>
      </td>
      <td>{datetime.time}</td>
      {excludeActions ? null : (
        <>
          <td className="control">
            <SvgButton
              type="button"
              name={EDIT}
              path={paths.pencil}
              title="Edit"
              onClick={handleClick}
              sm
            />
          </td>
          <td className="control">
            <SvgButton
              type="button"
              name={DELETE}
              path={paths.delete}
              title="Delete"
              color={colors.delete}
              onClick={handleClick}
              sm
            />
          </td>
        </>
      )}
    </>
  );
};

TimeSlotRow.propTypes = {
  slot: PropTypes.shape({
    id: PropTypes.number,
    time: PropTypes.string,
    serviceId: PropTypes.number,
  }).isRequired,
  checked: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCheckedChanged: PropTypes.func,
  excludeActions: PropTypes.bool,
};

TimeSlotRow.defaultProps = {
  checked: false,
  excludeActions: false,
  onEdit: null,
  onDelete: null,
  onCheckedChanged: null,
};

const AutoTimeSlotRow = ({
  slot,
  service,
  onChange,
  onDelete,
}) => {
  const [datetime, setDateTime] = useState({
    date: '',
    time: '',
    slotDate: '',
    overlapStart: 0,
    overlapEnd: 0,
    overlapTime: 0,
  });
  const [overlaps, setOverlaps] = useState();
  const timeSlots = useSelector(selectTimeSlots);
  const timeInput = useRef();
  const overlapIcon = useRef();
  const hoverContext = useOnHoverContextMenu();
  const dispatch = useDispatch();

  useEffect(() => {
    const date = new Date(slot.time);
    const time = 3600 * date.getHours() + 60 * date.getMinutes();

    setDateTime({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      slotDate: dateUtils.toNormalizedString(date),
      overlapStart: (time - service.duration) / 60,
      overlapEnd: (time + service.duration) / 60,
      overlapTime: time / 60,
    });
  }, [slot, service, setDateTime]);

  useEffect(() => {
    const slotsForDate = timeSlots[datetime.slotDate];
    setOverlaps(
      slotsForDate
        ? slotsForDate.filter(
          (s) => {
            if (s.serviceId !== service.id) {
              return false;
            }

            const date = new Date(s.time);
            const time = 60 * date.getHours() + date.getMinutes();
            return (
              (time > datetime.overlapStart && time <= datetime.overlapTime)
              || (time >= datetime.overlapTime && time < datetime.overlapEnd)
            );
          },
        )
        : null,
    );
  }, [service, datetime, timeSlots, setOverlaps]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === TIME) {
      timeInput.current.showPicker();
    } else if (name === DELETE) {
      onDelete(slot);
    } else if (name === LOAD) {
      dispatch(loadTimeSlotsAsync(dateUtils.toNormalizedString(slot.time), () => {}));
    }
  }, [slot, onDelete]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === TIME) {
      onChange({ ...slot, time: value });
    } else if (name === DELETE) {
      onDelete(slot);
    }
  }, [slot, onChange, onDelete]);

  return (
    <tr>
      <td>
        <div className={css.editable_datetime_cell}>
          <span>{datetime.date}</span>
        </div>
      </td>
      <td>
        <div className={css.editable_datetime_cell}>
          <span>{datetime.time}</span>
          <SvgButton
            type="button"
            title="edit"
            name={TIME}
            path={paths.pencil}
            onClick={handleClick}
            xsm
          />
          <input
            ref={timeInput}
            type="datetime-local"
            name={TIME}
            className="clip"
            onChange={handleValueChange}
          />
        </div>
      </td>
      <td>{slot.weekday}</td>
      <td ref={overlapIcon} className="relative">
        <Svg path={paths.alertOutline} color={overlaps && !overlaps.length ? '#2ec4b6' : colors.delete} sm />
        {overlaps ? (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 12,
              display: 'block',
              padding: 4,
              color: '#fff',
              backgroundColor: colors.delete,
              borderRadius: '50%',
              lineHeight: 0.6,
              fontSize: '0.6rem',
              fontWeight: 'bold',
            }}
          >
            {overlaps.length}
          </span>
        ) : null}
        <hoverContext.Menu refElement={overlapIcon}>
          <section className={css.new_time_slot_auto_overlaps_section}>
            <h1 className={`${css.h1} ${css.sm}`}>
              Overlaps
            </h1>
            {overlaps ? (
              <>
                {overlaps.length ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {overlaps.map((slot) => (
                      <span key={slot.id}>
                        {`Time: ${dateUtils.toTimeFormat(60 * slot.time)}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={`${css.empty_notice} ${css.small}`}>
                    No overlaps found
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '8px 0' }}>
                <button
                  type="button"
                  name={LOAD}
                  className="link compact-link"
                  onClick={handleClick}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'center',
                  }}
                >
                  <span className="pointer-events-none">
                    Timeslots for date are not yet loaded
                  </span>
                  <span className="pointer-events-none">
                    Click To Load
                  </span>
                </button>
              </div>
            )}
          </section>
        </hoverContext.Menu>
      </td>
      <td>
        <SvgButton
          type="button"
          name={DELETE}
          title="Delete"
          path={paths.close}
          onClick={handleClick}
          color={colors.delete}
          sm
        />
      </td>
    </tr>
  );
};

AutoTimeSlotRow.propTypes = {
  slot: PropTypes.shape({
    id: PropTypes.number,
    time: PropTypes.string,
    weekday: PropTypes.string,
  }).isRequired,
  service: PropTypes.shape({
    id: PropTypes.number,
    duration: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const AutoTimeSlotCard = ({
  slot,
  service,
  onChange,
  onDelete,
}) => {
  const [datetime, setDateTime] = useState({
    date: '',
    time: '',
    text: '',
    slotDate: '',
    overlapStart: 0,
    overlapEnd: 0,
    overlapTime: 0,
  });
  const [overlaps, setOverlaps] = useState();
  const timeSlots = useSelector(selectTimeSlots);
  const timeInput = useRef();
  const overlapIcon = useRef();
  const dispatch = useDispatch();
  const hovered = useHover(overlapIcon);

  useEffect(() => {
    const date = new Date(slot.time);
    const time = 3600 * date.getHours() + 60 * date.getMinutes();
    const timeParts = date.toLocaleTimeString().split(':');
    const mer = timeParts.pop().split(' ').pop();

    setDateTime({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      text: `${slot.weekday} ${date.toLocaleDateString()} ${timeParts.join(':')} ${mer}`,
      slotDate: dateUtils.toNormalizedString(date),
      overlapStart: (time - service.duration) / 60,
      overlapEnd: (time + service.duration) / 60,
      overlapTime: time / 60,
    });
  }, [slot, service]);

  useEffect(() => {
    const slotsForDate = timeSlots[datetime.slotDate];
    setOverlaps(
      slotsForDate
        ? slotsForDate.filter(
          (s) => {
            if (s.serviceId !== service.id) {
              return false;
            }

            const date = new Date(s.time);
            const time = 60 * date.getHours() + date.getMinutes();
            return (
              (time > datetime.overlapStart && time <= datetime.overlapTime)
              || (time >= datetime.overlapTime && time < datetime.overlapEnd)
            );
          },
        )
        : null,
    );
  }, [service, datetime, timeSlots]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === TIME) {
      timeInput.current.showPicker();
    } else if (name === DELETE) {
      onDelete(slot);
    } else if (name === LOAD) {
      dispatch(loadTimeSlotsAsync(dateUtils.toNormalizedString(slot.time), () => {}));
    }
  }, [slot, onDelete]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === TIME) {
      onChange({ ...slot, time: value });
    } else if (name === DELETE) {
      onDelete(slot);
    }
  }, [slot, onChange, onDelete]);

  return (
    <article className={css.auto_slot_card}>
      <p className={css.auto_slot_card_text}>{datetime.text}</p>
      <footer className={css.auto_slot_card_controls}>
        <div className={css.editable_datetime_cell}>
          <SvgButton
            type="button"
            title="edit"
            name={TIME}
            path={paths.pencil}
            onClick={handleClick}
            sm
          />
          <input
            ref={timeInput}
            type="datetime-local"
            name={TIME}
            className="clip"
            onChange={handleValueChange}
          />
        </div>
        <SvgButton
          type="button"
          name={DELETE}
          title="Delete"
          path={paths.deleteOutline}
          onClick={handleClick}
          color={colors.delete}
          sm
        />
        <div ref={overlapIcon} className="relative">
          <Svg path={paths.alertOutline} color={overlaps && !overlaps.length ? '#2ec4b6' : colors.delete} sm />
          {overlaps && overlaps.length ? (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                display: 'block',
                padding: 4,
                color: '#fff',
                backgroundColor: colors.delete,
                borderRadius: '50%',
                lineHeight: 0.6,
                fontSize: '0.6rem',
                fontWeight: 'bold',
              }}
            >
              {overlaps.length}
            </span>
          ) : null}
          {hovered ? (
            <section className={css.new_time_slot_auto_overlaps_section}>
              <h1 className={`${css.h1} ${css.sm}`}>
                Overlaps
              </h1>
              {overlaps ? (
                <>
                  {overlaps.length ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      {overlaps.map((slot) => (
                        <span key={slot.id} style={{ whiteSpace: 'nowrap' }}>
                          {new Date(slot.time).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={`${css.empty_notice} ${css.small}`}>
                      No overlaps found
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  <button
                    type="button"
                    name={LOAD}
                    className="link compact-link"
                    onClick={handleClick}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'center',
                    }}
                  >
                    <span className="pointer-events-none">
                      Timeslots for date are not yet loaded
                    </span>
                    <span className="pointer-events-none">
                      Click To Load
                    </span>
                  </button>
                </div>
              )}
            </section>
          ) : null}
        </div>
      </footer>
    </article>
  );
};

AutoTimeSlotCard.propTypes = {
  slot: PropTypes.shape({
    id: PropTypes.number,
    time: PropTypes.string,
    weekday: PropTypes.string,
  }).isRequired,
  service: PropTypes.shape({
    id: PropTypes.number,
    duration: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const AutoGeneratePanel = ({ service }) => {
  const [slots, setSlots] = useState([]);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [repeats, setRepeats] = useState(1);
  const company = useSelector(selectCompany);
  const employees = useSelector(selectEmployees);
  const permissions = useSelector(selectPermissions);
  const startDateRef = useRef();
  const endDateRef = useRef();
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  useEffect(() => {
    if (company) {
      setSetupCompleted(company.officeHours && company.openDays);
    }
  }, [company]);

  useEffect(() => {
    if (employees) {
      setRepeats(employees.length);
    }
  }, [employees]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === START_DATE) {
      startDateRef.current.showPicker();
    } else if (name === END_DATE) {
      endDateRef.current.showPicker();
    } else if (name === GENERATE) {
      if (!service) {
        notification.showError('Please select a Service!');
        return;
      }

      if (!startDate) {
        notification.showError('Please set a start start!');
        return;
      }

      const date = new Date(startDate);
      const lastDate = new Date(endDate || date);

      const numberOfDays = (lastDate.getTime() - date.getTime()) / 86400000;

      if (numberOfDays > permissions.maxAutoTimeslotDays) {
        notification.showError(`You can only generate timeslots for up to ${permissions.maxAutoTimeslotDays} days!`);
        return;
      }

      const popup = busyDialog.show('Generating Timeslots ...');

      const start = company.officeHours ? company.officeHours.start : 32400; // 9:00AM
      const end = (company.officeHours ? company.officeHours.end : 61200) - service.duration;

      const includeDate = company.openDays
        ? (date) => company.openDays.includes(date.getDay())
        : () => true;

      const slots = [];
      let slot;
      let id = 1;
      while (date <= lastDate) {
        if (includeDate(date)) {
          let time = start;
          const lDate = new Date(date);
          while (time < end) {
            lDate.setHours(Math.floor(time / 3600));
            lDate.setMinutes(Math.floor((time % 3600) / 60));
            slot = {
              id,
              time: lDate.toUTCString(),
              serviceId: service.id,
              weekday: dateUtils.getWeekday(date.getDay(), true),
            };

            for (let i = 0; i < repeats; i += 1) {
              slots.push({ ...slot });
            }

            id += 1;
            time += service.duration;
          }
        }
        date.setDate(date.getDate() + 1);
      }

      setSlots(slots);
      popup.close();
    } else if (name === SAVE) {
      if (!(slots && slots.length)) {
        notification.showError('There are no time slots to save!');
        return;
      }

      const list = slots.map((slot) => ({
        time: slot.time,
      }));

      const popup = busyDialog.show('Creating Slots ...');
      dispatch(createTimeSlotsAsync({ slots: list }, service.id, true, (err, createdSlots) => {
        popup.close();
        if (!err) {
          if (!createdSlots) {
            notification.showError('No time solts was created due to server errors!');
          } else if (createdSlots.length !== list.length) {
            notification.showError(
              `Only ${createdSlots.length} of ${list.length} were saved. The slots above could NOT be saved.`,
            );
            setSlots(slots.filter((slot) => !createdSlots.find((s) => s.time === slot.time)));
          } else {
            setSlots([]);
          }
        }
      }));
    } else if (name === CLEAR) {
      setSlots([]);
    }
  }, [company, startDate, endDate, repeats, service, slots, permissions]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === START_DATE) {
      setStartDate(value);
    } else if (name === END_DATE) {
      setEndDate(value);
    }
  }, []);

  const handleChange = useCallback((slot) => setSlots(
    slots.reduce((memo, item) => [...memo, item.id === slot.id ? slot : item], []),
  ), [slots, setSlots]);

  const handleDelete = useCallback((slot) => setSlots(
    slots.filter((item) => item.id !== slot.id),
  ), [slots, setSlots]);

  const handleFieldValueChange = useCallback((name, value, callback) => {
    setRepeats(value);
    callback();
  }, []);

  return (
    <section className={css.auto_generate_panel}>
      <h1 className={`${css.h1} ${css.pad} ${css.sm}`}>
        Auto Generate
      </h1>
      <div className={css.auto_generate_body}>
        {slots.length ? (
          <GridPanel minimumChildWidth={240}>
            {slots.map((slot) => (
              <div key={slot.id} style={{ padding: 4 }}>
                <AutoTimeSlotCard
                  slot={slot}
                  service={service}
                  onChange={handleChange}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </GridPanel>
        ) : (
          <>
            {setupCompleted ? (
              <section className={`${css.empty_notice} ${css.small} ${css.center}`}>
                List is Empty!
              </section>
            ) : (
              <section className={css.new_time_slot_auto_generate_setup_alert_wrap}>
                {company.officeDays ? null : (
                  <AlertComponent type="error" style={{ padding: 8, margin: 0 }}>
                    <span>
                      You have NOT setup your office days. We will generate slots
                      for every day in the date interval you specify.
                    </span>
                  </AlertComponent>
                )}
                {company.officeHours ? null : (
                  <AlertComponent type="error" style={{ padding: 8, margin: 0 }}>
                    You have NOT setup your office hours.
                    We will assume you open by 9:00AM to 5:00PM local times.
                  </AlertComponent>
                )}
              </section>
            )}
          </>
        )}
      </div>
      <div className={css.slot_auto_generate_controls}>
        <div className={css.slot_auto_generate_dates_wrap}>
          <div className={css.auto_input_wrap}>
            <button
              type="button"
              name={START_DATE}
              className="link compact-link"
              onClick={handleClick}
            >
              {`Start:  ${startDate || 'YYYY-mm-dd'}`}
            </button>
            <input
              ref={startDateRef}
              type="date"
              name={START_DATE}
              value={startDate}
              className="clip"
              onChange={handleValueChange}
            />
          </div>
          <div className={css.auto_input_wrap}>
            <button
              type="button"
              name={END_DATE}
              className="link compact-link"
              onClick={handleClick}
            >
              {`End:  ${endDate || 'YYYY-mm-dd'}`}
            </button>
            <input
              ref={endDateRef}
              type="date"
              name={END_DATE}
              value={endDate}
              className="clip"
              onChange={handleValueChange}
            />
          </div>
          <FieldEditor
            type="text"
            name={REPEATS}
            label="Repeats"
            initialValue={repeats}
            onSave={handleFieldValueChange}
            style={{ display: 'flex', alignItems: 'center' }}
            inputStyle={{ width: 60 }}
            isInteger
            transparent
          />
        </div>
        <div className={css.slot_auto_generate_actions_wrap}>
          <button
            type="button"
            name={GENERATE}
            className={`control-btn ${css.control_btn}`}
            onClick={handleClick}
          >
            Generate
          </button>
          {slots.length ? (
            <>
              <button
                type="button"
                name={SAVE}
                className={`control-btn green ${css.control_btn}`}
                onClick={handleClick}
              >
                Save
              </button>
              <button
                type="button"
                name={CLEAR}
                className={`control-btn cancel ${css.control_btn}`}
                onClick={handleClick}
              >
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

AutoGeneratePanel.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number,
    duration: PropTypes.number,
  }),
};

AutoGeneratePanel.defaultProps = {
  service: null,
};

const OverlapsPanel = ({
  id,
  serviceId,
  time,
}) => {
  const [overlaps, setOverlaps] = useState(null);
  const slots = useSelector(selectTimeSlots);
  const dispatch = useDispatch();

  useEffect(() => {
    const date = dateUtils.toNormalizedString(time);
    const slotsForDate = slots[date];
    if (!slotsForDate) {
      setOverlaps(null);
      return;
    }

    const isoTime = dateUtils.toISOString(time);
    setOverlaps(slotsForDate.filter((slot) => (
      slot.id !== id
      && slot.serviceId === serviceId
      && slot.time === isoTime
    )));
  }, [id, serviceId, time, slots, setOverlaps]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === LOAD) {
      dispatch(getTimeSlotsAsync(dateUtils.toNormalizedString(time), () => {}));
    }
  }, [time]);

  return (
    <section className={css.time_slots_overlaps_panel}>
      <h1 className={`${css.h1} ${css.pad} ${css.sm}`}>
        Overlaps
      </h1>
      {overlaps ? (
        <>
          <div className={css.time_slots_overlaps_count}>
            {`${overlaps.length} overlap${overlaps.length === 1 ? '' : 's'} found.`}
          </div>
          {overlaps.length ? (
            <div className={css.time_slots_overlaps_body}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {overlaps.map((slot) => (
                    <tr key={slot.id}>
                      <TimeSlotRow slot={slot} excludeActions />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : (
        <div className={css.time_slots_overlaps_not_loaded}>
          {time ? (
            <button type="button" name={LOAD} className="link" onClick={handleClick}>
              Time Slots not yet loaded for date. (click to load)
            </button>
          ) : (
            <span>
              DATE NOT SET
            </span>
          )}
        </div>
      )}
    </section>
  );
};

OverlapsPanel.propTypes = {
  id: PropTypes.number,
  serviceId: PropTypes.number,
  time: PropTypes.string,
};

OverlapsPanel.defaultProps = {
  id: 0,
  serviceId: 0,
  time: '',
};

const UpdateTimeSlotPopup = ({ slot, onClose }) => {
  const [isOpen, setOpen] = useState(false);
  const [time, setTime] = useState(dateUtils.dateTimeToInputString(slot.time));
  const dispatch = useDispatch();
  const busyDialog = useBusyDialog();

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === TIME) {
      setTime(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === UPDATE) {
      const data = {};
      if (time !== dateUtils.dateTimeToInputString(slot.time)) {
        data.time = new Date(time).toUTCString();
      }

      if (!Object.keys(data).length) {
        notification.showInfo('Timeslot has NOT changed');
        return;
      }

      const popup = busyDialog.show('Updating Time Slot ...');
      dispatch(updateTimeSlotAsync(data, slot, (err) => {
        popup.close();
        if (!err) {
          setOpen(false);
          setTimeout(onClose, 500);
        }
      }));
    } else if (name === CLOSE) {
      setOpen(false);
      setTimeout(onClose, 500);
    }
  }, [slot, onClose, time, setOpen]);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.time_slot_update_section}>
        <h1 className={`${css.h1} ${css.pad}`}>Update TimeSlot</h1>
        <div className={css.time_slot_update_inputs_wrap}>
          <div className={css.custom_input_wrap}>
            <div className={css.custom_input_label}>Set Time</div>
            <input
              type="datetime-local"
              name={TIME}
              value={time}
              onChange={handleValueChange}
            />
          </div>
        </div>
        <div className="form-controls pad-top">
          <button
            type="button"
            name={UPDATE}
            className={`control-btn ${css.control_btn}`}
            onClick={handleClick}
          >
            Update
          </button>
        </div>
        <SvgButton
          name={CLOSE}
          path={paths.close}
          color={colors.delete}
          onClick={handleClick}
          style={{ position: 'absolute', right: 4, top: 4 }}
          sm
        />
      </section>
    </SlideDialog>
  );
};

UpdateTimeSlotPopup.propTypes = {
  slot: PropTypes.shape({
    id: PropTypes.number,
    time: PropTypes.string,
    serviceId: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

const NewTimeSlotBody = ({
  service,
  time,
  clickHandler,
  valueChangeHandler,
}) => {
  const [tab, setTab] = useState(AUTO);
  const handleHeaderClick = useCallback(({ target: { name } }) => setTab(name), []);

  return (
    <div className={css.new_time_slot_tab_control}>
      <div className={css.new_time_slot_tab_headers_panel}>
        <button
          type="button"
          name={AUTO}
          className={`${css.new_time_slot_tab_header} ${tab === AUTO ? css.active : ''}`}
          onClick={handleHeaderClick}
        >
          Auto Generate
        </button>
        <button
          type="button"
          name={NEW}
          className={`${css.new_time_slot_tab_header} ${tab === NEW ? css.active : ''}`}
          onClick={handleHeaderClick}
        >
          Custom Slot
        </button>
      </div>
      <div className={`table-wrap ${css.new_time_slot_panel}`}>
        <div
          className={`tab ${tab === NEW ? 'active' : ''} ${css.new_time_slot_form_overlap_wrap}`}
        >
          <div className={`${css.new_time_slot_overlap_wrap} ${css.new_section}`}>
            <OverlapsPanel
              serviceId={service ? service.id : 0}
              time={time}
            />
          </div>
          <section className={`${css.time_slot_update_section} ${css.new} ${css.new_section}`}>
            <div className={css.new_timeslot_custom_controls_wrap}>
              <div className={css.custom_input_label}>Set Time</div>
              <TimePicker time={time} onChange={valueChangeHandler} />
              <button
                type="button"
                name={SAVE}
                className={`control-btn ${css.control_btn}`}
                onClick={clickHandler}
              >
                SAVE
              </button>
            </div>
          </section>
        </div>
        <div
          className={`tab ${tab === AUTO ? 'active' : ''} ${css.new_time_slot_auto_generate_wrap} ${css.new_section}`}
        >
          <AutoGeneratePanel service={service} />
        </div>
      </div>
    </div>
  );
};

NewTimeSlotBody.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  time: PropTypes.string.isRequired,
  clickHandler: PropTypes.func.isRequired,
  valueChangeHandler: PropTypes.func.isRequired,
};

export const NewTimeSlot = () => {
  const categories = useSelector(selectServiceCategories);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [service, setService] = useState();
  const [time, setTime] = useState(dateUtils.dateTimeToInputString(new Date()));
  const company = useSelector(selectCompany);
  const busyDialog = useBusyDialog();
  const confirmDialog = useConfirmDialog();
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedCategory) {
      setService(selectedCategory.services[0]);
    }
  }, [selectedCategory, setService]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === CATEGORY) {
      const category = categories.find((cat) => cat.id === Number.parseInt(value, 10));
      setSelectedCategory(category);
    } else if (name === SERVICE) {
      setService(selectedCategory.services.find(
        (service) => service.id === Number.parseInt(value, 10),
      ));
    } else if (name === TIME) {
      setTime(value);
    }
  }, [categories, selectedCategory, setSelectedCategory, setService]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SAVE) {
      if (!service) {
        notification.showError('Please select a service!');
        return;
      }
      if (!time) {
        notification.showError('Please choose a time');
        return;
      }

      if (company.officeHours && company.officeHours.end) {
        const date = new Date(time);
        const end = 3600 * date.getHours()
          + 60 * date.getMinutes()
          + date.getSeconds()
          + service.duration;

        if (end > company.officeHours.end) {
          confirmDialog.show(
            'The time entered falls outside your office hours',
            'Do you wish to continue?',
            (confirmed) => {
              if (confirmed) {
                const popup = busyDialog.show('Creating TimeSlot ...');
                dispatch(createTimeSlotsAsync(
                  {
                    time: new Date(time).toUTCString(),
                  },
                  service.id,
                  false,
                  popup.close,
                ));
              }
            },
          );

          return;
        }
      }

      const popup = busyDialog.show('Creating TimeSlot ...');
      dispatch(createTimeSlotsAsync(
        {
          time: new Date(time).toUTCString(),
        },
        service.id,
        false,
        popup.close,
      ));
    }
  }, [service, time, company, confirmDialog]);

  return (
    <section className={`${css.content} ${css.overflow_hidden}`}>
      <header className={`${css.page_header} ${css.new}`}>
        <div className={css.new_time_slot_heading_wrap}>
          <SvgLink
            to={routes.company.absolute.settings.timeSlots}
            path={paths.back}
          />
          <h1 className={`${css.h1} ${css.md}`}>New Time Slot</h1>
        </div>
      </header>
      <div className={css.column_screen}>
        {!categories.length ? (
          <div className={`${css.empty_notice} ${css.time_slot_empty_pad}`}>
            No Service Categories Found!
          </div>
        ) : (
          <>
            <div className={css.time_slot_selects_block}>
              <div className={css.time_slot_select_wrap}>
                <div className={css.time_slot_select_label}>Select Category</div>
                <div className="select">
                  <select name={CATEGORY} value={selectedCategory.id} onChange={handleValueChange}>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={css.time_slot_select_wrap}>
                <div className={css.time_slot_select_label}>Select Service</div>
                <div className="select">
                  <select
                    name={SERVICE}
                    value={service ? service.id : ''}
                    onChange={handleValueChange}
                  >
                    {selectedCategory.services.map((serv) => (
                      <option key={serv.id} value={serv.id}>{serv.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {!service ? (
              <div className={`${css.empty_notice} ${css.time_slot_empty_pad}`}>
                No services found!
              </div>
            ) : (
              <NewTimeSlotBody
                service={service}
                time={time}
                clickHandler={handleClick}
                valueChangeHandler={setTime}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

const TimeSlots = () => {
  const timeSlots = useSelector(selectTimeSlots);
  const categories = useSelector(selectServiceCategories);
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [checkedSlots, setCheckedSlots] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(dateToNormalizedString(new Date()));
  const dispatch = useDispatch();
  const busyDialog = useBusyDialog();
  const confirmDialog = useConfirmDialog();
  const dialog = useDialog();

  useEffect(() => {
    if (date) {
      const slots = timeSlots[date];
      if (slots) {
        setSlots(slots);
        return;
      }

      const popup = busyDialog.show('Loading Time Slots ...');
      dispatch(loadTimeSlotsAsync(date, () => {
        popup.close();
      }));
    }
  }, [date, timeSlots]);

  useEffect(() => {
    if (selectedService) {
      setFilteredSlots(slots.filter((slot) => slot.serviceId === selectedService.id));
    }
  }, [selectedService, slots, setFilteredSlots]);

  useEffect(() => {
    if (selectedCategory) {
      const service = selectedCategory.services[0];
      setSelectedService(service);
    }
  }, [selectedCategory, setSelectedService]);

  const handleValueChange = useCallback(({ target }) => {
    const { name, value } = target;
    if (name === CATEGORY) {
      const category = categories.find((cat) => cat.id === Number.parseInt(value, 10));
      if (category) {
        setSelectedCategory(category);
      }
    } else if (name === SERVICE) {
      const service = selectedCategory.services.find(
        (serv) => serv.id === Number.parseInt(value, 10),
      );
      if (service) {
        setSelectedService(service);
      }
    } else if (name === DATE) {
      setDate(value);
    } else if (name === CHECK_ALL_SLOTS) {
      if (target.checked) {
        setCheckedSlots(filteredSlots.map(({ id }) => id));
      } else {
        setCheckedSlots([]);
      }
    } else if (name === CHECK_SLOT) {
      const id = Number.parseInt(value, 10);
      if (target.checked) {
        setCheckedSlots((slots) => {
          if (!slots.find((slot) => slot.id === id)) {
            return [...slots, id];
          }
          return slots;
        });
      } else {
        setCheckedSlots((slots) => slots.filter((slod) => slod.id !== id));
      }
    }
  }, [categories, selectedCategory, filteredSlots]);

  const handleEdit = useCallback((slot) => {
    let popup;
    const handleClose = () => popup.close();
    popup = dialog.show(<UpdateTimeSlotPopup slot={slot} onClose={handleClose} />);
  }, []);

  const handleDelete = useCallback((slot) => {
    confirmDialog.show(
      'Time Slot will be permanently deleted!',
      'Do you wish to continue?',
      (confirmed) => {
        if (confirmed) {
          const popup = busyDialog.show('Deleting Time Slot ...');
          dispatch(deleteTimeSlotAsync(slot, popup.close));
        }
      },
    );
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === DELETE_TIMESLOTS) {
      if (checkedSlots.length) {
        confirmDialog.show(
          `${checkedSlots.length} timeslots will be permanently deleted! Please NOTE that it is only appointments that are NOT booked or locked for booking that will be deleted. Please refresh your browser after deleting to see the timeslots that were NOT deleted.`,
          'Do you wish to continue?',
          (confirmed) => {
            if (confirmed) {
              const popup = busyDialog.show('Deleting Time Slots ...');
              dispatch(deleteTimeSlotsAsync(checkedSlots, date, popup.close));
            }
          },
        );
      }
    }
  }, [checkedSlots, date, confirmDialog]);

  return (
    <section className={`${css.content} ${css.overflow_hidden}`}>
      <PageHeader title="Timeslots">
        <NewLink to={routes.company.absolute.settings.newTimeSlots} text="New Time Slot" />
      </PageHeader>
      <div className={css.column_screen}>
        {!categories.length ? (
          <div className={`${css.empty_notice} ${css.time_slot_empty_pad}`}>
            No Service Categories Found!
          </div>
        ) : (
          <>
            <div className={css.time_slot_selects_block}>
              <div className={css.time_slot_select_wrap}>
                <div className={css.time_slot_select_label}>Select Category</div>
                <div className="select">
                  <select name={CATEGORY} value={selectedCategory.id} onChange={handleValueChange}>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={css.time_slot_select_wrap}>
                <div className={css.time_slot_select_label}>Select Service</div>
                <div className="select">
                  <select
                    name={SERVICE}
                    value={selectedService ? selectedService.id : undefined}
                    onChange={handleValueChange}
                  >
                    {selectedCategory.services.map((serv) => (
                      <option key={serv.id} value={serv.id}>{serv.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={css.time_slot_select_wrap}>
                <div className={css.time_slot_select_label}>Date</div>
                <DateButton date={date} onChange={setDate} />
              </div>
            </div>
            {!selectedService ? (
              <div className={`${css.empty_notice} ${css.time_slot_empty_pad}`}>
                No services found!
              </div>
            ) : (
              <div className="table-wrap">
                {!filteredSlots.length ? (
                  <div className={`${css.empty_notice} ${css.time_slot_empty_pad}`}>
                    No time slots found!
                  </div>
                ) : (
                  <div className={css.slots_table_wrap}>
                    <div className={css.slots_table_header}>
                      <input
                        type="checkbox"
                        name={CHECK_ALL_SLOTS}
                        checked={checkedSlots.length}
                        onChange={handleValueChange}
                      />
                      {checkedSlots.length ? (
                        <SvgButton
                          type="button"
                          name={DELETE_TIMESLOTS}
                          title="Delete Timeslots"
                          color={colors.delete}
                          path={paths.delete}
                          onClick={handleClick}
                          style={{ minWidth: 18 }}
                          sm
                        />
                      ) : null}
                    </div>
                    <div className={`table-card ${css.slots_table}`}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th className={css.slots_date_header}>Date</th>
                            <th>Time</th>
                            <th colSpan={2}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSlots.map((slot) => (
                            <tr key={slot.id}>
                              <TimeSlotRow
                                slot={slot}
                                checked={!!checkedSlots.find((id) => id === slot.id)}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onCheckedChanged={handleValueChange}
                              />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TimeSlots;
