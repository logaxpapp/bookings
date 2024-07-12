import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { getProviderAsync } from '../../redux/serviceProvidersSlice';
import { Loader } from '../../components/LoadingSpinner';
import ResourceLoader from '../../components/ResourceLoader';
import ProviderPage from '../ProviderPage';
import UserSearchbarContainer from './UserSearchbarContainer';

const UserProvider = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [provider, setProvider] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  const reload = useCallback(() => {
    setBusy(true);
    const id = Number.parseInt(params.provider_id, 10);
    dispatch(getProviderAsync(id, (err, provider) => {
      if (err) {
        setError(true);
      } else {
        setProvider(provider);
      }
      setBusy(false);
    }));
  }, []);

  useEffect(() => reload(), []);

  /* eslint-disable no-nested-ternary */
  return (
    <div className="w-full flex-1 overflow-hidden">
      {busy ? (
        <Loader type="double_ring" />
      ) : error ? (
        <ResourceLoader resourceName="Provider" onReload={reload} />
      ) : provider ? (
        <UserSearchbarContainer>
          <div className="h-full overflow-auto">
            <ProviderPage provider={provider} />
          </div>
        </UserSearchbarContainer>
      ) : <></>}
    </div>
  );
  /* eslint-enable no-nested-ternary */
};

export default UserProvider;
