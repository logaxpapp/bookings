import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { dateUtils } from '../../utils';

const DATE = 'date';

export const NewLink = ({ text, to, state }) => (
  <Link
    to={to}
    state={state}
    className={css.new_btn}
  >
    <svg viewBox="0 0 24 24" className={css.new_svg}>
      <path
        d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
        fill="currentColor"
      />
    </svg>
    <span>{text}</span>
  </Link>
);

NewLink.propTypes = {
  text: PropTypes.string,
  to: PropTypes.string,
  state: PropTypes.shape({}),
};

NewLink.defaultProps = {
  text: 'Link',
  to: '',
  state: undefined,
};

export const NewButton = ({ name, text, onClick }) => (
  <button
    type="button"
    name={name}
    className={css.new_btn}
    onClick={onClick}
  >
    <svg viewBox="0 0 24 24" className={css.new_svg}>
      <path
        d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
        fill="currentColor"
      />
    </svg>
    <span>{text}</span>
  </button>
);

NewButton.propTypes = {
  name: PropTypes.string,
  text: PropTypes.string,
  onClick: PropTypes.func,
};

NewButton.defaultProps = {
  name: undefined,
  text: 'New Button',
  onClick: null,
};

export const ImageButton = ({
  name,
  src,
  isSubmit,
  onClick,
}) => (
  <button
    // eslint-disable-nex-line
    type={isSubmit ? 'submit' : 'button'}
    name={name}
    onClick={onClick}
    className={css.image_btn}
  >
    <img src={src} alt={name} />
  </button>
);

ImageButton.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  isSubmit: PropTypes.bool,
  onClick: PropTypes.func,
};

ImageButton.defaultProps = {
  name: undefined,
  src: null,
  isSubmit: false,
  onClick: null,
};

export const DateButton = ({ date, onChange }) => {
  const [localDate, setLocalDate] = useState(dateUtils.toNormalizedString(new Date()));
  const dateInput = useRef();

  useEffect(() => {
    if (date) {
      setLocalDate(date);
    }
  }, [date, setLocalDate]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === DATE) {
      if (onChange) {
        onChange(value);
      }
      if (!date) {
        setLocalDate(value);
      }
    }
  }, [date, onChange, setLocalDate]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === DATE) {
      dateInput.current.showPicker();
    }
  }, []);

  return (
    <div className={css.header_date_wrap}>
      <button
        type="button"
        name={DATE}
        className={css.header_date_btn}
        onClick={handleClick}
      >
        <span className={`calendar-date-icon ${css.header_calendar_date_icon}`}>
          {(new Date()).getDate()}
        </span>
        <span>{new Date(localDate).toDateString()}</span>
      </button>
      <input
        ref={dateInput}
        type="date"
        name={DATE}
        value={localDate}
        className="clip"
        onChange={handleValueChange}
      />
    </div>
  );
};

DateButton.propTypes = {
  date: PropTypes.string,
  onChange: PropTypes.func,
};

DateButton.defaultProps = {
  date: '',
  onChange: null,
};

export const TimePicker = ({ time, onChange }) => {
  const [localTime, setLocalTime] = useState();
  const [timeText, setTimeText] = useState('Time not set.');
  const dateInput = useRef();

  useEffect(() => {
    if (time) {
      setLocalTime(dateUtils.dateTimeToInputString(time));
    }
  }, [time, setLocalTime]);

  useEffect(() => {
    if (localTime) {
      const date = new Date(localTime);
      if (!Number.isNaN(date.getDate())) {
        setTimeText(date.toLocaleString());
      }
    }
  }, [localTime]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === DATE) {
      if (onChange) {
        onChange(value);
      }
      if (!time) {
        setLocalTime(value);
      }
    }
  }, [time, onChange]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === DATE) {
      dateInput.current.showPicker();
    }
  }, []);

  return (
    <div className={css.header_date_wrap}>
      <button
        type="button"
        name={DATE}
        className={css.header_time_btn}
        onClick={handleClick}
      >
        <span>{timeText}</span>
      </button>
      <input
        ref={dateInput}
        type="datetime-local"
        name={DATE}
        value={localTime}
        className="clip"
        onChange={handleValueChange}
      />
    </div>
  );
};

TimePicker.propTypes = {
  time: PropTypes.string,
  onChange: PropTypes.func,
};

TimePicker.defaultProps = {
  time: '',
  onChange: null,
};

export const ShareButtonDesign = () => (
  <div className="flex gap-1 items-center bg-[#011c39] rounded-[101px] px-6 py-[10px]">
    <svg className="w-6 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5951 5.35445L12.4305 4.34307C11.5914 3.61435 11.2625 3.22234 10.8081 3.36092C10.2415 3.53372 10.428 4.62406 10.428 4.99216C9.54707 4.99216 8.6312 4.9244 7.76287 5.06557C4.89635 5.53161 4 7.57106 4 9.76833C4.81131 9.271 5.62183 8.7164 6.59693 8.48593C7.81413 8.1982 9.17353 8.33546 10.428 8.33546C10.428 8.70359 10.2415 9.79393 10.8081 9.96673C11.3229 10.1237 11.5914 9.71326 12.4305 8.9846L13.5951 7.9732C14.3095 7.35286 14.6667 7.04266 14.6667 6.66382C14.6667 6.285 14.3095 5.97482 13.5951 5.35445Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.04572 2C4.47222 2.00463 3.12461 2.06768 2.26339 2.92715C1.33398 3.85468 1.33398 5.3475 1.33398 8.33313C1.33398 11.3188 1.33398 12.8116 2.26338 13.7391C3.19279 14.6667 4.68864 14.6667 7.68032 14.6667C10.6721 14.6667 12.1679 14.6667 13.0973 13.7391C13.7444 13.0933 13.9409 12.1735 14.0007 10.6667" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="text-white text-sm font-medium">Share</span>
  </div>
);
