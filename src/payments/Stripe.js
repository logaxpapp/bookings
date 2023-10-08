import { postResource, updateResource } from '../api';
import { notification } from '../lib/Notification';
import { windowUtils } from '../utils';
import routes from '../routing/routes';
import config from '../config';
import AppStorage from '../utils/appStorage';

const storage = AppStorage.getInstance();

const callbacks = Object.create(null);

const respond = (id, err, data) => {
  const callback = callbacks[id];
  if (callback) {
    try {
      callback(err, data);
    } catch {
      //  No action required!
    }
    delete callbacks[id];
  }
};

const createIntent = (
  id,
  token,
  type,
  channel,
  data,
  extraPopupData,
  popupRouteProvider,
  onConnect,
  onResponse,
  deleteCallbackOnConnect,
) => {
  const oldCallback = callbacks[id];
  callbacks[id] = onResponse;
  if (oldCallback) {
    return;
  }

  postResource(token, `payments?type=${type}`, { ...data, provider: 'stripe' }, true)
    .then((response) => {
      if (deleteCallbackOnConnect) {
        delete callbacks[id];
      }

      onConnect();

      const { connection, intentId } = response;

      let ws;
      let interval;
      let responded = false;

      const handleServerResponse = ({ status }) => {
        if (status === 'pending' || responded) {
          return;
        }

        responded = true;
        clearInterval(interval);
        if (ws) {
          try {
            ws.close();
          } catch {
            // No action required!
          }
        }

        if (response.status === 'failed') {
          respond(id, new Error('Payment was not successful'));
        } else {
          respond(id);
        }
      };

      const openWs = () => {
        ws = new WebSocket(`${config.API_HOST.replace('http', 'ws')}/cable?id=${connection}`);

        ws.onopen = () => {
          const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
              channel,
              id: response.intentId,
              token: token || response.token,
            }),
          };
          ws.send(JSON.stringify(msg));
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
            openWs();
            return;
          }
          if (!identifier) {
            return;
          }

          if (message) {
            handleServerResponse(message);
          }
        };
      };

      openWs();

      //  In addition to waiting for websocket communication,
      //  We check payment status every 2 minutes
      //  TODO: There should be a maximum number of times to check before marking this as failed
      interval = setInterval(() => {
        const params = { provider: 'stripe' };
        if (type === 'deposit') {
          params.requested_by = 'customer';
        }
        updateResource(token || response.token, `payments/${intentId}?type=${type}`, params, true)
          .then((res) => handleServerResponse(res))
          .catch(() => {});
      }, 120000);

      storage.set(`${type}_payment_intent_${intentId}`, JSON.stringify({
        ...response, ...extraPopupData, token,
      }));

      windowUtils.open(popupRouteProvider(intentId));
    })
    .catch((err) => {
      notification.showError(err.message);
      respond(id, err);
    });
};

const deposit = (
  token,
  slotId,
  data,
  companyDetails,
  onConnect,
  onResponse,
) => createIntent(
  `slots_${slotId}`,
  token,
  'deposit',
  'DepositChannel',
  { ...data, slot_id: slotId },
  companyDetails,
  routes.stripe.deposits.elementHost,
  onConnect,
  onResponse,
);

const subscribe = (
  id,
  token,
  onConnect,
  onResponse,
) => createIntent(
  `subscription_${id}`,
  token,
  'subscription',
  'SubscriptionPaymentChannel',
  {},
  {},
  routes.stripe.subscriptions.elementHost,
  onConnect,
  onResponse,
  true,
);

const Stripe = {
  deposit,
  subscribe,
};

export default Stripe;
