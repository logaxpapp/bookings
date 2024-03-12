import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router';
import PropTypes from 'prop-types';
import { BrandDetails, BrandHeader } from '../Brand';
import { childrenProps, companyProps } from '../../../../utils/propTypes';
import Integrations from './Integrations';
import { ServiceComponent } from '../../Services';
import { NewButton } from '../../../../components/Buttons';
import { setServiceEditorOpen } from '../../../../redux/controls';
import { Breaks, WorkingHours } from './WorkingHours';
import TimeOffs from './TimeOffs';
import EmptyListPanel from '../../../../components/EmptyListPanel';

const tabs = {
  about: 'About',
  integrations: 'Integrations',
  services: 'Services',
  workingHours: 'Working Hours',
  breaks: 'Breaks',
  timeOff: 'Time Off',
  updates: 'Updates',
};

const headers = Object.values(tabs);

const TabHeader = ({ header, tab, setTab }) => {
  const isActive = tab === header;

  const handleClick = () => {
    if (!isActive) {
      setTab(header);
    }
  };

  return (
    <button
      aria-current={isActive}
      type="button"
      onClick={handleClick}
      className={`py-0 border-none outline-none bg-transparent cursor-pointer font-medium ${isActive ? 'underline font-bold text-[#011c39]' : 'text-[#8e98ab]'}`}
    >
      {header}
    </button>
  );
};

TabHeader.propTypes = {
  header: PropTypes.string.isRequired,
  tab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
};

const TabBody = ({ tab, header, children }) => {
  const isActive = tab === header;

  return (
    <div
      role="tab"
      aria-current={isActive}
      aria-hidden={!isActive}
      className={isActive ? 'block' : 'hidden'}
    >
      {children}
    </div>
  );
};

TabBody.propTypes = {
  tab: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  children: childrenProps,
};

TabBody.defaultProps = {
  children: null,
};

const ServicesTab = ({ company }) => {
  const dispatch = useDispatch();

  return (
    <div className="relative">
      <ServiceComponent company={company} />
      <div className="absolute top-0 right-2">
        <NewButton text="Service" onClick={() => dispatch(setServiceEditorOpen(true))} />
      </div>
    </div>
  );
};

ServicesTab.propTypes = {
  company: companyProps.isRequired,
};

const Profile = () => {
  const [company] = useOutletContext();
  const [tab, setTab] = useState(tabs.about);

  return (
    <div className="flex flex-col gap-8">
      <BrandHeader company={company} />
      <div role="tabpanel" className="flex flex-col gap-10">
        <div className="flex items-center gap-6">
          {headers.map((header) => (
            <TabHeader key={header} header={header} tab={tab} setTab={setTab} />
          ))}
        </div>
        <TabBody tab={tab} header={tabs.about}>
          <BrandDetails company={company} />
        </TabBody>
        <TabBody tab={tab} header={tabs.integrations}>
          <Integrations />
        </TabBody>
        <TabBody tab={tab} header={tabs.services}>
          <ServicesTab company={company} />
        </TabBody>
        <TabBody tab={tab} header={tabs.workingHours}>
          <WorkingHours company={company} />
        </TabBody>
        <TabBody tab={tab} header={tabs.breaks}>
          <Breaks company={company} />
        </TabBody>
        <TabBody tab={tab} header={tabs.timeOff}>
          <TimeOffs />
        </TabBody>
        <TabBody tab={tab} header={tabs.updates}>
          <div className="flex justify-center">
            <div className="w-60">
              <EmptyListPanel text="Coming Soon" />
            </div>
          </div>
        </TabBody>
      </div>
    </div>
  );
};

export default Profile;
