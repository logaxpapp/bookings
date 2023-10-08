import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

const CheckBox = ({
  name,
  value,
  label,
  checked,
  onChange,
  labelClass,
  labelStyle,
}) => (
  <label className={css.checkbox_wrapper_51}>
    <input type="checkbox" name={name} checked={checked} value={value} onChange={onChange} />
    <div className={css.toggle}>
      <span>
        <svg width="10px" height="10px" viewBox="0 0 10 10">
          <path
            d="M5,1 L5,1 C2.790861,1 1,2.790861 1,5 L1,5 C1,7.209139 2.790861,9 5,9 L5,9 C7.209139,9 9,7.209139 9,5 L9,5 C9,2.790861 7.209139,1 5,1 L5,9 L5,1 Z"
          />
        </svg>
      </span>
    </div>
    <span className={labelClass} style={labelStyle}>{label}</span>
  </label>
);

CheckBox.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  labelClass: PropTypes.string,
  labelStyle: PropTypes.shape({}),
};

CheckBox.defaultProps = {
  checked: false,
  label: '',
  value: '',
  onChange: null,
  labelClass: null,
  labelStyle: {},
};

export default CheckBox;

/* eslint-enable jsx-a11y/label-has-associated-control */
