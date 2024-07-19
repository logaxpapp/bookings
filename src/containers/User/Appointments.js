import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import UserSearchbarContainer from './UserSearchbarContainer';
import { DatePicker2 } from '../../components/DatePicker';
import Modal, { useBusyModal } from '../../components/Modal';
import {
  addressText,
  currencyHelper,
  dateUtils,
  rootSelector,
  toDuration,
} from '../../utils';
// import GridPanel from '../../components/GridPanel';
import { appointmentProps } from '../../utils/propTypes';
import ClassNames from '../../utils/classNames';
import { SvgButton, paths } from '../../components/svg';
import {
  deleteAppointmentUpdateRequestAsync,
  loadAppointmentsAsync,
  openAppointmentMessages,
  requestAppointmentUpdateAsync,
  respondToAppointmentUpdateRequestAsync,
  selectAppointments,
  updateAppointmentTimeSlotAsync,
} from '../../redux/userSlice';
import { LoadingBar } from '../../components/LoadingSpinner';
import { ContextMenu } from '../../components/Inputs/MenuSelect';
import defaultImages from '../../utils/defaultImages';
import routes from '../../routing/routes';
import { SlotsPanel } from '../Search/SearchPanel';
import { Button } from '../../components/Buttons';
import { Heading1 } from '../Aside';
import { statusColors } from '../../utils/constants';

const OPEN_MESSAGES = 'open_messages';
const REQUEST_COMMENT = 'request_comment';
const SHOW_UPDATE_REQUESTS = 'show_update_requests';
const SUBMIT_REQUEST_FORM = 'submit_request_form';

const appointmentActions = {
  companyDetails: 'Company Details',
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
      actions.push(requestActions.COMMENT);
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
    if (action === requestActions.COMMENT) {
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
            buttonText="Update Appointment"
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
            <span className="font-semibold w-18">Provider</span>
            <span>
              {appointment.timeSlot.service.company.name}
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
      <td aria-label={appointment.status} className={`${ClassNames.td} w-8`}>
        <span
          aria-hidden="true"
          className="block w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColors[appointment.status] }}
        />
      </td>
      <td className={ClassNames.td}>{details.companyName}</td>
      <td className={ClassNames.td}>{details.serviceName}</td>
      <td className={ClassNames.td}>{details.time}</td>
      <td className={ClassNames.td}>{details.price}</td>
      <td className={ClassNames.td}>{details.deposit}</td>
      <td className={ClassNames.td}>{details.balance}</td>
      <td className={`${ClassNames.td} w-8`} aria-label="actions">
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
};

const UserAppointments = () => {
  const [date, setDate] = useState(new Date());
  const cachedAppointments = useSelector(selectAppointments);
  const [updateRequestAttentionCount, setUpdateRequestAttentionCount] = useState(0);
  const appointments = useMemo(() => {
    const key = dateUtils.toNormalizedString(date);
    return cachedAppointments[key] || [];
  }, [cachedAppointments, date]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loadCount, setLoadCount] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoadCount((count) => count + 1);
    dispatch(loadAppointmentsAsync(dateUtils.toNormalizedString(date), () => {
      setLoadCount((count) => count - 1);
    }));
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
      <div className="h-full w-full overflow-hidden flex flex-col gap-6 px-3 sm:px-8 py-3 sm:py-6 relative">
        {loadCount ? (
          <LoadingBar />
        ) : null}
        <div className="w-full flex items-center justify-between">
          <div className="flex gap-0">
            <Heading1>My Appointments</Heading1>
            {updateRequestAttentionCount ? (
              <div
                className="w-5 h-5 rounded-full text-[0.6rem] text-red-800 bg-red-200 flex items-center justify-center cursor-default -translate-y-2"
                title={`${updateRequestAttentionCount} update requests need your attention!`}
              >
                <span>{updateRequestAttentionCount}</span>
              </div>
            ) : null}
          </div>
          <DatePicker2 initialDate={date} onChange={setDate} />
        </div>
        <div className="flex-1 overflow-x-auto">
          {appointments.length ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={ClassNames.th} aria-label="serial number" />
                  <th className={ClassNames.th}>Company</th>
                  <th className={ClassNames.th}>Service</th>
                  <th className={ClassNames.th}>Time</th>
                  <th className={ClassNames.th}>Price</th>
                  <th className={ClassNames.th}>Deposit</th>
                  <th className={ClassNames.th}>Balance</th>
                  <th className={`${ClassNames.th} control`} aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
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
