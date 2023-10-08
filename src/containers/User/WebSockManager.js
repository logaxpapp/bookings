import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addAppointmentUpdateRequest,
  openAppointmentMessage,
  selectUser,
  sendAppointmentMessageReplyAsync,
  updateAppointmentUpdateRequest,
} from '../../redux/userSlice';
import { useNotification } from '../../lib/Notification';
import config from '../../config';
import { useMessageAlert } from '../MessageAlert';
import {
  useAppointmentUpdateRequestAlert,
  useAppointmentUpdateResponseAlert,
} from '../AppointmentAlert';

const WebSocketManager = () => {
  const user = useSelector(selectUser);
  const connected = useRef(false);
  const notification = useNotification();
  const messageAlert = useMessageAlert();
  const updateRequestAlert = useAppointmentUpdateRequestAlert();
  const updateResponseAlert = useAppointmentUpdateResponseAlert();
  const dispatch = useDispatch();

  const handleDataReceived = useCallback((data, channel) => {
    if (!data) {
      return;
    }

    if (channel === 'message') {
      if (data.referenceType === 'Appointment') {
        dispatch(openAppointmentMessage(data, (open) => {
          if (!open) {
            messageAlert.show(
              data.content,
              `New message from ${data.from}`,
              (data, callback) => dispatch(
                sendAppointmentMessageReplyAsync(data.referenceId, data, callback),
              ),
            );
          }
        }));
      }
    } else if (channel === 'appointment') {
      if (data.type === 'update request') {
        dispatch(addAppointmentUpdateRequest(data));
        updateRequestAlert.show(data);
      } else if (data.type === 'update request response') {
        dispatch(updateAppointmentUpdateRequest(data));
        updateResponseAlert.show(data);
      }
    }
  }, []);

  const openWs = useCallback(() => {
    if (connected.current) {
      return;
    }

    if (user) {
      connected.current = true;
      const ws = new WebSocket(`${config.API_HOST.replace('http', 'ws')}/cable?id=${user.id}`);

      ws.onopen = () => {
        const messageSubscriptionData = {
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: 'MessageChannel',
            type: 'User',
            id: user.id,
            token: user.token,
          }),
        };
        ws.send(JSON.stringify(messageSubscriptionData));
        const appointmentSubscriptionData = {
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: 'AppointmentChannel',
            type: 'User',
            id: user.id,
            token: user.token,
          }),
        };
        ws.send(JSON.stringify(appointmentSubscriptionData));
      };
      ws.onerror = (err) => notification.showError(err.message);
      ws.onmessage = ({ data }) => {
        const {
          type,
          message,
          identifier,
        } = JSON.parse(data);
        if (type === 'ping') {
          return;
        }
        if (type === 'disconnect') {
          connected.current = false;
          openWs();
          return;
        }
        if (!identifier) {
          return;
        }

        const { channel } = JSON.parse(identifier);

        if (channel === 'MessageChannel') {
          handleDataReceived(message, 'message');
        } else if (channel === 'AppointmentChannel') {
          handleDataReceived(message, 'appointment');
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (user && !connected.current) {
      openWs();
    }
  }, [user, handleDataReceived]);

  return null;
};

export default WebSocketManager;
