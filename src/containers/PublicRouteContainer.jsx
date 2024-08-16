import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { childrenProps } from '../utils/propTypes';
import AppStorage from '../utils/appStorage';
import { fetchCompanyAsync, selectEmployee } from '../redux/companySlice';
import { fetchUserAsync, selectUser } from '../redux/userSlice';
import { setReAuthenticating } from '../redux/controls';

const appStorage = AppStorage.getInstance();

const PublicRouteContainer = ({ children }) => {
  const employee = useSelector(selectEmployee);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user || employee) {
      return;
    }

    const authData = appStorage.getLastAuthInfo();
    if (authData) {
      dispatch(setReAuthenticating(true));
      if (authData.type === 'employee') {
        dispatch(fetchCompanyAsync(authData.token, () => dispatch(setReAuthenticating(false))));
      } else {
        dispatch(fetchUserAsync(authData.token, () => dispatch(setReAuthenticating(false))));
      }
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
};

PublicRouteContainer.propTypes = {
  children: childrenProps,
};

PublicRouteContainer.defaultProps = {
  children: null,
};

export default PublicRouteContainer;
