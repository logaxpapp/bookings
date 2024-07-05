import PropTypes from 'prop-types';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
};

const ResourceLoader = ({ resourceName, onReload }) => (
  <section style={styles.container}>
    <span>{`An error occurred while loading ${resourceName}`}</span>
    <button type="button" className="link" onClick={onReload}>
      Please Click Here To Reload!
    </button>
  </section>
);

ResourceLoader.propTypes = {
  resourceName: PropTypes.string,
  onReload: PropTypes.func.isRequired,
};

ResourceLoader.defaultProps = {
  resourceName: 'Resource',
};

export default ResourceLoader;
