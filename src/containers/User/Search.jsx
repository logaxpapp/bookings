import { useSearchParams } from 'react-router-dom';
import SearchPanel from '../Search/SearchPanel';
import UserSearchbarContainer from './UserSearchbarContainer';

const UserSearch = () => {
  const [params] = useSearchParams();
  const term = params.get('term');

  return (
    <UserSearchbarContainer>
      <div className="h-full flex-1 overflow-auto">
        <SearchPanel term={term} />
      </div>
    </UserSearchbarContainer>
  );
};

export default UserSearch;
