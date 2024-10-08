import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { SvgButton, colors, paths } from '../../components/svg';
import { useDialog } from '../../lib/Dialog';
import {
  respondToLiveAppointmentUpdateRequestAsync as companyUpdateResponse,
  deleteAppointmentUpdateRequestAsync as companyDeleteRequest,
} from '../../redux/companySlice';
import {
  fetchAppointmentAsync,
  respondToLiveAppointmentUpdateRequestAsync as userUpdateResponse,
  deleteAppointmentUpdateRequestAsync as userDeleteRequest,
  updateAppointmentTimeSlotAsync,
} from '../../redux/userSlice';
import { Ring } from '../../components/LoadingButton';
import AlertComponent from '../../components/AlertComponents';
import Modal from '../../components/Modal';
import { SlotsPanel } from '../Search/SearchPanel';
import {
  addressText,
  currencyHelper,
  rootSelector,
  toDuration,
} from '../../utils';

const ACCEPT = 'accept';
const CLOSE = 'close';
const DELETE = 'delete';
const NEW_SLOT = 'new_slot';
const REJECT = 'reject';

export const AppointmentAlert = ({
  type,
  appointment,
  onView,
  onClose,
}) => {
  const [sliderClass, setSliderClass] = useState(css.slider);
  const [dates, setDates] = useState({ current: '', previous: '' });
  const [heading, setHeading] = useState({ main: '', intro: '' });

  useEffect(() => {
    setSliderClass(`${css.slider} ${css.open}`);
  }, []);

  useEffect(() => {
    setDates({
      current: new Date(appointment.time).toLocaleString(),
      previous: new Date(appointment.previousTime).toLocaleString(),
    });
    setHeading(
      type === 'created'
        ? {
          main: 'New Appointment',
          intro: 'You have a new client appointment as detailed below.',
        }
        : {
          main: 'Appointment Update',
          intro: 'The following appointment has been updated as indicated.',
        },
    );
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setSliderClass(css.slider);
      setTimeout(onClose, 500);
    }
  }, []);

  return (
    <div className={css.container}>
      <div className={sliderClass}>
        <article className={css.panel}>
          <header className={css.header}>
            <h1 className={css.heading}>
              {heading.main}
            </h1>
            <SvgButton
              type="button"
              name={CLOSE}
              title="Close"
              color={colors.delete}
              path={paths.close}
              onClick={handleClick}
              sm
            />
          </header>
          <div className={css.body}>
            <p className={css.request_intro}>
              {heading.intro}
            </p>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Service</title>
                <path
                  fill="currentColor"
                  d={paths.roomService}
                />
              </svg>
              <span>{appointment.service}</span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Client</title>
                <path
                  fill="currentColor"
                  d={paths.account}
                />
              </svg>
              <span>{appointment.client}</span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>{type === 'updated' ? 'Current Time' : 'Time'}</title>
                <path
                  fill="currentColor"
                  d={paths.clock}
                />
              </svg>
              <span className={type === 'updated' ? css.with_label : ''} data-label="Current Time:">
                {dates.current}
              </span>
            </div>
            {type === 'updated' ? (
              <div className={css.appointment_row}>
                <svg viewBox="0 0 24 24">
                  <title>Previous Time</title>
                  <path
                    fill="currentColor"
                    d={paths.clock}
                  />
                </svg>
                <span className={css.with_label} data-label="Previous Time:">
                  {dates.previous}
                </span>
              </div>
            ) : null}
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Price</title>
                <path
                  fill="currentColor"
                  d={paths.dollarSign}
                />
              </svg>
              <span className={css.with_label} data-label="Price:">
                {appointment.price}
              </span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Deposit</title>
                <path
                  fill="currentColor"
                  d={paths.dollarSign}
                />
              </svg>
              <span className={css.with_label} data-label="Deposit:">
                {appointment.deposit}
              </span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Balance</title>
                <path
                  fill="currentColor"
                  d={paths.dollarSign}
                />
              </svg>
              <span className={css.with_label} data-label="Balance:">
                {appointment.balance}
              </span>
            </div>
            <button
              type="button"
              className={`link compact-link ${css.dashboard_btn}`}
              onClick={onView}
            >
              View In Your Dashboard
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

AppointmentAlert.propTypes = {
  type: PropTypes.string.isRequired,
  appointment: PropTypes.shape({
    id: PropTypes.number,
    client: PropTypes.string,
    time: PropTypes.string,
    previousTime: PropTypes.string,
    service: PropTypes.string,
    price: PropTypes.string,
    deposit: PropTypes.string,
    balance: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export const useAppointmentAlert = () => {
  const dialog = useDialog();

  return {
    show: (type, appointment, onView) => {
      let popup;
      const handleClose = () => popup.close();
      const handleView = () => {
        popup.close();
        onView();
      };

      popup = dialog.show(
        <AppointmentAlert
          appointment={appointment}
          type={type}
          onClose={handleClose}
          onView={handleView}
        />,
      );
    },
  };
};

export const AppointmentUpdateRequestAlert = ({ request, onClose }) => {
  const [busy, setBusy] = useState(false);
  const [sliderClass, setSliderClass] = useState(css.slider);
  const [date, setDate] = useState('');
  const dispatch = useDispatch();
  const [appointment, setAppointment] = useState(null);
  const [panelWidth, setPanelWidth] = useState(750);
  const [slotsModal, setSlotsModal] = useState({ open: false, busy: false });
  const {
    address,
    price,
    deposit,
    duration,
  } = useMemo(() => {
    if (!appointment) {
      return {
        address: '',
        price: '',
        deposit: '',
        duration: '',
      };
    }

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
  }, [appointment, request]);

  const close = useCallback(() => {
    setSliderClass(css.slider);
    setTimeout(onClose, 500);
  }, []);

  useEffect(() => {
    setSliderClass(`${css.slider} ${css.open}`);
    setDate(new Date(request.time).toLocaleString());
    if (window.location.pathname.indexOf('users') > -1) {
      dispatch(fetchAppointmentAsync(request.appointmentId, (err, appointment) => {
        if (!err) {
          setAppointment(appointment);
        }
      }));
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      close();
    } else if (name === REJECT) {
      setBusy(true);
      const data = {
        id: request.id,
        originator: request.originator,
        status: request.status,
        comment: request.comment,
        createdAt: request.createdAt,
        appointmentId: request.appointmentId,
      };
      const callback = (err) => {
        setBusy(false);
        if (!err) {
          close();
        }
      };

      dispatch(
        request.originator === 'client'
          ? companyUpdateResponse('rejected', data, callback)
          : userUpdateResponse('rejected', data, callback),
      );
    } else if (name === ACCEPT) {
      setBusy(true);
      const data = {
        id: request.id,
        originator: request.originator,
        status: request.status,
        comment: request.comment,
        createdAt: request.createdAt,
        appointmentId: request.appointmentId,
      };
      if (request.originator === 'client') {
        dispatch(companyUpdateResponse('accepted', data, (err) => {
          setBusy(false);
          if (!err) {
            close();
          }
        }));
        return;
      }
      setSlotsModal({ open: true, busy: false });
    }
  }, []);

  const handleUpdateAppointment = (slot) => {
    setSlotsModal({ open: true, busy: true });
    dispatch(updateAppointmentTimeSlotAsync(slot, request, appointment, (err) => {
      if (err) {
        setSlotsModal({ open: true, busy: false });
      } else {
        setSlotsModal({ open: false, busy: false });
        onClose();
      }
    }));
  };

  return (
    <div className={css.container}>
      <div className={sliderClass}>
        <article className={css.panel}>
          <header className={css.header}>
            <h1 className={`ellipsis ${css.heading}`}>
              Appointment Update Request
            </h1>
            <SvgButton
              type="button"
              name={CLOSE}
              title="Close"
              color={colors.delete}
              path={paths.close}
              onClick={handleClick}
              sm
            />
          </header>
          <div className={css.body}>
            <p className={css.request_intro}>
              {`You have a request from the ${request.originator === 'provider' ? 'service provider' : 'client'} to update the following appointment.`}
            </p>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>service</title>
                <path
                  fill="currentColor"
                  d={paths.roomService}
                />
              </svg>
              <span>{request.service}</span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>
                  {request.originator === 'client' ? 'client' : 'service provider'}
                </title>
                <path
                  fill="currentColor"
                  d={request.originator === 'client' ? paths.account : paths.domain}
                />
              </svg>
              <span>{request.name}</span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>time</title>
                <path
                  fill="currentColor"
                  d={paths.clock}
                />
              </svg>
              <span>{date}</span>
            </div>
            <div className={css.comment_panel}>
              <span className={css.label}>Comment</span>
              <span>
                {request.comment || 'No Comment'}
              </span>
            </div>
            {request.originator === 'provider' ? null : (
              <p className={css.consent_text}>
                If you approve this request, the user will be allowed to choose
                a different timeslot for the appointment.
              </p>
            )}
            <div className="form-controls">
              {busy ? (
                <Ring size={18} color="#00416a" />
              ) : (
                <>
                  <button
                    type="button"
                    name={ACCEPT}
                    className="control-btn"
                    onClick={handleClick}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    name={REJECT}
                    className="control-btn cancel"
                    onClick={handleClick}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </article>
      </div>
      {appointment ? (
        <Modal
          isOpen={slotsModal.open || slotsModal.busy}
          parentSelector={rootSelector}
          onRequestClose={() => {
            if (!slotsModal.busy) {
              setSlotsModal({ busy: false, isOpen: false });
            }
          }}
          style={{
            content: { maxWidth: panelWidth },
            overlay: { zIndex: 1000009 },
          }}
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
    </div>
  );
};

AppointmentUpdateRequestAlert.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.number,
    appointmentId: PropTypes.number,
    service: PropTypes.string,
    name: PropTypes.string,
    time: PropTypes.string,
    originator: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    comment: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export const useAppointmentUpdateRequestAlert = () => {
  const dialog = useDialog();

  return {
    show: (request) => {
      let popup;
      const handleClose = () => popup.close();

      popup = dialog.show(
        <AppointmentUpdateRequestAlert
          request={request}
          onClose={handleClose}
        />,
      );
    },
  };
};

export const AppointmentUpdateResponseAlert = ({ request, onClose }) => {
  const [busy, setBusy] = useState(false);
  const [sliderClass, setSliderClass] = useState(css.slider);
  const [date, setDate] = useState('');
  const dispatch = useDispatch();
  const [appointment, setAppointment] = useState(null);
  const [panelWidth, setPanelWidth] = useState(750);
  const [slotsModal, setSlotsModal] = useState({ open: false, busy: false });
  const {
    address,
    price,
    deposit,
    duration,
  } = useMemo(() => {
    if (!appointment) {
      return {
        address: '',
        price: '',
        deposit: '',
        duration: '',
      };
    }

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
  }, [appointment]);

  const close = useCallback(() => {
    setSliderClass(css.slider);
    setTimeout(onClose, 500);
  }, []);

  useEffect(() => {
    setSliderClass(`${css.slider} ${css.open}`);
    setDate(new Date(request.time).toLocaleString());
    if (window.location.pathname.indexOf('users') > -1) {
      dispatch(fetchAppointmentAsync(request.appointmentId, (err, appointment) => {
        if (!err) {
          setAppointment(appointment);
        }
      }));
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      close();
    } else if (name === NEW_SLOT) {
      setSlotsModal({ open: true, busy: false });
    } else if (name === DELETE) {
      const callback = (err) => {
        setBusy(false);
        if (!err) {
          setSliderClass(css.slider);
          setTimeout(onClose, 500);
        }
      };

      if (request.originator === 'provider') {
        setBusy(true);
        dispatch(companyDeleteRequest(request, request.appointmentId, callback));
      } else if (request.originator === 'client') {
        setBusy(true);
        dispatch(userDeleteRequest(request, request.appointmentId, callback));
      }
    }
  }, []);

  const handleUpdateAppointment = (slot) => {
    setSlotsModal({ open: true, busy: true });
    dispatch(updateAppointmentTimeSlotAsync(slot, request, appointment, (err) => {
      if (err) {
        setSlotsModal({ open: true, busy: false });
      } else {
        setSlotsModal({ open: false, busy: false });
        onClose();
      }
    }));
  };

  return (
    <div className={css.container}>
      <div className={sliderClass}>
        <article className={css.panel}>
          <header className={css.header}>
            <h1 className={`ellipsis ${css.heading}`}>
              Appointment Update Response
            </h1>
            <SvgButton
              type="button"
              name={CLOSE}
              title="Close"
              color={colors.delete}
              path={paths.close}
              onClick={handleClick}
              sm
            />
          </header>
          <div className={css.body}>
            <p className={css.request_intro}>
              The status of your request to change the time of the appointment
              with details below has been updated as shown
            </p>
            <AlertComponent
              type={request.status === 'accepted' ? 'success' : 'error'}
              message={`Status: ${request.status}`}
              style={{ textAlign: 'left' }}
            />
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Service</title>
                <path
                  fill="currentColor"
                  d={paths.roomService}
                />
              </svg>
              <span>{request.service}</span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>
                  {request.originator === 'client' ? 'Client' : 'Service Provider'}
                </title>
                <path
                  fill="currentColor"
                  d={request.originator === 'client' ? paths.account : paths.domain}
                />
              </svg>
              <span>{request.name}</span>
            </div>
            <div className={css.appointment_row}>
              <svg viewBox="0 0 24 24">
                <title>Time</title>
                <path
                  fill="currentColor"
                  d={paths.clock}
                />
              </svg>
              <span>{date}</span>
            </div>
            <div className={css.comment_panel}>
              <span className={css.label}>Comment</span>
              <span>
                {request.comment || 'No Comment'}
              </span>
            </div>
            {request.originator === 'client' && request.status === 'accepted' ? (
              <div className="form-controls">
                {busy ? (
                  <Ring size={18} color="#00416a" />
                ) : (
                  <button
                    type="button"
                    name={NEW_SLOT}
                    className="control-btn"
                    onClick={handleClick}
                  >
                    Choose New Time Slot
                  </button>
                )}
              </div>
            ) : null}
            {request.status === 'rejected' ? (
              <div className="form-controls">
                {busy ? (
                  <Ring size={18} color="#00416a" />
                ) : (
                  <button
                    type="button"
                    name={DELETE}
                    className="control-btn cancel"
                    onClick={handleClick}
                  >
                    Delete Request
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </article>
        {appointment ? (
          <Modal
            isOpen={slotsModal.open || slotsModal.busy}
            parentSelector={rootSelector}
            onRequestClose={() => {
              if (!slotsModal.busy) {
                setSlotsModal({ busy: false, isOpen: false });
              }
            }}
            style={{
              content: { maxWidth: panelWidth },
              overlay: { zIndex: 1000009 },
            }}
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
      </div>
    </div>
  );
};

AppointmentUpdateResponseAlert.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.number,
    appointmentId: PropTypes.number,
    service: PropTypes.string,
    name: PropTypes.string,
    time: PropTypes.string,
    originator: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    comment: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export const useAppointmentUpdateResponseAlert = () => {
  const dialog = useDialog();

  return {
    show: (request) => {
      let popup;
      const handleClose = () => popup.close();

      popup = dialog.show(
        <AppointmentUpdateResponseAlert
          request={request}
          onClose={handleClose}
        />,
      );
    },
  };
};
