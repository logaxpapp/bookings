import { useCallback, useState } from 'react';
import { put } from '../../api';
import TextBox from '../TextBox';

/* eslint react/prop-types: 0 */

let token;
let connectedAccountId;
let secret;

export const Element = ({ options, children }) => {
  useState(() => {
    secret = options.clientSecret;
  }, []);

  return (
    <>
      {children}
    </>
  );
};

export const PaymentElement = () => {
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === 'card') {
      setCard(value);
    } else if (name === 'expiry') {
      setExpiry(value);
    } else if (name === 'cvc') {
      setCvc(value);
    }
  });

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          width: '100%',
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          value="card"
          style={{
            color: '#0570de',
            border: '2px solid #0570de',
            borderRadius: 8,
            fontSize: '1.2rem',
            padding: '8px 48px 8px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div className="p-TabIconContainer">
            <svg
              role="presentation"
              fill="#0570de"
              viewBox="0 0 16 16"
              style={{ width: 24 }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 4a2 2 0 012-2h12a2 2 0 012 2H0zm0 2v6a2 2 0 002 2h12a2 2 0 002-2V6H0zm3 5a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1z"
              />
            </svg>
          </div>
          <span className="p-TabLabel TabLabel TabLabel--selected">Card</span>
        </button>
      </div>
      <TextBox
        type="text"
        name="card"
        id="card"
        label="Card number"
        value={card}
        onChange={handleValueChange}
        hideErrorOnNull
        style={{ border: '1px solid #efefef' }}
      />
      <div style={{ display: 'flex', gap: 16, width: '100%' }}>
        <TextBox
          type="text"
          name="expiry"
          id="expiry"
          label="Expiration"
          value={expiry}
          onChange={handleValueChange}
          hideErrorOnNull
          style={{ border: '1px solid #efefef' }}
        />
        <TextBox
          type="text"
          name="cvc"
          id="cvc"
          label="CVC"
          value={cvc}
          onChange={handleValueChange}
          hideErrorOnNull
          style={{ border: '1px solid #efefef' }}
        />
      </div>
    </div>
  );
};

export const loadStripe = (apiKey, options) => {
  token = apiKey;
  connectedAccountId = (options && options.stripeAccount) || 'self';
};

export const useStripe = () => ({
  confirmPayment: ({ confirmParams }) => new Promise((resolve) => {
    put(
      'http://localhost:7171/v1/payment_intents/10',
      {
        client_secret: secret,
        status: 'succeeded',
        connected_account_id: connectedAccountId,
      },
      { Authorization: `Bearer ${token}` },
    )
      .then(() => {
        resolve({ error: null });
        window.location.href = confirmParams.return_url;
      })
      .catch((error) => resolve({ error }));
  }),
});

export const useElements = () => ({
  // TODO
});
