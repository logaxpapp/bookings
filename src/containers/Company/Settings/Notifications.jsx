/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { PencilSquareIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Heading1, Heading2 } from '../../Aside';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import { TimeAmount } from '../../CustomInputs';
import { usePrefereceFields } from '../../../utils/hooks';
import {
  createTimeBeforeNotificationsAsync,
  deleteTimeBeforeNotificationsAsync,
  selectPermissions,
  selectTimesBeforeNotifications,
  updateTimeBeforeNotificationsAsync,
} from '../../../redux/companySlice';
import EmptyListPanel from '../../../components/EmptyListPanel';
import { notificationTimeProps } from '../../../utils/propTypes';
import ClassNames from '../../../utils/classNames';
import Modal, { useBusyModal } from '../../../components/Modal';
import { selectBusy } from '../../../redux/controls';
import { notification } from '../../../utils';
import { Input } from '../../../components/TextBox';
import { Button } from '../../../components/Buttons';
import DeleteModal from '../../../components/modals/DeleteModal';

const DELETE = 'delete';
const EDIT = 'edit';
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
  home: 'General',
  bookings: 'Bookings',
  reminders: 'Reminders',
  personalization: 'Personalize Messages',
};

const headers = Object.values(tabs);

const reminderTabs = {
  email: 'Email',
  sms: 'SMS',
};

const reminderHeaders = Object.values(reminderTabs);

const unitsObject = {
  minute: 'Minutes',
  hour: 'Hours',
  day: 'Days',
  week: 'Weeks',
  month: 'Months',
};
const units = Object.keys(unitsObject);

const methodsObject = { email: 'Email', sms: 'SMS' };
const methods = Object.keys(methodsObject);

const NotificationTimeEditor = ({ time = null, method = 'email', onClose }) => {
  const [fields, setFields] = useState({
    quantity: '',
    unit: units[1],
    method,
  });
  const [errors, setErrors] = useState({
    quantity: '',
    unit: '',
    method: '',
  });
  const busy = useSelector(selectBusy);
  const busyModal = useBusyModal();
  const dispatch = useDispatch();
  const isEdit = !!time;

  useEffect(() => {
    if (time) {
      setFields({
        quantity: time.quantity,
        unit: time.unit,
        method: time.method,
      });
    }
  }, [time]);

  const handleChange = ({ target: { name, value } }) => {
    let val = value;

    if (name === 'quantity') {
      if (val) {
        val = Number.parseInt(val, 10);

        if (Number.isNaN(val)) {
          return;
        }
      }
    }

    setFields((fields) => ({ ...fields, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!fields.quantity) {
      errors.quantity = 'Quantity is required!';
    }

    if (!fields.unit) {
      errors.unit = 'Units is required!';
    }

    if (!fields.method) {
      errors.method = 'Method is required!';
    }

    setErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    if (isEdit) {
      const data = {};

      if (fields.method !== time.method) {
        data.method = fields.method;
      }

      if (fields.quantity !== time.quantity) {
        data.quantity = fields.quantity;
      }

      if (fields.unit !== time.unit) {
        data.unit = fields.unit;
      }

      if (!Object.keys(data).length) {
        notification.showInfo('You have NOT made any changes to time!');
        return;
      }

      busyModal.showLoader('Updating Notification Time!');
      dispatch(updateTimeBeforeNotificationsAsync(time.id, data, (err) => {
        busyModal.hideLoader();
        if (!err) {
          onClose();
        }
      }));

      return;
    }

    busyModal.showLoader('Creating Notification Time ...');
    dispatch(createTimeBeforeNotificationsAsync(fields, (err) => {
      busyModal.hideLoader();
      if (!err) {
        onClose();
      }
    }));
  };

  return (
    <section className="p-8 max-h-[90vh] overflow-auto flex flex-col gap-8">
      <Heading1 className="pb-6">
        {isEdit ? 'Edit Notification Time' : 'New Notification Time'}
      </Heading1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <Input
            type="text"
            name="quantity"
            value={fields.quantity}
            error={errors.quantity}
            label="Value"
            onChange={handleChange}
          />
          <div className="bold-select-wrap">
            <span className="label">Unit</span>
            <div className="bold-select caret">
              <select name="unit" value={fields.unit} onChange={handleChange}>
                <option value="" disabled>-- Select Unit --</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unitsObject[unit]}</option>
                ))}
              </select>
              {errors.unit ? (
                <span className="input-error">{errors.unit}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bold-select-wrap">
            <span className="label">Method</span>
            <div className="bold-select caret">
              <select name="method" value={fields.method} onChange={handleChange}>
                <option value="" disabled>-- Select Method --</option>
                {methods.map((method) => (
                  <option key={method} value={method}>{methodsObject[method]}</option>
                ))}
              </select>
              {errors.method ? (
                <span className="input-error">{errors.method}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <Button type="submit" className="!px-10" busy={busy}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </section>
  );
};

NotificationTimeEditor.propTypes = {
  time: notificationTimeProps,
  method: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

NotificationTimeEditor.defaultProps = {
  time: null,
  method: 'email',
};

const NewNotificationTimeModal = ({ isOpen, method, onClose }) => {
  const busy = useSelector(selectBusy);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={busy ? null : onClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <NotificationTimeEditor method={method} onClose={onClose} />
    </Modal>
  );
};

NewNotificationTimeModal.propTypes = {
  isOpen: PropTypes.bool,
  method: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

NewNotificationTimeModal.defaultProps = {
  isOpen: false,
  method: 'email',
};

const UpdateNotificationTimeModal = ({ time, onClose }) => {
  const busy = useSelector(selectBusy);
  const isOpen = !!time;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={busy ? null : onClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <NotificationTimeEditor time={time} onClose={onClose} />
    </Modal>
  );
};

UpdateNotificationTimeModal.propTypes = {
  time: notificationTimeProps,
  onClose: PropTypes.func.isRequired,
};

UpdateNotificationTimeModal.defaultProps = {
  time: null,
};

const DeleteNotificationTimeModal = ({ time, onClose }) => {
  const busy = useSelector(selectBusy);
  const busyModal = useBusyModal();
  const dispatch = useDispatch();

  const isOpen = !!time;

  const handleDelete = () => {
    busyModal.showLoader('Deleting feaure ...');
    dispatch(deleteTimeBeforeNotificationsAsync(time.id, (err) => {
      busyModal.hideLoader();
      if (!err) {
        onClose();
      }
    }));
  };

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={busy ? null : onClose}
      onConfirm={handleDelete}
      text1={`Default Notification Time "${time?.quantity} ${time?.unit}" will be permanently deleted.`}
    />
  );
};

DeleteNotificationTimeModal.propTypes = {
  time: notificationTimeProps,
  onClose: PropTypes.func.isRequired,
};

DeleteNotificationTimeModal.defaultProps = {
  time: null,
};

const NotificationTimeRow = ({ time, onDelete, onEdit }) => {
  const handleClick = ({ target: { name } }) => {
    if (name === DELETE) {
      onDelete(time);
    } else if (name === EDIT) {
      onEdit(time);
    }
  };

  return (
    <tr>
      <td className={`${ClassNames.td} capitalize`}>{time.quantity}</td>
      <td className={`${ClassNames.td} capitalize`}>{time.unit}</td>
      <td className={`${ClassNames.td} uppercase`}>{time.method}</td>
      <td className={ClassNames.td}>
        <button
          type="button"
          name={EDIT}
          onClick={handleClick}
          className="inline-flex items-center px-2 py-2 border border-slate-200 shadow-sm font-medium rounded-full focus:outline-none"
        >
          <PencilSquareIcon className="h-3 w-4 mr-1 hover:text-white pointer-events-none" />
          <span className="pointer-events-none">Edit</span>
        </button>
      </td>
      <td className={ClassNames.td}>
        <button
          type="button"
          name={DELETE}
          onClick={handleClick}
          className="bg-red-300 text-xs hover:bg-red-600 hover:text-white focus:ring-red-500 inline-flex items-center px-2 py-2 border border-transparent shadow-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <TrashIcon className="h-3 w-4 mr-1 hover:text-white pointer-events-none" />
          Delete
        </button>
      </td>
    </tr>
  );
};

NotificationTimeRow.propTypes = {
  time: notificationTimeProps.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

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

const Bookings = () => {
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

const Reminders = () => {
  const [tab, setTab] = useState(reminderTabs.email);
  const timesBeforeNotifications = useSelector(selectTimesBeforeNotifications);
  const permissions = useSelector(selectPermissions);
  const { notificationTimes, maxNotificationTimes } = useMemo(() => {
    const term = tab.toLowerCase();
    const notificationTimes = timesBeforeNotifications.filter((time) => time.method === term);
    const maxNotificationTimes = tab === reminderTabs.email
      ? permissions.maxEmailNotifications : permissions.maxSmsNotifications;

    return {
      notificationTimes,
      maxNotificationTimes,
    };
  }, [tab, timesBeforeNotifications, permissions]);

  const [isNewModalOpen, setNewModalOpen] = useState(false);
  const [toDeleteTime, setToDeleteTime] = useState(null);
  const [toUpdateModa, setToUpdateModal] = useState(null);

  return (
    <div className="flex flex-col gap-3 w-full max-w-[600px]">
      <TabHeaders headers={reminderHeaders} tab={tab} setTab={setTab} />
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Heading2>
              {`${tab} Reminders`}
            </Heading2>
            {maxNotificationTimes && notificationTimes.length < maxNotificationTimes ? (
              <button
                type="button"
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-1.5"
                onClick={() => setNewModalOpen(true)}
              >
                <PlusCircleIcon className="w-4.5 h-4.5 pointer-events-none" />
                <span className="pointer-events-none">New Time</span>
              </button>
            ) : null}
          </div>
          <p className="m-0 font-normal text-sm text=[#5c5c5c]">
            Keep clients in the loop with automatic reminders for upcoming bookings
          </p>
        </header>
        <div className="flex-1 w-full overflow-x-auto">
          {notificationTimes.length ? (
            <table className={ClassNames.table}>
              <thead>
                <tr>
                  <th className={ClassNames.th}>Time</th>
                  <th className={ClassNames.th}>Unit</th>
                  <th className={ClassNames.th}>Method</th>
                  <th className={`${ClassNames.th} w-28`}>Edit</th>
                  <th className={`${ClassNames.th} w-28`}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {notificationTimes.map((time) => (
                  <NotificationTimeRow
                    key={time.id}
                    time={time}
                    onDelete={setToDeleteTime}
                    onEdit={setToUpdateModal}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyListPanel text="No notification time found!" />
          )}
        </div>
      </section>
      <NewNotificationTimeModal
        isOpen={isNewModalOpen}
        method={tab.toLowerCase()}
        onClose={() => setNewModalOpen(false)}
      />
      <UpdateNotificationTimeModal time={toUpdateModa} onClose={() => setToUpdateModal(null)} />
      <DeleteNotificationTimeModal time={toDeleteTime} onClose={() => setToDeleteTime(null)} />
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
      <TabBody tab={tab} header={tabs.bookings}>
        <Bookings />
      </TabBody>
      <TabBody tab={tab} header={tabs.reminders}>
        <Reminders />
      </TabBody>
      <TabBody tab={tab} header={tabs.personalization}>
        <Personalization />
      </TabBody>
    </section>
  );
};

export default Notifications;
