import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchResources, postResource } from '../api';
import { dialog } from '../lib/Dialog';
import { notification } from '../lib/Notification';
import SlideDialog from '../components/SlideInDialog';
import LoadingButton from '../components/LoadingButton';
import TextBox from '../components/TextBox';
import { SvgButton, colors, paths } from '../components/svg';

const ACCOUNT_NUMBER = 'account_number';
const BANK_CODE = 'bank_code';
const CLOSE = 'close';

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

const deposit = () => {
  // TODO:
};

const subscribe = () => {
  // TODO:
};

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
