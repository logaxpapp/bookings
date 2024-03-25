/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import { Heading1, Heading2 } from '../../Aside';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import { TimeAmount } from '../../CustomInputs';

const tabs = {
  home: 'My Notifications',
  staff: 'Staff',
  customers: 'Customers',
  personalization: 'Personalize Messages',
};

const headers = Object.values(tabs);

const notificationModes = {
  all: 'All',
  focus: 'Focus Mode',
  none: 'None',
};

const Personalization = () => {
  const [fields, setFields] = useState({
    name: 'Ujah Emmanuel',
    signature: 'Thanks,\nUjah',
  });

  const handleChange = ({ target: { name, value } }) => setFields(
    (fields) => ({ ...fields, [name]: value }),
  );

  return (
    <section className="w-full max-w-[600px] flex flex-col gap-6">
      <label className="bold-select-wrap">
        <span className="label">Sender Name</span>
        <input
          type="text"
          name="name"
          className="text-input bg-[#f8fafc] text-[#011c39] font-medium -tracking-[2%]"
          value={fields.name}
          onChange={handleChange}
          style={{ fontSize: 14 }}
        />
      </label>
      <label className="bold-select-wrap">
        <span className="label">Email Signature</span>
        <textarea
          name="signature"
          value={fields.signature}
          onChange={handleChange}
          className="w-full resize-none h-32 rounded-lg p-4 bg-[#f8fafc] text-[#011c39] font-medium text-sm"
          style={{ border: '1px solid #cbd5e1' }}
        />
      </label>
    </section>
  );
};

const Customers = () => {
  const [fields, setFields] = useState({
    confirmations: true,
    updates: true,
    cancellations: true,
    email: true,
  });

  const handleChange = ({ target: { checked, name } }) => setFields(
    (fields) => ({ ...fields, [name]: checked }),
  );

  return (
    <div className="flex flex-col gap-10 w-full max-w-[600px]">
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <Heading2>Updates</Heading2>
          <p className="m-0 font-normal text-sm text=[#5c5c5c]">
            Automate notifications for new, edited and cancelled bookings
          </p>
        </header>
        <div className="flex flex-col gap-4">
          <label className="relative flex items-center gap-3 cursor-pointer">
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.confirmations ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields.confirmations ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name="confirmations"
              checked={fields.confirmations}
              className="clip"
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-[#8e98ab]">
                Confirmation
              </span>
              <span className="font-normal text-xs text-[#5c5cc]">
                Automate notifications for new appointments
              </span>
            </div>
          </label>
          <label className="relative flex items-center gap-3 cursor-pointer">
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.updates ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields.updates ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name="updates"
              checked={fields.updates}
              className="clip"
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-[#8e98ab]">
                Changes
              </span>
              <span className="font-normal text-xs text-[#5c5cc]">
                Automate notifications for edited or rescheduled bookings
              </span>
            </div>
          </label>
          <label className="relative flex items-center gap-3 cursor-pointer">
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.cancellations ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields.cancellations ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name="cancellations"
              checked={fields.cancellations}
              className="clip"
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-[#8e98ab]">
                Cancellation
              </span>
              <span className="font-normal text-xs text-[#5c5cc]">
                Automate notifications for cancelled bookings
              </span>
            </div>
          </label>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <Heading2>Reminders</Heading2>
          <p className="m-0 font-normal text-sm text=[#5c5c5c]">
            Keep customers in the loop with automatic reminders for upcoming bookings
          </p>
        </header>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6 justify-between">
            <label className="relative flex-1 flex items-center gap-3 cursor-pointer">
              <span
                aria-hidden="true"
                className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.email ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
              >
                {fields.email ? (
                  <span
                    className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                  >
                    &#10003;
                  </span>
                ) : null}
              </span>
              <input
                type="checkbox"
                name="email"
                checked={fields.email}
                className="clip"
                onChange={handleChange}
              />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base text-[#8e98ab]">
                  Email
                </span>
                <span className="font-normal text-xs text-[#5c5cc]">
                  prior to appointment
                </span>
              </div>
            </label>
            <TimeAmount initialValue="1h" />
          </div>
        </div>
      </section>
    </div>
  );
};

const Staff = () => {
  const [fields, setFields] = useState({
    confirmations: true,
    updates: true,
    cancellations: true,
    email: true,
  });

  const handleChange = ({ target: { checked, name } }) => setFields(
    (fields) => ({ ...fields, [name]: checked }),
  );

  return (
    <div className="flex flex-col gap-10 w-full max-w-[600px]">
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <Heading2>Updates</Heading2>
          <p className="m-0 font-normal text-sm text=[#5c5c5c]">
            Automate notifications for new, edited and cancelled bookings
          </p>
        </header>
        <div className="flex flex-col gap-4">
          <label className="relative flex items-center gap-3 cursor-pointer">
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.confirmations ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields.confirmations ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name="confirmations"
              checked={fields.confirmations}
              className="clip"
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-[#8e98ab]">
                Confirmation
              </span>
              <span className="font-normal text-xs text-[#5c5cc]">
                Automate notifications for new appointments
              </span>
            </div>
          </label>
          <label className="relative flex items-center gap-3 cursor-pointer">
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.updates ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields.updates ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name="updates"
              checked={fields.updates}
              className="clip"
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-[#8e98ab]">
                Changes
              </span>
              <span className="font-normal text-xs text-[#5c5cc]">
                Automate notifications for edited or rescheduled bookings
              </span>
            </div>
          </label>
          <label className="relative flex items-center gap-3 cursor-pointer">
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.cancellations ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields.cancellations ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name="cancellations"
              checked={fields.cancellations}
              className="clip"
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base text-[#8e98ab]">
                Cancellation
              </span>
              <span className="font-normal text-xs text-[#5c5cc]">
                Automate notifications for cancelled bookings
              </span>
            </div>
          </label>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <Heading2>Reminders</Heading2>
          <p className="m-0 font-normal text-sm text=[#5c5c5c]">
            Keep staff in the loop with automatic reminders for upcoming bookings
          </p>
        </header>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6 justify-between">
            <label className="relative flex-1 flex items-center gap-3 cursor-pointer">
              <span
                aria-hidden="true"
                className={`w-5 h-5 rounded-md flex justify-center items-center ${fields.email ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
              >
                {fields.email ? (
                  <span
                    className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                  >
                    &#10003;
                  </span>
                ) : null}
              </span>
              <input
                type="checkbox"
                name="email"
                checked={fields.email}
                className="clip"
                onChange={handleChange}
              />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base text-[#8e98ab]">
                  Email
                </span>
                <span className="font-normal text-xs text-[#5c5cc]">
                  prior to appointment
                </span>
              </div>
            </label>
            <TimeAmount initialValue="1h" />
          </div>
        </div>
      </section>
    </div>
  );
};

const Home = () => {
  const [mode, setMode] = useState(notificationModes.all);

  const handleChange = ({ target: { checked, name } }) => {
    if (checked) {
      setMode(notificationModes[name]);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <Heading2>My Notification</Heading2>
        <p className="m-0 font-normal text-sm text=[#5c5c5c]">
          Choose the type of notifications you receive
        </p>
      </header>
      <div className="flex flex-col gap-4">
        <label className="relative flex items-center gap-3 cursor-pointer">
          <span
            aria-hidden="true"
            className="w-5 h-5 rounded-full border border-[#5c5c5c] flex justify-center items-center"
          >
            {mode === notificationModes.all ? (
              <span
                className="block w-3 h-3 rounded-full bg-[#89e101]"
              />
            ) : null}
          </span>
          <input
            type="radio"
            name="all"
            checked={mode === notificationModes.all}
            className="clip"
            onChange={handleChange}
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base text-[#8e98ab]">
              {notificationModes.all}
            </span>
            <span className="font-normal text-xs text-[#5c5cc]">
              All connects, chats & mentions plus appointments updates
            </span>
          </div>
        </label>
        <label className="relative flex items-center gap-3 cursor-pointer">
          <span
            aria-hidden="true"
            className="w-5 h-5 rounded-full border border-[#5c5c5c] flex justify-center items-center"
          >
            {mode === notificationModes.focus ? (
              <span
                className="block w-3 h-3 rounded-full bg-[#89e101]"
              />
            ) : null}
          </span>
          <input
            type="radio"
            name="focus"
            checked={mode === notificationModes.focus}
            className="clip"
            onChange={handleChange}
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base text-[#8e98ab]">
              {notificationModes.focus}
            </span>
            <span className="font-normal text-xs text-[#5c5cc]">
              Only direct connects, chats & mentions plus appointments updates
            </span>
          </div>
        </label>
        <label className="relative flex items-center gap-3 cursor-pointer">
          <span
            aria-hidden="true"
            className="w-5 h-5 rounded-full border border-[#5c5c5c] flex justify-center items-center"
          >
            {mode === notificationModes.none ? (
              <span
                className="block w-3 h-3 rounded-full bg-[#89e101]"
              />
            ) : null}
          </span>
          <input
            type="radio"
            name="none"
            checked={mode === notificationModes.none}
            className="clip"
            onChange={handleChange}
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base text-[#8e98ab]">
              {notificationModes.none}
            </span>
            <span className="font-normal text-xs text-[#5c5cc]">
              Turn off all notifications
            </span>
          </div>
        </label>
      </div>
    </section>
  );
};

const Notifications = () => {
  const [tab, setTab] = useState(tabs.home);

  return (
    <section className="flex flex-col gap-6 h-full overflow-y-auto overflow-x-hidden">
      <Heading1>Notifications</Heading1>
      <TabHeaders headers={headers} tab={tab} setTab={setTab} />
      <TabBody tab={tab} header={tabs.home}>
        <Home />
      </TabBody>
      <TabBody tab={tab} header={tabs.staff}>
        <Staff />
      </TabBody>
      <TabBody tab={tab} header={tabs.customers}>
        <Customers />
      </TabBody>
      <TabBody tab={tab} header={tabs.personalization}>
        <Personalization />
      </TabBody>
    </section>
  );
};

export default Notifications;
