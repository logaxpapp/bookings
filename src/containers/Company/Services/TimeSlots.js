/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import {
  SvgButton,
  colors,
  paths,
} from '../../../components/svg';
import { TimePicker } from '../../../components/Buttons';
import {
  dateToNormalizedString,
  dateUtils,
  notification,
  classNames,
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
import { useBusyDialog } from '../../../components/LoadingSpinner';
import GridPanel from '../../../components/GridPanel';
import { FieldEditor } from '../../../components/TextBox';
import { DatePicker2 } from '../../../components/DatePicker';
import { Heading1 } from '../../Aside';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import gearIcon from '../../../assets/images/gear.svg';
import Modal from '../../../components/Modal';
import { useWindowSize } from '../../../lib/hooks';

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
const OPEN = 'open';
const REPEATS = 'repeats';
const SAVE = 'save';
const SERVICE = 'service';
const START_DATE = 'start_date';
const TIME = 'time';
const UPDATE = 'update';

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * @param {Date} date
 */
const formatter = (date) => date.toLocaleDateString('en-us', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

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
      <td className="flex items-center gap-2 h-[39px]">
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
          <td aria-label="edit" className="control">
            <SvgButton
              type="button"
              name={EDIT}
              path={paths.pencil}
              title="Edit"
              onClick={handleClick}
              sm
            />
          </td>
          <td aria-label="delete" className="control">
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

const AutoTimeSlotCard = ({
  slot,
  service,
  onChange,
  onDelete,
}) => {
  const datetime = useMemo(() => {
    const date = new Date(slot.time);
    const time = 3600 * date.getHours() + 60 * date.getMinutes();
    const timeParts = date.toLocaleTimeString().split(':');
    const mer = timeParts.pop().split(' ').pop();

    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      text: `${timeParts.join(':')} ${mer}`,
      slotDate: dateUtils.toNormalizedString(date),
      overlapStart: (time - service.duration) / 60,
      overlapEnd: (time + service.duration) / 60,
      overlapTime: time / 60,
    };
  }, [slot, service]);
  const [overlaps, setOverlaps] = useState();
  const [overlapsModal, setOverlapsModal] = useState({ busy: false, isOpen: false });
  const [isRight, setRight] = useState(false);
  const timeSlots = useSelector(selectTimeSlots);
  const { width } = useWindowSize();
  const timeInput = useRef();
  const containerRef = useRef();
  const dispatch = useDispatch();

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

  useEffect(() => {
    const elmt = containerRef.current;
    const rect = elmt.getBoundingClientRect();
    const rect2 = elmt.parentElement.getBoundingClientRect();

    setRight(rect2.right - rect.right < 200);
  }, [width]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === LOAD) {
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
    <div ref={containerRef} id={`slot-${slot.id}`} className="p-1">
      <article
        className="py-3 px-4 w-full flex items-center justify-between border border-[#e6edf3] rounded-md relative"
      >
        <p className="m-0 whitespace-pre-wrap">{datetime.text}</p>
        <Menu as="div" className="inline-block text-left">
          <div>
            <Menu.Button
              className="bg-transparent p-0 border-none outline-none"
            >
              <EllipsisVerticalIcon stroke="#5c5c5c" className="w-5 h-5" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className={`absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${isRight ? 'right-0' : 'left-0'}`}>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-lg',
                      )}
                      onClick={() => timeInput.current.showPicker()}
                    >
                      Edit Slot
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-lg',
                      )}
                      onClick={() => setOverlapsModal({ isOpen: true, busy: false })}
                    >
                      View Overlaps
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`block w-full px-4 py-2 text-left text-lg text-[#b61818] ${active ? 'bg-gray-100' : ''}`}
                      onClick={() => onDelete(slot)}
                    >
                      Delete Slot
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <div className="left-2 bottom-6 absolute">
          <input
            ref={timeInput}
            type="datetime-local"
            name={TIME}
            className="clip"
            onChange={handleValueChange}
          />
        </div>
      </article>
      <Modal
        isOpen={overlapsModal.busy || overlapsModal.isOpen}
        parentSelector={() => document.querySelector(`#slot-${slot.id}`)}
        onRequestClose={() => {
          if (!overlapsModal.busy) {
            setOverlapsModal({ busy: false, isOpen: false });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <section className="w-full h-full overflow-auto max-h-[80vh] min-h-32 py-5 px-8">
          <h1 className="text-sm">
            {`${overlaps?.length ? `${overlaps.length} Overlap found` : 'Overlaps'}`}
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
                <div className="font-bold text-[#858b9c] text-[0.8rem]">
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
      </Modal>
    </div>
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
  const [controlsVisible, setControlsVisible] = useState(true);
  const [slots, setSlots] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [repeats, setRepeats] = useState(1);
  const company = useSelector(selectCompany);
  const employees = useSelector(selectEmployees);
  const permissions = useSelector(selectPermissions);
  const workSettings = useMemo(() => {
    const hours = Array(7);
    const breaks = Array(7);

    weekdays.forEach((day, idx) => {
      let hr = company.workingHours.find(({ weekday }) => weekday === day);
      hours[idx] = hr ? { start: hr.start * 60, end: hr.end * 60 } : hr;
      hr = company.breaks.find(({ weekday }) => weekday === day);
      breaks[idx] = hr ? { start: hr.start * 60, end: hr.end * 60 } : hr;
    });

    console.log(hours);

    return { hours, breaks };
  }, [company]);
  const startDateRef = useRef();
  const endDateRef = useRef();
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  const slotKeys = Object.keys(slots);

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

      const slots = {};
      let slot;
      let id = 1;
      while (date <= lastDate) {
        const dateSlots = [];
        const day = date.getDay();
        const hours = workSettings.hours[day];
        if (hours) {
          const breaks = workSettings.breaks[day];
          const end = hours.end - service.duration;
          let time = hours.start;
          const lDate = new Date(date);
          while (time <= end) {
            const slotEnd = time + service.duration;
            if (
              breaks && (
                (time <= breaks.start && slotEnd <= breaks.end)
                || (time >= breaks.start && time < breaks.end)
              )
            ) {
              time = slotEnd;
              // eslint-disable-next-line no-continue
              continue;
            }

            lDate.setHours(Math.floor(time / 3600));
            lDate.setMinutes(Math.floor((time % 3600) / 60));
            slot = {
              id,
              time: lDate.toUTCString(),
              serviceId: service.id,
            };

            for (let i = 0; i < repeats; i += 1) {
              dateSlots.push({ ...slot, id });
              id += 1;
            }

            id += 1;
            time = slotEnd;
          }
        }

        if (dateSlots.length) {
          slots[`${dateUtils.getWeekday(date.getDay(), true)} ${date.toLocaleDateString()}`] = dateSlots;
        }

        date.setDate(date.getDate() + 1);
      }

      setSlots(slots);
      setControlsVisible(false);
      popup.close();
    } else if (name === SAVE) {
      if (!slotKeys?.length) {
        notification.showError('There are no time slots to save!');
        return;
      }

      const list = slotKeys.reduce((memo, key) => (
        [...memo, ...slots[key].map(({ time }) => ({ time }))]
      ), []);

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
    } else if (name === CLOSE) {
      setControlsVisible(false);
    } else if (name === OPEN) {
      setControlsVisible(true);
    }
  }, [
    company, startDate, endDate, repeats,
    service, slots, permissions, workSettings,
  ]);

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
    <section className="p-2 h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between">
        <h1 className="text-[0.9rem] mb-1 pb-1">
          Auto Generate
        </h1>
        {controlsVisible ? null : (
          <button
            type="button"
            aria-label="Open Controls"
            title="Open Controls"
            name={OPEN}
            onClick={handleClick}
            className="w-4 h-4 cursor-pointer border-none outline-none transition-transform hover:scale-105 bg-[#5c5c5c]"
            style={{
              maskSize: '100% 100%',
              maskImage: `url(${gearIcon})`,
            }}
          />
        )}
      </header>
      <div className="text-[0.9rem] mb-2 pb-1 flex-1 overflow-auto">
        {slotKeys.length ? slotKeys.map((key) => (
          <section key={key}>
            <h1 className="py-4 px-8 font-semibold text-[#011c39] text-lg mb-0 bg-[#f0f0f0]">
              {key}
            </h1>
            <GridPanel minimumChildWidth={140}>
              {slots[key].map((slot) => (
                <AutoTimeSlotCard
                  key={slot.id}
                  slot={slot}
                  service={service}
                  onChange={handleChange}
                  onDelete={handleDelete}
                />
              ))}
            </GridPanel>
          </section>
        )) : (
          <section className="font-bold text-[0.8rem] text-center text-[#858b9c]">
            List is Empty!
          </section>
        )}
      </div>
      {controlsVisible ? (
        <div className="p-2 bg-[#e7f1f5] flex justify-between items-center flex-wrap gap-3 whitespace-pre">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1 relative">
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
            <div className="flex items-center gap-1 relative">
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              name={GENERATE}
              className="control-btn text-[0.6rem]"
              onClick={handleClick}
            >
              Generate
            </button>
            {slotKeys.length ? (
              <>
                <button
                  type="button"
                  name={SAVE}
                  className="control-btn green text-[0.6rem]"
                  onClick={handleClick}
                >
                  Save
                </button>
                <button
                  type="button"
                  name={CLEAR}
                  className="control-btn cancel text-[0.6rem]"
                  onClick={handleClick}
                >
                  Clear
                </button>
              </>
            ) : null}
            <button
              type="button"
              name={CLOSE}
              className="control-btn cancel text-[0.6rem]"
              onClick={handleClick}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
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
    <section className="w-full h-full flex flex-col overflow-hidden p-2">
      <h1 className="text-[0.9rem] mb-1 pb-1">
        Overlaps
      </h1>
      {overlaps ? (
        <>
          <div className="py-0 px-2 text-[0.7rem]">
            {`${overlaps.length} overlap${overlaps.length === 1 ? '' : 's'} found.`}
          </div>
          {overlaps.length ? (
            <div className="flex-1 overflow-auto py-3 px-6">
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
        <div className="p-6 flex justify-center">
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
      <section className="relative py-2 px-4">
        <h1 className="text-[1.4rem] pb-6 mb-6 border border-dotted border-[#eee]">Update TimeSlot</h1>
        <div className="min-w-60 grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-[0.8rem]">Set Time</div>
            <input
              type="datetime-local"
              name={TIME}
              value={time}
              onChange={handleValueChange}
              className="block w-full border border-[#eceff1] rounded"
            />
          </div>
        </div>
        <div className="form-controls pad-top">
          <button
            type="button"
            name={UPDATE}
            className="control-btn text-[0.6rem]"
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

const tabs = {
  AUTO: 'Auto Generate',
  CUSTOM: 'Custom Slot',
};

const headers = Object.values(tabs);

const NewTimeSlotBody = ({
  service,
  time,
  clickHandler,
  valueChangeHandler,
}) => {
  const [tab, setTab] = useState(tabs.AUTO);

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
      <div className="py-5">
        <TabHeaders tab={tab} headers={headers} setTab={setTab} />
      </div>
      <TabBody tab={tab} header={tabs.CUSTOM} className="flex-1 overflow-hidden">
        <div className="flex flex-col overflow-hidden h-full">
          <div className="flex-1 flex overflow-hidden border border-[#cfd8df] bg-white rounded">
            <OverlapsPanel
              serviceId={service ? service.id : 0}
              time={time}
            />
          </div>
          <section className="relative p-2 bg-[#e7f1f5]">
            <div className="flex flex-wrap items-center gap-6">
              <div className="font-bold text-[0.8rem]">Set Time</div>
              <TimePicker time={time} onChange={valueChangeHandler} />
              <button
                type="button"
                name={SAVE}
                className="control-btn text-[0.6rem]"
                onClick={clickHandler}
              >
                SAVE
              </button>
            </div>
          </section>
        </div>
      </TabBody>
      <TabBody tab={tab} header={tabs.AUTO} className="flex-1 overflow-hidden">
        <div
          className="h-full overflow-hidden border border-[#cfd8df] bg-white rounded"
        >
          <AutoGeneratePanel service={service} />
        </div>
      </TabBody>
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
    <section className="flex-1 overflow-hidden h-full py-5 px-8 flex flex-col">
      <Heading1>New Timeslots</Heading1>
      <div className="flex-1 h-full flex flex-col overflow-hidden pt-4">
        {!categories.length ? (
          <div className="font-bold text-xl text-[#858b9c] p-12 text-center">
            No Service Categories Found!
          </div>
        ) : (
          <>
            <div className="py-2 px-4 flex flex-wrap gap-6 border border-[#eee]">
              <label className="bold-select-wrap min-w-24">
                <span className="label">Select Category</span>
                <div className="bold-select caret">
                  <select name={CATEGORY} value={selectedCategory.id} onChange={handleValueChange}>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="bold-select-wrap">
                <span className="label">Select Service</span>
                <div className="bold-select caret">
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
              </label>
            </div>
            {!service ? (
              <div className="font-bold text-xl text-[#858b9c] p-12 text-center">
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
  const hasServiceRef = useRef(false);

  useEffect(() => {
    if (date) {
      const slots = timeSlots[date];
      if (slots) {
        setSlots(slots);
        return;
      }

      if (!hasServiceRef.current) {
        return;
      }

      const popup = busyDialog.show('Loading Time Slots ...');
      dispatch(loadTimeSlotsAsync(date, () => {
        popup.close();
      }));
    }
  }, [date, timeSlots]);

  useEffect(() => {
    hasServiceRef.current = !!selectedService;
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
    <section className="flex-1 overflow-hidden py-5 px-8 h-full">
      <Heading1>Timeslots</Heading1>
      <div className="flex-1 h-full flex flex-col overflow-hidden pt-4">
        {!categories.length ? (
          <div className="font-bold text-xl text-[#858b9c] p-12 text-center">
            No Service Categories Found!
          </div>
        ) : (
          <>
            <div className="py-2 px-4 flex flex-wrap gap-6 border border-[#eee]">
              <label className="bold-select-wrap">
                <span className="label">Select Category</span>
                <div className="bold-select caret">
                  <select name={CATEGORY} value={selectedCategory.id} onChange={handleValueChange}>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="bold-select-wrap">
                <span className="label">Select Service</span>
                <div className="bold-select caret">
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
              </label>
              <div className="bold-select-wrap">
                <div className="label">Date</div>
                <DatePicker2
                  initialDate={new Date(date)}
                  dateFormatter={formatter}
                  onChange={setDate}
                />
              </div>
            </div>
            {!selectedService ? (
              <div className="font-bold text-xl text-[#858b9c] p-12 text-center">
                No services found!
              </div>
            ) : (
              <div className="table-wrap">
                {!filteredSlots.length ? (
                  <div className="font-bold text-xl text-[#858b9c] p-12 text-center">
                    No time slots found!
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="py-2 px-4 flex items-center gap-6">
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
                    <div className="table-card">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="pl-9">Date</th>
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
