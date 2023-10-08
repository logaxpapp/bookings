import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { updateResource } from '../../../api';
import stripeHelpers from './helpers';
import BlankPage from '../../../components/BlankPage';
import { Loader } from '../../../components/LoadingSpinner';
import AlertComponent from '../../../components/AlertComponents';
import WindowCloseCounter from '../../../components/WindowCloseCounter';
import { useNotification } from '../../../lib/Notification';

const styles = {
  container: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 24,
  },
  outer: {
    width: '100%',
    maxWidth: '480px',
  },
  inner: {
    backgroundColor: '#fff',
    width: '100%',
    padding: '8px 16px',
    borderRadius: '0 0 8px 8px',
  },
  timerPanel: {
    padding: 12,
  },
  pre: {
    whiteSpace: 'pre-wrap',
  },
  companyPanel: {
    display: 'flex',
    gap: 4,
    width: '100%',
    backgroundColor: '#d0dee8',
    padding: '8px 16px',
    borderRadius: '8px 8px 0 0',
  },
  pictureWrap: {
    width: 60,
    height: 60,
    backgroundColor: '#000',
  },
  picture: {
    width: '100%',
    height: '100%',
  },
  companyDetails: {
    minHeight: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  companyName: {
    fontSize: '0.9rem',
  },
  companyAddress: {
    fontSize: '0.7rem',
    opacity: 0.7,
  },
};

const requestParams = (() => {
  const parts = window.location.pathname.split('/');
  return stripeHelpers.getRequestParams(parts[parts.length - 2], 'deposit');
})();

const updateGuard = (() => {
  let updating = false;

  return {
    isUpdating: () => updating,
    setUpdating: (value) => {
      updating = value;
    },
  };
})();

const StripeDepositReturnWindow = () => {
  const [busy, setBusy] = useState(true);
  const [state, setState] = useState({
    type: 'info',
    text: '',
    counter: 0,
  });
  const notification = useNotification();
  const { intent_id: intentId } = useParams();

  const updateServer = useCallback(() => {
    setBusy(true);
    updateResource(requestParams.token, `payments/${intentId}?type=deposit`, {
      provider: 'stripe',
      broadcast: true,
      requested_by: 'customer',
    }, true)
      .then(({ status, stripeStatus }) => {
        if (status === 'pending') {
          setState({
            counter: 20,
            type: 'info',
            text: `The Stripe reported status [(${stripeStatus})] of this session means that we cannot take any actions at the moment. We will update your appointment status as soon as this status changes. If you want to open a ticket with us on this session, please use the code below.\n\nTransaction ID: ${requestParams.ticketId}`,
          });
        } else if (status === 'successful') {
          setState({
            type: 'success',
            counter: 10,
            text: 'Your appointment was successfully booked. Thanks for choosing LogaXP.',
          });
        } else {
          setState({
            type: 'error',
            counter: 10,
            text: `Stripe has updated the status of this session to ${stripeStatus}, therefore we are marking it as failed also. If you want to open a ticket with us on this session, please use the code below.\n\nTransaction ID: ${requestParams.ticketId}`,
          });
        }

        setBusy(false);
      })
      .catch(({ message }) => {
        notification.showError(message);
        setState({
          type: 'error',
          text: 'Error connecting with server',
          counter: 0,
        });
        setBusy(false);
      });
  }, [state.stripeError, setState, setBusy]);

  useEffect(() => {
    if (!updateGuard.isUpdating()) {
      updateGuard.setUpdating(true);
      updateServer();
    }
  }, []);

  return (
    <BlankPage>
      <div style={styles.container}>
        {busy ? (
          <Loader type="double_ring" color="transparent">
            <span style={{ color: 'var(--color-accent)' }}>Connecting to server ...</span>
          </Loader>
        ) : (
          <div style={styles.outer}>
            <article style={styles.companyPanel}>
              <div style={styles.pictureWrap}>
                <img
                  alt={requestParams.companyName}
                  src={requestParams.companyProfilePicture}
                  style={styles.picture}
                />
              </div>
              <div style={styles.companyDetails}>
                <span style={styles.companyName}>{requestParams.companyName}</span>
                <span style={styles.companyAddress}>{requestParams.companyAddress}</span>
              </div>
            </article>
            <div style={styles.inner}>
              <AlertComponent type={state.type}>
                <pre style={styles.pre}>{state.text}</pre>
              </AlertComponent>
              {state.counter ? (
                <WindowCloseCounter duration={state.counter} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </BlankPage>
  );
};

export default StripeDepositReturnWindow;
