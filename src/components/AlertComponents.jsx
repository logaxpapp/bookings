import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const styles = {
  alert: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    textAlign: 'center',
    padding: 5,
    margin: '8px 0',
    overflow: 'auto',
  },
  error: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  info: {
    color: '#0c5460',
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
  },
  success: {
    color: '#155724',
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  warning: {
    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
};

/**
 * @param {Object} props
 * @param {string} props.message
 * @param {"error" | "info" | "succcess" | "warning"} props.type
 * @param {import('../types/namedStyles').NamedStyle} props.style
 */
const AlertComponent = ({
  message,
  type,
  style,
  children,
}) => {
  const [computedStyle, setComputedStyle] = useState(styles.alert);
  const [content, setContent] = useState(message);

  useEffect(() => {
    let newStyle = styles[type];
    if (newStyle) {
      newStyle = { ...styles.alert, ...newStyle, ...style };
    } else {
      newStyle = { ...styles.alert, ...style };
    }

    try {
      const json = JSON.parse(message);
      newStyle.textAlign = 'left';
      setContent(JSON.stringify(json, null, 2));
    } catch {
      setContent(message);
    }
    setComputedStyle(newStyle);
  }, [style, message, setComputedStyle, setContent]);

  if (!(message || children)) {
    return null;
  }

  return (
    <div style={computedStyle}>
      {message ? (
        <pre>{content}</pre>
      ) : null}
      {children}
    </div>
  );
};

AlertComponent.propTypes = {
  message: PropTypes.string,
  children: PropTypes.node,
  type: PropTypes.string,
  style: PropTypes.shape({}),
};

AlertComponent.defaultProps = {
  message: null,
  children: null,
  type: '',
  style: {},
};

export default AlertComponent;
