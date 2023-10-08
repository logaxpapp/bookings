import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from './style.module.css';
import textboxCss from '../../components/TextBox/textbox.module.css';
import TextBox from '../../components/TextBox';
import LoadingButton from '../../components/LoadingButton';
import AlertComponent from '../../components/AlertComponents';
import Header from '../Header';

const EMAIL = 'email';
const PASSWORD = 'password';

const LoginForm = ({
  busy,
  error,
  referred,
  passwordRecoveryPath,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassord] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === EMAIL) {
      setEmail(value);
    } else if (name === PASSWORD) {
      setPassord(value);
    }
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    let hasError = false;
    if (!email) {
      setEmailError('Email CANNOT be Blank!');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password CANNOT be Blank!');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (!hasError) {
      onSubmit(email, password);
    }
  }, [email, password, setEmailError, setPasswordError, onSubmit]);

  return (
    <div className={css.container}>
      <Header />
      <main className={css.main}>
        <form className={css.innerWrap} onSubmit={handleSubmit}>
          <h1 className={css.h1}>
            {`Sign In${referred ? ' To Continue' : ''}`}
          </h1>
          <AlertComponent type="error">
            {error ? (
              <span
                style={{
                  display: 'block',
                  width: '100%',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  maxHeight: 60,
                }}
              >
                {error}
              </span>
            ) : null}
          </AlertComponent>
          <TextBox
            type="text"
            id={EMAIL}
            name={EMAIL}
            value={email}
            error={emailError}
            label="Email"
            className={textboxCss.email}
            containerStyle={{ marginBottom: 8 }}
            style={{ backgroundColor: '#efefef', borderRadius: 4 }}
            onChange={handleValueChange}
          />
          <div className={css.forgot_password_wrap}>
            <Link to={passwordRecoveryPath} tabIndex={-1} state={{ email }}>
              Forgot Password?
            </Link>
          </div>
          <TextBox
            type="password"
            id={PASSWORD}
            name={PASSWORD}
            value={password}
            error={passwordError}
            label="Password"
            containerStyle={{ marginBottom: 8 }}
            style={{ backgroundColor: '#efefef', borderRadius: 4 }}
            className={textboxCss.password}
            onChange={handleValueChange}
          />
          <LoadingButton
            type="submit"
            label="Log In"
            loading={busy}
          />
        </form>
      </main>
    </div>
  );
};

LoginForm.propTypes = {
  busy: PropTypes.bool,
  referred: PropTypes.bool,
  error: PropTypes.string,
  passwordRecoveryPath: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

LoginForm.defaultProps = {
  busy: false,
  referred: false,
  error: null,
};

export default LoginForm;
