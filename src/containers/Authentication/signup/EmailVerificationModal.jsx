import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from '../style.module.css';
import { paths } from '../../../components/svg';
import { fetchResources } from '../../../api';
import { notification } from '../../../utils';
import { Ring } from '../../../components/LoadingButton';
import Modal from '../../../components/Modal';
import routes from '../../../routing/routes';

const RESEND_LINK = 'resend_link';

const EmailVerificationModal = ({ email, resendPath }) => {
  const [busy, setBusy] = useState(false);

  const handleClick = ({ target: { name } }) => {
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
  };

  return (
    <Modal
      isOpen={!!resendPath}
      parentSelector={() => document.body}
      style={{ content: { maxWidth: 'max-content' } }}
    >
      <section className={css.success_panel}>
        <h1 className={css.verification_heading}>Registration Successful</h1>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={css.envelope}>
          <path fill="currentColor" d={paths.email} />
        </svg>
        <div className={css.verification_panel}>
          <span className={css.verification_heading}>Verify your email address</span>
          <div className="flex flex-col items-center">
            <span>Please click the link that was sent to </span>
            <div>
              <span className={css.bold}>
                {email || 'your email address'}
              </span>
              <span> to verify your email</span>
            </div>
          </div>
        </div>
        <footer className="flex flex-col items-center text-sm py-6">
          <span>
            Didn&apos;t get the email?
          </span>
          {busy ? (
            <Ring color="#1454a8" size={18} />
          ) : (
            <button
              type="button"
              name={RESEND_LINK}
              className="link compact-link"
              onClick={handleClick}
            >
              Click here to resend
            </button>
          )}
        </footer>
      </section>
    </Modal>
  );
};

EmailVerificationModal.propTypes = {
  email: PropTypes.string,
  resendPath: PropTypes.string,
};

EmailVerificationModal.defaultProps = {
  email: '',
  resendPath: '',
};

export const EmailVerifiedModal = ({ redirect }) => {
  const [scale, setScale] = useState(0);

  useEffect(() => setScale(1.5), []);

  return (
    <Modal
      isOpen={!!redirect}
      parentSelector={() => document.body}
      style={{ content: { maxWidth: 'max-content' } }}
    >
      <section className={`${css.success_panel} gap-4`}>
        <h1 className={css.verification_heading}>Verification Successful</h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={css.envelope}
          style={{ transform: `scale(${scale})` }}
        >
          <path fill="currentColor" d={paths.checkCircle} />
        </svg>
        <div className="flex flex-col items-center gap-3">
          <span>Your email was successfully verified</span>
          <span className="text-center">
            Thank you for registering with BookMiz!
            We&apos;re thrilled to have you join our community.
            Please feel free to explore all the features our platform has to offer.
            If you have any questions or need assistance, don&apos;t hesitate to reach out.
            Welcome aboard!
          </span>
        </div>
        <footer className="flex items-center text-sm py-2 gap-1">
          <Link className="link compact-link" to={redirect}>Login</Link>
          <span>
            to proceed to your dashboard
          </span>
        </footer>
      </section>
    </Modal>
  );
};

EmailVerifiedModal.propTypes = {
  redirect: PropTypes.string,
};

EmailVerifiedModal.defaultProps = {
  redirect: '',
};

export const InvalidLinkModal = () => {
  const [scale, setScale] = useState(0);

  useEffect(() => setScale(1.5), []);

  return (
    <Modal
      isOpen
      parentSelector={() => document.body}
      style={{ content: { maxWidth: 'max-content' } }}
    >
      <section className={`${css.success_panel} gap-4`}>
        <h1 className={`${css.verification_heading} ${css.error} ${css.center}`}>
          The link you clicked no longer exist.
        </h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`${css.envelope} ${css.error}`}
          style={{ transform: `scale(${scale})` }}
        >
          <path fill="currentColor" d={paths.closeCircle} />
        </svg>
        <div className="flex flex-col items-center gap-3">
          <span>Why am I seeing this?</span>
          <span>
            The link may have expired or it could be a one time link and you have
            already clicked it before.
          </span>
          <span className="text-center">
            <span>Please contact our</span>
            <Link className="link" to={routes.contact}> Support </Link>
            <span>if you need further assistance.</span>
          </span>
        </div>
        <footer className="flex items-center text-sm py-2 gap-1">
          <Link className="link" to={routes.home}>Click</Link>
          <span>
            to proceed to your dashboard
          </span>
        </footer>
      </section>
    </Modal>
  );
};

export default EmailVerificationModal;
