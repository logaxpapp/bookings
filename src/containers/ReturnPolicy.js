import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import AlertComponent from '../components/AlertComponents';
import { FieldEditor } from '../components/TextBox';
import Header from './Header';
import Error404 from './Error404';
import { Loader } from '../components/LoadingSpinner';
import { getProviderAsync } from '../redux/serviceProvidersSlice';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    maxWidth: 800,
    margin: 'auto',
    overflow: 'auto',
    padding: 24,
    lineHeight: 1.5,
    backgroundColor: '#fff',
  },
  h1: {
    fontSize: '1.2rem',
  },
  h2: {
    fontSize: '1.05rem',
  },
  loaderPage: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  loaderWrap: {
    flex: 1,
    position: 'relative',
  },
  spacedText: {
    display: 'inline-block',
    padding: '0 6px',
  },
};

const Span = ({ name, value, onEdit }) => {
  if (onEdit) {
    return (
      <FieldEditor
        name={name}
        initialValue={value}
        onSave={onEdit}
        style={{
          display: 'inline-flex',
          padding: '0 6px',
          backgroundColor: 'transparent',
        }}
        inputStyle={{
          maxWidth: 64,
        }}
        transparent
      />
    );
  }

  return (
    <span style={styles.spacedText}>
      {value}
    </span>
  );
};

Span.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEdit: PropTypes.func,
};

Span.defaultProps = {
  value: '',
  onEdit: null,
};

export const ReturnPolicyComponent = ({
  homepage,
  onEdit,
  effectiveDate,
  minNoticeTime,
  refundPercent,
  refundDelay,
  email,
  phoneNumber,
}) => (
  <section style={styles.container}>
    <h1 style={styles.h1}>Return Policy - Appointment Booking App</h1>
    {homepage ? (
      <AlertComponent type="error" style={{ padding: 24, borderRadius: 8 }}>
        <section>
          <h1 style={styles.h2}>Disclaimer for Generalized Return Policy</h1>
          <p>
            This disclaimer is intended to clarify that the terms and
            conditions of this generalized return policy can be altered or
            updated by the service provider at any time. When changes occur,
            the newly specified terms and conditions will supersede those set
            forth here. It is important for users to regularly review the
            return policy (accessible on a Service Provider&apos;s page) to
            stay informed about any modifications. By continuing to use our
            services, you acknowledge your understanding of this disclaimer and
            your agreement to abide by the most recent version of our return policy.
          </p>
          <p>enquiries@logaxp.com</p>
        </section>
      </AlertComponent>
    ) : null}
    <p>
      <strong>
        Effective Date:&nbsp;
        {effectiveDate}
      </strong>
    </p>
    <p><strong>1. Introduction</strong></p>
    <p>
      This Return Policy outlines the terms and conditions related to
      appointment cancellations and the forfeiture of customer deposits for
      services booked through this application. By using our application to
      schedule appointments, you agree to comply with the terms and conditions
      outlined in this policy.
    </p>
    <p><strong>2. Cancellation Policy</strong></p>
    <p>
      Customers who wish to cancel their appointments must adhere to the following guidelines:
    </p>
    <p><strong>2.1. Timeframe for Cancellation</strong></p>
    <ul>
      <li>
        <span>Appointments must be canceled at least</span>
        <Span name="min_notice_time" value={minNoticeTime} onEdit={onEdit} />
        <span>
          hours before the scheduled appointment time to qualify for a
          refund of the deposit.
        </span>
      </li>
    </ul>
    <p><strong>2.2. Deposit Forfeiture</strong></p>
    <ul>
      <li>
        {`If a customer fails to cancel their appointment within the specified
        ${minNoticeTime}-hour timeframe, the deposit paid for the appointment will be forfeited.`}
      </li>
    </ul>
    <p><strong>3. Refund Process</strong></p>
    <p><strong>3.1. Eligibility for Refund</strong></p>
    <ul>
      <li>
        Customers who cancel their appointments in accordance with the
        cancellation policy will be eligible for a refund of the deposit.
      </li>
    </ul>
    <p><strong>3.2. Refund Amount</strong></p>
    <ul>
      <li>
        <span>Refunds will be processed for</span>
        <Span name="refund_percent" value={refundPercent} onEdit={onEdit} />
        <span>percent of the deposit amount paid for the appointment.</span>
      </li>
    </ul>
    <p><strong>3.3. Refund Timeline</strong></p>
    <ul>
      <li>
        <span>Refunds will be processed within</span>
        <Span name="refund_delay" value={refundDelay} onEdit={onEdit} />
        <span>business days from the date of the cancellation.</span>
      </li>
    </ul>
    <p><strong>3.4. Refund Method</strong></p>
    <ul>
      <li>
        Refunds will be issued using the same method of payment used for the
        original transaction.
      </li>
    </ul>
    <p><strong>4. Contact Information</strong></p>
    <p>
      If you have any questions, concerns, or require assistance related to
      this Return Policy, please contact our customer support team through the
      following methods:
    </p>
    <ul>
      <li>
        Email:&nbsp;&nbsp;
        {email}
      </li>
      <li>
        Phone:&nbsp;&nbsp;
        {phoneNumber}
      </li>
    </ul>
    <p><strong>5. Amendments to the Return Policy</strong></p>
    <p>
      We reserve the right to modify, amend, or update this Return Policy at
      our discretion. Any changes made to this policy will be communicated to
      customers through our website. Please check this page and the Service
      Providers&apos; page regularly to stay informed about any updates to the policy.
    </p>
    <p>
      By using our appointment booking website and agreeing to schedule
      appointments, you acknowledge that you have read and understood the terms
      and conditions of this Return Policy and agree to comply with it.
    </p>
  </section>
);
ReturnPolicyComponent.propTypes = {
  homepage: PropTypes.bool,
  onEdit: PropTypes.func,
  effectiveDate: PropTypes.string,
  minNoticeTime: PropTypes.number,
  refundPercent: PropTypes.number,
  refundDelay: PropTypes.number,
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
};

const effectiveDate = new Date(2023, 9, 23).toLocaleDateString();

ReturnPolicyComponent.defaultProps = {
  homepage: false,
  onEdit: null,
  effectiveDate,
  minNoticeTime: 48,
  refundPercent: 100,
  refundDelay: 2,
  email: 'enquiries@logaxp.com',
  phoneNumber: '+1 (615) 930-6090 | +1 (832) 946-5563 | +2348031332801',
};

const ReturnPolicy = ({
  homepage,
  onEdit,
  effectiveDate,
  minNoticeTime,
  refundPercent,
  refundDelay,
  email,
  phoneNumber,
}) => (
  <>
    <Header />
    <ReturnPolicyComponent
      homepage={homepage}
      onEdit={onEdit}
      effectiveDate={effectiveDate}
      minNoticeTime={minNoticeTime}
      refundPercent={refundPercent}
      refundDelay={refundDelay}
      email={email}
      phoneNumber={phoneNumber}
    />
  </>
);

ReturnPolicy.propTypes = {
  homepage: PropTypes.bool,
  onEdit: PropTypes.func,
  effectiveDate: PropTypes.string,
  minNoticeTime: PropTypes.number,
  refundPercent: PropTypes.number,
  refundDelay: PropTypes.number,
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
};

ReturnPolicy.defaultProps = {
  homepage: false,
  onEdit: null,
  effectiveDate,
  minNoticeTime: 48,
  refundPercent: 100,
  refundDelay: 2,
  email: 'enquiries@logaxp.com',
  phoneNumber: '+1 (615) 930-6090 | +1 (832) 946-5563 | +2348031332801',
};

export const ProviderRefundPolicy = () => {
  const [provider, setProvider] = useState(null);
  const [busy, setBusy] = useState(true);
  const dispatch = useDispatch();
  const params = useParams();

  useEffect(() => {
    let { id } = params;
    if (!id) {
      setBusy(false);
      return;
    }

    id = Number.parseInt(id, 10);
    dispatch(getProviderAsync(id, (err, provider) => {
      if (!err) {
        setProvider(provider);
      }
      setBusy(false);
    }));
  }, []);

  if (busy) {
    return (
      <div style={styles.loaderPage}>
        <Header />
        <div style={styles.loaderWrap}>
          <Loader type="double_ring" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return <Error404 />;
  }

  if (provider.returnPolicy) {
    return (
      <ReturnPolicy
        effectiveDate={new Date(provider.returnPolicy.updatedAt).toLocaleDateString()}
        minNoticeTime={provider.returnPolicy.minNoticeTime}
        refundPercent={provider.returnPolicy.refundPercent}
        refundDelay={provider.returnPolicy.refundDelay}
        email={provider.email}
        phoneNumber={provider.phoneNumber}
      />
    );
  }

  return <ReturnPolicy />;
};

export default ReturnPolicy;
