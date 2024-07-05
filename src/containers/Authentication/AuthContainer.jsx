import PropTypes from 'prop-types';
import css from './style.module.css';
import { childrenProps } from '../../utils/propTypes';
import banner from '../../assets/images/auth-banner.jpg';
import av from '../../assets/images/av.png';
import LogoLink from '../../components/LogoLink';

const AuthContainer = ({ text, children }) => (
  <div className="grid grid-cols-1 h-screen overflow-hidden sm:grid-cols-2">
    <aside
      className="w-full flex justify-center px-8 h-full"
      style={{
        backgroundImage: `url(${banner})`,
        backgroundSize: '100% 100%',
        color: '#fff',
      }}
    >
      <div className="sm:flex flex-col h-full justify-evenly w-full max-w-md hidden">
        <LogoLink className="text-white" />
        <div className="flex flex-col gap-6">
          <h1 className={css.h1}>
            <span>Welcome to</span>
            <span className={css.text_accent}> LogaXP </span>
            <span>BookMiz</span>
          </h1>
          <p className={css.p}>{text}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex gap-1">
            <span className={css.star} />
            <span className={css.star} />
            <span className={css.star} />
            <span className={css.star} />
            <span className={css.star} />
          </div>
          <p>
            Absolutely thrilled with this appointment booking app! It&apos;s incredibly
            user-friendly and has streamlined our scheduling process. Our clients love
            the convenience, and our team appreciates the efficiency it brings
            to our day-to-day operations. Highly recommend!
          </p>
          <div className="flex items-center gap-2">
            <img src={av} alt="user" className={css.av} />
            <div className="flex flex-col gap-1">
              <span className={css.name}>Ujah Emmanuel</span>
              <span className={css.designation}>Founder, Apex Design Inc.</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <main className="w-full flex justify-center p-8 h-full overflow-auto">
      {children}
    </main>
  </div>
);

AuthContainer.propTypes = {
  text: PropTypes.string.isRequired,
  children: childrenProps.isRequired,
};

export default AuthContainer;
