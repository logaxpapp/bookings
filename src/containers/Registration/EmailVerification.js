import { useCallback, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import PropTypes from 'prop-types';
import css from './style.module.css';
import BlankPage from '../../components/BlankPage';
import { paths } from '../../components/svg';
import { fetchResources } from '../../api';
import { useNotification } from '../../lib/Notification';
import { Ring } from '../../components/LoadingButton';

const RESEND_LINK = 'resend_link';

const EmailVerification = ({ email, resendPath }) => {
  const [busy, setBusy] = useState(false);
  const notification = useNotification();

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === RESEND_LINK) {
      if (resendPath) {
        setBusy(true);
        fetchResources(resendPath, null, true)
          .then(() => {
            setBusy(false);
            notification.showSuccess(`Link has been resent to ${email}`);
          })
          .catch(() => {
            setBusy(false);
            notification.showError('An error occurred while resending link. Please try again.');
          });
      }
    }
  }, []);

  return (
    <BlankPage header>
      <main className={css.success_wrap}>
        <section className={css.success_panel}>
          <h1 className={css.h1}>Registration Successful</h1>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={css.envelope}>
            <path fill="currentColor" d={paths.email} />
          </svg>
          <div className={css.verification_panel}>
            <span className={css.verification_heading}>Verify your email address</span>
            <div className={css.align_horizontal}>
              <span>Please click the link that was sent to </span>
              <div>
                <span className={css.bold}>
                  {email || 'your email address'}
                </span>
                <span> to verify your email</span>
              </div>
            </div>
          </div>
          <footer className={`${css.align_horizontal} ${css.verification_footer}`}>
            <span>
              Didn&apos;t get the email?
            </span>
            {busy ? (
              <Ring color="#1454a8" size={18} />
            ) : (
              <button
                type="button"
                name={RESEND_LINK}
                className={`link compact-link ${css.link}`}
                onClick={handleClick}
              >
                Click here to resend
              </button>
            )}
          </footer>
        </section>
      </main>
    </BlankPage>
  );
};

EmailVerification.propTypes = {
  resendPath: PropTypes.string.isRequired,
  email: PropTypes.string,
};

EmailVerification.defaultProps = {
  email: '',
};

export const CompanyEmailVerification = () => {
  const { id } = useParams();
  const { state } = useLocation();

  return (
    <EmailVerification
      email={state ? state.email : ''}
      resendPath={`companies/${id}/resend-verification-link`}
    />
  );
};

export const UserEmailVerification = () => {
  const { id } = useParams();
  const { state } = useLocation();

  return (
    <EmailVerification
      email={state ? state.email : ''}
      resendPath={`users/${id}/resend-verification-link`}
    />
  );
};

export default EmailVerification;
