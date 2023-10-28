import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import css from './style.module.css';
import textboxCss from '../../components/TextBox/textbox.module.css';
import AlertComponent from '../../components/AlertComponents';
import Header from '../Header';
import LoadingButton from '../../components/LoadingButton';
import TextBox, {
  matchesEmail,
  matchesPhoneNumber,
} from '../../components/TextBox';
import routes from '../../routing/routes';
import { registerCompany } from '../../api';
import { SimpleCheckBox } from '../../components/Inputs';
import {
  usePrivacyPolicyDialog,
  useTermsAndConditionDialog,
} from '../TermsAndPrivacy';

const ADDRESS = 'address';
const CATEGORY = 'category';
const CONSENT = 'consent';
const EMAIL = 'email';
const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const NAME = 'name';
const PASSWORD = 'password';
const PASSWORD_REPEAT = 'password_repeat';
const PHONE_NUMBER = 'phone_number';
const PRIVACY_POLICY = 'privacy_policy';
const TERMS_AND_CONDITIONS = 'terms_and_conditions';

const categories = ['Salon'];

const CompanyRegistration = () => {
  const [priceId, setPriceId] = useState(0);
  const [countryId, setCountryId] = useState(0);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    firstname: '',
    lastname: '',
    phoneNumber: '',
    category: '',
    address: '',
    password: '',
    passwordRepeat: '',
  });
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const termsAndConditionsDialog = useTermsAndConditionDialog();
  const privacyPolicyDialog = usePrivacyPolicyDialog();

  useEffect(() => {
    if (location.state && location.state.priceId && location.state.countryId) {
      setPriceId(location.state.priceId);
      setCountryId(location.state.countryId);
    } else {
      navigate(routes.company.absolute.subscriptions, { replace: true });
    }
  }, []);

  const handleValueChange = useCallback(({ target }) => {
    const { name, value } = target;

    if (name === FIRSTNAME) {
      setFirstname(value);
    } else if (name === LASTNAME) {
      setLastname(value);
    } else if (name === NAME) {
      setName(value);
    } else if (name === EMAIL) {
      setEmail(value);
    } else if (name === PHONE_NUMBER) {
      setPhoneNumber(value);
    } else if (name === CATEGORY) {
      setCategory(value);
    } else if (name === ADDRESS) {
      setAddress(value);
    } else if (name === PASSWORD) {
      setPassword(value);
    } else if (name === PASSWORD_REPEAT) {
      setPasswordRepeat(value);
    } else if (name === CONSENT) {
      setConsented(target.checked);
    }
  }, []);

  const handleClick = useCallback(({ target }) => {
    const { name } = target;

    if (name === TERMS_AND_CONDITIONS) {
      termsAndConditionsDialog.show();
    } else if (name === PRIVACY_POLICY) {
      privacyPolicyDialog.show();
    }
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();

    if (!consented) {
      return;
    }

    const errors = {};

    if (!firstname || firstname.length < 2) {
      errors.firstname = 'Firstname MUST be at least 2 characters!';
    }

    if (!lastname || lastname.length < 2) {
      errors.lastname = 'Lastname MUST be at least 2 characters!';
    }

    if (!name || name.length < 2) {
      errors.name = 'Company name MUST be at least 2 characters!';
    }

    if (!matchesEmail(email)) {
      errors.email = 'Invalid Email Address!';
    }

    if (!matchesPhoneNumber(phoneNumber)) {
      errors.phoneNumber = 'Invalid Phone Number!';
    }

    if (!category || category.length < 3) {
      errors.category = 'Invalid Category!';
    }

    if (!address || address.length < 10) {
      errors.address = 'Invalid Address!';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password MUST be at least 6 characters long!';
    }

    if (passwordRepeat !== password) {
      errors.passwordRepeat = 'Password Mismatch!';
    }

    setErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }

    setBusy(true);

    registerCompany({
      name,
      email,
      firstname,
      lastname,
      phone_number: phoneNumber,
      category: category.toLowerCase(),
      address,
      password,
      price_id: priceId,
      country_id: countryId,
    })
      .then(({ id }) => {
        setBusy(false);
        navigate(routes.company.absolute.emailVerification(id), {
          replace: true,
          state: { email, resendPath: `companies/${id}/resend_verification_link` },
        });
      })
      .catch(({ message }) => {
        setBusy(false);
        setError(message);
      });
  }, [
    name, email, phoneNumber, category, firstname, lastname,
    password, passwordRepeat, address, priceId, countryId, consented,
    setErrors, setBusy, setError,
  ]);

  return (
    <div className={css.container}>
      <Header />
      <main className={css.main}>
        <form className={`${css.form} ${css.registration_form}`} onSubmit={handleFormSubmit}>
          <h1 className={css.h1}>Company Registration</h1>
          <AlertComponent type="error" message={error} style={{ maxHeight: 60 }} />
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
              type="text"
              name={LASTNAME}
              value={lastname}
              label="Lastname"
              error={errors.lastname}
              className={textboxCss.account}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
          </div>
          <div className={css.row}>
            <TextBox
              id={NAME}
              name={NAME}
              value={name}
              label="Company Name"
              error={errors.name}
              className={textboxCss.company}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
            />
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
          </div>
          <div className={css.row}>
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
            <TextBox
              id={CATEGORY}
              name={CATEGORY}
              value={category}
              label="Category"
              error={errors.category}
              className={textboxCss.category}
              style={{ backgroundColor: '#efefef', borderRadius: 4 }}
              onChange={handleValueChange}
              options={{ listId: 'category-list', list: categories }}
            />
          </div>
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
              onChange={handleValueChange}
            />
          </div>
          <TextBox
            id={ADDRESS}
            type="text"
            name={ADDRESS}
            value={address}
            label="Address"
            error={errors.address}
            className={textboxCss.marker}
            style={{ backgroundColor: '#efefef', borderRadius: 4 }}
            onChange={handleValueChange}
          />
          <div className={css.consent_row}>
            <SimpleCheckBox
              name={CONSENT}
              checked={consented}
              label="I have read and agree to the"
              onChange={handleValueChange}
            />
            <button
              type="button"
              name={TERMS_AND_CONDITIONS}
              className="link compact-link"
              onClick={handleClick}
            >
              Terms and Conditions
            </button>
            <span>and</span>
            <button
              type="button"
              name={PRIVACY_POLICY}
              className="link compact-link"
              onClick={handleClick}
            >
              Privacy Policy
            </button>
          </div>
          <div className={css.submit_pad}>
            {consented ? (
              <LoadingButton type="submit" label="Register" loading={busy} />
            ) : (
              <div className={css.submit_btn_placeholder}>Register</div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default CompanyRegistration;
