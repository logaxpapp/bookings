import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { SvgButton, paths } from '../../components/svg';

const faqsFull = [
  {
    id: 1,
    q: 'What if I only need an account for a few months out of the year?',
    a: "No worries! Many professionals utilize LogaXP for specific seasonal periods, making it a particularly popular choice for businesses with fluctuating seasonal demands. However, after completing your LogaXP usage for the required period, you have the option to place your account in hibernation mode. During hibernation, you can specify a reactivation date. When that date arrives, you will receive step-by-step reactivation instructions to assist you in restoring your account. Your data remains securely stored, eliminating the need to reconfigure everything. Rest assured; you won't incur charges during the inactive months.",
  },
  {
    id: 2,
    q: 'What are the different security levels that I can provide for my staff?',
    a: `
There are four different staff security levels in LogaXP and they determine different access rights within the app. The four security levels are:

  1. Account Owner: By default, this is the individual who initially registered the account. The Account Owner enjoys complete access to all account information and can edit any data. This includes appointments, clients of all staff, and configuration settings for online booking. Additionally, the Account Owner can access billing information.

  2. Administrators: Staff members designated as administrators share the same access rights as the Account Owner, with the exception that they cannot modify or view billing details or overall Account Settings. Administrators can view appointments for all staff, clients across the entire business, and update settings, including creating staff profiles and modifying security statuses for other staff members.

  3. Location Super Users: Staff members designated as location super users can view and make changes to all appointments and client data within the assigned location(s). However, they lack the ability to modify settings or access appointments and clients at locations where they have not been granted access. They can access their own staff profiles to update availability and class schedules.

  4. Users: Staff members designated as users have limited access, allowing them to view only the appointments made with them and clients who have booked with them. They can access their own staff profiles but cannot view other account settings.

  Please note that only the Account Owner and administrators can modify security levels for other staff members. Location Super Users and Users do not possess this privilege.
  For business-level subscriptions, the option exists to create custom security roles to better align with specific needs if the default roles do not provide an exact match.`,
  },
  {
    id: 3,
    q: "I'm interested but I don’t want to start a free trial. Can I book a demo?",
    a: 'Certainly! You can easily schedule a demo with our team by using any of our contact channels.',
  },
  {
    id: 4,
    q: "I'm moving to LogaXP from another scheduling system. Do you offer data upload?",
    a: 'At the moment, LogaXP does not provide a direct appointment data upload feature from other scheduling systems. However, we do offer a client upload feature that enables you to import a spreadsheet containing your existing client data and align it with the corresponding client fields within LogaXP.',
  },
  {
    id: 5,
    q: "What's the difference in features offered in the different versions of LogaXP?",
    a: `The LogaXP Professional subscription encompasses essential scheduling capabilities, including limitless appointment bookings, an unrestricted range of services or classes, two-way staff calendar synchronization, and automatic appointment confirmation and reminder emails.
    The LogaXP Business subscription builds upon the Professional plan by offering advanced features. This includes complete customization of your booking sites, waitlists, courses, custom staff security levels, and a range of additional benefits. For a comprehensive feature comparison across our plans, please refer to our Pricing page.`,
  },
  {
    id: 6,
    q: 'Will my clients have to call me to cancel or reschedule appointments?',
    a: "While we can't prevent clients from calling you, we can offer a hassle-free way for them to manage their appointments without making a call. Our confirmation and reminder emails include a link that allows clients to easily cancel or reschedule their appointments for a more convenient time. Additionally, we provide the option for clients to create their own logins for your scheduling platform. This grants them access to your website or scheduling page, where they can log in, view their appointments, and make any necessary cancellations or rescheduling.",
  },
  {
    id: 7,
    q: 'How will my customers book appointments?',
    a: "Your customers have the convenience of booking appointments through your business's web scheduler. You can utilize LogaXP's scheduling landing page provided with your account (example: https://logaxp.com/A1045) or seamlessly embed the scheduler into your website. The scheduling landing page is optimized for mobile devices, ensuring a responsive experience for clients accessing your scheduler on their tablets or smartphones.",
  },
  {
    id: 8,
    q: 'Is my data secure?',
    a: "Data security is our top priority. We conduct complete hourly backups to ensure your data remains protected, and our servers are securely stored in a remote location. For a detailed overview of our data security measures, please visit our website's dedicated page: 'Security for your Online Scheduling System.",
  },
  {
    id: 10,
    q: 'How long does it take to get it all setup?',
    a: `The duration of the setup process depends on the size and specific requirements of your business. For an expedited setup, we suggest collaborating with one of our support specialists through personalized one-on-one onboarding sessions.
    Typically, the setup can be finalized within 1 or 2 onboarding sessions. However, if you have a larger account with extensive customization needs, additional sessions may be beneficial. You can schedule a one-on-one onboarding session with our support team here: 'Schedule an Onboarding Call`,
  },
  {
    id: 11,
    q: 'Do you offer any non-profit discounts?',
    a: 'We are passionate about extending LogaXP to non-profit organizations whose missions align with our values and who may benefit from a discounted rate. If you represent a non-profit organization in search of a scheduling solution, please reach out to our team. Share details about your non-profit mission and scheduling requirements, and we will promptly assess the discount we can offer and provide you with the information you need.',
  },
  {
    id: 13,
    q: 'What kind of support can I expect?',
    a: `We take immense pride in providing outstanding support to our valued users. Business level plans enjoy the added benefit of phone support at [phone number]. For all our plans, we offer responsive email and in-app messaging support. You can expect a prompt response, typically within a few hours, during our standard business hours (9 am - 5 pm US Central, Monday through Friday).
    
    Our dedicated support team is committed not only to assisting but also to educating our users during each interaction. We understand that scheduling software offers a wide range of possibilities. Therefore, when addressing a support issue, we strive to identify and recommend an additional feature that could enhance their business. While users have the choice to explore it or not, we consider this approach a valuable way to educate our user community about the full spectrum of features available in the application.`,
  },
];

const faqs = [0, 2, 5, 8, 9].map((idx) => faqsFull[idx]);

const QA = ({ qa }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => setExpanded((expanded) => !expanded), []);

  return (
    <section className={`${css.faq_card} ${expanded ? css.expanded : ''}`}>
      <header className={css.faq_header}>
        <h1 className={css.faq_heading}>{qa.q}</h1>
        <SvgButton
          type="button"
          color="#667583"
          title={expanded ? 'Collapse' : 'Expand'}
          path={expanded ? paths.chevronUp : paths.chevronDown}
          onClick={toggleExpanded}
        />
      </header>
      <div className={`${css.faq_body} ${expanded ? css.expanded : ''}`}>
        <pre className={css.pre_wrap}>{qa.a}</pre>
      </div>
    </section>
  );
};

QA.propTypes = {
  qa: PropTypes.shape({
    q: PropTypes.string,
    a: PropTypes.string,
  }).isRequired,
};

const FrequentQuestions = () => (
  <section className={css.section_row}>
    <div className={css.faq_section}>
      <span className={css.section_intro}>LogaXP FAQ</span>
      <h1 className={`${css.section_heading} ${css.testimonial_heading}`}>
        Frequently Asked Questions
      </h1>
      <div className={css.faqs_panel}>
        {faqs.map((qa) => (
          <QA key={qa.id} qa={qa} />
        ))}
      </div>
    </div>
  </section>
);

export default FrequentQuestions;
