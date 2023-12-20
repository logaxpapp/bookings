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
const TOGGLE_MODE = 'toggle_mode';

const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

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
  const [dateMode, setDateMode] = useState(true);

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
      setMonthAndYear((monthAndYear) => {
        if (dateMode) {
          const date = new Date(monthAndYear.year, monthAndYear.month + 1, 1);
          return { year: date.getFullYear(), month: date.getMonth() };
        }
        return { ...monthAndYear, year: monthAndYear.year + 1 };
      });
    } else if (name === DECREMENT) {
      setMonthAndYear((monthAndYear) => {
        if (dateMode) {
          const date = new Date(monthAndYear.year, monthAndYear.month - 1, 1);
          return { year: date.getFullYear(), month: date.getMonth() };
        }
        return { ...monthAndYear, year: monthAndYear.year - 1 };
      });
    } else if (name === TOGGLE_MODE) {
      setDateMode((mode) => !mode);
    }
  }, [dateMode]);

  const handleMonthClick = useCallback(({ target: { name } }) => {
    setMonthAndYear((monthAndYear) => ({ ...monthAndYear, month: Number.parseInt(name, 10) }));
    setDateMode(true);
  }, []);

  const today = new Date();

  return (
    <section className={css.grid_calendar_wrap}>
      <header className={css.grid_calendar_header}>
        <button type="button" name={TOGGLE_MODE} className={css.month_year_wrap} onClick={handleClick}>
          {dateMode ? `${monthValues[monthAndYear.month]} ${monthAndYear.year}` : monthAndYear.year}
        </button>
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
      </header>
      {dateMode ? (
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
      ) : (
        <div className={`${css.grid_calendar} ${css.months_grid}`}>
          {months.map((month, idx) => (
            <button
              key={month}
              type="button"
              name={idx}
              title={month}
              className={css.month_btn}
              onClick={handleMonthClick}
            >
              <span>{month}</span>
            </button>
          ))}
        </div>
      )}
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
