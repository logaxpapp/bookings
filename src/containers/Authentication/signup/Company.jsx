import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import css from '../style.module.css';
import AlertComponent from '../../../components/AlertComponents';
import LoadingButton from '../../../components/LoadingButton';
import TextBox, {
  matchesEmail,
  matchesPhoneNumber,
  Password,
  validatePassword,
} from '../../../components/TextBox';
import routes from '../../../routing/routes';
import { registerCompany } from '../../../api';
import AuthContainer from '../AuthContainer';
import { notification } from '../../../utils';
import EmailVerificationModal from './EmailVerificationModal';

const EMAIL = 'email';
const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const NAME = 'name';
const PASSWORD = 'password';
const PHONE_NUMBER = 'phone_number';

const fieldStyle = {
  backgroundColor: '#f2eff5',
  borderRadius: 4,
};

const CompanySignupForm = () => {
  const [priceId, setPriceId] = useState(0);
  const [countryId, setCountryId] = useState(0);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({
    [FIRSTNAME]: '',
    [LASTNAME]: '',
    [NAME]: '',
    [EMAIL]: '',
    [PHONE_NUMBER]: '',
    [PASSWORD]: '',
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    hasLowerCase: false,
    hasUpperCase: false,
    hasDigit: false,
    hasSpecialCharacter: false,
    satisfiesMinLength: false,
    isValid: false,
  });

  const [errors, setErrors] = useState({
    [NAME]: '',
    [EMAIL]: '',
    [FIRSTNAME]: '',
    [LASTNAME]: '',
    [PHONE_NUMBER]: '',
  });
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [linkResendPath, setLinkResendPath] = useState('');

  useEffect(() => {
    if (location.state && location.state.priceId && location.state.countryId) {
      setPriceId(location.state.priceId);
      setCountryId(location.state.countryId);
    } else {
      navigate(routes.company.absolute.subscriptions, { replace: true });
    }
  }, []);

  const handleValueChange = ({ target }) => {
    const { name, value } = target;

    setFields((fields) => ({ ...fields, [name]: value }));

    if (name === PASSWORD) {
      setPasswordCriteria(validatePassword(value));
      return;
    }

    let error = false;

    if (value) {
      if (name === FIRSTNAME || name === LASTNAME || name === NAME) {
        error = value.length < 2;
      } else if (name === EMAIL) {
        error = !matchesEmail(value);
      } else if (name === PHONE_NUMBER) {
        error = !matchesPhoneNumber(value);
      }
    }

    setErrors((errors) => ({ ...errors, [name]: error }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const passwordValid = validatePassword(fields[PASSWORD]);

    setPasswordCriteria(passwordValid);

    const errors = {
      [FIRSTNAME]: fields[FIRSTNAME].length < 2,
      [LASTNAME]: fields[LASTNAME].length < 2,
      [NAME]: fields[NAME].length < 2,
      [EMAIL]: fields[EMAIL].length < 2,
      [PHONE_NUMBER]: !matchesPhoneNumber(fields[PHONE_NUMBER]),
    };

    setErrors(errors);

    if (!passwordValid.isValid || Object.keys(errors).some((key) => errors[key])) {
      notification.showError('It seems you have some invalid values in the form. Please correct any errors to proceed.');
      return;
    }

    setBusy(true);

    registerCompany({
      ...fields,
      price_id: priceId,
      country_id: countryId,
    })
      .then(({ id }) => {
        setBusy(false);
        setLinkResendPath(`companies/${id}/resend-verification-link`);
      })
      .catch(({ message }) => {
        setBusy(false);
        setError(message);
        notification.showError('Applicaton encountered an error while creating account. Please try again.');
      });
  };

  return (
    <AuthContainer
      text="Unlock your business's potential for growth by leveraging our platform to expand your reach and connect with a broader audience."
    >
      <div className={css.form_wrap}>
        <header className="flex flex-col pb-6">
          <h1 className={css.h2}>Create a free account </h1>
          <p className="m-0">
            Fill in the form below to create a free account.
            It only takes a few minutes to register.
          </p>
        </header>
        <form className={css.panel} onSubmit={handleFormSubmit}>
          <AlertComponent
            type="error"
            message={error ? 'An error occurred while creating account' : ''}
            style={{ maxHeight: 60 }}
          />
          <TextBox
            id={FIRSTNAME}
            name={FIRSTNAME}
            value={fields[FIRSTNAME]}
            label="Firstname"
            placeholder="Enter your firstname"
            error={errors[FIRSTNAME] ? 'Firstname MUST be at least 2 characters!' : ''}
            style={fieldStyle}
            onChange={handleValueChange}
          />
          <TextBox
            id={LASTNAME}
            type="text"
            name={LASTNAME}
            value={fields[LASTNAME]}
            label="Lastname"
            placeholder="Enter your firstname"
            error={errors[LASTNAME] ? 'Lastname MUST be at least 2 characters!' : ''}
            style={fieldStyle}
            onChange={handleValueChange}
          />
          <TextBox
            id={NAME}
            name={NAME}
            value={fields[NAME]}
            label="Company Name"
            placeholder="Enter your company name"
            error={errors[NAME] ? 'Company name MUST be at least 2 characters!' : ''}
            style={fieldStyle}
            onChange={handleValueChange}
          />
          <TextBox
            id={EMAIL}
            type="email"
            name={EMAIL}
            value={fields[EMAIL]}
            label="Email"
            error={errors[EMAIL] ? 'Invalid Email Address!' : ''}
            style={fieldStyle}
            onChange={handleValueChange}
            readOnly={busy}
          />
          <TextBox
            id={PHONE_NUMBER}
            name={PHONE_NUMBER}
            value={fields[PHONE_NUMBER]}
            label="Phone Number"
            error={errors[PHONE_NUMBER] ? 'Invalid Phone Number!' : ''}
            style={fieldStyle}
            onChange={handleValueChange}
          />
          <div className="flex flex-col gap-1">
            <Password
              id={PASSWORD}
              name={PASSWORD}
              value={fields[PASSWORD]}
              label="Password"
              style={fieldStyle}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
              hideErrorOnNull
              canUnmask
            />
            {fields[PASSWORD] && !passwordCriteria.isValid ? (
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
            ) : null}
          </div>
          <div>
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
            <LoadingButton
              type="submit"
              label="Create Account"
              loading={busy}
              styles={{ marginTop: 0 }}
            />
          </div>
          <Link to={routes.company.absolute.login} className="link">
            <span>Already has an account?</span>
            <span className="font-bold"> login.</span>
          </Link>
        </form>
        <EmailVerificationModal email={fields[EMAIL]} resendPath={linkResendPath} />
      </div>
    </AuthContainer>
  );
};

export default CompanySignupForm;
