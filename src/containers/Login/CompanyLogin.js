import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import LoginForm from './LoginForm';
import {
  loginAsync,
  selectAuthenticatingCompany,
  selectCompanyAuthenticationError,
} from '../../redux/companySlice';
import routes from '../../routing/routes';

const CompanyLogin = () => {
  const [referrer, setReferrer] = useState();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const busy = useSelector(selectAuthenticatingCompany);
  const error = useSelector(selectCompanyAuthenticationError);

  useEffect(() => {
    const referrer = location.state && location.state.referrer;
    setReferrer(referrer || routes.company.absolute.dashboard);
  }, []);

  const handleSubmit = useCallback((email, password) => {
    dispatch(loginAsync(email, password, (error) => {
      if (!error) {
        navigate(referrer, { replace: true });
      }
    }));
  }, [referrer]);

  return (
    <LoginForm
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
      referred={!!referrer}
      passwordRecoveryPath={routes.company.absolute.passwordRecovery}
    />
  );
};

export default CompanyLogin;
