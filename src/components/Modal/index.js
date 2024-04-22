import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import { childrenProps } from '../../utils/propTypes';
import './styles.css';
import { SvgButton, paths } from '../svg';
import { selectBusy, setLoading } from '../../redux/controls';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  content: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 600,
    borderRadius: 8,
    WebkitOverflowScrolling: 'touch',
    padding: 0,
    overflow: 'unset',
  },
};

export const BusyModal = () => {
  const busy = useSelector(selectBusy);

  return (
    <ReactModal
      closeTimeoutMS={200}
      isOpen={busy}
      parentSelector={() => document.querySelector('#root')}
      style={{
        content: {},
        overlay: styles.overlay,
      }}
      className="bg-transparent border-[transparent] border-none"
    >
      <div className="lds_spinner">
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
    </ReactModal>
  );
};

export const useBusyModal = () => {
  const dispatch = useDispatch();

  return {
    showLoader: () => dispatch(setLoading(true)),
    hideLoader: () => dispatch(setLoading(false)),
  };
};

const Modal = ({
  children,
  contentLabel,
  isOpen,
  onRequestClose,
  parentSelector,
  shouldCloseOnEsc,
  shouldCloseOnOverlayClick,
  style,
}) => (
  <ReactModal
    closeTimeoutMS={200}
    contentLabel={contentLabel}
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    parentSelector={parentSelector}
    shouldCloseOnEsc={shouldCloseOnEsc}
    shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    style={{
      content: { ...styles.content, ...(style?.content || {}) },
      overlay: { ...styles.overlay, ...(style?.overlay || {}) },
    }}
    className="bg-white dark:bg-[#24303f] border border-[#ccc] dark:border-[#43464b] max-h-[90vh] overflow-y-auto"
  >
    {children}
    {onRequestClose ? (
      <SvgButton
        path={paths.close}
        title="Close"
        color="#ee4f4f"
        style={{
          width: 36,
          height: 36,
          borderRadius: 36,
          boxShadow: 'rgba(99, 99, 99, 0.2) 0 2px 8px 0',
          position: 'absolute',
          top: -16,
          right: -16,
          padding: 4,
        }}
        className="!bg-white border dark:!bg-[#24303f] dark:border-[#334255]"
        onClick={onRequestClose}
      />
    ) : null}
  </ReactModal>
);

Modal.propTypes = {
  children: childrenProps,
  contentLabel: PropTypes.string,
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  parentSelector: PropTypes.func,
  shouldCloseOnEsc: PropTypes.bool,
  shouldCloseOnOverlayClick: PropTypes.bool,
  style: PropTypes.shape({
    content: PropTypes.shape({}),
    overlay: PropTypes.shape({}),
  }),
};

Modal.defaultProps = {
  children: null,
  contentLabel: 'Modal',
  isOpen: false,
  onRequestClose: null,
  parentSelector: () => document.body,
  shouldCloseOnEsc: false,
  shouldCloseOnOverlayClick: false,
  style: {},
};

export default Modal;
