/* eslint react/prop-types: 0 */

import React, { useEffect, useRef, useState } from 'react';
// import x from '../utils/types';

const useHover = (elementRef) => {
  const [isHovered, setHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.addEventListener('mouseenter', () => setHovered(true));
    element.addEventListener('mouseleave', () => setHovered(false));
  }, [elementRef]);

  return isHovered;
};

export const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, setSize]);

  return size;
};

let all = [];

let id = 0;

const removeDialog = (id) => {
  all = all.filter((notice) => notice.id !== id);
};

const manager = (() => {
  let callback = null;

  return {
    subscribe: (cb) => {
      callback = cb;
    },
    unsubscribe: () => {
      callback = null;
    },
    remove: (id) => {
      removeDialog(id);
      if (callback) callback(all);
    },
    add: (element) => {
      const newId = id + 1;
      id = newId;
      all = [
        ...all,
        { id: newId, element },
      ];
      if (callback) callback(all);
      return {
        close: () => {
          removeDialog(newId);
          if (callback) callback(all);
        },
      };
    },
  };
})();

export const dialog = {
  show: (element) => (
    manager.add(element)
  ),
};

const styles = {
  container: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    height: '100vh',
    zIndex: 10000,
    pointerEvents: 'none',
  },
  screen: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  modalScreen: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'all',
    background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))',
  },
  center: {
    backgroundColor: '#fff',
  },
  scaler: {
    transform: 'scale(0)',
    transition: 'transform 0.3s linear',
  },
  dialog: {
    padding: 15,
    whiteSpace: 'pre-wrap',
    minWidth: 280,
    maxWidth: 350,
  },
  dialogTitle: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  dialogPrompt: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    fontWeight: 'normal',
    marginBottom: 25,
    textAlign: 'center',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  dialogPromptSpan: {
    display: 'block',
  },
  dialogControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 24,
  },
  blockTextInput: {
    display: 'block',
    width: '100%',
    border: '1px solid #efefef',
    backgroundColor: '#f5f8ff',
    padding: '7px 10px',
  },
  message: {
    textAlign: 'center',
    marginBottom: 15,
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    padding: '0 10px 10px',
  },
  btn: (isDanger, isHovered, isFirst) => ({
    minWidth: 68,
    color: '#fff',
    backgroundOrigin: 'border-box',
    border: 'none',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: 4,
    borderColor: 'transparent',
    borderWidth: 1,
    outline: 'none',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: 'Roboto, sans-serif',
    transition: 'all 0.3s ease',
    marginLeft: isFirst ? 0 : 15,
    background: isDanger
      ? 'linear-gradient(180deg, #9e0606, #5e0505)'
      : 'linear-gradient(180deg, #135cbb, #0e2f5a)',
    boxShadow: isHovered ? '0 2px 4px 0 rgb(0 0 0 / 50%)' : '0 0 0 0 transparent',
  }),
};

const ModalScreen = ({ children }) => {
  const { width } = useWindowSize();
  const [style, setStyle] = useState(styles.center);

  useEffect(() => {
    if (width < 576) {
      if (style.width !== '100%') {
        setStyle({ ...style, width: '100%' });
      }
    } else if (style.width === '100%') {
      setStyle(styles.center);
    }
  }, [style, setStyle]);

  return (
    <div style={styles.modalScreen}>
      <div style={style}>{children}</div>
    </div>
  );
};

export const ConfirmDialog = ({
  prompt1,
  prompt2,
  onConfirm,
  onCancel,
}) => (
  <ModalScreen>
    <div style={styles.dialog}>
      <h2 style={styles.dialogPrompt}>
        <span>{prompt1}</span>
        <span>{prompt2}</span>
      </h2>
      <div style={styles.dialogControls}>
        <button
          type="button"
          className="control-btn cancel"
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          className="control-btn"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </ModalScreen>
);

export const YesNoDialog = ({
  prompt1,
  prompt2,
  onConfirm,
  onCancel,
}) => (
  <ModalScreen>
    <div style={styles.dialog}>
      <h2 style={styles.dialogPrompt}>
        <span style={styles.dialogPromptSpan}>{prompt1}</span>
        <span style={styles.dialogPromptSpan}>{prompt2}</span>
      </h2>
      <div style={styles.dialogControls}>
        <button
          type="button"
          className="control-btn"
          onClick={onConfirm}
          style={{ paddingLeft: 25, paddingRight: 25 }}
        >
          Yes
        </button>
        <button
          type="button"
          className="control-btn cancel"
          onClick={onCancel}
          style={{ paddingLeft: 25, paddingRight: 25 }}
        >
          No
        </button>
      </div>
    </div>
  </ModalScreen>
);

export const MessageDialog = ({ message, onOK }) => {
  const okBtn = useRef();
  const isOkHovered = useHover(okBtn);

  return (
    <ModalScreen>
      <div style={styles.dialog}>
        <div style={styles.message}>{message}</div>
        <div style={styles.dialogControls}>
          <button
            ref={okBtn}
            type="button"
            style={styles.btn(true, isOkHovered, true)}
            onClick={onOK}
          >
            OK
          </button>
        </div>
      </div>
    </ModalScreen>
  );
};

export const TextInputDialog = ({
  prompt,
  initialValue,
  onConfirm,
  onCancel,
}) => {
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState('');
  const textInput = useRef(null);

  useEffect(() => textInput.current.focus(), []);

  const handleTextChange = ({ target: { value } }) => setText(value);

  const handleSubmit = (evt) => {
    evt.preventDefault();

    if (!text) {
      setError('Field cannot be empty!');
      textInput.current.focus();
      return false;
    }

    onConfirm(text);
    return false;
  };

  return (
    <ModalScreen>
      <form style={styles.dialog} onSubmit={handleSubmit}>
        {prompt ? (
          <h2 style={styles.dialogTitle}>{prompt}</h2>
        ) : null}
        {error ? (
          <div style={styles.error}>{error}</div>
        ) : null}
        <input
          ref={textInput}
          type="text"
          value={text}
          onChange={handleTextChange}
          style={styles.blockTextInput}
        />
        <div style={styles.dialogControls}>
          <button
            type="submit"
            className="control-btn"
          >
            Confirm
          </button>
          <button
            type="button"
            className="control-btn cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalScreen>
  );
};

TextInputDialog.defaultProps = {
  initialValue: '',
};

const Dialog = () => {
  const [dialogs, setDialogs] = useState(all);

  useEffect(() => {
    manager.subscribe((dialogs) => setDialogs(dialogs));
    return () => manager.unsubscribe();
  });

  if (dialogs.length <= 0) return null;

  return (
    <div style={styles.container} role="alertdialog">
      {dialogs.map((dialog) => (
        <React.Fragment key={dialog.id}>
          {dialog.element}
        </React.Fragment>
      ))}
    </div>
  );
};

export const useDialog = () => dialog;

export const useConfirmDialog = () => ({
  show: (prompt1, prompt2, onConfirm) => {
    let popup;

    const handleClose = () => {
      popup.close();
      onConfirm(false);
    };

    const handleConfirm = () => {
      popup.close();
      onConfirm(true);
    };

    popup = dialog.show(
      <ConfirmDialog
        prompt1={prompt1}
        prompt2={prompt2 || 'Do you wish to continue?'}
        onConfirm={handleConfirm}
        onCancel={handleClose}
      />,
    );
  },
});

export const useYesNoDialog = () => ({
  show: (prompt1, prompt2, onConfirm) => {
    let popup;

    const handleClose = () => {
      popup.close();
      onConfirm(false);
    };

    const handleConfirm = () => {
      popup.close();
      onConfirm(true);
    };

    popup = dialog.show(
      <YesNoDialog
        prompt1={prompt1}
        prompt2={prompt2 || 'Do you wish to continue?'}
        onConfirm={handleConfirm}
        onCancel={handleClose}
      />,
    );
  },
});

export const useMessageDialog = () => ({
  show: (message) => {
    let popup;

    const handleClose = () => popup.close();

    popup = dialog.show(
      <MessageDialog message={message} onOK={handleClose} />,
    );
  },
});

export const useTextInputDialog = () => ({
  show: (prompt, onConfirm, initialValue = '') => {
    let popup;

    const handleClose = () => popup.close();

    const handleConfirm = (result) => {
      popup.close();
      onConfirm(result);
    };

    popup = dialog.show(
      <TextInputDialog
        prompt={prompt}
        initialValue={initialValue}
        onConfirm={handleConfirm}
        onCancel={handleClose}
      />,
    );
  },
});

export default Dialog;
