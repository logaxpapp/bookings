import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Navigate,
  useLocation,
} from 'react-router';
import PropTypes from 'prop-types';
import UserLayout from './UserLayout';
import { appointmentProps, userProps } from '../../utils/propTypes';
import {
  closeAppointmentMessage,
  fetchUserAsync,
  selectOpenMessages,
  selectUser,
  sendAppointmentMessageAsync,
} from '../../redux/userSlice';
import AppStorage from '../../utils/appStorage';
import routes from '../../routing/routes';
import BlankPageContainer from '../../components/BlankPageContainer';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessagePanel from '../../components/MessagePanel';
import WebSocketManager from './WebSockManager';

const storage = AppStorage.getInstance();

/**
 * @param {Object} props
 * @param {import('../../types').Appointment} props.appointment
 * @returns
 */
const UserMessagePanel = ({ appointment, onClose }) => {
  const [title, setTitle] = useState('');
  const [rider, setRider] = useState('');
  const [messages, setMessages] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle(appointment.timeSlot.service.company.name);
    setRider(`Service: ${appointment.timeSlot.service.name}`);
    setMessages(appointment.messages.map((msg) => ({
      id: msg.id,
      senderName: msg.senderType,
      content: msg.content,
    })));
  }, [appointment]);

  const handleSubmit = useCallback((content) => dispatch(sendAppointmentMessageAsync(
    appointment,
    { content },
  )), [appointment]);

  const handleClose = useCallback(() => {
    onClose(appointment);
  }, [appointment]);

  return (
    <MessagePanel
      messages={messages}
      title={title}
      rider={rider}
      username="User"
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};

UserMessagePanel.propTypes = {
  appointment: appointmentProps.isRequired,
  onClose: PropTypes.func.isRequired,
};

const RestrictedUserPage = ({ user }) => {
  const openMessages = useSelector(selectOpenMessages);
  const dispatch = useDispatch();

  const handleCloseMessages = (appointment) => {
    dispatch(closeAppointmentMessage(appointment));
  };

  return (
    <div>
      <UserLayout user={user} />
      {openMessages.length ? (
        <div className="fixed left-0 top-0 w-full h-screen flex items-end justify-end gap-2 p-1 pointer-events-none z-9">
          {openMessages.map((appointment) => (
            <UserMessagePanel
              key={appointment.id}
              appointment={appointment}
              onClose={handleCloseMessages}
            />
          ))}
        </div>
      ) : null}
      <WebSocketManager />
    </div>
  );
};

RestrictedUserPage.propTypes = {
  user: userProps.isRequired,
};

const User = () => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const [state, setState] = useState({ loading: false, error: '' });
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      return;
    }

    const token = storage.getUserToken();
    if (token) {
      setState({ loading: true, error: '' });
      dispatch(fetchUserAsync(token, (err) => {
        setState({ loading: false, error: err });
      }));
    } else {
      setState({ loading: false, error: 'No Token Found' });
    }
  }, []);

  if (state.loading) {
    return (
      <BlankPageContainer>
        <LoadingSpinner>
          <span>Loading ...</span>
        </LoadingSpinner>
      </BlankPageContainer>
    );
  }

  if (!user) {
    if (state.error) {
      return (
        <Navigate
          to={routes.user.login}
          state={{ referrer: location.pathname }}
          replace
        />
      );
    }

    return null;
  }

  return <RestrictedUserPage user={user} />;
};

export default User;
