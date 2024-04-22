import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import lx from '../assets/images/logaxp.png';

const styles = {
  mainNaBrand: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    width: 'max-content',
  },
  logo: {
    width: 40,
  },
  navBrandWrap: {
    fontSize: 32,
    fontFamily: 'Clash Display',
    fontWeight: 600,
    textAlign: 'center',
  },
  loga: {
    color: '#00416a',
  },
  xp: {
    color: '#89e101',
  },
};

const LogoLink = ({ className }) => (
  <Link to="/" style={styles.mainNaBrand}>
    <img src={lx} alt="logo" style={styles.logo} />
    <div className={`text-4xl font-clash font-semibold text-center ${className}`}>
      <span>Loga</span>
      <span style={styles.xp}>XP</span>
    </div>
  </Link>
);

LogoLink.propTypes = {
  className: PropTypes.string,
};

LogoLink.defaultProps = {
  className: 'text-[#00416a] dark: text-white',
};

export const Logo = ({ className }) => (
  <div style={styles.mainNaBrand}>
    <img src={lx} alt="logo" style={styles.logo} />
    <div className={`text-4xl font-clash font-semibold text-center ${className}`}>
      <span>Loga</span>
      <span style={styles.xp}>XP</span>
    </div>
  </div>
);

Logo.propTypes = {
  className: PropTypes.string,
};

Logo.defaultProps = {
  className: 'text-[#00416a] dark: text-white',
};

export default LogoLink;
