import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import {
  deleteAppointmentUpdateRequestAsync,
  loadAppointmentsAsync,
  openAppointmentMessages,
  requestAppointmentUpdateAsync,
  respondToAppointmentUpdateRequestAsync,
  selectAppointments,
  selectCompany,
  updateAppointmentAsync,
} from '../../../redux/companySlice';
import {
  capitalize,
  currencyHelper,
  dateToNormalizedString,
} from '../../../utils';
import { colors, SvgButton, paths } from '../../../components/svg';
import { useContextMenu } from '../../../components/ContextMenu';
import AlertComponent from '../../../components/AlertComponents';
import { appointmentProps } from '../../../utils/propTypes';
import SlideDialog from '../../../components/SlideInDialog';
import { useDialog } from '../../../lib/Dialog';
import { DateButton } from '../../../components/Buttons';
import { Ring } from '../../../components/LoadingButton';
import { AccentRadioButton } from '../../../components/Inputs';
import { LoadingBar } from '../../../components/LoadingSpinner';

/* eslint-disable jsx-a11y/label-has-associated-control */

const ACCEPT_REQUEST_BTN = 'accept request btn';
const APPOINTMENT_STATUS = 'appointment_status';
const CLOSE_UPDATE_REQUESTS = 'close update requests';
const CLOSE_SETUP_MESSAGE = 'close setup message';
const CLOSE_STATUS_UPDATE = 'close_status_update';
const COMMENT = 'comment';
const DELETE_REQUEST_BTN = 'delete_request_btn';
const MESSAGES = 'messages';
const OPEN_MENU = 'open menu';
const REJECT_REQUEST_BTN = 'reject request btn';
const SHOW_REQUEST_UPDATES = 'show_request_updates';
const SHOW_STATUS_UPDATE_FORM_BTN = 'show_status_update_form_btn';
const SUBMIT_REQUEST_FORM = 'submit request form';
const TOGGLE_REQUEST_FORM = 'toggle request form';
const UPDATE_REQUESTS = 'view update request';
const UPDATE_STATUS = 'update_status';

const appointStatuses = ['pending', 'active', 'done', 'failed'];

const requiresAttention = ({ originator, status }) => (
  originator === 'client' && status === 'pending'
);

const AppointmentStatusDialog = ({ appointment, onClose }) => {
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(appointment.status);
  const dispatch = useDispatch();

  useEffect(() => setOpen(true), []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_STATUS_UPDATE) {
      setOpen(false);
      setTimeout(onClose, 500);
    } else if (name === UPDATE_STATUS) {
      setBusy(true);
      dispatch(updateAppointmentAsync(status, appointment, (err) => {
        setBusy(false);
        if (!err) {
          setOpen(false);
          setTimeout(onClose, 500);
        }
      }));
    }
  }, [status, appointment, onClose, setOpen, setBusy]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === APPOINTMENT_STATUS) {
      setStatus(value);
    }
  }, []);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.status_update_container}>
        <header className={css.status_update_header}>
          <h1 className={css.status_update_heading}>Update Status</h1>
          <SvgButton
            type="button"
            name={CLOSE_STATUS_UPDATE}
            title="Close"
            color={colors.delete}
            path={paths.close}
            onClick={handleClick}
            sm
          />
        </header>
        <div className={css.status_update_body}>
          {appointStatuses.map((s) => (
            <AccentRadioButton
              key={s}
              name={APPOINTMENT_STATUS}
              value={s}
              label={capitalize(s)}
              onChange={handleValueChange}
              checked={s === status}
              style={{
                fontSize: '0.8rem',
              }}
              radioSize={14}
            />
          ))}
        </div>
        <div className={css.status_update_footer}>
          <button
            type="button"
            name={UPDATE_STATUS}
            className={`${css.update_request_submit_btn} ${css.status}`}
            onClick={handleClick}
            disabled={busy}
          >
            Update
          </button>
        </div>
      </section>
    </SlideDialog>
  );
};

AppointmentStatusDialog.propTypes = {
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const UpdateRequestPanel = ({ requestId, appointmentId }) => {
  const [appointment, setAppointment] = useState();
  const [request, setRequest] = useState();
  const [comment, setComment] = useState('No Comment');
  const [status, setStatus] = useState('');
  const [initiatorText, setInitiatorText] = useState('');
  const [controls, setControls] = useState({
    respond: false,
    delete: false,
  });
  const [busy, setBusy] = useState(false);
  const appointments = useSelector(selectAppointments);
  const dispatch = useDispatch();

  useEffect(() => {
    let appointment;
    const keys = Object.keys(appointments);
    for (let i = 0; i < keys.length; i += 1) {
      appointment = appointments[keys[i]].find(({ id }) => id === appointmentId);
      if (appointment) {
        break;
      }
    }

    setAppointment(appointment);
  }, [appointmentId, appointments, setAppointment]);

  useEffect(() => {
    if (appointment) {
      const requests = appointment.appointmentUpdateRequests;
      if (requests) {
        setRequest(requests.find(({ id }) => id === requestId));
      }
    }
  }, [appointment, requestId, setRequest]);

  useEffect(() => {
    if (request) {
      const { status, originator, comment } = request;

      setControls({
        delete: status === 'rejected' && originator === 'provider',
        respond: status === 'pending' && originator === 'client',
      });
      setComment(comment || 'No Comment');
      setStatus(status);
      setInitiatorText(
        `This request was initiated by ${originator === 'provider' ? 'you' : 'the client'}.`,
      );
    }
  }, [request, setControls, setComment, setStatus, setInitiatorText]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === ACCEPT_REQUEST_BTN || name === REJECT_REQUEST_BTN) {
      const status = name === ACCEPT_REQUEST_BTN ? 'accepted' : 'rejected';
      setBusy(true);
      dispatch(respondToAppointmentUpdateRequestAsync(status, request, appointment, () => (
        setBusy(false)
      )));
    } else if (name === DELETE_REQUEST_BTN) {
      setBusy(true);
      dispatch(deleteAppointmentUpdateRequestAsync(request, appointment, () => (
        setBusy(false)
      )));
    }
  }, [appointment, request, setBusy]);

  return (
    <section className={css.request_panel}>
      <div className={css.request_panel_header}>
        <span className={`${css.request_status} ${css[status]}`}>
          {status}
        </span>
        {busy ? (
          <Ring color="#298bfc" size={16} />
        ) : (
          <div className={css.request_controls}>
            {controls.respond ? (
              <>
                <button
                  type="button"
                  name={ACCEPT_REQUEST_BTN}
                  onClick={handleClick}
                  className={`${css.request_control_btn} ${css.accept}`}
                >
                  Accept
                </button>
                <button
                  type="button"
                  name={REJECT_REQUEST_BTN}
                  onClick={handleClick}
                  className={`${css.request_control_btn} ${css.reject}`}
                >
                  Reject
                </button>
              </>
            ) : null}
            {controls.delete ? (
              <button
                type="button"
                name={DELETE_REQUEST_BTN}
                onClick={handleClick}
                className={`${css.request_control_btn} ${css.reject}`}
              >
                Delete
              </button>
            ) : null}
            {controls.delete || controls.respond ? null : (
              <span className={css.no_request_controls_info}>
                No actions available
              </span>
            )}
          </div>
        )}
      </div>
      <div className={css.request_comment}>{comment}</div>
      <div className={css.request_originator}>{initiatorText}</div>
    </section>
  );
};

UpdateRequestPanel.propTypes = {
  requestId: PropTypes.number.isRequired,
  appointmentId: PropTypes.number.isRequired,
};

const UpdateRequestsPanel = ({ appointmentId, onClose }) => {
  const [isOpen, setOpen] = useState(false);
  const [appointment, setAppointment] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [title, setTitle] = useState('Update Requests');
  const [companyName, setCompanyName] = useState('');
  const [requests, setRequests] = useState([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const appointments = useSelector(selectAppointments);
  const dispatch = useDispatch();

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    let appointment;
    const keys = Object.keys(appointments);
    for (let i = 0; i < keys.length; i += 1) {
      appointment = appointments[keys[i]].find(({ id }) => id === appointmentId);
      if (appointment) {
        break;
      }
    }

    setAppointment(appointment);
  }, [appointmentId, appointments, setAppointment]);

  useEffect(() => {
    if (appointment) {
      setAppointmentDate(new Date(appointment.timeSlot.time).toUTCString());
      setTitle(`${appointment.timeSlot.service.name} - update requests`);
      setCompanyName(appointment.timeSlot.service.company.name);
      setRequests(appointment.appointmentUpdateRequests);
    } else {
      setAppointmentDate('');
      setTitle('Update Requests');
      setCompanyName('');
      setRequests([]);
    }
  }, [appointment, setAppointmentDate]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === COMMENT) {
      setComment(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_UPDATE_REQUESTS) {
      setOpen(false);
      setTimeout(onClose, 500);
    } if (name === TOGGLE_REQUEST_FORM) {
      setFormOpen((open) => !open);
    } else if (name === SUBMIT_REQUEST_FORM) {
      setSubmitting(true);
      const data = {};
      if (comment) {
        data.comment = comment;
      }
      dispatch(requestAppointmentUpdateAsync(data, appointment, (err) => {
        setSubmitting(false);
        if (!err) {
          setOpen(false);
          setTimeout(onClose, 500);
        }
      }));
    }
  }, [appointment, comment, setFormOpen, setSubmitting]);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.update_requests_container}>
        <div className={css.update_request_header}>
          <h1
            className={`ellipsis ${css.h1} ${css.appointments_heading} ${css.request_heading}`}
            title={title}
          >
            {title}
          </h1>
          <SvgButton
            type="button"
            name={CLOSE_UPDATE_REQUESTS}
            title="Close"
            color={colors.delete}
            path={paths.close}
            onClick={handleClick}
            sm
          />
        </div>
        <div className={css.update_request_appointment}>
          <div className={css.update_request_appointment_row}>
            <span className={css.update_request_appointment_label}>Provider</span>
            <span>
              {companyName}
            </span>
          </div>
          <div className={css.update_request_appointment_row}>
            <span className={css.update_request_appointment_label}>Date</span>
            <span>
              {appointmentDate}
            </span>
          </div>
        </div>
        <div className={css.update_request_body}>
          {
            requests.length
              ? requests.map((request) => (
                <UpdateRequestPanel
                  key={request.id}
                  requestId={request.id}
                  appointmentId={appointment.id}
                />
              ))
              : (
                <span className={css.update_request_empty_info}>
                  No update requests found!
                </span>
              )
          }
        </div>
        <div className={css.update_request_footer}>
          <div className={`${css.update_request_form} ${isFormOpen ? css.open : ''}`}>
            <div className={css.update_request_form_inner}>
              <span className={css.update_request_info}>
                Write a comment to explain to the client why you need this update (optional)
              </span>
              <textarea
                name={COMMENT}
                value={comment}
                onChange={handleValueChange}
                className={css.update_request_comment}
                rows="3"
              />
              <span className={css.update_request_info}>
                The client will select any other available time slot
                if they choose to accept this request.
              </span>
              <div className={css.update_request_form_controls}>
                <button
                  type="button"
                  name={SUBMIT_REQUEST_FORM}
                  className={css.update_request_submit_btn}
                  onClick={handleClick}
                  disabled={submitting}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            name={TOGGLE_REQUEST_FORM}
            className={`${css.update_request_form_toggle_btn} ${isFormOpen ? css.open : ''}`}
            onClick={handleClick}
          >
            {`${isFormOpen ? 'Close' : 'Open'} request form`}
          </button>
        </div>
      </section>
    </SlideDialog>
  );
};

UpdateRequestsPanel.propTypes = {
  appointmentId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

const UpdateRequestsDialog = ({ date, onClose }) => {
  const [isOpen, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  const appointments = useSelector(selectAppointments);

  useEffect(() => setOpen(true), []);

  useEffect(() => {
    const filterd = appointments[date] || [];
    const requests = [];
    filterd.forEach((appointment) => {
      appointment.appointmentUpdateRequests.forEach((req) => {
        if (requiresAttention(req)) {
          requests.push({ ...req, appointment });
        }
      });
    });

    setRequests(requests);
  }, [date, appointments, setRequests]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_UPDATE_REQUESTS) {
      onClose();
    }
  }, []);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.update_requests_container}>
        <header className={`${css.update_request_header} ${css.dialog}`}>
          <h1
            className={`${css.h1} ${css.appointments_heading} ${css.request_heading}`}
          >
            Update Requests
          </h1>
          <SvgButton
            type="button"
            name={CLOSE_UPDATE_REQUESTS}
            title="Close"
            color={colors.delete}
            path={paths.close}
            onClick={handleClick}
            sm
          />
        </header>
        <div className={css.update_request_dialog_date}>
          {new Date(date).toUTCString()}
        </div>
        <div className={css.update_request_body}>
          {
            requests.length
              ? requests.map((request) => (
                <div key={request.id} className={css.update_request_appointment}>
                  <div className={css.update_request_appointment_row}>
                    <span className={css.update_request_appointment_label}>Provider: </span>
                    <span>
                      {request.appointment.timeSlot.service.company.name}
                    </span>
                  </div>
                  <div className={css.update_request_appointment_row}>
                    <span className={css.update_request_appointment_label}>Service: </span>
                    <span>
                      {request.appointment.timeSlot.service.name}
                    </span>
                  </div>
                  <UpdateRequestPanel
                    requestId={request.id}
                    appointmentId={request.appointment.id}
                  />
                </div>
              ))
              : (
                <span className={css.update_request_empty_info}>
                  No update requests found!
                </span>
              )
          }
        </div>
      </section>
    </SlideDialog>
  );
};

UpdateRequestsDialog.propTypes = {
  date: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * @param {Object} props
 * @param {import('../../../types').Appointment} props.appointment
 * @returns
 */
const AppointmentRow = ({ appointment, onOpenMessages }) => {
  const [datetime, setDateTime] = useState({ date: '', time: '' });
  const [payment, setPayment] = useState({ price: '', deposit: '', balance: '' });
  const [updateRequestText, setUpdateRequestText] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const moreColumn = useRef();
  const contextMenu = useContextMenu();
  const dialog = useDialog();

  useEffect(() => {
    let text = 'Update Requests';
    const reqs = appointment.appointmentUpdateRequests.filter((a) => requiresAttention(a));
    if (reqs.length) {
      text = `${text} (${reqs.length})`;
    }

    setUpdateRequestText(text);
  }, [appointment, setUpdateRequestText]);

  useEffect(() => {
    const { deposit, timeSlot: slot } = appointment;
    const date = new Date(slot.time);
    const { price } = slot.service;
    setDateTime({ date: date.toLocaleDateString(), time: date.toLocaleTimeString() });
    setPayment({
      price: currencyHelper.toString(price, slot.service.company.country.currencySymbol),
      deposit: currencyHelper.toString(deposit, slot.service.company.country.currencySymbol),
      balance: currencyHelper.toString(
        price - deposit,
        slot.service.company.country.currencySymbol,
      ),
    });
  }, [appointment, setDateTime]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN_MENU) {
      setMenuOpen(true);
    } else if (name === MESSAGES) {
      onOpenMessages(appointment);
    } else if (name === UPDATE_REQUESTS) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <UpdateRequestsPanel appointmentId={appointment.id} onClose={handleClose} />,
      );
    } else if (name === SHOW_STATUS_UPDATE_FORM_BTN) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <AppointmentStatusDialog appointment={appointment} onClose={handleClose} />,
      );
    }
  }, [appointment, onOpenMessages]);

  return (
    <>
      <td>
        <span className={`${css.status} ${css[appointment.status]}`}>
          {capitalize(appointment.status)}
        </span>
      </td>
      <td>{datetime.date}</td>
      <td>{datetime.time}</td>
      <td>{appointment.timeSlot.service.name}</td>
      <td>{appointment.customer.firstname}</td>
      <td>{payment.price}</td>
      <td>{payment.deposit}</td>
      <td>{payment.balance}</td>
      <td ref={moreColumn} className={css.more_cell}>
        <SvgButton
          type="button"
          name={OPEN_MENU}
          title="Actions"
          color="#8c9297"
          onClick={handleClick}
          path={paths.more}
          sm
        />
        <contextMenu.Menu isOpen={isMenuOpen} refElement={moreColumn} onClose={closeMenu}>
          <div className={`context-menu ${css.appointment_row_context_menu}`}>
            <button
              type="button"
              name={SHOW_STATUS_UPDATE_FORM_BTN}
              className="menu-item"
              onClick={handleClick}
              onMouseDown={handleClick}
            >
              Update Status
            </button>
            <button
              type="button"
              name={MESSAGES}
              className="menu-item"
              onClick={handleClick}
              onMouseDown={handleClick}
            >
              Messages
            </button>
            <button
              type="button"
              name={UPDATE_REQUESTS}
              className="menu-item"
              onClick={handleClick}
              onMouseDown={handleClick}
            >
              {updateRequestText}
            </button>
          </div>
        </contextMenu.Menu>
      </td>
    </>
  );
};

AppointmentRow.propTypes = {
  appointment: appointmentProps.isRequired,
  onOpenMessages: PropTypes.func.isRequired,
};

const Dashboard = () => {
  const appointments = useSelector(selectAppointments);
  const [displayedAppointments, setDisplayedAppointments] = useState([]);
  const [date, setDate] = useState(dateToNormalizedString(new Date()));
  const [incompleteSetupMessage, setIncompleteSetupMessage] = useState('');
  const [updateRequestsCount, setUpdateRequestsCount] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const company = useSelector(selectCompany);
  const dialog = useDialog();
  const dispatch = useDispatch();
  const { state } = useLocation();

  useEffect(() => {
    if (state && state.date) {
      setDate(state.date);
    }
  }, [state, setDate]);

  useEffect(() => {
    setLoadCount((count) => count + 1);
    dispatch(loadAppointmentsAsync(date, () => {
      setLoadCount((count) => count - 1);
    }));
  }, [date, setLoadCount]);

  useEffect(() => {
    const filterd = appointments[date] || [];
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
  }, [date, appointments, setDisplayedAppointments]);

  useEffect(() => {
    if (!company.city) {
      setIncompleteSetupMessage(
        "You have NOT set your Business' City! People will NOT be able to find your business when they search by their City name.",
      );
      return;
    }

    if (!company.location) {
      setIncompleteSetupMessage(
        "You have NOT set your Business' Location! People will NOT be able to find your business when they search by their Location.",
      );
    }
  }, [company]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_SETUP_MESSAGE) {
      setIncompleteSetupMessage('');
    } else if (name === SHOW_REQUEST_UPDATES) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <UpdateRequestsDialog date={date} onClose={handleClose} />,
      );
    }
  }, [date, setIncompleteSetupMessage]);

  const handleOpenMessages = useCallback((appointment) => {
    dispatch(openAppointmentMessages(appointment));
  }, []);

  return (
    <main className={css.main}>
      {loadCount ? (
        <LoadingBar />
      ) : null}
      <header className="page-header">
        <h1 className="page_heading">Appointments</h1>
        <DateButton date={date} onChange={setDate} />
      </header>
      {incompleteSetupMessage ? (
        <section className={css.incomplete_setup_message_wrap}>
          <AlertComponent
            type="error"
            message={incompleteSetupMessage}
            style={{
              padding: '4px 24px 4px 8px',
              margin: 0,
              textAlign: 'left',
            }}
          />
          <SvgButton
            type="button"
            name={CLOSE_SETUP_MESSAGE}
            title="Close"
            color="#a90909"
            path={paths.close}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
            onClick={handleClick}
            sm
          />
        </section>
      ) : null}
      <div className={css.content}>
        <div className={css.appointments_wrap}>
          {displayedAppointments.length ? (
            <>
              <div>
                <div className={css.summary_panel}>
                  <div className={css.summary_wrap}>
                    <span className={css.summary_label}>Total:</span>
                    <span>{displayedAppointments.length}</span>
                  </div>
                  {updateRequestsCount ? (
                    <button
                      type="button"
                      name={SHOW_REQUEST_UPDATES}
                      onClick={handleClick}
                      className={`link compact-link ${css.summary_wrap}`}
                      title="You have update requests that requires your attention"
                    >
                      {`Update requests: ${updateRequestsCount}`}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="table-card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Service</th>
                      <th>Customer</th>
                      <th>Price</th>
                      <th>Deposit</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <AppointmentRow
                          appointment={appointment}
                          onOpenMessages={handleOpenMessages}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={`${css.empty_notice} ${css.sm}`}>
              No appointments found for date!
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

/* eslint-enable jsx-a11y/label-has-associated-control */
