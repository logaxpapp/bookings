import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import SlideDialog from '../components/SlideInDialog';
import TextBox from '../components/TextBox';
import LoadingButton from '../components/LoadingButton';
import { colors, paths, SvgButton } from '../components/svg';
import AccentCheckBox from '../components/Inputs/AccentCheckBox';

const CLOSE_PASSWORD_EDITOR = 'close_password_editor';
const MODE = 'mode';
const NEW_PASSWORD = 'new_password';
const OLD_PASSWORD = 'old_password';
const PASSWORD_R = 'password_r';

const styles = {
  passwordEditor: {
    position: 'relative',
    padding: '12px 24px',
    backgroundColor: '#eef0f3',
    minWidth: 280,
  },
  settingsHeader: {
    padding: '8px 0',
    marginBottom: 8,
    borderBottom: '1px dotted #efefef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsHeading: {
    fontSize: '0.9rem',
    marginBottom: 0,
  },
};

const PasswordEditor = ({ onClose, updatePassword }) => {
  const [busy, setBusy] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordR, setPasswordR] = useState('');
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    passwordR: '',
  });
  const [passwordMode, setPasswordMode] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => setOpen(true), []);

  const handleValueChange = useCallback(({ target }) => {
    const { name, value } = target;

    if (name === OLD_PASSWORD) {
      setOldPassword(value);
      if (errors.oldPassword) {
        setErrors({ ...errors, oldPassword: '' });
      }
    } else if (name === NEW_PASSWORD) {
      setNewPassword(value);
      if (errors.newPassword) {
        setErrors({ ...errors, newPassword: '', passwordR: '' });
      } else if (errors.passwordR) {
        setErrors({ ...errors, passwordR: '' });
      }
    } else if (name === PASSWORD_R) {
      setPasswordR(value);
      if (errors.passwordR) {
        setErrors({ ...errors, passwordR: '' });
      }
    } else if (name === MODE) {
      setPasswordMode(target.checked);
    }
  }, [errors, setErrors, setOldPassword, setNewPassword, setPasswordR]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const errors = {};

    if (!(oldPassword && oldPassword.length >= 6)) {
      errors.oldPassword = 'Password MUST be at least 6 characters';
    }
    if (!(newPassword && newPassword.length >= 6)) {
      errors.newPassword = 'Password MUST be at least 6 characters';
    }
    if (newPassword !== passwordR) {
      errors.passwordR = 'Password Mismatch!';
    }

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }
    setBusy(true);
    dispatch(updatePassword({
      new_password: newPassword,
      old_password: oldPassword,
    }, (err) => {
      setBusy(false);
      if (!err) {
        setOpen(false);
        setTimeout(onClose, 500);
      }
    }));
  }, [oldPassword, newPassword, passwordR, onClose, setErrors, setBusy]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_PASSWORD_EDITOR) {
      setOpen(false);
      setTimeout(onClose, 500);
    }
  }, [onClose, setOpen]);

  return (
    <SlideDialog isIn={isOpen}>
      <section style={styles.passwordEditor}>
        <header style={styles.settingsHeader}>
          <h1 style={styles.settingsHeading}>Change Password</h1>
          <SvgButton
            type="button"
            name={CLOSE_PASSWORD_EDITOR}
            title="Close"
            color={colors.delete}
            path={paths.close}
            onClick={handleClick}
            sm
          />
        </header>
        <AccentCheckBox
          name={MODE}
          checked={passwordMode}
          label="Show Passwords"
          onChange={handleValueChange}
          style={{ paddingBottom: 24 }}
        />
        <form onSubmit={handleSubmit}>
          <TextBox
            type={passwordMode ? 'password' : 'text'}
            id={OLD_PASSWORD}
            name={OLD_PASSWORD}
            label="Old Password"
            value={oldPassword}
            error={errors.oldPassword}
            onChange={handleValueChange}
          />
          <TextBox
            type={passwordMode ? 'password' : 'text'}
            id={NEW_PASSWORD}
            name={NEW_PASSWORD}
            label="New Password"
            value={newPassword}
            error={errors.newPassword}
            onChange={handleValueChange}
          />
          <TextBox
            type={passwordMode ? 'password' : 'text'}
            id={PASSWORD_R}
            name={PASSWORD_R}
            label="Repeat Password"
            value={passwordR}
            error={errors.passwordR}
            onChange={handleValueChange}
          />
          <LoadingButton
            type="submit"
            label="Update Password"
            loading={busy}
            styles={{ fontSize: '1.05rem' }}
          />
        </form>
      </section>
    </SlideDialog>
  );
};

PasswordEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  updatePassword: PropTypes.func.isRequired,
};

export default PasswordEditor;
