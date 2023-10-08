import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

/**
 * @param {Object} props
 * @param {import('../../types').NamedStyle} props.style
 * @param {string} props.name
 * @param {string} props.value
 * @param {boolean} props.checked
 * @param {number} props.radioSize
 */
const AccentRadioButton = ({
  name,
  value,
  checked,
  label,
  style,
  radioSize,
  onChange,
  disabled,
  labelStyle,
}) => {
  const [lStyle, setLStyle] = useState(labelStyle);

  useEffect(() => {
    const lStyle = labelStyle ? { ...labelStyle } : {};
    if (disabled) {
      lStyle.opacity = 0.5;
    }

    setLStyle(lStyle);
  }, [disabled, labelStyle, setLStyle]);

  return (
    <label
      className={css.accent_radio_btn_label}
      style={style}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        value={value}
        disabled={disabled}
      />
      <span className={css.radio} style={{ width: radioSize, height: radioSize }} />
      <span className={css.label} style={lStyle}>{label}</span>
    </label>
  );
};

AccentRadioButton.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func,
  style: PropTypes.shape({}),
  radioSize: PropTypes.number,
  labelStyle: PropTypes.shape({}),
};

AccentRadioButton.defaultProps = {
  checked: false,
  disabled: false,
  value: undefined,
  style: undefined,
  radioSize: 16,
  onChange: null,
  label: '',
  name: undefined,
  labelStyle: null,
};

/* eslint-enable jsx-a11y/label-has-associated-control */

export default AccentRadioButton;
