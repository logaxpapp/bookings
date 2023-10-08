import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext, useParams } from 'react-router';
import { getProviderAsync } from '../../redux/serviceProvidersSlice';
import { Loader } from '../../components/LoadingSpinner';
import ResourceLoader from '../../components/ResourceLoader';
import ProviderPage from '../ProviderPage';

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
};

const Provider = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [provider, setProvider] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();
  const [, showDashboardLink] = useOutletContext();

  const reload = useCallback(() => {
    showDashboardLink(true);
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
    <div style={styles.container}>
      {busy ? (
        <Loader type="double_ring" />
      ) : error ? (
        <ResourceLoader resourceName="Provider" onReload={reload} />
      ) : provider ? (
        <ProviderPage provider={provider} />
      ) : <></>}
    </div>
  );
  /* eslint-enable no-nested-ternary */
};

export default Provider;
