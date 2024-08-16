import { useCallback } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';

/* eslint-disable jsx-a11y/label-has-associated-control */

const AccentCheckButton = ({
  name,
  checked,
  label,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    onClick(name);
  }, []);

  return (
    <label className={css.accent_btn_label}>
      <input type="checkbox" name={name} checked={checked} onChange={handleClick} />
      <span>{label}</span>
    </label>
  );
};

AccentCheckButton.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  checked: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

AccentCheckButton.defaultProps = {
  checked: false,
};

export default AccentCheckButton;

/* eslint-enable jsx-a11y/label-has-associated-control */
