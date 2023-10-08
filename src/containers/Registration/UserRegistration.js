import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { decodeJwt } from 'jose';
import css from './style.module.css';
import textboxCss from '../../components/TextBox/textbox.module.css';
import Header from '../Header';
import LoadingButton from '../../components/LoadingButton';
import TextBox from '../../components/TextBox';
import { registerUser } from '../../api';
import routes from '../../routing/routes';

const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const EMAIL = 'email';
const PHONE_NUMBER = 'phone_number';
const PASSWORD = 'password';
const PASSWORD_REPEAT = 'password_repeat';

export const matchesEmail = (email) => /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);

export const matchesPhoneNumber = (number) => (
  /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/g.test(number)
);

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
  const [firstnameError, setFirstnameError] = useState('');
  const [lastnameError, setLastnameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordRepeatError, setPasswordRepeatError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleValueChange = useCallback(({ target: { name, value } }) => {
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
    } else if (name === PASSWORD_REPEAT) {
      setPasswordRepeat(value);
    }
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    let hasError = false;

    if (!firstname || firstname.length < 2) {
      setFirstnameError('Firstname MUST be at least 2 characters long!');
      hasError = true;
    } else {
      setFirstnameError('');
    }

    if (!lastname || lastname.length < 2) {
      setLastnameError('Lastname MUST be at least 2 characters long!');
      hasError = true;
    } else {
      setLastnameError('');
    }

    if (!matchesEmail(email)) {
      setEmailError('Invalid Email Address!');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!matchesPhoneNumber(phoneNumber)) {
      setPhoneNumberError('Invalid Phone Number!');
      hasError = true;
    } else {
      setPhoneNumberError('');
    }

    if (!password || password.length < 6) {
      setPasswordError('Password MUST be at least 6 characters long!');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (passwordRepeat !== password) {
      setPasswordRepeatError('Password Mismatch!');
      hasError = true;
    } else {
      setPasswordRepeatError('');
    }

    if (hasError) {
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
        navigate(routes.signupSuccess, {
          replace: true,
          state: { email, resendPath: `users/${id}/resend_verification_link` },
        });
      })
      .catch(() => {
        setBusy(false);
      });
  }, [
    firstname, lastname, email, phoneNumber, password, passwordRepeat,
    setFirstnameError, setLastnameError, setEmailError, setPhoneNumberError,
    setPasswordError, setPasswordRepeatError, setBusy,
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
              error={firstnameError}
              className={textboxCss.account}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
            <TextBox
              id={LASTNAME}
              name={LASTNAME}
              value={lastname}
              label="Lastname"
              error={lastnameError}
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
            error={emailError}
            className={textboxCss.email}
            style={{ backgroundColor: '#efefef', borderRadius: 4 }}
            onChange={handleValueChange}
          />
          <TextBox
            id={PHONE_NUMBER}
            name={PHONE_NUMBER}
            value={phoneNumber}
            label="Phone Number"
            error={phoneNumberError}
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
              error={passwordError}
              className={textboxCss.password}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
            <TextBox
              id={PASSWORD_REPEAT}
              type="password"
              name={PASSWORD_REPEAT}
              value={passwordRepeat}
              label="Repeat Password"
              error={passwordRepeatError}
              className={textboxCss.password}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
          </div>
          <LoadingButton type="submit" label="Register" loading={busy} />
        </form>
      </main>
    </div>
  );
};

export default UserRegistration;
