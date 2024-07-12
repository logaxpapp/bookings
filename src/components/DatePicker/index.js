/* eslint-disable no-nested-ternary */
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import {
  getCalendarDays,
  monthValues,
  weekdays,
} from '../../utils';

const DECREMENT = 'decrement';
const INCREMENT = 'increment';
const TOGGLE_MODE = 'toggle_mode';

const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/**
 * @param {Date} date
 * @returns {string}
 */
const defaultDateFormatter = (date) => date.toLocaleDateString();

/**
 * @param {number} date
 * @param {{ month: number, year: number }} d1
 * @param {Date} d2
 */
const isDateEqual = (date, d1, d2) => (
  date === d2.getDate()
  && d1.month === d2.getMonth()
  && d1.year === d2.getFullYear()
);

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
  }, [monthAndYear]);

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
  }, [monthAndYear, onDateChange]);

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
    <section className="min-w-60">
      <header className="p-2 flex items-center justify-between gap-8">
        <button
          type="button"
          name={TOGGLE_MODE}
          className="cursor-pointer bg-transparent whitespace-nowrap text-[#011c39] dark:text-white text-base text-left p-0 min-w-30"
          onClick={handleClick}
        >
          {dateMode ? `${monthValues[monthAndYear.month]} ${monthAndYear.year}` : monthAndYear.year}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="decrement"
            name={DECREMENT}
            className="bg-transparent p-0"
            onClick={handleClick}
          >
            <ChevronLeftIcon className="w-6 h-6 text-[#011c39] dark:text-white pointer-events-none" />
          </button>
          <button
            type="button"
            aria-label="decrement"
            name={INCREMENT}
            className="bg-transparent p-0"
            onClick={handleClick}
          >
            <ChevronRightIcon className="w-6 h-6 text-[#011c39] dark:text-white pointer-events-none" />
          </button>
        </div>
      </header>
      {dateMode ? (
        <div className="grid grid-cols-7">
          {weekdays.map((day) => (
            <div
              key={day}
              className="bg-transparent flex items-center justify-center w-6 h-6 font-black text-xs p-0 rounded-full duration-300 ease-in text-[#011c39] dark:text-white"
            >
              <span>{day.substring(0, 1)}</span>
            </div>
          ))}
          {days.previous.map((d) => (
            <button
              key={d}
              type="button"
              name={`p#${d}`}
              className={`flex items-center justify-center w-6 h-6 font-medium text-xs p-0 rounded-full duration-300 ease-in opacity-50 ${date.getDate() === d && ((date.getMonth() === 11 && date.getFullYear() === monthAndYear.year - 1) || (date.getMonth() === monthAndYear.month - 1 && date.getFullYear() === monthAndYear.year)) ? 'text-[#F3FCE6] bg-[#89E101]' : 'bg-transparent text-#[#011c39] dark:text-white hover:bg-[#efefef] dark:hover:bg-[#334255]'}`}
              onClick={handleDateChange}
            >
              <span className="pointer-events-none">{d}</span>
            </button>
          ))}
          {days.current.map((d) => (
            <button
              key={d}
              type="button"
              name={`c#${d}`}
              className={`
                flex items-center justify-center w-6 h-6 font-medium text-xs p-0 rounded-full duration-300 ease-in ${isDateEqual(d, monthAndYear, today) ? 'text-[#F3FCE6] bg-[#89E101]' : isDateEqual(d, monthAndYear, date) ? 'text-[#F3FCE6] bg-[#89E101] opacity-60' : 'bg-transparent text-[#011c39] dark:text-white hover:bg-[#efefef] dark:hover:bg-[#334255]'}
              `}
              onClick={handleDateChange}
            >
              <span className="pointer-events-none">{d}</span>
            </button>
          ))}
          {days.next.map((d) => (
            <button
              key={d}
              type="button"
              name={`n#${d}`}
              className={`flex items-center justify-center w-6 h-6 font-medium text-xs p-0 rounded-full duration-300 ease-in opacity-50 ${date.getDate() === d && ((date.getMonth() === 0 && date.getFullYear() === monthAndYear.year + 1) || (date.getMonth() === monthAndYear.month + 1 && date.getFullYear() === monthAndYear.year)) ? 'text-[#F3FCE6] bg-[#89E101]' : 'bg-transparent text-#[#011c39] dark:text-white hover:bg-[#efefef] dark:hover:bg-[#334255]'}`}
              onClick={handleDateChange}
            >
              <span className="pointer-events-none">{d}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-0.5">
          {months.map((month, idx) => (
            <button
              key={month}
              type="button"
              name={idx}
              title={month}
              className="w-full aspect-square flex items-center justify-center cursor-pointer bg-transparent rounded border text-[#011c39] dark:text-white"
              onClick={handleMonthClick}
            >
              <span className="pointer-events-none">{month}</span>
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

/**
 * @param {Object} props
 * @param {Date} props.initialDate
 */
export const DatePicker2 = ({
  initialDate,
  onChange,
  dateFormatter,
  className,
  right,
}) => {
  const [date, setDate] = useState(initialDate);
  const dateString = useMemo(() => dateFormatter(date), [date]);

  const handleDateChange = (date) => {
    setDate(date);

    if (onChange) {
      onChange(date);
    }
  };

  return (
    <Popover className="relative">
      <div>
        <Popover.Button
          className={`${className} flex gap-10 justify-between items-center font-medium text-base text-[#5c5c5c] dark:text-white border border-[#8e98a8] dark:border-[#334255] py-3 px-4 rounded-[10px] min-w-44`}
        >
          <span>{dateString}</span>
          <ChevronDownIcon aria-hidden="true" className="w-5 h-5 text-[#5c5c5c] dark:text-white" />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel
            className={`absolute z-50 left-0 mt-3 px-4 py-3 shadow-xl bg-white dark:bg-[#1a222c] ${right ? 'translate-x-6' : '-translate-x-1/2'}`}
          >
            <DatePicker initialDate={date} onDateChange={handleDateChange} />
          </Popover.Panel>
        </Transition>
      </div>
    </Popover>
  );
};

DatePicker2.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  dateFormatter: PropTypes.func,
  className: PropTypes.string,
  right: PropTypes.bool,
};

DatePicker2.defaultProps = {
  initialDate: new Date(),
  onChange: null,
  dateFormatter: defaultDateFormatter,
  className: 'border border-[#8e98a8] dark:border-[#3f4549]',
  right: false,
};

export default DatePicker;
