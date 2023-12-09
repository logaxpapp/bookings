import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  loadAppointmentsAsync,
  openAppointmentMessage,
  selectCompany,
  selectToken,
  sendAppointmentMessageReplyAsync,
  updateAppointmentUpdateRequest,
} from '../../redux/companySlice';
import config from '../../config';
import { useMessageAlert } from '../MessageAlert';
import {
  useAppointmentAlert,
  useAppointmentUpdateRequestAlert,
  useAppointmentUpdateResponseAlert,
} from '../AppointmentAlert';
import { dateUtils, notification } from '../../utils';
import routes from '../../routing/routes';
import { addAppointmentUpdateRequest } from '../../redux/userSlice';

const WebSocketManager = () => {
  const company = useSelector(selectCompany);
  const token = useSelector(selectToken);
  const connected = useRef(false);
  const messageAlert = useMessageAlert();
  const appointmentAlert = useAppointmentAlert();
  const updateRequestAlert = useAppointmentUpdateRequestAlert();
  const updateResponseAlert = useAppointmentUpdateResponseAlert();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      if (data.type === 'created' || data.type === 'updated') {
        const date = dateUtils.toNormalizedString(data.time);
        dispatch(loadAppointmentsAsync(date, () => {}, true));

        appointmentAlert.show(data.type, data, () => {
          navigate(routes.company.absolute.dashboard, { state: { date } });
        });
      } else if (data.type === 'update request') {
        dispatch(addAppointmentUpdateRequest);
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

    if (company) {
      connected.current = true;
      const ws = new WebSocket(`${config.API_HOST.replace('http', 'ws')}/cable?id=${company.id}`);

      ws.onopen = () => {
        const messageSubscriptionData = {
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: 'MessageChannel',
            type: 'Company',
            id: company.id,
            token,
          }),
        };
        ws.send(JSON.stringify(messageSubscriptionData));

        const appointmentSubscriptionData = {
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: 'AppointmentChannel',
            type: 'Company',
            id: company.id,
            token,
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
        if (type === 'ping' || type === 'welcome') {
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
  }, [company, token, handleDataReceived]);

  useEffect(() => {
    if (company && !connected.current) {
      openWs();
    }
  }, [company, token, handleDataReceived]);

  return null;
};

export default WebSocketManager;
