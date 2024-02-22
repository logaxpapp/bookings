import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SigninForm from './SigninForm';
import { loginAsync } from '../../../redux/companySlice';
import routes from '../../../routing/routes';

const CompanyLogin = () => {
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
        setBusy(false);
        setError(error === 'Invalid credentials' ? 'Incorrect Email or Password' : 'An unknown error occurred during authentication.');
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
      forgotPasswordEndpoint="auth/password-recoveries/employee"
      signupPath={routes.company.absolute.login}
      setBusy={setBusy}
    />
  );
};

export default CompanyLogin;
