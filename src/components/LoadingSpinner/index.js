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
  children,
  className,
}) => (
  <div className={`flex flex-col items-center justify-center absolute top-0 left-0 w-full h-full gap-2.5 pointer-events-auto ${className}`}>
    <span className={css[type]} />
    {children && <div className={css.children}>{children}</div>}
  </div>
);

Loader.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  className: PropTypes.string,
};

Loader.defaultProps = {
  children: null,
  type: 'cloud',
  className: 'bg-[#fff] dark:bg-[#24303f]',
};

export const LoadingBar = ({ zIndex }) => (
  <span style={{ zIndex }} className={css.loading_bar} />
);

LoadingBar.propTypes = {
  zIndex: PropTypes.number,
};

LoadingBar.defaultProps = {
  zIndex: 2,
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
