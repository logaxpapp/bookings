import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
import textboxCss from '../../components/TextBox/textbox.module.css';
import Header from '../../Header';
import LoadingButton from '../../../components/LoadingButton';
import { postResource } from '../../../api';
import routes from '../../../routing/routes';
import AlertComponent from '../../../components/AlertComponents';
import TextBox from '../../../components/TextBox';

const EMAIL = 'email';
const PASSWORD = 'password';
const PASSWORD_REPEAT = 'password repeat';

export const PasswordRecovery = ({ endpoint, defaultEmail }) => {
  const [linkSent, setLinkSent] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === EMAIL) {
      setEmail(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Email is required!');
      return;
    }

    setBusy(true);

    postResource(null, endpoint, { email })
      .then(() => {
        setLinkSent(true);
      })
      .catch(({ message }) => {
        setBusy(false);
        setError(message);
      });
  }, [email, endpoint, setEmailError, setBusy, setError, setLinkSent]);

  if (linkSent) {
    return (
      <div className={css.container}>
        <Header transparent />
        <main className={css.main}>
          <div className={css.innerWrap}>
            <h1 className={css.h1}>Password Recovery</h1>
            <div className={css.recovery_success}>
              <span>We have sent a recovery email to the address you provided.</span>
              <span>Please follow the link to RESET your password.</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <Header transparent />
      <main className={css.main}>
        <form className={css.innerWrap} onSubmit={handleSubmit}>
          <h1 className={css.h1}>Password Recovery</h1>
          <AlertComponent message={error} type="error" />
          <TextBox
            type="text"
            id={EMAIL}
            name={EMAIL}
            value={email}
            error={emailError}
            label="Email"
            className={textboxCss.email}
            onChange={handleValueChange}
          />
          <LoadingButton
            type="submit"
            label="Submit"
            loading={busy}
          />
        </form>
      </main>
    </div>
  );
};

PasswordRecovery.propTypes = {
  endpoint: PropTypes.string.isRequired,
  defaultEmail: PropTypes.string.isRequired,
};

export const CompanyPasswordRecovery = () => {
  const location = useLocation();

  return (
    <PasswordRecovery
      endpoint="auth/password-recoveries/company"
      defaultEmail={(location.state && location.state.email) || ''}
    />
  );
};

export const UserPasswordRecovery = () => {
  const location = useLocation();

  return (
    <PasswordRecovery
      endpoint="auth/password-recoveries/user"
      defaultEmail={(location.state && location.state.email) || ''}
    />
  );
};

export const PasswordResetSuccess = () => (
  <div className={css.container}>
    <Header transparent />
    <main className={css.main}>
      <div className={css.innerWrap}>
        <h1 className={css.h1}>Password Reset</h1>
        <div className={css.reset_success_wrap}>
          <span className={css.reset_success_message}>
            You have successfully changed your password.
          </span>
          <Link to={routes.login} className={css.login_link} replace>
            Please Login To Continue
          </Link>
        </div>
      </div>
    </main>
  </div>
);

export const PasswordResetForm = () => {
  const [password, setPassword] = useState('');
  const [passwordR, setPasswordR] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordRError, setPasswordRError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const navigate = useNavigate();
  const { token, resource } = useParams();

  useEffect(() => {
    if (!(token && (resource === 'companies' || resource === 'users'))) {
      navigate('/page-not-found', { replace: true });
    }
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === PASSWORD) {
      setPassword(value);
    } else if (name === PASSWORD_REPEAT) {
      setPasswordR(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    let hasError = false;

    if (!(password && password.length >= 6)) {
      setPasswordError('Password MUST be at least 6 characters!');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (password && password !== passwordR) {
      setPasswordRError('Password Mismatch!');
      hasError = true;
    } else {
      setPasswordRError('');
    }

    if (hasError) {
      return;
    }

    setBusy(true);

    postResource(null, 'auth/password-recoveries/reset', { password, token })
      .then(() => navigate(routes.passwordResetSuccess, { replace: true }))
      .catch(({ message }) => {
        setBusy(false);
        setError(message);
      });
  }, [password, passwordR, setPasswordError, setPasswordRError, setBusy, setError]);

  return (
    <div className={css.container}>
      <Header transparent />
      <main className={css.main}>
        <form className={css.innerWrap} onSubmit={handleSubmit}>
          <h1 className={css.h1}>Password Reset</h1>
          <AlertComponent type="error" message={error} />
          <TextBox
            type="password"
            id={PASSWORD}
            name={PASSWORD}
            value={password}
            error={passwordError}
            label="New Password"
            className={textboxCss.password}
            onChange={handleValueChange}
          />

          <TextBox
            type="password"
            id={PASSWORD_REPEAT}
            name={PASSWORD_REPEAT}
            value={passwordR}
            error={passwordRError}
            label="Repeat Password"
            className={textboxCss.password}
            onChange={handleValueChange}
          />
          <LoadingButton
            type="submit"
            label="Reset Password"
            loading={busy}
          />
        </form>
      </main>
    </div>
  );
};
