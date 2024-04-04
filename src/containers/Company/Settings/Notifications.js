/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import { Heading1, Heading2 } from '../../Aside';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import { TimeAmount } from '../../CustomInputs';
import { usePrefereceFields } from '../../../utils/hooks';

const NOTIFICATION_MODE = 'notification_mode';
const NOTIFY_STAFF_ON_NEW_APPOINTMENT = 'notify_staff_on_new_appointment';
const NOTIFY_STAFF_ON_EDIT_APPOINTMENT = 'notify_staff_on_edit_appointment';
const NOTIFY_STAFF_ON_CANCEL_APPOINTMENT = 'notify_staff_on_cancel_appointment';
const STAFF_NOTIFICATION_LEAD_TIME = 'staff_notification_lead_time';
const NOTIFY_CLIENT_ON_NEW_APPOINTMENT = 'notify_client_on_new_appointment';
const NOTIFY_CLIENT_ON_EDIT_APPOINTMENT = 'notify_client_on_edit_appointment';
const NOTIFY_CLIENT_ON_CANCEL_APPOINTMENT = 'notify_client_on_cancel_appointment';
const CLIENT_NOTIFICATION_LEAD_TIME = 'client_notification_lead_time';
const NOTIFICATION_SENDER_NAME = 'notification_sender_name';
const NOTIFICATION_SIGNATURE = 'notification_signature';

const notificationModes = {
  ALL: 'all',
  FOCUS: 'focus',
  NONE: 'none',
};

const tabs = {
  home: 'My Notifications',
  staff: 'Staff',
  customers: 'Customers',
  personalization: 'Personalize Messages',
};

const headers = Object.values(tabs);

const Personalization = () => {
  const {
    busy,
    fields,
    hasChanges,
    setFields,
    update,
  } = usePrefereceFields([NOTIFICATION_SENDER_NAME, NOTIFICATION_SIGNATURE]);

  const handleChange = ({ target: { name, value } }) => setFields(
    (fields) => ({ ...fields, [name]: value }),
  );

  return (
    <section className="w-full max-w-[600px] flex flex-col gap-6">
      <label className="bold-select-wrap">
        <span className="label">Sender Name</span>
        <input
          type="text"
          name={NOTIFICATION_SENDER_NAME}
          className="text-input bg-[#f8fafc] text-[#011c39] font-medium -tracking-[2%]"
          value={fields[NOTIFICATION_SENDER_NAME]}
          onChange={handleChange}
          style={{ fontSize: 14 }}
        />
      </label>
      <label className="bold-select-wrap">
        <span className="label">Email Signature</span>
        <textarea
          name={NOTIFICATION_SIGNATURE}
          value={fields[NOTIFICATION_SIGNATURE]}
          onChange={handleChange}
          className="w-full resize-none h-32 rounded-lg p-4 bg-[#f8fafc] text-[#011c39] font-medium text-sm"
          style={{ border: '1px solid #cbd5e1' }}
        />
      </label>
      {hasChanges ? (
        <div className="flex justify-end pt-6">
          <button
            type="button"
            className={`btn ${busy ? 'busy' : ''}`}
            onClick={() => update()}
          >
            Update
          </button>
        </div>
      ) : null}
    </section>
  );
};

const Customers = () => {
  const {
    busy,
    fields,
    hasChanges,
    setFields,
    update,
  } = usePrefereceFields([
    NOTIFY_CLIENT_ON_CANCEL_APPOINTMENT,
    NOTIFY_CLIENT_ON_EDIT_APPOINTMENT,
    NOTIFY_CLIENT_ON_NEW_APPOINTMENT,
    CLIENT_NOTIFICATION_LEAD_TIME,
  ]);

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
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[NOTIFY_CLIENT_ON_NEW_APPOINTMENT] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields[NOTIFY_CLIENT_ON_NEW_APPOINTMENT] ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name={NOTIFY_CLIENT_ON_NEW_APPOINTMENT}
              checked={fields[NOTIFY_CLIENT_ON_NEW_APPOINTMENT]}
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
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[NOTIFY_CLIENT_ON_EDIT_APPOINTMENT] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields[NOTIFY_CLIENT_ON_EDIT_APPOINTMENT] ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name={NOTIFY_CLIENT_ON_EDIT_APPOINTMENT}
              checked={fields[NOTIFY_CLIENT_ON_EDIT_APPOINTMENT]}
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
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[NOTIFY_CLIENT_ON_CANCEL_APPOINTMENT] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields[NOTIFY_CLIENT_ON_CANCEL_APPOINTMENT] ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name={NOTIFY_CLIENT_ON_CANCEL_APPOINTMENT}
              checked={fields[NOTIFY_CLIENT_ON_CANCEL_APPOINTMENT]}
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
                className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[CLIENT_NOTIFICATION_LEAD_TIME] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
              >
                {fields[CLIENT_NOTIFICATION_LEAD_TIME] ? (
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
                checked={fields[CLIENT_NOTIFICATION_LEAD_TIME]}
                className="clip"
                onChange={({ target: { checked } }) => {
                  if (checked) {
                    setFields((fields) => ({ ...fields, [CLIENT_NOTIFICATION_LEAD_TIME]: '1h' }));
                  } else {
                    setFields((fields) => ({ ...fields, [CLIENT_NOTIFICATION_LEAD_TIME]: '' }));
                  }
                }}
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
            <TimeAmount initialValue={fields[CLIENT_NOTIFICATION_LEAD_TIME || '']} />
          </div>
        </div>
      </section>
      {hasChanges ? (
        <div className="flex justify-end pt-8">
          <button
            type="button"
            className={`btn ${busy ? 'busy' : ''}`}
            onClick={() => update()}
          >
            Update
          </button>
        </div>
      ) : null}
    </div>
  );
};

const Staff = () => {
  const {
    busy,
    fields,
    hasChanges,
    setFields,
    update,
  } = usePrefereceFields([
    NOTIFY_STAFF_ON_CANCEL_APPOINTMENT,
    NOTIFY_STAFF_ON_EDIT_APPOINTMENT,
    NOTIFY_STAFF_ON_NEW_APPOINTMENT,
    STAFF_NOTIFICATION_LEAD_TIME,
  ]);

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
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[NOTIFY_STAFF_ON_NEW_APPOINTMENT] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields[NOTIFY_STAFF_ON_NEW_APPOINTMENT] ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name={NOTIFY_STAFF_ON_NEW_APPOINTMENT}
              checked={fields[NOTIFY_STAFF_ON_NEW_APPOINTMENT]}
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
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[NOTIFY_STAFF_ON_EDIT_APPOINTMENT] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields[NOTIFY_STAFF_ON_EDIT_APPOINTMENT] ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name={NOTIFY_STAFF_ON_EDIT_APPOINTMENT}
              checked={fields[NOTIFY_STAFF_ON_EDIT_APPOINTMENT]}
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
              className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[NOTIFY_STAFF_ON_CANCEL_APPOINTMENT] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
            >
              {fields[NOTIFY_STAFF_ON_CANCEL_APPOINTMENT] ? (
                <span
                  className="block w-3 h-3 text-white font-bold text-[12px] translate-x-[2px]"
                >
                  &#10003;
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              name={NOTIFY_STAFF_ON_CANCEL_APPOINTMENT}
              checked={fields[NOTIFY_STAFF_ON_CANCEL_APPOINTMENT]}
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
                className={`w-5 h-5 rounded-md flex justify-center items-center ${fields[STAFF_NOTIFICATION_LEAD_TIME] ? 'bg-[#89e101]' : 'border border-[#5c5c5c]'}`}
              >
                {fields[STAFF_NOTIFICATION_LEAD_TIME] ? (
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
                checked={fields[STAFF_NOTIFICATION_LEAD_TIME]}
                className="clip"
                onChange={({ target: { checked } }) => {
                  if (checked) {
                    setFields((fields) => ({ ...fields, [STAFF_NOTIFICATION_LEAD_TIME]: '1h' }));
                  } else {
                    setFields((fields) => ({ ...fields, [STAFF_NOTIFICATION_LEAD_TIME]: '' }));
                  }
                }}
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
            <TimeAmount initialValue={fields[STAFF_NOTIFICATION_LEAD_TIME || '']} />
          </div>
        </div>
      </section>
      {hasChanges ? (
        <div className="flex justify-end pt-8">
          <button
            type="button"
            className={`btn ${busy ? 'busy' : ''}`}
            onClick={() => update()}
          >
            Update
          </button>
        </div>
      ) : null}
    </div>
  );
};

const Home = () => {
  const {
    busy,
    fields,
    hasChanges,
    setFields,
    update,
  } = usePrefereceFields([NOTIFICATION_MODE]);

  const handleChange = ({ target: { checked, name } }) => {
    if (checked) {
      setFields((fields) => ({ ...fields, [NOTIFICATION_MODE]: name }));
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
            {fields[NOTIFICATION_MODE] === notificationModes.ALL ? (
              <span
                className="block w-3 h-3 rounded-full bg-[#89e101]"
              />
            ) : null}
          </span>
          <input
            type="radio"
            name={notificationModes.ALL}
            checked={fields[NOTIFICATION_MODE] === notificationModes.ALL}
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
            {fields[NOTIFICATION_MODE] === notificationModes.FOCUS ? (
              <span
                className="block w-3 h-3 rounded-full bg-[#89e101]"
              />
            ) : null}
          </span>
          <input
            type="radio"
            name={notificationModes.FOCUS}
            checked={fields[NOTIFICATION_MODE] === notificationModes.FOCUS}
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
            {fields[NOTIFICATION_MODE] === notificationModes.NONE ? (
              <span
                className="block w-3 h-3 rounded-full bg-[#89e101]"
              />
            ) : null}
          </span>
          <input
            type="radio"
            name={notificationModes.NONE}
            checked={fields[NOTIFICATION_MODE] === notificationModes.NONE}
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
      {hasChanges ? (
        <div className="flex justify-end pt-8">
          <button
            type="button"
            className={`btn ${busy ? 'busy' : ''}`}
            onClick={() => update()}
          >
            Update
          </button>
        </div>
      ) : null}
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
