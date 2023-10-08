import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { timeSlotProps } from '../../utils/propTypes';
import css from './style.module.css';
import { useWindowSize } from '../../lib/hooks';

const MIN_WIDTH = 80;
const SELECT_SLOT_BTN = 'select_slot_btn';

const SlotButton = ({ slot, onSelect }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const text = new Date(slot.time).toLocaleTimeString();
    setText(text);
  }, [slot, setText]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === SELECT_SLOT_BTN) {
      onSelect(slot);
    }
  }, [slot, onSelect]);

  return (
    <button
      type="button"
      name={SELECT_SLOT_BTN}
      className={css.slot_btn}
      onClick={handleClick}
    >
      <span>{text}</span>
    </button>
  );
};

SlotButton.propTypes = {
  slot: timeSlotProps.isRequired,
  onSelect: PropTypes.func.isRequired,
};

const SlotsGrid = ({ slots, onSelect }) => {
  const [cols, setCols] = useState(5);
  const grid = useRef();
  const winSize = useWindowSize();

  useEffect(() => {
    setCols(Math.floor(grid.current.clientWidth / MIN_WIDTH));
  }, [winSize, setCols]);

  return (
    <section
      ref={grid}
      className={`${css.container} ${slots.length ? '' : css.empty}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.length ? slots.map((slot) => (
        <SlotButton key={slot.id} slot={slot} onSelect={onSelect} />
      )) : (
        <span className={css.empty_info}>
          No time slots found for date!
        </span>
      )}
    </section>
  );
};

SlotsGrid.propTypes = {
  slots: PropTypes.arrayOf(timeSlotProps).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default SlotsGrid;
