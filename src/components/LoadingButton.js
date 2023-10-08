import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const mStyles = {
  btn: {
    fontWeight: 'bold',
    fontSize: '1.4rem',
    lineHeight: 1,
    borderRadius: '4px',
    boxShadow: '0 3px 9px rgb(0 0 0 / 5%)',
    transition: 'all 180ms',
    display: 'block',
    width: '100%',
    marginTop: '30px',
    padding: '15px',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#0e2f5a',
    borderWidth: 0,
    cursor: 'pointer',
  },
  svg: (width) => ({
    width: `${width}px`,
  }),
  btnPad: {
    padding: '0 8px 8px 8px',
  },
};

const keyframes = [
  { transform: 'rotate(0)' },
  { transform: 'rotate(360deg)' },
];

const timing = {
  duration: 1200,
  easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
  iterations: Infinity,
};

export const Ring = ({ color, size }) => {
  const svg = useRef(null);

  useEffect(() => {
    if (svg.current) {
      svg.current.animate(keyframes, timing);
    }
  }, []);

  return (
    // https://www.iconbolt.com/iconsets/ant-design-outline/loading-3-quarters
    <svg ref={svg} viewBox="0 0 1024 1024" style={mStyles.svg(size)}>
      <path
        fill={color}
        d="M512 1024c-69.1 0-136.2-13.5-199.3-40.2C251.7 958 197 921 150 874c-47-47-84-101.7-109.8-162.7C13.5 648.2 0 581.1 0 512c0-19.9 16.1-36 36-36s36 16.1 36 36c0 59.4 11.6 117 34.6 171.3 22.2 52.4 53.9 99.5 94.3 139.9 40.4 40.4 87.5 72.2 139.9 94.3C395 940.4 452.6 952 512 952c59.4 0 117-11.6 171.3-34.6 52.4-22.2 99.5-53.9 139.9-94.3 40.4-40.4 72.2-87.5 94.3-139.9C940.4 629 952 571.4 952 512c0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.2C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3s-13.5 136.2-40.2 199.3C958 772.3 921 827 874 874c-47 47-101.8 83.9-162.7 109.7-63.1 26.8-130.2 40.3-199.3 40.3z"
      />
    </svg>
  );
};

Ring.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

const LoadingButton = ({
  type,
  name,
  label,
  loading,
  styles,
  onClick,
  ringSize,
  ringColor,
}) => {
  const [hovered, setHovered] = useState(false);
  const [height, setHeight] = useState(0);
  const btn = useRef();

  useEffect(() => setHeight(btn.current.clientHeight), []);

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  const btnStyle = { ...mStyles.btn, ...styles };

  if (hovered) {
    btnStyle.opacity = 0.9;
  }

  if (height) {
    btnStyle.height = height;
  }

  if (!loading) {
    return (
      <div>
        <button
          ref={btn}
          name={name}
          style={btnStyle}
          type={type === 'submit' ? 'submit' : 'button'}
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {label}
        </button>
      </div>
    );
  }

  btnStyle.cursor = 'default';
  btnStyle.display = 'flex';
  btnStyle.justifyContent = 'center';

  return (
    <div>
      <div
        ref={btn}
        style={btnStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Ring color={ringColor} size={ringSize} />
      </div>
    </div>
  );
};

LoadingButton.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  styles: PropTypes.shape({}),
  onClick: PropTypes.func,
  ringSize: PropTypes.number,
  ringColor: PropTypes.string,
};

LoadingButton.defaultProps = {
  type: 'button',
  name: undefined,
  loading: false,
  styles: {},
  ringSize: 20,
  ringColor: '#fff',
  onClick: null,
};

export default LoadingButton;
