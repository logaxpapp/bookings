import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

const SimpleCheckBox = ({
  name,
  value,
  label,
  checked,
  onChange,
  labelClass,
  labelStyle,
}) => (
  <label className={css.simple_checkbox}>
    <input type="checkbox" name={name} checked={checked} value={value} onChange={onChange} />
    <span className={labelClass} style={labelStyle}>{label}</span>
  </label>
);

SimpleCheckBox.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  labelClass: PropTypes.string,
  labelStyle: PropTypes.shape({}),
};

SimpleCheckBox.defaultProps = {
  checked: false,
  label: '',
  value: '',
  onChange: null,
  labelClass: null,
  labelStyle: {},
};

export default SimpleCheckBox;

/* eslint-enable jsx-a11y/label-has-associated-control */
