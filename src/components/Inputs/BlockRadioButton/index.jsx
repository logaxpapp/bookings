import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

const BlockRadioButton = ({
  name,
  value,
  label,
  checked,
  onChange,
  style,
}) => (
  <label
    className={`${css.block_radio_label} ${checked ? css.active : ''}`}
    style={style}
  >
    <div className={css.block_radio_name}>
      <input
        type="radio"
        className="clip"
        name={name}
        value={value}
        onChange={onChange}
        checked={checked}
      />
    </div>
    <div className={css.block_radio_pricing}>{label}</div>
  </label>
);

BlockRadioButton.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.shape({}),
};

BlockRadioButton.defaultProps = {
  checked: false,
  label: '',
  value: '',
  onChange: null,
  style: {},
};

/* eslint-enable jsx-a11y/label-has-associated-control */

export default BlockRadioButton;
