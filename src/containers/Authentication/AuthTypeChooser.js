import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';

const AuthTypeChooser = ({ companyRoute, userRoute }) => (
  <section
    className="relative flex flex-col items-center gap-12 p-12"
  >
    <Link to={userRoute} className={css.chooser_link}>
      I am a user
    </Link>
    <Link to={companyRoute} className={css.chooser_link}>
      I am a service provider
    </Link>
  </section>
);

AuthTypeChooser.propTypes = {
  companyRoute: PropTypes.string.isRequired,
  userRoute: PropTypes.string.isRequired,
};

export default AuthTypeChooser;
