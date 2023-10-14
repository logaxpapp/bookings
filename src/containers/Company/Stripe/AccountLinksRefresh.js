import { useCallback, useState } from 'react';
import Header from '../../Header';
import TextBox, { matchesEmail } from '../../../components/TextBox';
import LoadingButton from '../../../components/LoadingButton';
import { postResource } from '../../../api';
import { useNotification } from '../../../lib/Notification';
import AlertComponent from '../../../components/AlertComponents';

const EMAIL = 'email';
const PASSWORD = 'password';

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(45deg, rgba(234,243,249,1) 0%, rgba(255,254,230,1) 22%, rgba(172,231,215,1) 40%, rgba(253,232,255,1) 60%, rgba(190,255,231,1) 81%, rgba(251,254,255,1) 100%)',
  },
  body: {
    width: '100%',
    maxWidth: 360,
    margin: 'auto',
    padding: '48px 16px 16px',
    display: 'flex',
  },
  formWrap: {
    padding: '12px 24px',
    backgroundColor: '#fff',
    boxShadow: 'rgba(0, 0, 0, 0.16) 0 3px 6px, rgba(0, 0, 0, 0.23) 0 3px 6px',
  },
  info: {
    lineHeight: 1.4,
    marginTop: 0,
    color: '#274a7f',
  },
};

const AccountLinksRefresh = () => {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const notification = useNotification();

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === EMAIL) {
      setEmail(value);
    } else if (name === PASSWORD) {
      setPassword(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const errors = {};
    if (!matchesEmail(email)) {
      errors.email = 'Invalid Email Address!';
    }
    if (!password) {
      errors.password = 'Please Enter Password!';
    }

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }

    setBusy(true);
    postResource(null, 'stripe_connected_accounts/links', { email, password }, true)
      .then(({ url }) => {
        window.location.href = url;
      })
      .catch(({ message }) => {
        notification.showError(message);
        setErrorMsg('Error creating link. Please try again');
        setBusy(false);
      });
  }, [email, password, setBusy, setErrors, setErrorMsg]);

  return (
    <section style={styles.container}>
      <Header />
      <div style={styles.body}>
        <div style={styles.formWrap}>
          <p style={styles.info}>
            It seems you had issues completing your Stripe on-boarding process.
            There are many reasons this could have happened (eg. the link could expire).
            This is a high security process and you must be patient to complete it.
            Please login to continue the process.
          </p>
          <AlertComponent type="error" style={{ whiteSpace: 'pre-wrap' }} message={errorMsg} />
          <form onSubmit={handleSubmit}>
            <TextBox
              type="email"
              name={EMAIL}
              value={email}
              label="Email"
              error={errors.email}
              onChange={handleValueChange}
              style={{ border: '1px solid #efefef' }}
            />
            <TextBox
              type="password"
              name={PASSWORD}
              value={password}
              label="Password"
              error={errors.password}
              onChange={handleValueChange}
              style={{ border: '1px solid #efefef' }}
            />
            <LoadingButton
              type="submit"
              label="Sign In"
              loading={busy}
              styles={{ fontSize: 14 }}
            />
          </form>
        </div>
      </div>
    </section>
  );
};

export default AccountLinksRefresh;
