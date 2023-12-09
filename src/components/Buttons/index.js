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
