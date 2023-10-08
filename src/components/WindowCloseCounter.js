import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const styles = {
  timerPanel: {
    padding: 12,
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

  useEffect(() => countDown(duration, setTime), []);

  useEffect(() => {
    if (style && Object.keys(style).length) {
      setConStyle({ ...styles.timerPanel, ...style });
    }
  }, [style, setConStyle]);

  return (
    <div style={conStyle}>{time}</div>
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
