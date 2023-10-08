import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import LoginForm from './LoginForm';
import routes from '../../routing/routes';
import {
  loginAsync,
  selectAuthenticatingUser,
  selectUserAuthenticationError,
} from '../../redux/userSlice';

const UserLogin = () => {
  const [referrer, setReferrer] = useState();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const busy = useSelector(selectAuthenticatingUser);
  const error = useSelector(selectUserAuthenticationError);

  useEffect(() => {
    const referrer = location.state && location.state.referrer;
    setReferrer(referrer || routes.user.base);
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
      passwordRecoveryPath={routes.user.passwordRecovery}
    />
  );
};

export default UserLogin;
