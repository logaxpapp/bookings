import {
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Password } from '../../components/TextBox';
import LoadingButton from '../../components/LoadingButton';
import Modal from '../../components/Modal';
import { notification } from '../../utils';
import { updatePasswordAsync as updateEmployeePassword } from '../../redux/companySlice';
import { updatePasswordAsync as updateUserPassword } from '../../redux/userSlice';

const NEW_PASSWORD = 'new_password';
const OLD_PASSWORD = 'old_password';
const PASSWORD_R = 'password_r';

const fieldStyle = {
  backgroundColor: '#f2eff5',
  borderRadius: 4,
  padding: 16,
};

const PasswordEditorDialog = ({ isOpen, onClose, updatePassword }) => {
  const [busy, setBusy] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordR, setPasswordR] = useState('');
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    passwordR: '',
  });
  const dispatch = useDispatch();

  const handleValueChange = ({ target }) => {
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
    }
  };

  const handleSubmit = (e) => {
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
        notification.showSuccess('Your password has been successfully updated!');
        onClose();
      }
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={busy ? null : onClose}
      parentSelector={() => document.body}
      shouldCloseOnEsc={!busy}
      shouldCloseOnOverlayClick={!busy}
    >
      <section className="w-full max-w-[600px] p-12">
        <header className="border-b mb-8">
          <h1 className="text-2xl font-semibold pb-4 m-0">Change Password</h1>
        </header>
        <form onSubmit={handleSubmit}>
          <Password
            id={OLD_PASSWORD}
            name={OLD_PASSWORD}
            label="Old Password"
            value={oldPassword}
            error={errors.oldPassword}
            onChange={handleValueChange}
            style={fieldStyle}
            canUmask
          />
          <Password
            id={NEW_PASSWORD}
            name={NEW_PASSWORD}
            label="New Password"
            value={newPassword}
            error={errors.newPassword}
            onChange={handleValueChange}
            style={fieldStyle}
            canUmask
          />
          <Password
            id={PASSWORD_R}
            name={PASSWORD_R}
            label="Repeat Password"
            value={passwordR}
            error={errors.passwordR}
            onChange={handleValueChange}
            style={fieldStyle}
            canUmask
          />
          <LoadingButton
            type="submit"
            label="Update Password"
            loading={busy}
            styles={{ fontSize: '1.05rem' }}
          />
        </form>
      </section>
    </Modal>
  );
};

PasswordEditorDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  updatePassword: PropTypes.func.isRequired,
};

PasswordEditorDialog.defaultProps = {
  isOpen: false,
};

export const EmployeePasswordEditorDialog = ({ isOpen, onClose }) => (
  <PasswordEditorDialog isOpen={isOpen} onClose={onClose} updatePassword={updateEmployeePassword} />
);

EmployeePasswordEditorDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

EmployeePasswordEditorDialog.defaultProps = {
  isOpen: false,
};

export const UserPasswordEditorDialog = ({ isOpen, onClose }) => (
  <PasswordEditorDialog isOpen={isOpen} onClose={onClose} updatePassword={updateUserPassword} />
);

UserPasswordEditorDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

UserPasswordEditorDialog.defaultProps = {
  isOpen: false,
};

export default PasswordEditorDialog;
