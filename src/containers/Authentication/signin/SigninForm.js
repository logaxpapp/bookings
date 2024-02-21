import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from '../style.module.css';
import AlertComponent from '../../../components/AlertComponents';
import LoadingButton from '../../../components/LoadingButton';
import TextBox, {
  matchesEmail,
  Password,
} from '../../../components/TextBox';
import AuthContainer from '../AuthContainer';
import { notification } from '../../../utils';
import Modal from '../../../components/Modal';
import { postResource } from '../../../api';

const EMAIL = 'email';
const PASSWORD = 'password';

const fieldStyle = {
  backgroundColor: '#f2eff5',
  borderRadius: 4,
  padding: 16,
};

const PasswordRecoveryForm = ({
  busy,
  endpoint,
  initialEmail,
  setBusy,
}) => {
  const [linkSent, setLinkSent] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Email is required!');
      return;
    }

    setBusy(true);

    postResource(null, endpoint, { email })
      .then(() => {
        setBusy(false);
        setLinkSent(true);
      })
      .catch(({ message }) => {
        setBusy(false);
        notification.showError(message);
      });
  };

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === EMAIL) {
      setEmail(value);
      setEmailError(value && !matchesEmail(value));
    }
  };

  if (linkSent) {
    return (
      <div className="p-12">
        <h1 className={css.forgot_password_header}>Password Recovery</h1>
        <div className="flex flex-col items-center gap-4">
          <span>We have sent a recovery email to the address you provided.</span>
          <span>Please follow the link to RESET your password.</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-12">
      <h1 className={css.forgot_password_header}>Password Recovery</h1>
      <TextBox
        type="text"
        id={EMAIL}
        name={EMAIL}
        value={email}
        error={emailError ? 'Invalid Email Address!' : ''}
        label="Email"
        style={fieldStyle}
        onChange={handleValueChange}
      />
      <LoadingButton
        type="submit"
        label="Submit"
        loading={busy}
      />
    </form>
  );
};

PasswordRecoveryForm.propTypes = {
  busy: PropTypes.bool,
  setBusy: PropTypes.func.isRequired,
  initialEmail: PropTypes.string,
  endpoint: PropTypes.string.isRequired,
};

PasswordRecoveryForm.defaultProps = {
  busy: false,
  initialEmail: '',
};

const SigninForm = ({
  busy,
  error,
  referred,
  signupPath,
  onSubmit,
  setBusy,
  forgotPasswordEndpoint,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassord] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  const openForgotPasswordModal = () => setForgotPasswordModalOpen(true);

  const closeForgotPasswordModal = () => {
    if (!busy) {
      setForgotPasswordModalOpen(false);
    }
  };

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === EMAIL) {
      setEmail(value);
      setEmailError(value && !matchesEmail(value));
    } else if (name === PASSWORD) {
      setPassord(value);
    }
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();

    if (!matchesEmail(email)) {
      setEmailError(true);
      return;
    }

    if (!password) {
      notification.showError('Please enter your password to login.');
      return;
    }

    onSubmit(email, password);
  }, [email, password]);

  return (
    <AuthContainer
      text="Discover top-notch service providers near you. Enter service below to start your search and get connected with the best professionals in your community"
    >
      <div className={css.form_wrap} id="login-form-wrap">
        <header className="flex flex-col pb-6">
          <h1 className={css.h2}>{`Login${referred ? ' to continue' : ''}`}</h1>
          <p className="m-0">Login to your account</p>
        </header>
        <form className={css.panel} onSubmit={handleFormSubmit}>
          <AlertComponent
            type="error"
            message={error || ''}
            style={{ maxHeight: 60 }}
          />
          <TextBox
            id={EMAIL}
            type="email"
            name={EMAIL}
            value={email}
            label="Email"
            error={emailError ? 'Invalid Email Address!' : ''}
            style={fieldStyle}
            onChange={handleValueChange}
          />
          <div className="flex flex-col">
            <div className="flex justify-end">
              <button type="button" className="link" onClick={openForgotPasswordModal}>
                Forgot Password?
              </button>
            </div>
            <Password
              id={PASSWORD}
              name={PASSWORD}
              value={password}
              label="Password"
              style={fieldStyle}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
              hideErrorOnNull
              canUnmask
            />
          </div>
          <div className="pt-4">
            <LoadingButton
              type="submit"
              label="Login"
              loading={busy}
              styles={{ marginTop: 0 }}
            />
          </div>
          <Link to={signupPath} className="link">
            <span>Don&apos;t have   account?</span>
            <span className="font-bold"> Create free account.</span>
          </Link>
        </form>
        <Modal
          isOpen={forgotPasswordModalOpen}
          onRequestClose={busy ? null : closeForgotPasswordModal}
          parentSelector={() => document.querySelector('#login-form-wrap')}
          shouldCloseOnEsc={!busy}
          shouldCloseOnOverlayClick={!busy}
        >
          {forgotPasswordModalOpen ? (
            <PasswordRecoveryForm
              busy={busy}
              endpoint={forgotPasswordEndpoint}
              setBusy={setBusy}
              initialEmail={email}
            />
          ) : null}
        </Modal>
      </div>
    </AuthContainer>
  );
};

SigninForm.propTypes = {
  busy: PropTypes.bool,
  referred: PropTypes.bool,
  error: PropTypes.string,
  signupPath: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setBusy: PropTypes.func.isRequired,
  forgotPasswordEndpoint: PropTypes.string.isRequired,
};

SigninForm.defaultProps = {
  busy: false,
  referred: false,
  error: null,
};

export default SigninForm;
