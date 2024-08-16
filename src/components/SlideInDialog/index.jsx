import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';

/**
 *
 * @param {Object} props
 * @param {boolean} props.isIn
 * @param {React.JSX.Element} props.children
 * @param {import('../../types').NamedStyle} props.style
 */
const SlideDialog = ({ isIn, children, style }) => {
  const [className, setClassName] = useState(css.scaler);

  useEffect(() => (
    setClassName(`${css.slide} ${isIn ? css.in : ''}`)
  ), [isIn, setClassName]);

  return (
    <div className={css.screen}>
      <div className={className}>
        <div style={style} className={css.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

SlideDialog.propTypes = {
  isIn: PropTypes.bool,
  style: PropTypes.shape({}),
  children: PropTypes.node.isRequired,
};

SlideDialog.defaultProps = {
  isIn: false,
  style: {},
};

export default SlideDialog;
