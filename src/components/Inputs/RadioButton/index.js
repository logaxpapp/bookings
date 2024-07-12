import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

const RadioButton = ({
  name,
  value,
  label,
  checked,
  disabled,
  onChange,
  labelClass,
  labelStyle,
}) => (
  <label
    className={css.radio_label}
    style={{ opacity: disabled ? 0.6 : 1 }}
  >
    <input
      type="radio"
      name={name}
      checked={checked}
      disabled={disabled}
      value={value}
      onChange={onChange}
    />
    <span
      className={`before:border-[4px] before:border-slate-100 before:dark:border-slate-500 ${labelClass}`}
      style={labelStyle}
    >
      {label}
    </span>
  </label>
);

RadioButton.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  labelClass: PropTypes.string,
  labelStyle: PropTypes.shape({}),
};

RadioButton.defaultProps = {
  checked: false,
  disabled: false,
  label: '',
  value: '',
  onChange: null,
  labelClass: null,
  labelStyle: {},
};

export default RadioButton;

/* eslint-enable jsx-a11y/label-has-associated-control */
