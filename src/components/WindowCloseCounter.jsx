import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

const CLOSE = 'close';
const STOP_TIMER = 'stop_timer';

const styles = {
  timerPanel: {
    padding: 12,
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: 48,
    paddingTop: 16,
  },
};

const countDown = (() => {
  let listener;
  let time = 20;
  let interval;

  const clear = () => {
    clearInterval(interval);
    listener = null;
  };

  return (duration, callback) => {
    time = duration;
    if (listener) {
      listener = callback;
      return clear;
    }

    listener = callback;

    interval = setInterval(() => {
      time -= 1;
      if (listener) {
        listener(`Window will close in ${time} seconds.`);
      }
      if (time === 0) {
        clearInterval(interval);
        window.close();
      }
    }, 1000);

    return clear;
  };
})();

const WindowCloseCounter = ({ duration, style }) => {
  const [time, setTime] = useState('');
  const [conStyle, setConStyle] = useState(styles.timerPanel);
  const clearTimer = useRef();

  useEffect(() => {
    clearTimer.current = countDown(duration, setTime);
    return () => clearTimer.current();
  }, []);

  useEffect(() => {
    if (style && Object.keys(style).length) {
      setConStyle({ ...styles.timerPanel, ...style });
    }
  }, [style, setConStyle]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      window.close();
    } else if (name === STOP_TIMER) {
      clearTimer.current();
    }
  }, []);

  return (
    <div style={conStyle}>
      <div>{time}</div>
      <div style={styles.controls}>
        <button
          type="button"
          name={CLOSE}
          className="link compact-link"
          onClick={handleClick}
        >
          Close Window
        </button>
        <button
          type="button"
          name={STOP_TIMER}
          className="link compact-link"
          onClick={handleClick}
        >
          Stop Counter
        </button>
      </div>
    </div>
  );
};

WindowCloseCounter.propTypes = {
  duration: PropTypes.number,
  style: PropTypes.shape({}),
};

WindowCloseCounter.defaultProps = {
  duration: 20,
  style: null,
};

export default WindowCloseCounter;
