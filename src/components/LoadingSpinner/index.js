import PropTypes from 'prop-types';
import css from './style.module.css';
import { useDialog } from '../../lib/Dialog';

const LoadingSpinner = ({ children }) => (
  <div className={css.container}>
    <div className={css.dimmer} />
    <div className={css.lds_spinner}>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
    {children && <div className={css.children}>{children}</div>}
  </div>
);

LoadingSpinner.propTypes = {
  children: PropTypes.node,
};

LoadingSpinner.defaultProps = {
  children: null,
};

/**
 * @param {Object} props
 * @param {"cloud" | "double_ring"} props.type
 * @returns
 */
export const Loader = ({
  type,
  color,
  children,
}) => (
  <div className={css.container} style={{ backgroundColor: color }}>
    <span className={css[type]} />
    {children && <div className={css.children}>{children}</div>}
  </div>
);

Loader.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  color: PropTypes.string,
};

Loader.defaultProps = {
  children: null,
  type: 'cloud',
  color: '#fff',
};

export const useBusyDialog = () => {
  const dialog = useDialog();

  return {
    show: (msg) => dialog.show(
      <LoadingSpinner><span>{msg}</span></LoadingSpinner>,
    ),
  };
};

export default LoadingSpinner;
