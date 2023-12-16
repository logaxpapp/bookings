import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchResources, postResource, updateResource } from '../api';
import { dialog } from '../lib/Dialog';
import SlideDialog from '../components/SlideInDialog';
import LoadingButton from '../components/LoadingButton';
import TextBox from '../components/TextBox';
import { SvgButton, colors, paths } from '../components/svg';
import config from '../config';
import { notification, windowUtils } from '../utils';
import AppStorage from '../utils/appStorage';
import { paystackStorageHelpers, usePaystackStoredParams } from './helpers';
import BlankPage from '../components/BlankPage';
import { Loader } from '../components/LoadingSpinner';
import AlertComponent from '../components/AlertComponents';
import WindowCloseCounter from '../components/WindowCloseCounter';

const storage = AppStorage.getInstance();

const ACCOUNT_NUMBER = 'account_number';
const BANK_CODE = 'bank_code';
const CLOSE = 'close';

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
  linkBtn: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    textDecoration: 'underline',
  },
};

let paystackBanks = null;

const BankAccountForm = ({ banks, onCancel, onSubmit }) => {
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => setOpen(true));

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === BANK_CODE) {
      setBankCode(value);
    } else if (name === ACCOUNT_NUMBER) {
      setAccountNumber(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setOpen(false);
      setTimeout(onCancel, 500);
    }
  }, [onCancel, setOpen]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!bankCode) {
      notification.showError('Please select a bank!');
      return;
    }

    if (!(accountNumber && accountNumber.length === 10)) {
      notification.showError('Please enter a valid account number');
      return;
    }

    setBusy(true);

    onSubmit(accountNumber, bankCode, (err) => {
      setBusy(false);
      if (!err) {
        setOpen(false);
        setTimeout(onCancel, 500);
      }
    });
  }, [bankCode, accountNumber, onCancel, onSubmit, onCancel, setBusy]);

  return (
    <SlideDialog isIn={isOpen}>
      <section style={{ width: '100%', maxWidth: 320, padding: 24 }}>
        <header>
          <h1 style={{ fontSize: '0.9rem', marginBottom: 0 }}>
            Setup Paystack Account
          </h1>
          <div
            style={{
              textAlign: 'center',
              padding: '16px 4px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            Your Account number is used by Paystack for your payouts.
          </div>
        </header>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
              Bank
            </div>
            <div className="select">
              <select name={BANK_CODE} value={bankCode} onChange={handleValueChange}>
                <option value="" disabled>-- Select Bank --</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </div>
          </div>
          <TextBox
            name={ACCOUNT_NUMBER}
            id={ACCOUNT_NUMBER}
            value={accountNumber}
            label="Account Number"
            onChange={handleValueChange}
            style={{
              border: '1px solid #ceebd8',
            }}
            containerStyle={{ marginBottom: 0 }}
            hideErrorOnNull
          />
          <LoadingButton
            type="submit"
            loading={busy}
            label="Create Account"
            styles={{ fontSize: '0.8rem', marginTop: 8 }}
          />
        </form>
        <SvgButton
          type="button"
          name={CLOSE}
          title="Close"
          color={colors.delete}
          path={paths.close}
          onClick={handleClick}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
          }}
        />
      </section>
    </SlideDialog>
  );
};

BankAccountForm.propTypes = {
  banks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    code: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const updateWithGuard = (() => {
  let lCallback;
  let updating = false;
  return (token, type, intentId, callback) => {
    lCallback = callback;
    if (updating) {
      return;
    }

    updateResource(token, `payments/${intentId}?type=${type}`, {
      provider: 'paystack',
      broadcast: true,
      requested_by: 'customer',
    }, true)
      .then((res) => {
        updating = false;
        lCallback(null, res);
      })
      .catch((err) => {
        updating = false;
        lCallback(err);
      });
  };
})();

export const PaystackIntentCallbackWindow = () => {
  const [busy, setBusy] = useState(true);
  const [state, setState] = useState({
    type: 'info',
    text: '',
    updated: false,
    canReconnect: false,
  });

  const params = usePaystackStoredParams();

  const updateServer = useCallback(() => {
    setBusy(true);
    setState((state) => ({ ...state, canReconnect: false }));
    updateWithGuard(params.token, params.type, params.intentId, (err, res) => {
      setBusy(false);

      if (err) {
        notification.showError(err.message);
        setState({
          type: 'error',
          text: 'Error connecting with server',
          canReconnect: true,
        });
        return;
      }

      const { status, paystackStatus } = res;

      if (status === 'pending') {
        setState({
          type: 'info',
          text: `The Paystack status [(${paystackStatus})] of this session means that we cannot take any actions at the moment. We will update your ${params.type === 'deposit' ? 'appointment status' : 'subscription'} as soon as this status changes. If you want to open a ticket with us on this session, please use the code below.\n\nTransaction ID: ${params.ticketId}`,
          canReconnect: true,
          updated: false,
        });
      } else if (status === 'successful') {
        setState({
          type: 'success',
          text: params.type === 'deposit' ? 'Your appointment was successfully booked. Thanks for choosing LogaXP.' : 'Your payment has been received and your subscription updated accordingly',
          canReconnect: false,
          updated: true,
        });
        paystackStorageHelpers.clear(params.reference);
      } else {
        setState({
          type: 'error',
          text: `Paystack status of this session to - ${paystackStatus} - means that we will be marking your payment as failed. If you want to open a ticket with us on this session, please use the code below.\n\nTransaction ID: ${params.ticketId}`,
          canReconnect: true,
        });
      }
    });
  }, [params]);

  useEffect(() => {
    if (params.loaded) {
      updateServer();
    }
  }, [params, updateServer]);

  return (
    <BlankPage>
      <div style={styles.container}>
        {busy ? (
          <Loader type="double_ring" color="transparent">
            <span style={{ color: 'var(--color-accent)' }}>Connecting to server ...</span>
          </Loader>
        ) : (
          <div style={styles.outer}>
            {params.companyName ? (
              <article style={styles.companyPanel}>
                <div style={styles.pictureWrap}>
                  <img
                    alt={params.companyName}
                    src={params.companyProfilePicture}
                    style={styles.picture}
                  />
                </div>
                <div style={styles.companyDetails}>
                  <span style={styles.companyName}>{params.companyName}</span>
                  <span style={styles.companyAddress}>{params.companyAddress}</span>
                </div>
              </article>
            ) : null}
            <div style={styles.inner}>
              <AlertComponent type={state.type}>
                <pre style={styles.pre}>{state.text}</pre>
              </AlertComponent>
              {state.updated ? (
                <WindowCloseCounter duration={20} style={{ textAlign: 'center' }} />
              ) : null}
              {state.canReconnect ? (
                <div>
                  <span>Click&nbsp;</span>
                  <button
                    type="button"
                    className="link"
                    style={styles.linkBtn}
                    onClick={updateServer}
                  >
                    here
                  </button>
                  <span>&nbsp;to recheck payment status!</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </BlankPage>
  );
};

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
  onConnect,
  onResponse,
  deleteCallbackOnConnect,
) => {
  const oldCallback = callbacks[id];
  callbacks[id] = onResponse;
  if (oldCallback) {
    return;
  }

  postResource(token, `payments?type=${type}`, { ...data, provider: 'paystack' }, true)
    .then((response) => {
      if (deleteCallbackOnConnect) {
        delete callbacks[id];
      }

      onConnect();

      const {
        connection,
        intentId,
        authorizationUrl,
        reference,
      } = response;

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

        if (status === 'failed') {
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
        const params = { provider: 'paystack' };
        if (type === 'deposit') {
          params.requested_by = 'customer';
        }
        updateResource(token || response.token, `payments/${intentId}?type=${type}`, params, true)
          .then((res) => handleServerResponse(res))
          .catch(() => {});
      }, 120000);

      storage.set(reference, JSON.stringify({
        ...extraPopupData,
        token,
        type,
        ...response,
      }));

      windowUtils.open(authorizationUrl);
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
  onConnect,
  onResponse,
  false,
);

const fetchBanks = (token) => new Promise((resolve, reject) => {
  if (paystackBanks) {
    resolve(paystackBanks);
    return;
  }

  fetchResources('paystack_connected_accounts/banks', token, true)
    .then((banks) => {
      paystackBanks = banks;
      resolve(banks);
    })
    .catch((err) => reject(err));
});

const setupPaymentMethod = (token, callback) => fetchBanks(token)
  .then((banks) => {
    if (!(banks && banks.length)) {
      notification.showError('Unable to retrieve bank list from Paysatck! Please try again.');
      callback(false);
      return;
    }

    let popup;
    const handleClose = () => {
      popup.close();
      callback(false);
    };
    const handleSubmit = (accountNumber, bankCode, callback1) => {
      const data = { bank_code: bankCode, account_number: accountNumber };
      postResource(token, 'paystack_connected_accounts', data, true)
        .then(({ subaccount_code: subaccountCode }) => {
          notification.showSuccess(`Your account - ${subaccountCode} - was successfully created.`);
          callback1();
          callback(true);
        })
        .catch(({ message }) => {
          notification.showError(message);
          callback1(message);
        });
    };

    popup = dialog.show(
      <BankAccountForm banks={banks} onCancel={handleClose} onSubmit={handleSubmit} />,
    );
  })
  .catch(({ message }) => {
    notification.showError(message);
    callback(false);
  });

const Paystack = {
  deposit,
  setupPaymentMethod,
  subscribe,
};

export default Paystack;
