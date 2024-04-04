// eslint-disable-next-line import/no-extraneous-dependencies
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import { childrenProps } from '../../utils/propTypes';
import './styles.css';
import { SvgButton, paths } from '../svg';

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
    zIndex: 1010,
  },
  content: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 600,
    border: '1px solid #ccc',
    borderRadius: 8,
    background: '#fff',
    WebkitOverflowScrolling: 'touch',
    padding: 0,
    overflow: 'unset',
  },
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
  >
    {children}
    {onRequestClose ? (
      <SvgButton
        path={paths.close}
        title="Close"
        color="#888"
        style={{
          width: 36,
          height: 36,
          borderRadius: 36,
          backgroundColor: '#fff',
          boxShadow: 'rgba(99, 99, 99, 0.2) 0 2px 8px 0',
          position: 'absolute',
          top: -16,
          right: -16,
          padding: 4,
        }}
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
