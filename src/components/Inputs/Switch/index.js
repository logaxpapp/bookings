import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

const Switch = ({
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

/* eslint-disable jsx-a11y/label-has-associated-control */

export default Switch;
