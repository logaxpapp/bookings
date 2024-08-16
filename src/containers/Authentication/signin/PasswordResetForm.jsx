import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PropTypes from 'prop-types';
import css from '../style.module.css';
import LoadingButton from '../../../components/LoadingButton';
import { postResource } from '../../../api';
import { Password, validatePassword } from '../../../components/TextBox';
import ModalPageContainer from '../ModalPageContainer';
import Modal from '../../../components/Modal';
import { notification } from '../../../utils';
import { paths } from '../../../components/svg';
import AuthTypeChooser from '../AuthTypeChooser';
import routes from '../../../routing/routes';

const PASSWORD = 'password';
const PASSWORD_REPEAT = 'password repeat';

const modes = {
  form: 'form',
  success: 'success',
  chooser: 'chooser',
};

const fieldStyle = {
  backgroundColor: '#f2eff5',
  borderRadius: 4,
  padding: 16,
};

const FormModal = ({ isOpen, setMode, token }) => {
  const [busy, setBusy] = useState('');
  const [password, setPassword] = useState('');
  const [passwordR, setPasswordR] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasLowerCase: false,
    hasUpperCase: false,
    hasDigit: false,
    hasSpecialCharacter: false,
    satisfiesMinLength: false,
    isValid: false,
  });
  const [passwordRError, setPasswordRError] = useState('');

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === PASSWORD) {
      setPassword(value);
      setPasswordCriteria(validatePassword(value));
    } else if (name === PASSWORD_REPEAT) {
      setPasswordR(value);
      setPasswordRError(value && value !== password);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;

    const passwordValid = validatePassword(password);
    setPasswordCriteria(passwordValid);
    const passwordMismatch = password !== passwordR;
    setPasswordRError(passwordMismatch);

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
      .then(() => setMode(modes.success))
      .catch(() => {
        setBusy(false);
        notification.showError('Failed to change your passwword. Please try again.');
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      parentSelector={() => document.body}
      style={{ content: { maxWidth: 'max-content' } }}
    >
      <form onSubmit={handleSubmit} className="p-12 flex flex-col gap-2 w-96">
        <h1 className={css.h1}>Reset Password</h1>
        <div className="flex flex-col gap-1">
          <Password
            id={PASSWORD}
            name={PASSWORD}
            value={password}
            label="New Password"
            onChange={handleValueChange}
            style={fieldStyle}
          />
          {password && !passwordCriteria.isValid ? (
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
        <Password
          id={PASSWORD_REPEAT}
          name={PASSWORD_REPEAT}
          value={passwordR}
          error={passwordRError ? 'Password Mismatch!' : ''}
          label="Repeat Password"
          onChange={handleValueChange}
          style={fieldStyle}
        />
        <LoadingButton
          type="submit"
          label="Reset Password"
          loading={busy}
          styles={{ marginTop: 0 }}
        />
      </form>
    </Modal>
  );
};

FormModal.propTypes = {
  setMode: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
};

FormModal.defaultProps = {
  isOpen: false,
};

const SuccessModal = ({ isOpen, setMode }) => {
  const [scale, setScale] = useState(0);

  useEffect(() => setScale(1.5), []);

  return (
    <Modal
      isOpen={isOpen}
      parentSelector={() => document.body}
      style={{ content: { maxWidth: 'max-content' } }}
    >
      <section className={`${css.success_panel} gap-4`}>
        <h1 className={css.verification_heading}>Password Reset Successful</h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={css.envelope}
          style={{ transform: `scale(${scale})` }}
        >
          <path fill="currentColor" d={paths.checkCircle} />
        </svg>
        <div className="flex flex-col items-center gap-3">
          <span>Your have successfully changed your password.</span>
          <span className="text-center">
            You can now access your account using your new password.
          </span>
        </div>
        <footer className="flex items-center text-sm py-2 gap-1">
          <button type="button" className="link" onClick={() => setMode(modes.chooser)}>
            Click
          </button>
          <span>
            to login to your dashboard
          </span>
        </footer>
      </section>
    </Modal>
  );
};

SuccessModal.propTypes = {
  setMode: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

SuccessModal.defaultProps = {
  isOpen: false,
};

const ChooserModal = ({ isOpen }) => (
  <Modal
    isOpen={isOpen}
    style={{
      content: { maxWidth: 'max-content' },
    }}
  >
    <AuthTypeChooser
      companyRoute={routes.company.absolute.dashboard}
      userRoute={routes.user.dashboard.absolute.home}
    />
  </Modal>
);

ChooserModal.propTypes = {
  isOpen: PropTypes.bool,
};

ChooserModal.defaultProps = {
  isOpen: false,
};

const PasswordResetForm = () => {
  const [mode, setMode] = useState(modes.form);
  const navigate = useNavigate();
  const { token, resource } = useParams();

  useEffect(() => {
    if (!(token && (resource === 'employees' || resource === 'users'))) {
      navigate('/page-not-found', { replace: true });
    }
  }, []);

  return (
    <ModalPageContainer>
      <ChooserModal isOpen={mode === modes.chooser} />
      <SuccessModal isOpen={mode === modes.success} setMode={setMode} />
      <FormModal isOpen={mode === modes.form} setMode={setMode} token={token} />
    </ModalPageContainer>
  );
};

export default PasswordResetForm;
