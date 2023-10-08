import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import PropTypes, { string } from 'prop-types';
import css from './style.module.css';
import { currencyHelper, dateUtils } from '../../utils';
import {
  deleteAppointmentUpdateRequestAsync,
  requestAppointmentUpdateAsync,
  respondToAppointmentUpdateRequestAsync,
  updateAppointmentTimeSlotAsync,
} from '../../redux/userSlice';
import { appointmentProps } from '../../utils/propTypes';
import { SvgButton, colors, paths } from '../../components/svg';
import { getServiceTimeSlotsAsync } from '../../redux/serviceProvidersSlice';
import SlideDialog from '../../components/SlideInDialog';
import { DateButton } from '../../components/Buttons';
import SlotsGrid from '../SlotsGrid';
import { useDialog } from '../../lib/Dialog';
import { Loader } from '../../components/LoadingSpinner';
import { Ring } from '../../components/LoadingButton';

const ACCEPT_REQUEST_BTN = 'accept request btn';
const CLOSE_TIME_SLOT_PANEL = 'close_time_slot_panel';
const CLOSE_UPDATE_REQUESTS = 'close_update_requests';
const DELETE_UPDATE_REQUESTS = 'delete_update_requests';
const OPEN_MESSAGES = 'open_messages';
const REJECT_REQUEST_BTN = 'reject_request_btn';
const REQUEST_COMMENT = 'request_comment';
const SHOW_UPDATE_REQUESTS = 'show_update_requests';
const SUBMIT_REQUEST_FORM = 'submit_request_form';
const TOGGLE_REQUEST_FORM = 'toggle_request_form';
const UPDATE_REQUEST_BTN = 'update_request_btn';

export const AppointmentTimeSlotUpdatePanel = ({ request, appointment, onClose }) => {
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState(dateUtils.toNormalizedString(new Date()));
  const [slots, setSlots] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => setOpen(true), []);

  useEffect(() => {
    setBusy(true);
    dispatch(getServiceTimeSlotsAsync(appointment.timeSlot.service.id, date, (err, slots) => {
      setSlots(err ? [] : slots);
      setBusy(false);
    }));
  }, [date, appointment, setBusy, setSlots, setOpen]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_TIME_SLOT_PANEL) {
      setOpen(false);
      setTimeout(onClose, 500);
    }
  }, []);

  const handleBook = useCallback((slot) => {
    setBusy(true);
    dispatch(updateAppointmentTimeSlotAsync(slot, request, appointment, (err) => {
      setBusy(false);
      if (!err) {
        setOpen(false);
        setTimeout(onClose, 500);
      }
    }));
  }, []);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.appointment_time_slot_panel}>
        <header className={css.appointment_time_slot_header}>
          <h1 className={css.appointment_time_slot_heading}>Select New Slot</h1>
          <DateButton date={date} onChange={setDate} />
        </header>
        <div className={css.appointment_time_slot_sizer}>
          {busy ? (
            <Loader type="double_ring" />
          ) : (
            <SlotsGrid slots={slots} onSelect={handleBook} />
          )}
        </div>
        <SvgButton
          type="button"
          name={CLOSE_TIME_SLOT_PANEL}
          title="Close"
          path={paths.close}
          color={colors.delete}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={handleClick}
        />
      </section>
    </SlideDialog>
  );
};

AppointmentTimeSlotUpdatePanel.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.number,
    status: PropTypes.string,
    originator: PropTypes.string,
    appointmentId: PropTypes.number,
  }).isRequired,
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const UpdateRequestPanel = ({ request, appointment }) => {
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [controlStates, setControlStates] = useState({
    accept: false,
    reject: false,
    update: false,
    delete: false,
  }, []);
  const dialog = useDialog();
  const dispatch = useDispatch();

  useEffect(() => {
    setComment(request.comment || 'No Comment');
  }, []);

  useEffect(() => {
    const { originator, status } = request;
    const state = {
      accept: false,
      reject: false,
      update: false,
      delete: false,
    };

    if (originator === 'client') {
      if (status === 'accepted') {
        state.update = true;
      } else if (status === 'rejected') {
        state.delete = true;
      }
    }

    if (originator === 'provider' && status === 'pending') {
      state.accept = true;
      state.reject = true;
    }
    setControlStates(state);
  }, [request, appointment, setControlStates]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === REJECT_REQUEST_BTN) {
      setBusy(true);
      dispatch(respondToAppointmentUpdateRequestAsync('rejected', request, appointment, () => (
        setBusy(false)
      )));
    } else if (name === ACCEPT_REQUEST_BTN || name === UPDATE_REQUEST_BTN) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <AppointmentTimeSlotUpdatePanel
          request={request}
          appointment={appointment}
          onClose={handleClose}
        />,
      );
    } else if (name === DELETE_UPDATE_REQUESTS) {
      setBusy(true);
      dispatch(deleteAppointmentUpdateRequestAsync(request, appointment, () => {
        setBusy(false);
      }));
    }
  }, [request, appointment, setBusy]);

  return (
    <section className={css.request_panel}>
      <div className={css.request_panel_header}>
        <span className={`${css.request_status} ${css[request.status]}`}>
          {request.status}
        </span>
        {busy ? (
          <Ring color="#298bfc" size={16} />
        ) : (
          <div className={css.request_controls}>
            {controlStates.update ? (
              <button
                type="button"
                name={UPDATE_REQUEST_BTN}
                onClick={handleClick}
                className={`${css.request_control_btn} ${css.update}`}
              >
                Update
              </button>
            ) : null}
            {controlStates.accept ? (
              <button
                type="button"
                name={ACCEPT_REQUEST_BTN}
                onClick={handleClick}
                className={`${css.request_control_btn} ${css.accept}`}
              >
                Accept
              </button>
            ) : null}
            {controlStates.reject ? (
              <button
                type="button"
                name={REJECT_REQUEST_BTN}
                onClick={handleClick}
                className={`${css.request_control_btn} ${css.reject}`}
              >
                Reject
              </button>
            ) : null}
            {controlStates.delete ? (
              <button
                type="button"
                name={DELETE_UPDATE_REQUESTS}
                onClick={handleClick}
                className={`${css.request_control_btn} ${css.delete}`}
              >
                Delete
              </button>
            ) : null}
            {controlStates.accept
              || controlStates.reject
              || controlStates.update
              || controlStates.delete ? null : (
                <span className={css.no_request_controls_info}>
                  No actions available
                </span>
              )}
          </div>
        )}
      </div>
      <div className={css.request_comment}>
        {comment}
      </div>
      <div className={css.request_originator}>
        {`This request was initiated by ${request.originator === 'provider' ? 'the provider' : 'you'}.`}
      </div>
    </section>
  );
};

UpdateRequestPanel.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.number,
    comment: PropTypes.string,
    status: PropTypes.string,
    originator: PropTypes.string,
  }).isRequired,
  appointment: appointmentProps.isRequired,
};

const UpdateRequestsPanel = ({ appointment, onClose }) => {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [requestComment, setRequestComment] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
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
  }, [appointment, setDate]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === REQUEST_COMMENT) {
      setRequestComment(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_UPDATE_REQUESTS) {
      onClose();
    } if (name === TOGGLE_REQUEST_FORM) {
      setIsRequestFormOpen((open) => !open);
    } else if (name === SUBMIT_REQUEST_FORM) {
      setSubmittingRequest(true);
      const data = {};
      if (requestComment) {
        data.comment = requestComment;
      }
      dispatch(requestAppointmentUpdateAsync(data, appointment, (err) => {
        setSubmittingRequest(false);
        if (!err) {
          setIsRequestFormOpen(false);
        }
      }));
    }
  }, [
    appointment, requestComment,
    onClose, setIsRequestFormOpen, setSubmittingRequest,
  ]);

  return (
    <div className={css.update_requests_container}>
      <div className={css.update_request_header}>
        <h1
          className={`ellipsis ${css.h1} ${css.appointments_heading} ${css.request_heading}`}
          title={`${appointment.timeSlot.service.name} - Update Requests`}
        >
          {`${appointment.timeSlot.service.name} - Update Requests`}
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
            {appointment.timeSlot.service.company.name}
          </span>
        </div>
        <div className={css.update_request_appointment_row}>
          <span className={css.update_request_appointment_label}>Date</span>
          <span>
            {date}
          </span>
        </div>
      </div>
      <div className={css.update_request_body}>
        {
          appointment.appointmentUpdateRequests.length
            ? appointment.appointmentUpdateRequests.map((request) => (
              <UpdateRequestPanel
                key={request.id}
                request={request}
                appointment={appointment}
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
        <div className={`${css.update_request_form} ${isRequestFormOpen ? css.open : ''}`}>
          <div className={css.update_request_form_inner}>
            <span className={css.update_request_info}>
              Write a comment to explain to the provider why you need this update (optional)
            </span>
            <textarea
              name={REQUEST_COMMENT}
              value={requestComment}
              onChange={handleValueChange}
              className={css.update_request_comment}
              rows="3"
            />
            <span className={css.update_request_info}>
              You will be able to choose a new time slot when this request is approved.
            </span>
            <div className={css.update_request_form_controls}>
              <button
                type="button"
                name={SUBMIT_REQUEST_FORM}
                className={css.update_request_submit_btn}
                onClick={handleClick}
                disabled={submittingRequest}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          name={TOGGLE_REQUEST_FORM}
          className={`${css.update_request_form_toggle_btn} ${isRequestFormOpen ? css.open : ''}`}
          onClick={handleClick}
        >
          {`${isRequestFormOpen ? 'Close' : 'Open'} request form`}
        </button>
      </div>
    </div>
  );
};

UpdateRequestsPanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * @param {Object} props
 * @param {import('../../types').Appointment} props.appointment
 */
const AppointmentPanel = ({
  appointment,
  onOpenMessages,
  onShowRequests,
}) => {
  const [requestCount, setRequestCount] = useState();
  const [details, setDetails] = useState({
    serviceName: '',
    companyName: '',
    companyAddress: '',
    time: '',
    price: '',
    deposit: '',
    balance: '',
  });

  useEffect(() => {
    const { timeSlot: slot } = appointment;
    const { service, time } = slot;
    const {
      company,
      name: serviceName,
      price,
      minDeposit,
    } = service;
    const {
      country,
      name: companyName,
      address: companyAddress,
    } = company;
    setDetails({
      serviceName,
      companyName,
      companyAddress,
      time: new Date(time).toLocaleString(),
      price: currencyHelper.toString(price, country.currencySymbol),
      deposit: currencyHelper.toString(minDeposit, country.currencySymbol),
      balance: currencyHelper.toString(price - minDeposit, country.currencySymbol),
    });
    setRequestCount(appointment.appointmentUpdateRequests.filter((req) => (
      (req.status === 'pending' && req.originator === 'provider')
      || (req.status === 'accepted' && req.originator === 'client')
    )).length);
  }, [appointment, setDetails, setRequestCount]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === OPEN_MESSAGES) {
      onOpenMessages(appointment);
    } else if (name === SHOW_UPDATE_REQUESTS) {
      onShowRequests(appointment);
    }
  }, [onOpenMessages, appointment]);

  return (
    <article className={css.appointment_panel}>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Service</title>
          <path
            fill="currentColor"
            d={paths.roomService}
          />
        </svg>
        <span>{details.serviceName}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Service Provider</title>
          <path
            fill="currentColor"
            d={paths.domain}
          />
        </svg>
        <span>{details.companyName}</span>
      </div>
      <div className={`${css.appointment_row} ${css.address_row}`}>
        <svg viewBox="0 0 24 24">
          <title>Location</title>
          <path
            fill="currentColor"
            d={paths.mapMarker}
          />
        </svg>
        <span>{details.companyAddress}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Time</title>
          <path
            fill="currentColor"
            d={paths.clock}
          />
        </svg>
        <span>{details.time}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Price</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{details.price}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Deposit</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{details.deposit}</span>
      </div>
      <div className={css.appointment_row}>
        <svg viewBox="0 0 24 24">
          <title>Balance</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{details.balance}</span>
      </div>
      <footer className={css.appointment_panel_footer}>
        <SvgButton
          type="button"
          name={OPEN_MESSAGES}
          title="View Messages"
          path={paths.email}
          onClick={handleClick}
          sm
        />
        <div
          className={`${css.appointment_panel_request_wrap} ${requestCount ? css.with_label : ''}`}
          data-pending-request-count={requestCount}
        >
          <SvgButton
            type="button"
            name={SHOW_UPDATE_REQUESTS}
            title="Update Requests"
            path={paths.update}
            onClick={handleClick}
            sm
          />
        </div>
      </footer>
    </article>
  );
};

AppointmentPanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onOpenMessages: PropTypes.func.isRequired,
  onShowRequests: PropTypes.func.isRequired,
};

const AppointmentsPanel = ({
  date,
  appointments,
  onOpenMessages,
  hideHeader,
}) => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateRequestAttentionCount, setUpdateRequestAttentionCount] = useState(0);

  useEffect(() => {
    if (selectedAppointmentId) {
      setSelectedAppointment(appointments.find(({ id }) => id === selectedAppointmentId));
    } else {
      setSelectedAppointment(null);
    }
  }, [appointments, selectedAppointmentId, setSelectedAppointmentId]);

  useEffect(() => {
    let count = 0;
    appointments.forEach((app) => (
      app.appointmentUpdateRequests.forEach(({ originator, status }) => {
        if (originator === 'provider') {
          if (status === 'pending') {
            count += 1;
          }
        } else if (status === 'accepted') {
          count += 1;
        }
      })
    ));

    setUpdateRequestAttentionCount(count);
  }, [appointments, setUpdateRequestAttentionCount]);

  const handleShowRequests = useCallback(
    (appointment) => setSelectedAppointmentId(appointment.id),
    [],
  );

  const handleCloseRequests = useCallback(() => setSelectedAppointmentId(0));

  return (
    <div className={css.appointments_wrap}>
      <header className={css.appointments_header}>
        {hideHeader ? null : (
          <h1 className={css.h1}>My Appointments</h1>
        )}
        {updateRequestAttentionCount ? (
          <div
            className={css.update_request_count_wrap}
            title={`${updateRequestAttentionCount} update requests need your attention!`}
          >
            <span>{updateRequestAttentionCount}</span>
          </div>
        ) : null}
      </header>
      {hideHeader ? null : (
        <div className={css.appointments_date}>
          {date}
        </div>
      )}
      <section className={css.appointments_panel}>
        {appointments.map((appointment) => (
          <AppointmentPanel
            key={appointment.id}
            appointment={appointment}
            onOpenMessages={onOpenMessages}
            onShowRequests={handleShowRequests}
          />
        ))}
      </section>
      {selectedAppointment ? (
        <UpdateRequestsPanel appointment={selectedAppointment} onClose={handleCloseRequests} />
      ) : null}
    </div>
  );
};

AppointmentsPanel.propTypes = {
  date: string.isRequired,
  appointments: PropTypes.arrayOf(appointmentProps).isRequired,
  onOpenMessages: PropTypes.func.isRequired,
  hideHeader: PropTypes.bool,
};

AppointmentsPanel.defaultProps = {
  hideHeader: false,
};

export default AppointmentsPanel;
