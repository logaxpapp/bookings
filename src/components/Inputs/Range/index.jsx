/* eslint-disable jsx-a11y/control-has-associated-label */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';

const Range = ({
  name,
  value,
  label,
  min,
  max,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState(min);
  const slideRef = useRef(null);

  useEffect(() => setLocalValue(value || 0), [value, setLocalValue]);

  const handleKnobMouseDown = useCallback(() => {
    let dragging = true;
    const ws = slideRef.current.clientWidth;
    const slideLeft = slideRef.current.getBoundingClientRect().left;
    const docLeft = document.querySelector('html').getBoundingClientRect().left;
    const left = slideLeft - docLeft;

    const drag = (evt) => {
      if (dragging) {
        let w = evt.clientX - left;
        if (w < 0) {
          w = 0;
        } else if (w > ws) {
          w = ws;
        }

        const value = min + ((w * (max - min)) / ws);
        if (onChange) {
          onChange({ target: { name, value } });
        } else {
          setLocalValue(value);
        }
      }
    };

    const stopDragging = () => {
      dragging = false;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDragging);
    };

    document.addEventListener('mouseup', stopDragging);

    document.addEventListener('mousemove', drag);
  }, [value, onChange, setLocalValue]);

  const handleClick = useCallback((evt) => {
    const ws = slideRef.current.clientWidth;
    const slideLeft = slideRef.current.getBoundingClientRect().left;
    const docLeft = document.querySelector('html').getBoundingClientRect().left;
    const left = slideLeft - docLeft;
    let w = evt.clientX - left;
    if (w < 0) {
      w = 0;
    } else if (w > ws) {
      w = ws;
    }

    const value = min + ((w * (max - min)) / ws);
    if (onChange) {
      onChange({ target: { name, value } });
    } else {
      setLocalValue(value);
    }
  }, []);

  const percent = `${(100 * localValue) / (max - min)}%`;

  return (
    <div ref={slideRef} className={css.range_wrap}>
      <div
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={localValue}
        role="slider"
        tabIndex={0}
        className={css.range_track}
        onMouseDown={handleClick}
      >
        <div className={css.range_track_fill} style={{ width: percent }} />
      </div>
      <div
        aria-label="knob"
        role="button"
        tabIndex={0}
        className={css.range_knob}
        style={{ left: percent }}
        onMouseDown={handleKnobMouseDown}
      />
    </div>
  );
};

Range.propTypes = {
  label: PropTypes.string,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
};

Range.defaultProps = {
  label: 'Range',
  name: null,
  value: 0,
  min: 0,
  max: 10,
  onChange: null,
};

export default Range;
