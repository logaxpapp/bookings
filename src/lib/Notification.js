/* eslint react/prop-types: 0 */

import { useCallback, useEffect, useState } from 'react';

let all = [];

let id = 0;

const addNotification = (notice) => {
  all = [...all, notice];
};

const removeNotification = (id) => {
  all = all.filter((notice) => notice.id !== id);
};

const createNotification = (type, text) => {
  id += 1;
  return { id, type, text };
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
      removeNotification(id);
      if (callback) callback(all);
    },
    add: (message) => {
      addNotification(message);
      if (callback) callback(all);
    },
  };
})();

export const notification = {
  showInfo: (msg) => manager.add(createNotification('info', msg)),
  showError: (msg) => manager.add(createNotification('error', msg)),
  showSuccess: (msg) => manager.add(createNotification('success', msg)),
};

const styles = {
  container: {
    position: 'fixed',
    right: '3px',
    bottom: '3px',
    width: '280px',
    height: '80px',
    overflow: 'hidden',
    zIndex: 10000,
  },
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    transition: 'all .3s linear',
  },
  feedback: {
    position: 'relative',
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    overflow: 'auto',
    boxShadow: 'rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px',
  },
  btn: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    padding: 0,
    border: 'none',
    backgroundColor: '#bf0808',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  svg: {
    width: '80%',
    height: '80%',
  },
  error: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  wraning: {
    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
  success: {
    color: '#155724',
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  info: {
    color: '#0c5460',
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
  },
  screen: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10000,
    overflow: 'hidden',
    paddingTop: '40px',
    color: '#721c24',
    backgroundColor: '#f8d7da',
  },
  screenCloseBtnWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 4,
    borderBottom: '1px solid #e1c3c6',
  },
  screenCloseBtn: {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    borderRadius: 4,
    backgroundColor: '#b90909',
  },
  screenBody: {
    height: '100%',
    overflow: 'hidden',
    padding: '0 25px 25px',
  },
  railsErrorBody: {
    height: '100%',
    overflow: 'auto',
    padding: '0 25px 25px',
  },
  railsErrorHeader: {
    paddingBottom: '20px',
    textAlign: 'center',
    fontSize: '1.6rem',
  },
  railsErrorException: {
    paddingBottom: '25px',
  },
  railsErrorSectionHeader: {
    fontSize: '1.2rem',
    padding: '15px',
  },
  railsErrorTraceParagraph: {
    margin: 0,
    padding: '8px 10px',
  },
  iframe: {
    width: '100%',
    height: '100%',
  },
};

const IFrame = ({ id, html }) => {
  const close = () => manager.remove(id);

  return (
    <div style={styles.screen}>
      <div style={styles.screenCloseBtnWrap}>
        <button style={styles.screenCloseBtn} type="button" onClick={close}>
          <svg viewBox="0 0 24 24">
            <path
              fill="#fff"
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            />
          </svg>
        </button>
      </div>
      <div style={styles.screenBody}>
        <iframe title={id} style={styles.iframe} srcDoc={html} />
      </div>
    </div>
  );
};

const RailsErrorDisplay = ({ id, text }) => {
  const {
    status,
    error,
    exception,
    traces,
  } = JSON.parse(text);

  const close = () => manager.remove(id);

  return (
    <div style={styles.screen}>
      <div style={styles.screenCloseBtnWrap}>
        <button style={styles.screenCloseBtn} type="button" onClick={close}>
          <svg viewBox="0 0 24 24">
            <path
              fill="#fff"
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            />
          </svg>
        </button>
      </div>
      <div style={styles.railsErrorBody}>
        {error ? (
          <h1 style={styles.railsErrorHeader}>
            <span>{error}</span>
            {status ? (
              <span>{status}</span>
            ) : null}
          </h1>
        ) : null}
        {exception ? (
          <div style={styles.railsErrorException}>{exception}</div>
        ) : null}
        {traces ? (
          Object.keys(traces).map((key) => (
            <section key={key}>
              <h2 style={styles.railsErrorSectionHeader}>{key}</h2>
              {traces[key].map((t) => (
                <p key={t.id} style={styles.railsErrorTraceParagraph}>{t.trace}</p>
              ))}
            </section>
          ))
        ) : null}
      </div>
    </div>
  );
};

const autoCloseHelper = (() => {
  const dict = {};

  const unregister = (id) => {
    const wrapper = dict[id];
    if (wrapper) {
      clearTimeout(wrapper.timeout);
      delete dict[id];
    }
  };

  const register = (id, callback) => {
    let wrapper = dict[id];
    if (wrapper) {
      clearTimeout(wrapper.timeout);
    }
    const timeout = setTimeout(() => {
      wrapper = dict[id];
      if (wrapper) {
        delete dict[id];
        try {
          wrapper.callback();
        } catch {
          // This should not happen BUT ...
        }
      }
    }, 20000);

    dict[id] = { callback, timeout };
  };

  return { register, unregister };
})();

const Notice = ({ notification }) => {
  const [state, setState] = useState({ loaded: false, closed: true });
  const [hovered, setHovered] = useState(false);

  const { id, text, type } = notification;

  const close = useCallback(() => setState({ loaded: true, closed: true }), []);

  useEffect(() => {
    autoCloseHelper.register(id, close);
  }, []);

  useEffect(() => {
    if (!state.loaded) {
      setState({ loaded: true, closed: false });
      return;
    }
    if (state.closed) {
      setTimeout(() => {
        autoCloseHelper.unregister(id);
        manager.remove(id);
      }, 400);
    }
  }, [state, id]);

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  const wrapStyle = { ...styles.wrap };
  wrapStyle.transform = state.closed ? 'translate(0, 100%)' : 'translate(0)';

  const style = styles[type] || styles.info;

  const btnStyle = hovered ? styles.btn : { ...styles.btn, opacity: 0.1 };

  return (
    <section
      style={wrapStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ ...styles.feedback, ...style }}>
        <span>{text}</span>
      </div>
      <button style={btnStyle} type="button" onClick={close}>
        <svg style={styles.svg} viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
          />
        </svg>
      </button>
    </section>
  );
};

const NoticeParser = ({ notification }) => {
  const { id, text } = notification;

  if (text.startsWith('{"status":')) {
    return <RailsErrorDisplay id={id} text={text} />;
  }

  if (text.startsWith('"<!DOCTYPE html>')) {
    const html = text.substring(1, text.length - 1).replace(/\\n/g, '');
    return <IFrame id={id} html={html} />;
  }

  return <Notice notification={notification} />;
};

const Notification = () => {
  const [notifications, setNotifications] = useState(all);

  useEffect(() => {
    manager.subscribe((msgs) => setNotifications(msgs));
    return () => manager.unsubscribe();
  });

  if (notifications.length <= 0) return <></>;

  return (
    <div style={styles.container}>
      {notifications.map((msg) => <NoticeParser key={msg.id} notification={msg} />)}
    </div>
  );
};

export const useNotification = () => notification;

export default Notification;
