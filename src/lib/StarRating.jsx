import { useState } from 'react';
import PropTypes from 'prop-types';

const styles = {
  container: {
    position: 'relative',
    outline: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  offBG: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  onBG: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  starGrid: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    pointerEvents: 'none',
  },
  star: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  cover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
};

const range5 = [...Array(5)].map((_, i) => i);

const getRating = (e) => {
  const rect = e.target.getBoundingClientRect();
  const fract = (e.clientX - rect.left) / (rect.width - 1);
  const rating = Math.round(10000 * fract) / 100;
  return rating;
};

export const Star = ({
  fill,
}) => (
  <svg style={styles.star} viewBox="0 0 24 24">
    <path fill={fill} d="M12,24L12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27L12,24L0,24L0,0L24,0L24,24L12,24Z" />
  </svg>
);

Star.propTypes = {
  fill: PropTypes.string,
};

Star.defaultProps = {
  fill: 'gray',
};

const StarRating = ({
  width,
  background,
  activeColor,
  inActiveColor,
  rating,
  onChange,
}) => {
  const [position, setPosition] = useState(0);

  if (!onChange) {
    return (
      <div
        style={{
          ...styles.container,
          cursor: 'default',
          width: `${width}px`,
          height: `${width / 5}px`,
          backgroundColor: `${background}`,
        }}
      >
        <div style={{ ...styles.offBG, backgroundColor: inActiveColor }} />
        <div style={{ ...styles.onBG, backgroundColor: activeColor, width: `${rating}%` }} />
        <div style={styles.starGrid}>
          <svg viewBox="0 0 120 24" style={{ width: '100%', height: '100%', color: background }} fillRule="evenodd">
            <path d="M2,9.5L9,8.5L12,2L15,8.5L22,9.5L16.7,15L18,22L12,18L6,22L7.3,15L2,9.5ZM0,0L0,24L24,24L24,0ZM26,9.5L33,8.5L36,2L39,8.5L46,9.5L40.7,15L42,22L36,18L30,22L31.3,15L26,9.5ZM24,0L24,24L48,24L48,0ZM50,9.5L57,8.5L60,2L63,8.5L70,9.5L64.7,15L66,22L60,18L54,22L55.3,15L50,9.5ZM48,0L48,24L72,24L72,0ZM74,9.5L81,8.5L84,2L87,8.5L94,9.5L88.7,15L90,22L84,18L78,22L79.3,15L74,9.5ZM72,0L72,24L96,24L96,0ZM98,9.5L105,8.5L108,2L111,8.5L118,9.5L112.7,15L114,22L108,18L102,22L103.3,15L98,9.5ZM96,0L96,24L120,24L120,0Z" fill="currentColor" />
          </svg>
        </div>
        <div
          style={{
            ...styles.cover,
            left: -1,
            width: ((2 * width) / 120) + 1,
            backgroundColor: background,
          }}
        />
        <div
          style={{
            ...styles.cover,
            right: -1,
            width: ((2 * width) / 120 + 1),
            backgroundColor: background,
          }}
        />
      </div>
    );
  }

  const handleClick = (e) => {
    if (!onChange) {
      return;
    }
    const percent = getRating(e);
    onChange(percent);
  };

  const handleMousemove = (e) => setPosition(getRating(e));

  return (
    <button
      type="button"
      style={{
        ...styles.container,
        width: `${width}px`,
        height: `${width / 5}px`,
        backgroundColor: `${background}`,
      }}
      onClick={handleClick}
      onMouseMove={handleMousemove}
      title={`${position}%`}
    >
      <div style={{ ...styles.offBG, backgroundColor: inActiveColor }} />
      <div style={{ ...styles.onBG, backgroundColor: activeColor, width: `${rating}%` }} />
      <div style={styles.starGrid}>
        {range5.map((key) => <Star key={key} fill={background} />)}
      </div>
    </button>
  );
};

StarRating.propTypes = {
  width: PropTypes.number,
  background: PropTypes.string,
  activeColor: PropTypes.string,
  inActiveColor: PropTypes.string,
  rating: PropTypes.number,
  onChange: PropTypes.func,
};

StarRating.defaultProps = {
  width: 120,
  background: '#fff',
  activeColor: '#faa434',
  inActiveColor: '#8c99ae',
  rating: 45,
  onChange: null,
};

export default StarRating;
