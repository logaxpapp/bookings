import { postResource, updateResource } from '../api';
import { notification } from '../lib/Notification';
import { windowUtils } from '.';
import routes from '../routing/routes';
import AppStorage from './appStorage';
import config from '../config';

const storage = AppStorage.getInstance();

export const handleStripeDeposit = (() => {
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

  return (token, data, slotId, companyDetails, onConnect, onResponse) => {
    const oldCallback = callbacks[slotId];
    callbacks[slotId] = onResponse;
    if (oldCallback) {
      return;
    }

    postResource(token, 'payments?type=deposit', {
      ...data,
      provider: 'stripe',
      slot_id: slotId,
    }, true)
      .then(({
        publishableKey,
        clientSecret,
        connectedAccountId,
        intentId,
        connection,
        token,
        ticketId,
      }) => {
        onConnect();

        const ws = new WebSocket(`${config.API_HOST.replace('http', 'ws')}/cable?id=${connection}`);
        let interval;
        let responded = false;

        const handleServerResponse = (response) => {
          if (response.status === 'pending' || responded) {
            return;
          }

          responded = true;
          clearInterval(interval);
          try {
            ws.close();
          } catch {
            // No action required!
          }

          if (response.status === 'failed') {
            respond(slotId, new Error('Payment was not successful'));
          } else {
            respond(slotId);
          }
        };

        ws.onopen = () => {
          const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'DepositChannel',
              id: intentId,
            }),
          };
          ws.send(JSON.stringify(msg));
        };
        ws.onerror = (err) => notification.showError(err.message);
        ws.onmessage = ({ data }) => {
          const { type, message } = JSON.parse(data);
          if (type === 'ping') {
            return;
          }

          if (message) {
            handleServerResponse(message);
          }
        };

        //  In addition to waiting for websocket communication,
        //  We check payment status every 2 minutes
        //  TODO: There should be a maximum number of times to check before marking this as failed
        interval = setInterval(() => {
          updateResource(token, `payments/${intentId}?type=deposit`, {
            provider: 'stripe',
            requested_by: 'customer',
          }, true)
            .then((res) => handleServerResponse(res))
            .catch(() => {});
        }, 120000);

        storage.set(`deposit_payment_intent_${intentId}`, JSON.stringify({
          publishableKey,
          clientSecret,
          connectedAccountId,
          token,
          ticketId,
          companyName: companyDetails.name,
          companyAddress: companyDetails.address,
          companyProfilePicture: companyDetails.profilePicture,
        }));

        windowUtils.open(routes.stripe.deposits.elementHost(intentId));
      })
      .catch((err) => {
        notification.showError(err.message);
        respond(slotId, err);
      });
  };
})();

export const getPaymentHandler = (provider, type) => {
  if (provider === 'stripe') {
    if (type === 'deposit') {
      return handleStripeDeposit;
    }
  }

  return null;
};
