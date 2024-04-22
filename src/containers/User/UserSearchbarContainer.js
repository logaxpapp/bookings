import { useOutletContext } from 'react-router';
import { childrenProps } from '../../utils/propTypes';
import Searchbar from './Searchbar';

const UserSearchbarContainer = ({ children }) => {
  const [user] = useOutletContext();

  return (
    <main className="bg-[#fafafa] dark:bg-[#1a222c] h-full flex-1 flex flex-col gap-4 overflow-hidden px-5 py-6">
      <Searchbar user={user} />
      <div className="bg-white dark:bg-[#24303f] rounded-lg flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </main>
  );
};

UserSearchbarContainer.propTypes = {
  children: childrenProps,
};

UserSearchbarContainer.defaultProps = {
  children: null,
};

export default UserSearchbarContainer;
