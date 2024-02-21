import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SigninForm from './SigninForm';
import { loginAsync } from '../../../redux/userSlice';
import routes from '../../../routing/routes';

const UserLogin = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [referrer, setReferrer] = useState();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const referrer = location.state && location.state.referrer;
    setReferrer(referrer || routes.company.absolute.dashboard);
  }, []);

  const handleSubmit = useCallback((email, password) => {
    setBusy(true);
    dispatch(loginAsync(email, password, (error) => {
      if (error) {
        setError(error === 'Invalid Email or Password' ? error : 'An unknown error occurred during authentication.');
        setBusy(false);
      } else {
        setBusy(false);
        navigate(referrer || routes.home, { replace: true });
      }
    }));
  }, [referrer]);

  return (
    <SigninForm
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
      referred={!!referrer}
      forgotPasswordEndpoint="auth/password-recoveries/user"
      signupPath={routes.user.registeration}
      setBusy={setBusy}
    />
  );
};

export default UserLogin;
