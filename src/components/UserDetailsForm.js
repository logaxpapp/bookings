import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TextBox, { matchEmail, matchesPhoneNumber } from './TextBox';
import LoadingButton from './LoadingButton';
import SlideDialog from './SlideInDialog';
import { SvgButton, colors, paths } from './svg';
import { useDialog } from '../lib/Dialog';

const CLOSE = 'close';
const EMAIL = 'email';
const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const PHONE_NUMBER = 'phone number';

const styles = {
  container: {
    padding: '12px 16px',
  },
  form: {
    display: 'grid',
    gridTemplateColums: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
    minWidth: 240,
  },
  h1: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1px dotted #efefef',
    fontSize: '0.9rem',
  },
  relative: {
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  textboxContainer: {
    marginBottom: 0,
  },
  textbox: {
    backgroundColor: 'rgb(236 240 247)',
  },
  loadBtn: {
    fontSize: '0.8rem',
    marginTop: 0,
  },
};

export const UserDetailsForm = ({ onSubmit }) => {
  const [busy, setBusy] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({
    firstname,
    lastname,
    email,
    phoneNumber,
  });

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === FIRSTNAME) {
      setFirstname(value);
    } else if (name === LASTNAME) {
      setLastname(value);
    } else if (name === EMAIL) {
      setEmail(value);
    } else if (name === PHONE_NUMBER) {
      setPhoneNumber(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    let errors;

    if (!firstname || firstname.length < 2) {
      errors = {};
      errors.firstname = 'Firstname MUST be at least 2 characters!';
    }
    if (!lastname || lastname.length < 2) {
      errors ||= {};
      errors.lastname = 'Lastname must be at least 2 characters';
    }
    if (!matchEmail(email)) {
      errors ||= {};
      errors.email = 'Invalid Email Address!';
    }
    if (!matchesPhoneNumber(phoneNumber)) {
      errors ||= {};
      errors.phoneNumber = 'Invalid Phone number!';
    }

    if (errors) {
      setErrors(errors);
      return;
    }

    setBusy(true);
    onSubmit(firstname, lastname, email, phoneNumber, () => {
      setBusy(false);
    });
  }, [firstname, lastname, email, phoneNumber, onSubmit, setErrors, setBusy]);

  return (
    <section style={styles.container}>
      <h1 style={styles.h1}>User Details</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <TextBox
          type="text"
          id={FIRSTNAME}
          name={FIRSTNAME}
          label="Firstname"
          value={firstname}
          error={errors.firstname}
          style={styles.textbox}
          containerStyle={styles.textboxContainer}
          onChange={handleValueChange}
        />
        <TextBox
          type="text"
          id={LASTNAME}
          name={LASTNAME}
          label="Lastname"
          value={lastname}
          error={errors.lastname}
          style={styles.textbox}
          containerStyle={styles.textboxContainer}
          onChange={handleValueChange}
        />
        <TextBox
          type="email"
          id={EMAIL}
          name={EMAIL}
          label="Email"
          value={email}
          error={errors.email}
          style={styles.textbox}
          containerStyle={styles.textboxContainer}
          onChange={handleValueChange}
        />
        <TextBox
          type="text"
          id={PHONE_NUMBER}
          name={PHONE_NUMBER}
          label="Phone Number"
          value={phoneNumber}
          error={errors.phoneNumber}
          style={styles.textbox}
          containerStyle={styles.textboxContainer}
          onChange={handleValueChange}
        />
        <LoadingButton
          type="submit"
          label="Submit"
          loading={busy}
          styles={styles.loadBtn}
        />
      </form>
    </section>
  );
};

UserDetailsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export const UserDetailsFormDialog = ({ onSubmit, onClose }) => {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setOpen(false);
      setTimeout(onClose, 500);
    }
  }, [onClose, setOpen]);

  const handleSubmit = useCallback((firstname, lastname, email, phoneNumber, callback) => {
    onSubmit(firstname, lastname, email, phoneNumber, (err) => {
      if (err) {
        callback();
      } else {
        setOpen(false);
        setTimeout(onClose, 500);
      }
    });
  }, [onClose, setOpen]);

  return (
    <SlideDialog isIn={isOpen} style={{ position: 'relative' }}>
      <>
        <UserDetailsForm onSubmit={handleSubmit} />
        <SvgButton
          type="button"
          name={CLOSE}
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={handleClick}
          style={styles.closeBtn}
          sm
        />
      </>
    </SlideDialog>
  );
};

UserDetailsFormDialog.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export const useUserDetailsDialog = () => {
  const dialog = useDialog();

  return {
    show: (onSubmit, onCancelled) => {
      let popup;
      const handleClose = () => {
        popup.close();
        onCancelled();
      };

      popup = dialog.show(
        <UserDetailsFormDialog onSubmit={onSubmit} onClose={handleClose} />,
      );
    },
  };
};
