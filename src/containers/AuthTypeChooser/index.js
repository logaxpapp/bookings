import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
/* eslint-disable-next-line */
import Header from '../Header';

const AuthTypeChooser = ({ companyRoute, userRoute }) => (
  <div className={css.container}>
    <Header />
    <main className={css.main}>
      <section className={css.links_wrap}>
        <Link to={userRoute} className={css.link}>
          I am a user
        </Link>
        <Link to={companyRoute} className={css.link}>
          I am a service provider
        </Link>
      </section>
    </main>
  </div>
);

AuthTypeChooser.propTypes = {
  companyRoute: PropTypes.string.isRequired,
  userRoute: PropTypes.string.isRequired,
};

export default AuthTypeChooser;
