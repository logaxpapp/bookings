import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router';
import {
  Element,
  loadStripe,
  PaymentElement,
  useElements,
  useStripe,
} from '../../../components/stripe';
import BlankPage from '../../../components/BlankPage';
import { updateResource } from '../../../api';
import { useNotification } from '../../../lib/Notification';
import { Loader } from '../../../components/LoadingSpinner';
import AlertComponent from '../../../components/AlertComponents';
import { Ring } from '../../../components/LoadingButton';
import routes from '../../../routing/routes';
import stripeHelpers from './helpers';
import WindowCloseCounter from '../../../components/WindowCloseCounter';

/* eslint-disable no-nested-ternary */

const styles = {
  container: {
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
  },
  timerPanel: {
    padding: 12,
  },
  connecting: {
    padding: 4,
    backgroundColor: '#efefef',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  requestConnectPanel: {
    padding: 4,
  },
  pre: {
    whiteSpace: 'pre-wrap',
  },
  companyPanel: {
    display: 'flex',
    gap: 4,
    width: '100%',
    backgroundColor: '#dfdfdf',
    padding: '8px 16px',
  },
  pictureWrap: {
    width: 60,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  picture: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  companyDetails: {
    minHeight: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  companyName: {
    fontSize: '0.9rem',
  },
  companyAddress: {
    fontSize: '0.7rem',
    opacity: 0.7,
  },
};

const requestParams = stripeHelpers.getRequestParams(
  window.location.pathname.split('/').pop(),
  'deposit',
);

const stripePromise = loadStripe(requestParams.publishableKey, {
  stripeAccount: requestParams.connectedAccountId,
});

const options = { clientSecret: requestParams.clientSecret, appearance: {} };

const StripeDepositPaymentWindow = () => {
  const [busy, setBusy] = useState(true);
  const [state, setState] = useState({
    errror: '',
    completed: false,
    server: {
      error: false,
      info: '',
      connecting: false,
      requestConnect: false,
    },
    stripeError: null,
    counter: false,
    reportError: false,
  });
  const stripe = useStripe();
  const elements = useElements();
  const notification = useNotification();
  const { intent_id: intentId } = useParams();
  const includeError = useRef(false);

  const reportError = useCallback((message, startTimer = false) => {
    setState((state) => ({
      ...state,
      errror: message,
      counter: startTimer,
    }));
    setBusy(false);
  }, []);

  useEffect(() => {
    if (requestParams.hasError) {
      let msg = 'Application encountered an unrecoverable error while performing task.\nWe are sorry for any inconvenience this failure will cause you.';
      if (requestParams.ticketId) {
        msg = `${msg}\n\nPlease use the below code if you will like to open a ticket with us on the transaction.\n\nTransaction ID: ${requestParams.ticketId}`;
      }

      if (requestParams.token) {
        updateResource(
          requestParams.token,
          `payments/${intentId}?type=deposit`,
          {
            provider: 'stripe',
            failed: true,
            broadcast: true,
            requested_by: 'customer',
          },
          true,
        )
          .then(() => reportError(msg, true))
          .catch(() => reportError(msg, true));
      } else {
        reportError(msg, true);
      }
    } else {
      setBusy(false);
    }
  }, []);

  const updateServer = useCallback(() => {
    setState((state) => ({
      ...state,
      reportError: false,
      server: { ...state.server, connecting: true },
    }));

    const data = {
      provider: 'stripe',
      broadcast: true,
    };

    if (includeError.current) {
      data.error = JSON.stringify(state.stripeError);
      includeError.current = false;
    }

    updateResource(requestParams.token, `payments/${intentId}?type=deposit`, data, true)
      .then(({ status, stripeStatus }) => {
        if (status === 'pending') {
          setState((state) => ({
            ...state,
            server: {
              ...state.server,
              connecting: false,
              requestConnect: true,
              error: false,
              info: `The Stripe reported status [(${stripeStatus})] of this session means that we cannot take any actions at the moment. Please click the link below, if you think the reported error was a mistake. If you will like to open a ticket with us on this section, please use the code below.\n\nTransaction ID: ${requestParams.ticketId}`,
            },
          }));
        } else if (status === 'completed') {
          setState((state) => ({
            ...state,
            server: {
              ...state.server,
              connecting: false,
              error: false,
              info: `Stripe has updated the status of this session as ${stripeStatus}, though they initially reported the error above. Please note that while we will book this appointment, it will be cancelled if the status changes again. If you want to open a ticket with us on this session, please use the code below.\n\nTransaction ID: ${requestParams.ticketId}`,
            },
            counter: true,
          }));
        } else {
          setState((state) => ({
            ...state,
            server: {
              ...state.server,
              connecting: false,
              error: true,
              info: `Stripe has updated the status of this session as ${stripeStatus}, therefore we are marking it as failed. If you want to open a ticket with us on this session, please use the code below.\n\nTransaction ID: ${requestParams.ticketId}`,
            },
            counter: true,
          }));
        }
      })
      .catch(({ message }) => {
        notification.showError(message);
        setState((state) => ({
          ...state,
          server: {
            ...state.server,
            connecting: false,
            error: true,
            info: 'Error connecting with server',
            requestConnect: true,
          },
        }));
      });
  }, [state.stripeError, setState]);

  useEffect(() => {
    if (state.reportError) {
      updateServer();
    }
  }, [state.reportError, updateServer]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (requestParams.hasError) {
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.protocol}//${window.location.host}${routes.stripe.deposits.return(intentId)}`,
      },
    });

    if (error) {
      includeError.current = true;
      setState((state) => ({
        ...state,
        stripeError: error,
        reportError: true,
        errror: error.message,
      }));
    } else {
      setState((state) => ({
        ...state,
        completed: true,
        server: {
          ...state.server,
          info: 'Your payment is being processed by Stripe. We will contact you with the appointment status once the process is finalized. Please wait while Stripe redirects you.',
        },
      }));
    }
  }, [updateServer, setState, stripe, elements]);

  return (
    <BlankPage>
      <div style={styles.container}>
        {busy ? (
          <Loader type="double_ring" color="transparent" />
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
              {state.errror ? (
                <AlertComponent type="error" style={{ maxHeight: 60 }}>
                  <pre style={styles.pre}>
                    {state.errror}
                  </pre>
                </AlertComponent>
              ) : null}
              {state.server.info ? (
                <AlertComponent
                  type={state.server.error ? 'error' : 'info'}
                  style={{ maxHeight: 60 }}
                >
                  <pre style={styles.pre}>
                    {state.server.info}
                  </pre>
                </AlertComponent>
              ) : null}
              {state.server.connecting ? (
                <div style={styles.connecting}>
                  <Ring color="blue" size={16} />
                  <span>Connecting To Server ...</span>
                </div>
              ) : (
                <>
                  {state.server.requestConnect ? (
                    <div style={styles.requestConnectPanel}>
                      <span style={{ whiteSpace: 'pre-wrap' }}>
                        Session requires further confirmation. Please&nbsp;
                      </span>
                      <button
                        type="button"
                        className="link compact-link"
                        style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}
                        onClick={updateServer}
                      >
                        click here
                      </button>
                      <span style={{ whiteSpace: 'pre-wrap' }}>
                        &nbsp;to recheck the status of this session.
                      </span>
                    </div>
                  ) : null}
                </>
              )}
              {state.counter ? (
                <WindowCloseCounter />
              ) : null}
              <Element stripe={stripePromise} options={options}>
                <form onSubmit={handleSubmit}>
                  <PaymentElement />
                  <div className="form-controls pad-top">
                    <button type="submit" className="control-btn">
                      Submit
                    </button>
                  </div>
                </form>
              </Element>
            </div>
          </div>
        )}
      </div>
    </BlankPage>
  );
};

/* eslint-enable no-nested-ternary */

export default StripeDepositPaymentWindow;
