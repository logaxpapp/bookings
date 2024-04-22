import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import UserSearchbarContainer from './UserSearchbarContainer';
import { DatePicker2 } from '../../components/DatePicker';
import Modal, { useBusyModal } from '../../components/Modal';
import { fetchResources } from '../../api';
import {
  addressText,
  currencyHelper,
  dateUtils,
  rootSelector,
  toDuration,
} from '../../utils';
// import GridPanel from '../../components/GridPanel';
import { appointmentProps } from '../../utils/propTypes';
import { SvgButton, colors, paths } from '../../components/svg';
import {
  deleteAppointmentUpdateRequestAsync,
  openAppointmentMessages,
  requestAppointmentUpdateAsync,
  respondToAppointmentUpdateRequestAsync,
  updateAppointmentTimeSlotAsync,
} from '../../redux/userSlice';
import { useDialog } from '../../lib/Dialog';
import { Ring } from '../../components/LoadingButton';
import { getServiceTimeSlotsAsync } from '../../redux/serviceProvidersSlice';
import { Loader } from '../../components/LoadingSpinner';
import SlotsGrid from '../SlotsGrid';
import SlideDialog from '../../components/SlideInDialog';
import css from './styles.module.css';
import { ContextMenu } from '../../components/Inputs/MenuSelect';
import defaultImages from '../../utils/defaultImages';
import routes from '../../routing/routes';
import { SlotsPanel } from '../Search/SearchPanel';
import { Button } from '../../components/Buttons';

const ACCEPT_REQUEST_BTN = 'accept request btn';
const CLOSE_TIME_SLOT_PANEL = 'close_time_slot_panel';
const DELETE_UPDATE_REQUESTS = 'delete_update_requests';
const OPEN_MESSAGES = 'open_messages';
const REJECT_REQUEST_BTN = 'reject_request_btn';
const REQUEST_COMMENT = 'request_comment';
const SHOW_UPDATE_REQUESTS = 'show_update_requests';
const SUBMIT_REQUEST_FORM = 'submit_request_form';
const UPDATE_REQUEST_BTN = 'update_request_btn';

const appointmentActions = {
  companyDetails: 'Company Details',
  messages: 'View Messages',
  updateRequests: 'Update Requests',
};

const requestActions = {
  ACCEPT: 'Accept',
  DELETE: 'Delete',
  DETAILS: 'View Details',
  REJECT: 'Reject',
  UPDATE: 'Update',
};

const requestsActions = {
  REQUEST: 'Request Update',
  CLOSE: 'Close',
};

const requestsOptions = Object.values(requestsActions);

const appointmentOptions = Object.values(appointmentActions);

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

  const handleClick = ({ target: { name } }) => {
    if (name === CLOSE_TIME_SLOT_PANEL) {
      setOpen(false);
      setTimeout(onClose, 500);
    }
  };

  const handleBook = (slot) => {
    setBusy(true);
    dispatch(updateAppointmentTimeSlotAsync(slot, request, appointment, (err) => {
      setBusy(false);
      if (!err) {
        setOpen(false);
        setTimeout(onClose, 500);
      }
    }));
  };

  return (
    <SlideDialog isIn={isOpen}>
      <section className="relative p-2 text-[#f0f7f9] dark:text-slate-500">
        <header className="pb-3 mb-3 border-b border-dotted border-[#eee] dark:border-slate-700">
          <h1 className="mb-3 text-[0.9rem]">Select New Slot</h1>
          <DatePicker2 date={date} onChange={setDate} />
        </header>
        <div className="w-70 h-60">
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
  const comment = useMemo(() => request.comment || 'No Comment');
  const [busy, setBusy] = useState(false);
  const controlStates = useMemo(() => {
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
    } else if (originator === 'provider' && status === 'pending') {
      state.accept = true;
      state.reject = true;
    }

    return state;
  }, [request]);
  const dialog = useDialog();
  const dispatch = useDispatch();

  const handleClick = ({ target: { name } }) => {
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
  };

  return (
    <section className="p-2 flex flex-col gap-2 bg-[#ecf2f7] dark:bg-slate-600">
      <div className="flex items-center justify-between">
        <span className={`${css.request_status} ${css[request.status]}`}>
          {request.status}
        </span>
        {busy ? (
          <Ring color="#298bfc" size={16} />
        ) : (
          <div className="p-1 flex gap-4 bg-[#edf4fc] dark:bg-slate-700">
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
                <span className="text-[0.7rem] text-[#6f8999] dark:text-slate-300">
                  No actions available
                </span>
              )}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-[#24303f] p-1.5 text-[0.7rem]">
        {comment}
      </div>
      <div className="text-[#357b76] text-[0.7rem]">
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

const UpdateRequestRow = ({ request, appointment, index }) => {
  const {
    actions,
    date,
    originator,
    hasSlotModal,
  } = useMemo(() => {
    const { comment, originator, status } = request;
    const actions = [];
    let hasSlotModal = false;

    if (comment) {
      actions.push(requestActions.DETAILS);
    }

    if (originator === 'client') {
      if (status === 'accepted') {
        actions.push(requestActions.UPDATE);
        hasSlotModal = true;
      } else if (status === 'rejected') {
        actions.push(requestActions.DELETE);
      }
    }

    if (originator === 'provider' && status === 'pending') {
      actions.push(requestActions.ACCEPT);
      actions.push(requestActions.REJECT);
      hasSlotModal = true;
    }

    return {
      actions,
      date: new Date(request.createdAt).toLocaleDateString(),
      hasSlotModal,
      originator: originator === 'client' ? 'Initiated by You' : 'Initiated by Service Probider',
    };
  }, [request]);
  const {
    address,
    price,
    deposit,
    duration,
  } = useMemo(() => {
    const { timeSlot: { service } } = appointment;
    const price = currencyHelper.toString(service.price, service.company.country.currencySymbol);
    let deposit = '';
    if (service.minDeposit) {
      deposit = currencyHelper.toString(service.minDeposit, service.company.country.currencySymbol);
    }
    const duration = toDuration(service.duration);

    return {
      address: addressText(service.company.address),
      price,
      deposit,
      duration,
    };
  }, [appointment.timeSlot.service]);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [slotsModal, setSlotsModal] = useState({ open: false, busy: false });
  const [panelWidth, setPanelWidth] = useState(750);
  const busyDialog = useBusyModal();
  const dispatch = useDispatch();

  const handleActionClick = (action) => {
    if (action === requestActions.DETAILS) {
      setCommentModalOpen(true);
    } else if (action === requestActions.REJECT) {
      busyDialog.showLoader();
      dispatch(respondToAppointmentUpdateRequestAsync('rejected', request, appointment, () => (
        busyDialog.hideLoader()
      )));
    } else if (action === requestActions.ACCEPT || action === requestActions.UPDATE) {
      setSlotsModal({ open: true, busy: false });
    } else if (action === requestActions.DELETE) {
      busyDialog.showLoader();
      dispatch(deleteAppointmentUpdateRequestAsync(request, appointment, () => (
        busyDialog.hideLoader()
      )));
    }
  };

  const handleUpdateAppointment = (slot) => {
    setSlotsModal({ open: true, busy: true });
    dispatch(updateAppointmentTimeSlotAsync(slot, request, appointment, (err) => {
      if (err) {
        setSlotsModal({ open: true, busy: false });
      } else {
        setSlotsModal({ open: false, busy: false });
      }
    }));
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
      {hasSlotModal ? (
        <Modal
          isOpen={slotsModal.open || slotsModal.busy}
          parentSelector={rootSelector}
          onRequestClose={() => {
            if (!slotsModal.busy) {
              setSlotsModal({ busy: false, isOpen: false });
            }
          }}
          style={{ content: { maxWidth: panelWidth } }}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <SlotsPanel
            service={appointment.timeSlot.service}
            address={address}
            price={price}
            duration={duration}
            deposit={deposit}
            panelWidth={panelWidth}
            setPanelWidth={setPanelWidth}
            busy={slotsModal.busy}
            setBusy={(busy) => setSlotsModal((state) => ({ ...state, busy }))}
            onSlotSelected={handleUpdateAppointment}
          />
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
      <div className="flex items-center gap-2 pb-2 border-b border-dotted border-[#dbdfeb] dark:border-slate-600">
        <h1
          className="ellipsis text-base flex-1"
          title={`${appointment.timeSlot.service.name} - Update Requests`}
        >
          {`${appointment.timeSlot.service.name} - Update Requests`}
        </h1>
        <ContextMenu
          options={requestsOptions}
          onClick={handleActions}
          right
        >
          <EllipsisVerticalIcon className="w-6 h-6 text-[#5c5c5c] dark:text-slate-100" />
        </ContextMenu>
      </div>
      <div
        className="flex flex-col gap-2 p-3"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0 2px 8px' }}
      >
        <div className="flex gap-2 text">
          <span className="font-semibold">Provider</span>
          <span>
            {appointment.timeSlot.service.company.name}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-semibold">Date</span>
          <span>
            {date}
          </span>
        </div>
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
            Write a comment to explain to the provider why you need this update (optional)
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
 * @param {import('../../types').Appointment} props.appointment
 */
export const AppointmentPanel = ({
  appointment,
  onOpenMessages,
  onShowRequests,
}) => {
  const { requestCount, details } = useMemo(() => {
    const { timeSlot: slot } = appointment;
    const { service, time } = slot;
    const {
      company,
      name: serviceName,
      price,
    } = service;
    const {
      country,
      name: companyName,
      address: companyAddress,
    } = company;

    return {
      details: {
        serviceName,
        companyName,
        companyAddress: companyAddress ? addressText(companyAddress) : '',
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

  const handleClick = ({ target: { name } }) => {
    if (name === OPEN_MESSAGES) {
      onOpenMessages(appointment);
    } else if (name === SHOW_UPDATE_REQUESTS) {
      onShowRequests(appointment);
    }
  };

  return (
    <article
      className="p-4 flex flex-col gap-2 rounded bg-white dark:bg-slate-700 text-[#011c39] dark:text-white w-70"
      style={{
        boxShadow: 'rgba(67, 71, 85, 0.27) 0 0 0.25em, rgba(90, 125, 188, 0.05) 0 0.25em 1em',
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Service</title>
          <path
            fill="currentColor"
            d={paths.roomService}
          />
        </svg>
        <span>{details.serviceName}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Service Provider</title>
          <path
            fill="currentColor"
            d={paths.domain}
          />
        </svg>
        <span>{details.companyName}</span>
      </div>
      <div className="flex items-start gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Location</title>
          <path
            fill="currentColor"
            d={paths.mapMarker}
          />
        </svg>
        <span className="text-xs opacity-70">
          {details.companyAddress}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Time</title>
          <path
            fill="currentColor"
            d={paths.clock}
          />
        </svg>
        <span>{details.time}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Price</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{details.price}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Deposit</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{details.deposit}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <title>Balance</title>
          <path
            fill="currentColor"
            d={paths.dollarSign}
          />
        </svg>
        <span>{details.balance}</span>
      </div>
      <footer className="pt-2 border-t border-dotted border-[#eee] dark:border-slate-800 flex justify-end gap-4">
        <SvgButton
          type="button"
          name={OPEN_MESSAGES}
          title="View Messages"
          color="currentColor"
          path={paths.email}
          onClick={handleClick}
          sm
        />
        <div
          className={`relative pr-2.5 ${requestCount ? 'after:content-[attr(data-pending-request-count)] after:absolute after:-top-1.5 after:left-0 after:py-[3px] after:px-1.5 after:text-[0.6rem] after:text-[#155724] after:bg-[#d4edda] dark:after:bg-slate-800 after:rounded-full after:-z-1 after:pointer-events-none' : ''}`}
          data-pending-request-count={requestCount}
        >
          <SvgButton
            type="button"
            name={SHOW_UPDATE_REQUESTS}
            title="Update Requests"
            color="currentColor"
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

const AppointmentRow = ({
  appointment,
  onShowRequests,
  serialNumber,
}) => {
  const { requestCount, details } = useMemo(() => {
    const { timeSlot: slot } = appointment;
    const { service, time } = slot;
    const {
      company,
      name: serviceName,
      price,
    } = service;
    const {
      country,
      name: companyName,
      address: companyAddress,
    } = company;

    return {
      details: {
        serviceName,
        companyName,
        companyAddress: companyAddress ? addressText(companyAddress) : '',
        time: new Date(time).toLocaleString(),
        price: currencyHelper.toString(price, country.currencySymbol),
        deposit: currencyHelper.toString(appointment.deposit, country.currencySymbol),
        balance: currencyHelper.toString(price - appointment.deposit, country.currencySymbol),
        photo: company.profilePicture || defaultImages.profile,
        phoneNumber: company.phoneNumber,
        page: routes.user.dashboard.absolute.providers(company.id),
      },
      requestCount: (appointment.appointmentUpdateRequests.filter((req) => (
        (req.status === 'pending' && req.originator === 'provider')
        || (req.status === 'accepted' && req.originator === 'client')
      )).length),
    };
  }, [appointment]);
  const [isCompanyDetailsModalOpen, setCompanyDetailsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleActionClick = (action) => {
    if (action === appointmentActions.messages) {
      dispatch(openAppointmentMessages(appointment));
    } else if (action === appointmentActions.updateRequests) {
      onShowRequests(appointment);
    } else if (action === appointmentActions.companyDetails) {
      setCompanyDetailsModalOpen(true);
    }
  };

  return (
    <tr>
      <td>{`${serialNumber}. `}</td>
      <td>{details.companyName}</td>
      <td>{details.serviceName}</td>
      <td>{details.time}</td>
      <td>{details.price}</td>
      <td>{details.deposit}</td>
      <td>{details.balance}</td>
      <td aria-label="actions">
        <ContextMenu
          options={appointmentOptions}
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
      <Modal
        isOpen={isCompanyDetailsModalOpen}
        parentSelector={rootSelector}
        onRequestClose={() => setCompanyDetailsModalOpen(false)}
        style={{ content: { maxHeight: '100vh' } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <section className="flex flex-col gap-6 p-8 w-full overflow-auto text-[#011c39] dark:text-white">
          <header className="flex flex-col gap-6">
            <img alt="!" src={details.photo} className="w-full" />
            <h1 className="m-0">
              {details.companyName}
            </h1>
          </header>
          <div className="flex flex-col gap-6">
            <div className="flex">
              <span className="w-20 font-semibold">
                Address:
              </span>
              <span className="flex-1">{details.companyAddress}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-semibold">
                Phone:
              </span>
              <span className="flex-1">{details.phoneNumber}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-semibold">
                Page:
              </span>
              <Link
                to={details.page}
                className="text-blue-600 flex-1"
                title={`${window.location.protocol}://${window.location.host}${details.page}`}
              >
                {`${window.location.protocol}://${window.location.host}${details.page}`}
              </Link>
            </div>
          </div>
        </section>
      </Modal>
    </tr>
  );
};

AppointmentRow.propTypes = {
  appointment: appointmentProps.isRequired,
  onShowRequests: PropTypes.func.isRequired,
  serialNumber: PropTypes.number.isRequired,
};

const UserAppointments = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateRequestAttentionCount, setUpdateRequestAttentionCount] = useState(0);
  const busyModal = useBusyModal();
  const [user] = useOutletContext();

  useEffect(() => {
    busyModal.showLoader();
    fetchResources(`users/${user.id}/appointments?date=${dateUtils.toNormalizedString(date)}&offset=0`, user.token, true)
      .then((appointments) => {
        setAppointments(appointments);
        busyModal.hideLoader();
      })
      .catch(() => {
        setAppointments([]);
        busyModal.hideLoader();
      });
  }, [date]);

  useEffect(() => {
    if (selectedAppointmentId) {
      setSelectedAppointment(appointments.find(({ id }) => id === selectedAppointmentId));
    } else {
      setSelectedAppointment(null);
    }
  }, [appointments, selectedAppointmentId]);

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
  }, [appointments]);

  const handleShowRequests = (appointment) => setSelectedAppointmentId(appointment.id);

  const handleCloseRequests = () => setSelectedAppointmentId(0);

  return (
    <UserSearchbarContainer>
      <div className="h-full w-full overflow-hidden flex flex-col gap-6 px-8 py-6 relative">
        <div className="w-full flex items-center justify-between">
          <DatePicker2 initialDate={date} onChange={setDate} right />
          {updateRequestAttentionCount ? (
            <div
              className="p-0.5 aspect-square rounded-full text-[0.6rem] min-w-4.5 text-[#155724] bg-[d4edda] dark:bg-slate-700 flex items-center justify-center cursor-default"
              title={`${updateRequestAttentionCount} update requests need your attention!`}
            >
              <span>{updateRequestAttentionCount}</span>
            </div>
          ) : null}
        </div>
        <div className="flex-1 overflow-x-auto">
          {appointments.length ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-6" aria-label="serial number" />
                  <th className="text-left pb-6">Company</th>
                  <th className="text-left pb-6">Service</th>
                  <th className="text-left pb-6">Time</th>
                  <th className="text-left pb-6">Price</th>
                  <th className="text-left pb-6">Deposit</th>
                  <th className="text-left pb-6">Balance</th>
                  <th className="text-left pb-6" aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, idx) => (
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
    </UserSearchbarContainer>
  );
};

export default UserAppointments;
