import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import {
  deleteAppointmentUpdateRequestAsync,
  loadAppointmentsAsync,
  openAppointmentMessages,
  requestAppointmentUpdateAsync,
  respondToAppointmentUpdateRequestAsync,
  selectAppointments,
  selectEmployees,
  updateAppointmentAsync,
} from '../../../redux/companySlice';
import {
  capitalize,
  currencyHelper,
  dateToNormalizedString,
  notification,
  rootSelector,
} from '../../../utils';
import { ContextMenu } from '../../../components/Inputs/MenuSelect';
import { appointmentProps } from '../../../utils/propTypes';
import { Button } from '../../../components/Buttons';
import { RadioButton } from '../../../components/Inputs';
import { LoadingBar } from '../../../components/LoadingSpinner';
import { DatePicker2 } from '../../../components/DatePicker';
import Modal, { useBusyModal } from '../../../components/Modal';
import { Heading1 } from '../../Aside';
import {
  appointmentStatuses,
  appointmentStatusesValues,
  statusColors,
} from '../../../utils/constants';
import ClassNames from '../../../utils/classNames';

const APPOINTMENT_STATUS = 'appointment_status';
const EMPLOYEE = 'employee';
const REQUEST_COMMENT = 'request_comment';
const SUBMIT_REQUEST_FORM = 'submit request form';
const UPDATE_STATUS = 'update_status';
const UPDATE_STATUS_ACTION = 'Update Status';
const UPDATE_STATUS_WITH_EMPLOYEE = 'update_status_with_employee';

const appointmentActions = {
  messages: 'View Messages',
  updateRequests: 'Update Requests',
};

const requestActions = {
  ACCEPT: 'Accept',
  DELETE: 'Delete',
  COMMENT: 'View Comment',
  REJECT: 'Reject',
  UPDATE: 'Update',
};

const requestsActions = {
  REQUEST: 'Request Update',
  CLOSE: 'Close',
};

const requestsOptions = Object.values(requestsActions);

const appointmentOptions = Object.values(appointmentActions);

const requiresAttention = ({ originator, status }) => (
  originator === 'client' && status === 'pending'
);

const UpdateStatusModal = ({ appointment, state, setState }) => {
  const employees = useSelector(selectEmployees);
  const [status, setStatus] = useState(appointment.status);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeMode, setEmployeeMode] = useState(false);
  const dispatch = useDispatch();

  const update = (data) => {
    setState({ open: true, busy: true });
    dispatch(updateAppointmentAsync(data, appointment, (err) => {
      let open = false;
      if (err) {
        open = true;
      }
      setState({ open, busy: false });
    }));
  };

  const handleValueChange = ({ target }) => {
    const { name, value } = target;
    if (name === APPOINTMENT_STATUS) {
      if (target.checked) {
        setStatus(value);
      }
    } else if (name === EMPLOYEE) {
      setSelectedEmployee(employees.find(({ id }) => id === Number.parseInt(value, 10)));
    }
  };

  const handleClick = ({ target: { name } }) => {
    if (name === UPDATE_STATUS) {
      if (status === appointment.status) {
        notification.showInfo('Appointment status did NOT change!');
        return;
      }

      if (status === appointmentStatuses.DONE) {
        if (employees.length > 1) {
          setEmployeeMode(true);
        } else {
          update({
            status,
            attending_employee_id: employees[0].id,
          });
        }
      } else {
        update({ status });
      }
    } else if (name === UPDATE_STATUS_WITH_EMPLOYEE) {
      if (status === appointment.status) {
        notification.showInfo('Appointment status did NOT change!');
        return;
      }

      if (!selectedEmployee) {
        notification.showError('Please select an employee!');
        return;
      }

      update({ status: appointmentStatuses.DONE, attending_employee_id: selectedEmployee.id });
    }
  };

  return (
    <Modal
      isOpen={state.open || state.busy}
      parentSelector={rootSelector}
      onRequestClose={() => {
        if (!state.busy) {
          setState({ open: false, busy: false });
        }
      }}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <section className="flex flex-col gap-6 py-6 px-8">
        <h1>
          {employeeMode ? 'Please select the employee that attended this customer' : 'Choose A New Status'}
        </h1>
        <div className="overflow-auto h-40">
          {employeeMode ? (
            <div className="bold-select-wrap">
              <span className="label">Attending Employee</span>
              <div className="bold-select caret">
                <select name={EMPLOYEE} value={selectedEmployee?.id || ''} onChange={handleValueChange}>
                  <option value="">--Select Employee--</option>
                  {employees.map(({ id, firstname, lastname }) => (
                    <option key={id} value={id}>
                      {`${firstname} ${lastname}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {appointmentStatusesValues.map((s) => (
                <RadioButton
                  key={s}
                  name={APPOINTMENT_STATUS}
                  value={s}
                  label={capitalize(s)}
                  onChange={handleValueChange}
                  checked={s === status}
                  radioSize={14}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-center pt-6">
          <Button
            name={employeeMode ? UPDATE_STATUS_WITH_EMPLOYEE : UPDATE_STATUS}
            busy={state.busy}
            onClick={handleClick}
            className="!px-12"
          >
            Update
          </Button>
        </div>
      </section>
    </Modal>
  );
};

UpdateStatusModal.propTypes = {
  appointment: appointmentProps.isRequired,
  state: PropTypes.shape({
    open: PropTypes.bool,
    busy: PropTypes.bool,
  }).isRequired,
  setState: PropTypes.func.isRequired,
};

const UpdateRequestRow = ({ request, appointment, index }) => {
  const {
    actions,
    date,
    originator,
  } = useMemo(() => {
    const { comment, originator, status } = request;
    const actions = [];

    if (comment) {
      actions.push(requestActions.COMMENT);
    }

    if (originator === 'client' && status === 'pending') {
      if (status === 'pending') {
        actions.push(requestActions.ACCEPT);
        actions.push(requestActions.REJECT);
      }
    } else if (originator === 'provider' && status === 'rejected') {
      actions.push(requestActions.DELETE);
    }

    return {
      actions,
      date: new Date(request.createdAt).toLocaleDateString(),
      originator: originator === 'provider' ? 'Initiated by You' : 'Initiated by Client',
    };
  }, [request]);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const busyDialog = useBusyModal();
  const dispatch = useDispatch();

  const handleActionClick = (action) => {
    if (action === requestActions.COMMENT) {
      setCommentModalOpen(true);
    } else if (action === requestActions.REJECT || action === requestActions.ACCEPT) {
      busyDialog.showLoader();
      const status = action === requestActions.REJECT ? 'rejected' : 'accepted';
      dispatch(respondToAppointmentUpdateRequestAsync(status, request, appointment, () => (
        busyDialog.hideLoader()
      )));
    } else if (action === requestActions.DELETE) {
      busyDialog.showLoader();
      dispatch(deleteAppointmentUpdateRequestAsync(request, appointment, () => (
        busyDialog.hideLoader()
      )));
    }
  };

  return (
    <tr>
      <td>
        {`${index + 1}. `}
      </td>
      <td>{date}</td>
      <td>{originator}</td>
      <td aria-label="actions">
        {actions.length ? (
          <ContextMenu
            options={actions}
            onClick={handleActionClick}
            right
          >
            <EllipsisVerticalIcon className="w-6 h-6 text-[#5c5c5c] dark:text-slate-100" />
          </ContextMenu>
        ) : null}
      </td>
      {request.comment ? (
        <Modal
          isOpen={isCommentModalOpen}
          parentSelector={rootSelector}
          onRequestClose={() => setCommentModalOpen(false)}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <div className="p-8 text-[#011c39] dark:text-slate-100">
            {request.comment}
          </div>
        </Modal>
      ) : null}
    </tr>
  );
};

UpdateRequestRow.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.number,
    comment: PropTypes.string,
    status: PropTypes.string,
    originator: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  appointment: appointmentProps.isRequired,
  index: PropTypes.number.isRequired,
};

export const UpdateRequestsPanel = ({ appointment, onClose }) => {
  const [requestComment, setRequestComment] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [newModalState, setNewModalState] = useState({ busy: false, open: false });
  const [date, setDate] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (appointment) {
      setDate(
        new Date(appointment.timeSlot.time).toUTCString(),
      );
    } else {
      setDate('');
    }
  }, [appointment]);

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === REQUEST_COMMENT) {
      setRequestComment(value);
    }
  };

  const handleClick = ({ target: { name } }) => {
    if (name === SUBMIT_REQUEST_FORM) {
      setSubmittingRequest(true);
      const data = {};
      if (requestComment) {
        data.comment = requestComment;
      }
      dispatch(requestAppointmentUpdateAsync(data, appointment, (err) => {
        let open = false;
        if (err) {
          open = true;
        }
        setNewModalState({ busy: false, open });
      }));
    }
  };

  const handleActions = (action) => {
    if (action === requestsActions.CLOSE) {
      onClose();
    } else if (action === requestsActions.REQUEST) {
      setNewModalState({ open: true, busy: false });
    }
  };

  return (
    <div className="absolute left-0 top-0 w-full h-full bg-white dark:bg-[#24303f] text-[#011c39] dark:text-white pt-4 pr-6 flex flex-col overflow-hidden p-5">
      <div
        className="flex justify-between p-3"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0 2px 8px' }}
      >
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="font-semibold w-18">Service</span>
            <span>
              {appointment.timeSlot.service.name}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-18">Client</span>
            <span>
              {`${appointment.customer.firstname} ${appointment.customer.lastname}`}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-18">Date</span>
            <span>
              {date}
            </span>
          </div>
        </div>
        <ContextMenu
          options={requestsOptions}
          onClick={handleActions}
          right
        >
          <EllipsisVerticalIcon className="w-6 h-6 text-[#5c5c5c] dark:text-slate-100" />
        </ContextMenu>
      </div>
      <div className="flex-1 overflow-auto pt-2 flex flex-col gap-1">
        {
          appointment.appointmentUpdateRequests.length ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-6" aria-label="serial number" />
                  <th className="text-left py-6">Date</th>
                  <th className="text-left py-6">Originator</th>
                  <th className="text-left py-6" aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {appointment.appointmentUpdateRequests.map((request, index) => (
                  <UpdateRequestRow
                    key={request.id}
                    request={request}
                    appointment={appointment}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <span className="text-[0.8rem] text-[#819997] block w-full p-6 text-center">
              No update requests found!
            </span>
          )
        }
      </div>
      <Modal
        isOpen={newModalState.open || newModalState.busy}
        parentSelector={rootSelector}
        onRequestClose={() => {
          if (!newModalState.busy) {
            setNewModalState({ busy: false, open: false });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div
          className="flex flex-col gap-1.5 px-8 py-6"
          style={{ boxShadow: 'rgba(50, 50, 105, 0.15) 0 2px 5px 0, rgba(0, 0, 0, 0.05) 0 1px 1px 0' }}
        >
          <span className="text-[#425467] dark:text-slate-100">
            Write a comment to explain to the client why you need this update (optional)
          </span>
          <textarea
            name={REQUEST_COMMENT}
            value={requestComment}
            onChange={handleValueChange}
            className="resize-none block w-full p-4 my-2 border border-[#b9d8ed] dark:border-slate-600 bg-white dark:bg-transparent rounded-lg"
            rows="8"
          />
          <span className="text-[#425467] dark:text-slate-100 pt-6">
            You will be able to choose a new time slot when this request is approved.
          </span>
          <div className="flex justify-center pt-6">
            <Button
              type="button"
              name={SUBMIT_REQUEST_FORM}
              className="!px-10"
              onClick={handleClick}
              disabled={submittingRequest}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

UpdateRequestsPanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * @param {Object} props
 * @param {import('../../../types').Appointment} props.appointment
 * @returns
 */
const AppointmentRow = ({
  appointment,
  onShowRequests,
}) => {
  const [modalState, setModalState] = useState({ open: false, busy: false });
  const {
    actions,
    details,
    requestCount,
  } = useMemo(() => {
    const { timeSlot: slot, customer } = appointment;
    const { service, time } = slot;
    const {
      company: { country },
      name: serviceName,
      price,
    } = service;
    const actions = [...appointmentOptions];

    actions.push(UPDATE_STATUS_ACTION);

    return {
      actions,
      details: {
        serviceName,
        customer: customer.firstname,
        customerFullname: `${customer.firstname} ${customer.lastname}}`,
        time: new Date(time).toLocaleString(),
        price: currencyHelper.toString(price, country.currencySymbol),
        deposit: currencyHelper.toString(appointment.deposit, country.currencySymbol),
        balance: currencyHelper.toString(price - appointment.deposit, country.currencySymbol),
      },
      requestCount: (appointment.appointmentUpdateRequests.filter((req) => (
        (req.status === 'pending' && req.originator === 'provider')
        || (req.status === 'accepted' && req.originator === 'client')
      )).length),
    };
  }, [appointment]);
  const dispatch = useDispatch();

  const handleActionClick = (action) => {
    if (action === appointmentActions.messages) {
      dispatch(openAppointmentMessages(appointment));
    } else if (action === appointmentActions.updateRequests) {
      onShowRequests(appointment);
    } else if (action === UPDATE_STATUS_ACTION) {
      setModalState({ open: true, busy: false });
    }
  };

  return (
    <tr>
      <td aria-label={appointment.status} className={`${ClassNames.th} control`}>
        <span
          aria-hidden="true"
          title={appointment.status}
          className="block w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColors[appointment.status] }}
        />
      </td>
      <td title={details.customerFullname} className={ClassNames.th}>{details.customer}</td>
      <td className={ClassNames.th}>{details.serviceName}</td>
      <td className={ClassNames.th}>{details.time}</td>
      <td className={ClassNames.th}>{details.price}</td>
      <td className={ClassNames.th}>{details.deposit}</td>
      <td className={ClassNames.th}>{details.balance}</td>
      <td className={`${ClassNames.th} control`} aria-label="actions">
        <ContextMenu
          options={actions}
          onClick={handleActionClick}
          right
        >
          <div
            className={`relative pr-2.5 ${requestCount ? 'after:content-[attr(data-pending-request-count)] after:absolute after:-top-1.5 after:left-0 after:py-[3px] after:px-1.5 after:text-[0.6rem] after:text-[#155724] after:bg-[#d4edda] dark:after:bg-slate-800 after:rounded-full after:-z-1 after:pointer-events-none' : ''}`}
            data-pending-request-count={requestCount}
          >
            <EllipsisVerticalIcon className="w-6 h-6 text-[#5c5c5c] dark:text-slate-100" />
          </div>
        </ContextMenu>
      </td>
      <UpdateStatusModal appointment={appointment} state={modalState} setState={setModalState} />
    </tr>
  );
};

AppointmentRow.propTypes = {
  appointment: appointmentProps.isRequired,
  onShowRequests: PropTypes.func.isRequired,
};

const CompanyAppointments = () => {
  const appointments = useSelector(selectAppointments);
  const [displayedAppointments, setDisplayedAppointments] = useState([]);
  const { state } = useLocation();
  const [date, setDate] = useState(() => {
    if (state && state.date) {
      return new Date(state.date);
    }
    return new Date();
  });
  const [updateRequestsCount, setUpdateRequestsCount] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoadCount((count) => count + 1);
    dispatch(loadAppointmentsAsync(dateToNormalizedString(date), () => {
      setLoadCount((count) => count - 1);
    }));
  }, [date]);

  useEffect(() => {
    const key = dateToNormalizedString(date);
    const filterd = appointments[key] || [];
    setDisplayedAppointments(filterd);
    let count = 0;
    filterd.forEach((appointment) => {
      const requests = appointment.appointmentUpdateRequests;
      if (requests) {
        requests.forEach((req) => {
          if (requiresAttention(req)) {
            count += 1;
          }
        });
      }
    });

    setUpdateRequestsCount(count);
  }, [date, appointments]);

  useEffect(() => {
    if (selectedAppointmentId) {
      setSelectedAppointment(displayedAppointments.find(({ id }) => id === selectedAppointmentId));
    } else {
      setSelectedAppointment(null);
    }
  }, [displayedAppointments, selectedAppointmentId]);

  const handleShowRequests = (appointment) => setSelectedAppointmentId(appointment.id);

  const handleCloseRequests = () => setSelectedAppointmentId(0);

  return (
    <div className="h-full w-full overflow-hidden flex flex-col gap-6 p-3 sm:px-8 sm:py-6 relative">
      {loadCount ? (
        <LoadingBar />
      ) : null}
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-0">
          <Heading1>Appointments</Heading1>
          {updateRequestsCount ? (
            <div
              className="w-5 h-5 rounded-full text-[0.6rem] text-red-800 bg-red-200 flex items-center justify-center cursor-default -translate-y-2"
              title={`${updateRequestsCount} update requests need your attention!`}
            >
              <span>{updateRequestsCount}</span>
            </div>
          ) : null}
        </div>
        <DatePicker2 initialDate={date} onChange={setDate} />
      </div>
      <div className="flex-1 w-full overflow-x-auto">
        {displayedAppointments.length ? (
          <table className={ClassNames.table}>
            <thead>
              <tr>
                <th className={`${ClassNames.th} control`} aria-label="status" />
                <th className={ClassNames.th}>Client</th>
                <th className={ClassNames.th}>Service</th>
                <th className={ClassNames.th}>Time</th>
                <th className={ClassNames.th}>Price</th>
                <th className={ClassNames.th}>Deposit</th>
                <th className={ClassNames.th}>Balance</th>
                <th className={`${ClassNames.th} control`} aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {displayedAppointments.map((appointment, idx) => (
                <AppointmentRow
                  key={appointment.id}
                  serialNumber={idx + 1}
                  appointment={appointment}
                  onShowRequests={handleShowRequests}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="font-bold text-xl text-[#858b9c] dark:text-[#ccc] pt-8 flex flex-col items-center gap-4">
            <span>You do NOT have any appointments on selected date.</span>
          </p>
        )}
      </div>
      {selectedAppointment ? (
        <UpdateRequestsPanel appointment={selectedAppointment} onClose={handleCloseRequests} />
      ) : null}
    </div>
  );
};

export default CompanyAppointments;

/* eslint-enable jsx-a11y/label-has-associated-control */
