import { useState } from 'react';
import PropTypes from 'prop-types';
import Profile from '../../components/Settings/Profile';
import UserAddress from '../../components/Settings/UserAddress';
import HomeLocation from '../../components/Settings/HomeLocation';
import Notification from '../../components/Settings/Notification';
import { Heading1 } from '../Aside';
import { TabBody } from '../../components/TabControl';

const tabs = {
  profile: 'Profile',
  address: 'Address',
  home: 'Home Location',
  notification: 'Notification',
};

const headers = Object.values(tabs);

const TabHeader = ({ header, tab, setTab }) => {
  const isActive = tab === header;

  return (
    <button
      type="button"
      onClick={() => setTab(header)}
      className={`bg-transparent py-2 px-0 border-b-2 text-[#393939] dark:text-white ${isActive ? 'border-[#011c39] dark:border-white font-semibold' : 'border-[#DDE2E4] dark:border-[#5f6568]'}`}
    >
      {header}
    </button>
  );
};

TabHeader.propTypes = {
  header: PropTypes.string.isRequired,
  tab: PropTypes.string,
  setTab: PropTypes.func.isRequired,
};

TabHeader.defaultProps = {
  tab: '',
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState(headers[0]);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      <div className="px-8 pt-8 bg-white dark:bg-[#24303f]">
        <Heading1>Settings</Heading1>
        <ul className="pt-10 flex items-center gap-8 m-0 p-0 list-none">
          {headers.map((header) => (
            <li key={header}>
              <TabHeader header={header} tab={activeTab} setTab={setActiveTab} />
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#fafafa] dark:bg-[#1a222c] p-5 flex-1 overflow-hidden">
        <div className="h-full overflow-hidden bg-white dark:bg-[#24303f] rounded-lg p-7">
          <TabBody header={tabs.profile} tab={activeTab} className="h-full overflow-hidden">
            <Profile />
          </TabBody>
          <TabBody header={tabs.address} tab={activeTab} className="h-full overflow-hidden">
            <UserAddress />
          </TabBody>
          <TabBody header={tabs.home} tab={activeTab}>
            <HomeLocation />
          </TabBody>
          <TabBody header={tabs.notification} tab={activeTab}>
            <Notification />
          </TabBody>
        </div>
      </div>
    </div>
  );
};

export default Settings;
