import PropTypes from 'prop-types';
import css from './style.module.css';
import { classNames } from '../../../utils';

/* eslint-disable jsx-a11y/label-has-associated-control */

const Switch = ({
  name,
  value,
  checked,
  onChange,
  disabled,
}) => (
  <label
    className={classNames(
      'relative w-[54px] h-[31px] flex items-center rounded-full px-[2px] cursor-pointer',
      checked ? 'bg-[#89e101]' : 'bg-[#5c5c5c]',
    )}
  >
    <input
      className="clip"
      type="checkbox"
      role="switch"
      name={name}
      checked={checked}
      onChange={onChange}
      value={value}
      disabled={disabled}
    />
    <span
      aria-hidden="true"
      className={`w-[27px] h-[27px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`}
    />
  </label>
);

Switch.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.shape({}),
};

Switch.defaultProps = {
  checked: false,
  disabled: false,
  value: undefined,
  style: undefined,
  onChange: null,
  name: undefined,
};

const Switch2 = ({
  name,
  value,
  checked,
  style,
  onChange,
  disabled,
}) => (
  <label className={css.switch} style={style}>
    <input
      className={css.switch_input}
      type="checkbox"
      role="switch"
      name={name}
      checked={checked}
      onChange={onChange}
      value={value}
      disabled={disabled}
    />
    <span className={css.switch_fill} aria-hidden="true">
      <span className={css.switch_text}>ON</span>
      <span className={css.switch_text}>OFF</span>
    </span>
  </label>
);

Switch2.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.shape({}),
};

Switch2.defaultProps = {
  checked: false,
  disabled: false,
  value: undefined,
  style: undefined,
  onChange: null,
  name: undefined,
};

/* eslint-disable jsx-a11y/label-has-associated-control */

export default Switch;
