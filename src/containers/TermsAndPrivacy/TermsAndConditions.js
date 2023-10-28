import css from './style.module.css';

const effectiveDate = new Date(2023, 9, 23).toLocaleDateString();

const TermsAndConditionsComponent = () => (
  <section className={css.container}>
    <h1 className={css.h1}>
      Terms and Conditions
    </h1>
    <p>
      {`Effective Date: ${effectiveDate}`}
    </p>
    <p>
      Please read these Terms and Conditions (&quot;Terms,&quot; &quot;
      Agreement&quot;) carefully before using the LogaXP appointment booking
      website (&quot;Website&quot;) operated by LogaXP (&quot;Company,&quot;
      &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
    </p>
    <p>
      By registering as a Service Provider or User, using our services, or
      accessing the Website, you agree to comply with and be bound by the
      following terms and conditions. If you do not agree to these terms,
      please do not use our Website.
    </p>
    <p><strong>1. Definitions</strong></p>
    <ul>
      <li>
        <strong>Service Provider: </strong>
        Refers to an individual or entity that registers on the Website to
        offer services and accept appointment bookings.
      </li>
      <li>
        <strong>User: </strong>
        Refers to an individual who registers on the Website to book
        appointments with Service Providers.
      </li>
      <li>
        <strong>Deposit: </strong>
        Refers to the amount paid by Users to secure an appointment booking.
      </li>
    </ul>
    <p><strong>2. Registration</strong></p>
    <ul>
      <li>
        <p>
          <strong>Service Provider Registration: </strong>
          Service Providers must provide accurate and complete information
          during registration. You are responsible for maintaining the
          confidentiality of your account credentials and are liable for any
          activity conducted through your account.
        </p>
      </li>
      <li>
        <p>
          <strong>User Registration: </strong>
          Users must also provide accurate and complete information during
          registration. You are responsible for the security of your account
          and for all activity occurring under your account.
        </p>
      </li>
    </ul>
    <p><strong>3. Appointment Booking and Deposits</strong></p>
    <ul>
      <li>
        <p>
          Users can book appointments with Service Providers through the
          Website. To secure an appointment, Users may be required to pay a
          deposit. Deposit details will be provided during the booking process.
        </p>
      </li>
      <li>
        <p>
          Service Providers agree to honor appointment bookings made through
          the Website and to provide services with professionalism and in
          accordance with their offered services.
        </p>
      </li>
    </ul>
    <p><strong>4. Payment and Refunds</strong></p>
    <ul>
      <li>
        <p>
          Payments for deposits and services may be processed through the
          Website. Service Providers may specify their refund and cancellation
          policies for Users. Users should review these policies before booking
          appointments.
        </p>
      </li>
      <li>
        <p>
          The Company is not responsible for refunds and cancellations; these
          are subject to the terms and conditions specified by the Service
          Provider.
        </p>
      </li>
    </ul>
    <p><strong>5. Intellectual Property</strong></p>
    <ul>
      <li>
        The content, logos, and design of the Website are owned by LogaXP and
        are protected by intellectual property laws. Users and Service
        Providers are not permitted to use, reproduce, or distribute this
        content without explicit permission.
      </li>
    </ul>
    <p><strong>6. Privacy Policy</strong></p>
    <ul>
      <li>
        Information collected from Users and Service Providers is governed by
        our Privacy Policy. Please review the Privacy Policy for details on how
        we handle and protect your data.
      </li>
    </ul>
    <p><strong>7. Modifications to Terms and Conditions</strong></p>
    <ul>
      <li>
        The Company reserves the right to modify these Terms and Conditions at
        any time. Any changes will be posted on the Website, and it is the
        responsibility of Users and Service Providers to regularly review these
        terms for updates.
      </li>
    </ul>
    <p><strong>8. Termination</strong></p>
    <ul>
      <li>
        The Company reserves the right to terminate or suspend accounts at its
        discretion, especially in cases of policy violations or misuse of the
        Website.
      </li>
    </ul>
    <p><strong>9. Contact Information</strong></p>
    <p>
      If you have any questions, concerns, or inquiries related to these Terms
      and Conditions, please contact us at:
    </p>
    <ul>
      <li>Email: enquiries@logaxp.com</li>
      <li>Address: 1105 Berry Street, Old Hickory, Tennessee 37138</li>
    </ul>
    <p>
      By using our Website, you acknowledge your understanding of these Terms
      and Conditions and your agreement to abide by them.
    </p>
  </section>
);

export default TermsAndConditionsComponent;
