import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import {
  getCalendarDays,
  monthValues,
  weekdays,
} from '../../utils';
import { SvgButton } from '../svg';

const DECREMENT = 'decrement';
const INCREMENT = 'increment';

/**
 * @param {Object} props
 * @param {Date} props.initialDate
 */
const DatePicker = ({ initialDate, onDateChange }) => {
  const [date, setDate] = useState(initialDate);
  const [monthAndYear, setMonthAndYear] = useState({
    month: date.getMonth(),
    year: date.getFullYear(),
  });
  const [days, setDays] = useState({
    previous: [],
    current: [],
    next: [],
  });

  useEffect(() => {
    setDays(getCalendarDays(monthAndYear.month, monthAndYear.year));
  }, [monthAndYear, setDays]);

  const handleDateChange = useCallback(({ target: { name } }) => {
    const parts = name.split('#');
    if (parts.length !== 2 || Number.isNaN(parts[1])) {
      return;
    }

    const d = Number.parseInt(parts[1], 10);
    let { month } = monthAndYear;
    if (parts[0] === 'p') {
      month -= 1;
    } else if (parts[0] === 'n') {
      month += 1;
    }

    const date = new Date(monthAndYear.year, month, d);
    setDate(date);

    if (onDateChange) {
      onDateChange(date);
    }
  }, [monthAndYear, onDateChange, setDate]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === INCREMENT) {
      const date = new Date(monthAndYear.year, monthAndYear.month + 1, 1);
      setMonthAndYear({ year: date.getFullYear(), month: date.getMonth() });
    } else if (name === DECREMENT) {
      const date = new Date(monthAndYear.year, monthAndYear.month - 1, 1);
      setMonthAndYear({ year: date.getFullYear(), month: date.getMonth() });
    }
  }, [monthAndYear, setMonthAndYear]);

  const today = new Date();

  return (
    <section className={css.grid_calendar_wrap}>
      <div className={css.grid_calendar_header}>
        <div>
          {`${monthValues[monthAndYear.month]} ${monthAndYear.year}`}
        </div>
        <div className={css.grid_calendar_header_controls}>
          <SvgButton
            type="button"
            name={DECREMENT}
            onClick={handleClick}
            path="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
          />
          <SvgButton
            type="button"
            name={INCREMENT}
            onClick={handleClick}
            path="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
          />
        </div>
      </div>
      <div className={css.grid_calendar}>
        {weekdays.map((day) => (
          <div key={day} className={`${css.grid_calendar_cell} ${css.grid_calendar_cell_heading}`}>
            <span>{day.substring(0, 1)}</span>
          </div>
        ))}
        {days.previous.map((d) => (
          <button
            key={d}
            type="button"
            name={`p#${d}`}
            className={`${css.grid_calendar_cell} ${css.fade} ${date.getDate() === d && date.getMonth() === monthAndYear.month - 1 && date.getFullYear() === monthAndYear.year ? css.active : ''}`}
            onClick={handleDateChange}
          >
            <span>{d}</span>
          </button>
        ))}
        {days.current.map((d) => (
          <button
            key={d}
            type="button"
            name={`c#${d}`}
            className={`
              ${css.grid_calendar_cell}
              ${monthAndYear.month === today.getMonth() && monthAndYear.year === today.getFullYear() && d === today.getDate() ? css.today : ''}
              ${date.getDate() === d && date.getMonth() === monthAndYear.month && date.getFullYear() === monthAndYear.year ? css.active : ''}
            `}
            onClick={handleDateChange}
          >
            <span>{d}</span>
          </button>
        ))}
        {days.next.map((d) => (
          <button
            key={d}
            type="button"
            name={`n#${d}`}
            className={`${css.grid_calendar_cell} ${css.fade}  ${date.getDate() === d && date.getMonth() === monthAndYear.month + 1 && date.getFullYear() === monthAndYear.year ? css.active : ''}`}
            onClick={handleDateChange}
          >
            <span>{d}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

DatePicker.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func,
};

DatePicker.defaultProps = {
  initialDate: new Date(),
  onDateChange: null,
};

export default DatePicker;
