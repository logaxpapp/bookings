import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router';
import { useBusyDialog } from '../../components/LoadingSpinner';
import { getProviderAsync } from '../../redux/serviceProvidersSlice';
import ResourceLoader from '../../components/ResourceLoader';
import ProviderPage from '../ProviderPage';

const ProfilePage = () => {
  const [provider, setProvider] = useState();
  const [company] = useOutletContext();
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  const reload = useCallback(() => {
    const popup = busyDialog.show('Loading Profile ...');
    dispatch(getProviderAsync(company.id, (err, provider) => {
      if (!err) {
        setProvider(provider);
      }

      popup.close();
    }));
  }, [company, setProvider]);

  useEffect(() => {
    reload();
  }, []);

  if (!provider) {
    return <ResourceLoader resourceName="Profile Page" onReload={reload} />;
  }

  return <ProviderPage provider={provider} />;
};

export default ProfilePage;
