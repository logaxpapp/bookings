import PropTypes from 'prop-types';
import Header from '../containers/Header';
import { Logo } from './LogoLink';
import { childrenProps } from '../utils/propTypes';

const styles = {
  container: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    pointerEvents: 'all',
    backgroundColor: 'rgba(234,243,249,1)',
    background: 'linear-gradient(45deg, rgba(234,243,249,1) 0%, rgba(255,254,230,1) 22%, rgba(172,231,215,1) 40%, rgba(253,232,255,1) 60%, rgba(190,255,231,1) 81%, rgba(251,254,255,1) 100%)',
    zIndex: 9999,
  },
  header: {
    position: 'relative',
    padding: '16px 32px',
    width: '100%',
    boxShadow: 'rgba(99, 99, 99, 0.2) 0 2px 8px 0',
  },
  body: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
};

const BlankPage = ({ header, children }) => (
  <section style={styles.container}>
    {header ? (
      <Header />
    ) : (
      <header style={styles.header}>
        <Logo />
      </header>
    )}
    <div style={styles.body}>
      {children}
    </div>
  </section>
);

BlankPage.propTypes = {
  header: PropTypes.bool,
  children: childrenProps,
};

BlankPage.defaultProps = {
  header: false,
  children: null,
};

export default BlankPage;
