import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { decodeJwt } from 'jose';
import css from './style.module.css';
import textboxCss from '../../components/TextBox/textbox.module.css';
import Header from '../Header';
import LoadingButton from '../../components/LoadingButton';
import TextBox, {
  matchesEmail,
  matchesPhoneNumber,
  validatePassword,
} from '../../components/TextBox';
import { registerUser } from '../../api';
import routes from '../../routing/routes';

const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const EMAIL = 'email';
const PHONE_NUMBER = 'phone_number';
const PASSWORD = 'password';
const PASSWORD_REPEAT = 'password_repeat';

const GoogleSignupBtn = ({ callbackFunction }) => (
  <>
    <div
      id="g_id_onload"
      data-client_id="789515297337-gqsfe25r8vrnn9tlpg7recdtm9reii2p.apps.googleusercontent.com"
      data-context="signup"
      data-ux_mode="popup"
      data-callback={callbackFunction}
      data-auto_prompt="false"
    />

    <div
      className="g_id_signin"
      data-type="standard"
      data-shape="pill"
      data-theme="filled_blue"
      data-text="signup_with"
      data-size="large"
      data-logo_alignment="left"
    />
  </>
);

GoogleSignupBtn.propTypes = {
  callbackFunction: PropTypes.string.isRequired,
};

const UserRegistration = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasLowerCase: false,
    hasUpperCase: false,
    hasDigit: false,
    hasSpecialCharacter: false,
    satisfiesMinLength: false,
    isValid: false,
  });
  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordRepeat: '',
  });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleValueChange = useCallback(({ target }) => {
    const { name, value } = target;

    if (name === FIRSTNAME) {
      setFirstname(value);
    } else if (name === LASTNAME) {
      setLastname(value);
    } else if (name === EMAIL) {
      setEmail(value);
    } else if (name === PHONE_NUMBER) {
      setPhoneNumber(value);
    } else if (name === PASSWORD) {
      setPassword(value);
      setPasswordCriteria(validatePassword(value));
    } else if (name === PASSWORD_REPEAT) {
      setPasswordRepeat(value);
    }
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();

    const errors = {};

    if (!firstname || firstname.length < 2) {
      errors.firstname = 'Firstname MUST be at least 2 characters long!';
    }

    if (!lastname || lastname.length < 2) {
      errors.lastname = 'Lastname MUST be at least 2 characters long!';
    }

    if (!matchesEmail(email)) {
      errors.email = 'Invalid Email Address!';
    }

    if (!matchesPhoneNumber(phoneNumber)) {
      errors.phoneNumber = 'Invalid Phone Number!';
    }

    if (!passwordCriteria.isValid) {
      errors.password = 'Password does NOT meet criteria!';
    }

    if (passwordRepeat !== password) {
      errors.passwordRepeat = 'Password Mismatch!';
    }

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }

    setBusy(true);

    registerUser({
      firstname,
      lastname,
      email,
      phone_number: phoneNumber,
      password,
    })
      .then(({ id }) => {
        setBusy(false);
        navigate(routes.user.emailVerification(id), {
          replace: true,
          state: { email, resendPath: `users/${id}/resend_verification_link` },
        });
      })
      .catch(() => {
        setBusy(false);
      });
  }, [
    firstname, lastname, email, phoneNumber,
    password, passwordRepeat, passwordCriteria,
  ]);

  return (
    <div className={css.container}>
      <Header />
      <main className={css.main}>
        <form className={`${css.form} ${css.registration_form}`} onSubmit={handleFormSubmit}>
          <h1 className={css.h1}>User Registration</h1>
          <div className={css.row}>
            <TextBox
              id={FIRSTNAME}
              name={FIRSTNAME}
              value={firstname}
              label="Firstname"
              error={errors.firstname}
              className={textboxCss.account}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
            <TextBox
              id={LASTNAME}
              name={LASTNAME}
              value={lastname}
              label="Lastname"
              error={errors.lastname}
              className={textboxCss.account}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
          </div>
          <TextBox
            id={EMAIL}
            type="email"
            name={EMAIL}
            value={email}
            label="Email"
            error={errors.email}
            className={textboxCss.email}
            style={{ backgroundColor: '#efefef', borderRadius: 4 }}
            onChange={handleValueChange}
          />
          <TextBox
            id={PHONE_NUMBER}
            name={PHONE_NUMBER}
            value={phoneNumber}
            label="Phone Number"
            error={errors.phoneNumber}
            className={textboxCss.phone}
            style={{ backgroundColor: '#efefef', borderRadius: 4 }}
            onChange={handleValueChange}
          />
          <div className={css.row}>
            <TextBox
              id={PASSWORD}
              type="password"
              name={PASSWORD}
              value={password}
              label="Password"
              error={errors.password}
              className={textboxCss.password}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
            />
            <TextBox
              id={PASSWORD_REPEAT}
              type="password"
              name={PASSWORD_REPEAT}
              value={passwordRepeat}
              label="Repeat Password"
              error={errors.passwordRepeat}
              className={textboxCss.password}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
            />
          </div>
          <div className={css.password_criteria_wrap}>
            <span className={`${css.password_criteria} ${css.header}`}>
              Password MUST contain at least&nbsp;
            </span>
            <span className={`${css.password_criteria} ${passwordCriteria.hasLowerCase ? css.satisfied : ''}`}>
              1 lowercase character,&nbsp;
            </span>
            <span className={`${css.password_criteria} ${passwordCriteria.hasUpperCase ? css.satisfied : ''}`}>
              1 uppercase character,&nbsp;
            </span>
            <span className={`${css.password_criteria} ${passwordCriteria.hasDigit ? css.satisfied : ''}`}>
              1 digit,&nbsp;
            </span>
            <span className={`${css.password_criteria} ${passwordCriteria.hasSpecialCharacter ? css.satisfied : ''}`}>
              1 special character,&nbsp;
            </span>
            <span className={`${css.password_criteria} ${css.header}`}>
              and MUST be&nbsp;
            </span>
            <span className={`${css.password_criteria} ${passwordCriteria.satisfiesMinLength ? css.satisfied : ''}`}>
              at least 8 characters long
            </span>
          </div>
          <div className={css.consent_row}>
            <span>
              By clicking Create account below, you agree to the&nbsp;
            </span>
            <a
              href="https://logaexp.netlify.app/terms-conditions"
              target="_blank"
              rel="noreferrer"
              className="link compact-link"
            >
              Terms and Conditions
            </a>
            <span>&nbsp;and&nbsp;</span>
            <a
              href="https://logaexp.netlify.app/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="link compact-link"
            >
              Privacy Policy
            </a>
          </div>
          <div className={css.submit_pad}>
            <LoadingButton type="submit" label="Create Account" loading={busy} />
          </div>
        </form>
      </main>
    </div>
  );
};

export default UserRegistration;
