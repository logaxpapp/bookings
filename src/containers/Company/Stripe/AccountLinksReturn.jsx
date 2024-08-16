import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { fetchResources } from '../../../api';
import { Loader } from '../../../components/LoadingSpinner';
import { notification } from '../../../utils';

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(45deg, rgba(234,243,249,1) 0%, rgba(255,254,230,1) 22%, rgba(172,231,215,1) 40%, rgba(253,232,255,1) 60%, rgba(190,255,231,1) 81%, rgba(251,254,255,1) 100%)',
  },
  body: {
    backgroundColor: '#fff',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  info: {
    margin: 0,
    lineHeight: 1.4,
    color: '#274a7f',
  },
  pre: {
    whiteSpace: 'pre-wrap',
  },
};

const UNSUBMITTED_MESSAGE = `
You did NOT complete your Stripe onboarding process.
Please login to your dashboard to complete the process.
If you are sure that you completed the process, there could be a delay in Stripe updating your information.
We will update your dashboard as soon as the information becomes available.
`;

const UNUPDATED_MESSAGE = `
Congratulations on completing your Stripe onboarding!
There is a delay in Stripe updating your account status.
As soon as your account status is updated to indicate that it can accept payments,
we will update your dashboard to reflect that.
`;

const COMPLETED_MESSAGE = `
Congratulations on completing your Stripe onboarding.
Your dashboard will soon be updated to indicate that you can accept Stripe payments.
`;

const requestHelper = (() => {
  let secondsSetter;
  let messageSetter;
  let loading = false;
  let seconds = 20;
  let interval;

  const countDown = () => {
    interval = setInterval(() => {
      if (secondsSetter) {
        seconds -= 1;
        secondsSetter(seconds);
        if (seconds <= 0) {
          window.close();
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const init = (setSeconds, setMessage, id) => {
    secondsSetter = setSeconds;
    messageSetter = setMessage;
    if (!loading) {
      loading = true;
      fetchResources(`stripe_connected_accounts/links/${id}`, null, true)
        .then(({ status, submitted }) => {
          if (messageSetter) {
            if (status === 'active') {
              messageSetter({ error: false, text: COMPLETED_MESSAGE });
              countDown();
            } else if (submitted) {
              messageSetter({ error: false, text: UNUPDATED_MESSAGE });
              countDown();
            } else {
              messageSetter({ error: true, text: UNSUBMITTED_MESSAGE });
            }
          }
        })
        .catch(({ message }) => {
          notification.showError(message);
          if (messageSetter) {
            messageSetter({ error: true, text: 'Application encountered server error!' });
          }
        });
    }
  };

  const clear = () => {
    secondsSetter = null;
    messageSetter = null;
    if (interval) {
      clearInterval(interval);
    }
  };

  return { clear, init };
})();

const AccountLinksReturn = () => {
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState({ error: false, text: '', loading: true });
  const [infoStyle, setInfoStyle] = useState(styles.info);
  const params = useParams();

  useEffect(() => {
    requestHelper.init(setSeconds, setMessage, params.id);
    return requestHelper.clear;
  }, []);

  useEffect(() => {
    setInfoStyle(message.error ? { ...styles.info, color: 'red' } : styles.info);
  }, [message, setInfoStyle]);

  if (message.loading) {
    return <Loader type="double_ring"><span>Checking Status ...</span></Loader>;
  }

  return (
    <section style={styles.container}>
      <div style={styles.body}>
        <p style={infoStyle}>
          <pre style={styles.pre}>
            {message.text}
          </pre>
        </p>
        {seconds ? (
          <span>
            {`window will close in ${seconds} seconds.`}
          </span>
        ) : null}
      </div>
    </section>
  );
};

export default AccountLinksReturn;
