import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { companyProps, periodProps } from '../../../../utils/propTypes';
import { d2, notification } from '../../../../utils';
import { SvgButton, paths } from '../../../../components/svg';
import Modal from '../../../../components/Modal';
import LoadingButton from '../../../../components/LoadingButton';
import { addCompanyPeriodAsync, deleteCompanyPeriodAsync } from '../../../../redux/companySlice';
import LoadingSpinner, { useBusyDialog } from '../../../../components/LoadingSpinner';

const START = 'start';
const END = 'end';

const weekDaysEnum = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

const weekDays = Object.keys(weekDaysEnum);

const typesEnum = {
  working_hours: 0,
  breaks: 1,
};

const toLocalTime = (minutes) => {
  const time = minutes + new Date().getTimezoneOffset();
  let hr = Math.floor(time / 60);
  let am = 'AM';

  if (hr > 12) {
    hr -= 12;
    am = 'PM';
  }

  return `${d2(hr)}:${d2(time % 60)} ${am}`;
};

/**
 * @param {string} time input time string
 */
const toUTCMinutes = (time) => {
  const parts = time.split(':').map((p) => Number.parseInt(p, 10));
  let minutes = ((60 * parts[0]) + parts[1]) - new Date().getTimezoneOffset();
  while (minutes >= 1440) {
    minutes -= 1440;
  }
  while (minutes < 0) {
    minutes += 1440;
  }
  return minutes;
};

const PeriodRow = ({ label, period, onAction }) => {
  const text = useMemo(() => {
    if (period) {
      return {
        start: toLocalTime(period.start),
        end: toLocalTime(period.end),
      };
    }

    return null;
  }, [label, period]);

  const handleClick = () => {
    onAction(label, period);
  };

  return (
    <div className="flex items-center gap-12 text-[#011c39] text-sm font-normal">
      <span className="w-24">{label}</span>
      {text ? (
        <div className="flex items-center gap-10">
          <div className="flex items-center justify-between w-32">
            <span>{text.start}</span>
            <span>-</span>
            <span>{text.end}</span>
          </div>
          <SvgButton
            color="#011c39"
            path={paths.deleteOutline}
            onClick={handleClick}
            style={{
              transform: 'scale(0.9)',
            }}
            sm
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="py-1 px-3 bg-[#e9ebf8] text[#011c39] text-xs rounded-[360px]"
        >
          Add Hours
        </button>
      )}
    </div>
  );
};

PeriodRow.propTypes = {
  period: periodProps,
  label: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
};

PeriodRow.defaultProps = {
  period: null,
};

const PeriodPanel = ({ periods, type }) => {
  const [busy, setBusy] = useState(false);
  const [editingWeekday, setEditingWeekday] = useState();
  const [fields, setFields] = useState({
    [START]: '',
    [END]: '',
  });
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  const handleAction = (label, period) => {
    if (period) {
      const popup = busyDialog.show('Deleting period');
      dispatch(deleteCompanyPeriodAsync(period.id, period.type, () => {
        popup.close();
      }));
    } else {
      setEditingWeekday(label);
    }
  };

  const handleValueChange = ({ target: { name, value } }) => setFields((fields) => (
    { ...fields, [name]: value }
  ));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!(fields.start && fields.end)) {
      notification.showError('Both start and end times are required!');
      return;
    }

    const start = toUTCMinutes(fields.start);
    const end = toUTCMinutes(fields.end);

    if (end <= start) {
      notification.showError('end MUST be greater than start!');
      return;
    }

    const data = {
      start,
      end,
      period_type: typesEnum[type],
      weekday: weekDaysEnum[editingWeekday],
    };

    setBusy(true);

    dispatch(addCompanyPeriodAsync(data, (err) => {
      setBusy(false);

      if (!err) {
        setEditingWeekday('');
      }
    }));
  };

  return (
    <div id={`period-panel-${type}`} className="flex flex-col gap-4">
      {periods.map(({ label, period }) => (
        <PeriodRow key={label} label={label} period={period} onAction={handleAction} />
      ))}
      <Modal
        isOpen={!!editingWeekday || busy}
        parentSelector={() => document.querySelector(`#period-panel-${type}`)}
        onRequestClose={() => {
          if (!busy) {
            setEditingWeekday('');
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <form
          onSubmit={handleSubmit}
          className="modal-bold-body max-h-[80vh] overflow-auto relative"
        >
          <h1 className="m-1 font-semibold text-2xl">
            {`${editingWeekday}s`}
          </h1>
          <label htmlFor={START} className="bold-select-wrap">
            <span className="label">Start Time</span>
            <input
              type="time"
              name={START}
              id={START}
              value={fields[START]}
              onChange={handleValueChange}
              className="text-input"
            />
          </label>
          <label htmlFor={END} className="bold-select-wrap">
            <span className="label">End Time</span>
            <input
              type="time"
              name={END}
              id={END}
              value={fields[END]}
              onChange={handleValueChange}
              className="text-input"
            />
          </label>
          <LoadingButton
            type="submit"
            loading={busy}
            label="Submit"
            styles={{ marginTop: 0 }}
          />
          {busy ? (
            <LoadingSpinner>
              <span>Adding period ...</span>
            </LoadingSpinner>
          ) : null}
        </form>
      </Modal>
    </div>
  );
};

PeriodPanel.propTypes = {
  periods: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    period: periodProps,
  })).isRequired,
  type: PropTypes.string.isRequired,
};

export const WorkingHours = ({ company }) => {
  const periods = useMemo(() => weekDays.map((w) => ({
    label: w,
    period: company.workingHours.find(({ weekday }) => weekday === w.toLowerCase()),
  })), [company]);

  return (
    <PeriodPanel periods={periods} type="working_hours" />
  );
};

WorkingHours.propTypes = {
  company: companyProps.isRequired,
};

export const Breaks = ({ company }) => {
  const periods = useMemo(() => weekDays.map((w) => ({
    label: w,
    period: company.breaks.find(({ weekday }) => weekday === w.toLowerCase()),
  })), [company]);

  return (
    <PeriodPanel periods={periods} type="breaks" />
  );
};

Breaks.propTypes = {
  company: companyProps.isRequired,
};
