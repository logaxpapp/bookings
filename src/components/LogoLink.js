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
    color: '#00416a',
    textAlign: 'center',
  },
  loga: {
    color: '#00416a',
  },
  xp: {
    color: '#89e101',
  },
};

const LogoLink = ({ color }) => (
  <Link to="/" style={styles.mainNaBrand}>
    <img src={lx} alt="logo" style={styles.logo} />
    <div style={styles.navBrandWrap}>
      <span className={`text-[${color}] dark:text-white`}>Loga</span>
      <span style={styles.xp}>XP</span>
    </div>
  </Link>
);

LogoLink.propTypes = {
  color: PropTypes.string,
};

LogoLink.defaultProps = {
  color: '#00416a',
};

export const Logo = ({ color }) => (
  <div style={styles.mainNaBrand}>
    <img src={lx} alt="logo" style={styles.logo} />
    <div style={styles.navBrandWrap}>
      <span className={`text-[${color}] dark:text-white`}>Loga</span>
      <span style={styles.xp}>XP</span>
    </div>
  </div>
);

Logo.propTypes = {
  color: PropTypes.string,
};

Logo.defaultProps = {
  color: '#00416a',
};

export default LogoLink;
