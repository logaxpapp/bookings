import { useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import SearchPanel from '../Search/SearchPanel';

const UserSearch = () => {
  const [, showDashboardLink] = useOutletContext();
  const [params] = useSearchParams();
  const term = params.get('term');

  useEffect(() => {
    showDashboardLink(true);
  }, [showDashboardLink]);

  return <SearchPanel term={term} />;
};

export default UserSearch;
