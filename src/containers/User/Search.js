import { useSearchParams } from 'react-router-dom';
import SearchPanel from '../Search/SearchPanel';
import UserSearchbarContainer from './UserSearchbarContainer';

const UserSearch = () => {
  const [params] = useSearchParams();
  const term = params.get('term');

  return (
    <UserSearchbarContainer>
      <SearchPanel term={term} />
    </UserSearchbarContainer>
  );
};

export default UserSearch;
