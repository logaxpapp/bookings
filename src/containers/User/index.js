import {
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Navigate,
  useLocation,
} from 'react-router';
import UserLayout from './UserLayout';
import { userProps } from '../../utils/propTypes';
import { fetchUserAsync, selectUser } from '../../redux/userSlice';
import AppStorage from '../../utils/appStorage';
import routes from '../../routing/routes';
import BlankPageContainer from '../../components/BlankPageContainer';
import LoadingSpinner from '../../components/LoadingSpinner';

const storage = AppStorage.getInstance();

const RestrictedUserPage = ({ user }) => (
  <UserLayout user={user} />
);

RestrictedUserPage.propTypes = {
  user: userProps.isRequired,
};

const User = () => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const [state, setState] = useState({ loading: false, error: '' });
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      return;
    }

    const token = storage.getUserToken();
    if (token) {
      setState({ loading: true, error: '' });
      dispatch(fetchUserAsync(token, (err) => {
        setState({ loading: false, error: err });
      }));
    } else {
      setState({ loading: false, error: 'No Token Found' });
    }
  }, []);

  if (state.loading) {
    return (
      <BlankPageContainer>
        <LoadingSpinner>
          <span>Loading ...</span>
        </LoadingSpinner>
      </BlankPageContainer>
    );
  }

  if (!user) {
    if (state.error) {
      return (
        <Navigate
          to={routes.user.login}
          state={{ referrer: location.pathname }}
          replace
        />
      );
    }

    return null;
  }

  return <RestrictedUserPage user={user} />;
};

export default User;
