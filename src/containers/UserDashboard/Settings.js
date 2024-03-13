import { useState } from 'react';
import Profile from '../../components/Settings/Profile';
import City from '../../components/Settings/City';
import HomeLocation from '../../components/Settings/HomeLocation';
import Notification from '../../components/Settings/Notification';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  return (
    <>
      <div className="">
        Settings
      </div>

      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="me-2">
            <button type="button" onClick={() => setActiveTab('profile')} className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Profile</button>
          </li>
          <li className="me-2">
            <button type="button" onClick={() => setActiveTab('city')} className="inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" aria-current="page">city</button>
          </li>
          <li className="me-2">
            <button type="button" onClick={() => setActiveTab('home')} className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Home Location</button>
          </li>
          <li className="me-2">
            <button type="button" onClick={() => setActiveTab('notification')} className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Notificiton</button>
          </li>
        </ul>
      </div>
      <section>
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'city' && <City />}
        {activeTab === 'home' && <HomeLocation />}
        {activeTab === 'notification' && <Notification />}
      </section>
    </>
  );
};

export default Settings;
