/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/rrui.css';
import 'react-phone-number-input/style.css';

const Phone = ({
  name,
  label,
  value,
  error,
  onChange,
}) => {
  const handleChange = (value) => {
    if (onChange) {
      onChange(name, value);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className="bold-select-wrap">
      {label ? <span className="label">{label}</span> : null}
      <div className="text-input">
        <PhoneInput
          value={value}
          onChange={handleChange}
        />
      </div>
      {error ? <span className="input-error">{error}</span> : null}
    </label>
  );
};

Phone.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
};

Phone.defaultProps = {
  name: 'phone',
  value: '',
  label: '',
  error: '',
  onChange: null,
};

export default Phone;
