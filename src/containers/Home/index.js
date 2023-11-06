import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import SearchRow from './SearchRow';
import css from './style.module.css';
import searchImage from '../../assets/images/search.jpg';
import barber from '../../assets/images/barber.jpg';
import phone from '../../assets/images/phone.jpg';
import routes from '../../routing/routes';
import { Testimonial, TrustedBy } from './TrustAndTestimonials';
import Subscriptions from '../Pricing/Subscription';
import BlendedImageBackground from '../../components/BlendedImageBackground';
import { Ring } from '../../components/LoadingButton';
import { postResource } from '../../api';
import { useNotification } from '../../lib/Notification';
import { matchesEmail } from '../../components/TextBox';
import FrequentQuestions from './FrequentQuestions';

const EMAIL = 'email';

const reasons = [
  {
    id: 'easy',
    title: 'Easy Scheduling',
    text: 'Effortlessly book appointments with our intuitive and user-friendly interface.',
  },
  {
    id: 'mobile',
    title: 'Mobile-Friendly',
    text: 'Access and manage your appointments on-the-go with our responsive design that works on any device.',
  },
  {
    id: 'secure',
    title: 'Secure Platform',
    text: 'Keep your data safe with our secure infrastructure and privacy-focused features.',
  },
];

const products = [
  { text: 'Loga Systems', href: '#' },
  { text: 'Time & Attendance', href: '#' },
  { text: 'Task Manager', href: '#' },
  { text: 'LogaXP HR', href: '#' },
  { text: 'Appraisal Hub', href: '#' },
  { text: 'Appointments Booking', href: '/' },
  { text: 'LogaXP Leaves', href: '#' },
  { text: 'Reimbux', href: '#' },
  { text: 'OnOffBoard', href: '#' },
  { text: 'Smart Hire', href: '#' },
  { text: 'Automations', href: '#' },
];

const site = [
  { text: 'About Us', url: '/about_us' },
  { text: 'Career', url: '/career' },
  { text: 'Management', url: '/management' },
  { text: 'Contact', url: '/contact' },
];

const businessTypes = [
  'Blog', 'Food & Beverages', 'Bars & Breweries', 'Fast Casual', 'Quick Services',
  'Barbershop', 'Full Services', 'Hair Salon', 'Tattoo & Piercing', 'Health & Fitness',
  'Professional Services', 'Large Businesses', 'Home & Repairs',
];

const Steps = () => (
  <section className={`${css.section_row} ${css.steps_row}`}>
    <span className={css.section_intro}>
      Our easy steps
    </span>
    <h1 className={css.section_heading}>
      How LogaXP works
    </h1>
    <div className={css.steps_body}>
      <div className={css.steps_left}>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Register your business
          </h1>
          <p className={css.steps_article_text}>
            Share your aspirations, work-history, & personality.
            Answer prompts to show-case your unique self.
          </p>
        </article>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Setup how you receive payments
          </h1>
          <p className={css.steps_article_text}>
            You choose if and how you receive money from your clients
            through our platform. We integrated an array of choice
            gateway services to choose from.
          </p>
        </article>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Create and manage your time slots
          </h1>
          <p className={css.steps_article_text}>
            Let your pontential clients know the times that you are
            available for appointments.
          </p>
        </article>
        <article className={css.steps_article}>
          <h1 className={css.steps_article_heading}>
            Showcase and Sell your services on the go
          </h1>
          <p className={css.steps_article_text}>
            No middle men are involved. Your clients will find you
            whereever you may be.
          </p>
        </article>
      </div>
      <div className={css.steps_right}>
        <p className={css.steps_clients_text}>
          We offer web and mobile applications designed to assist prospective
          clients in exploring and accessing your services.
        </p>
        <img alt="user search" src={searchImage} className={css.search_picture} />
      </div>
    </div>
  </section>
);

const GrowWithUs = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Grow With Us At LogaXP</span>
    <h1 className={css.section_heading}>
      We&apos;re helping businesses like yours
    </h1>
    <div className={css.service_row}>
      <BlendedImageBackground
        imageClass={`${css.img} ${css.first}`}
        containerClass={`${css.img_wrap} ${css.first}`}
        src={barber}
        alt="service"
      />
      <div className={`${css.text} ${css.light_blue} ${css.last}`}>
        <span className={css.pre_text}>
          Logaxp for Businessess
        </span>
        <h2 className={css.heading}>
          Boost Your Sales and Expand Your Reach!
        </h2>
        <p className={css.text_body}>
          Are you looking to grow your business and increase your sales?
          Take advantage of our platform to reach a wider audience
          and elevate your business to new heights!
        </p>
        <div className={css.service_row_footer}>
          <Link to={routes.company.absolute.registration} className={css.join_link}>
            Join as a Business
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const SubscriptionPanel = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Subscription</span>
    <h2 className={css.section_heading}>
      Find the perfect plan for your business
    </h2>
    <Subscriptions />
  </section>
);

const FindServices = () => (
  <section className={css.section_row}>
    <span className={css.section_intro} style={{ display: 'none' }}>
      Grow With Us At LogaXP
    </span>
    <h1 className={css.section_heading} style={{ display: 'none' }}>
      We&apos;re helping businesses like yours
    </h1>
    <div className={`${css.service_row} ${css.flip}`}>
      <BlendedImageBackground
        imageClass={`${css.img} ${css.first}`}
        containerClass={`${css.img_wrap} ${css.first}`}
        src={phone}
        alt="service"
      />
      <div className={`${css.text} ${css.light_yellow} ${css.last}`}>
        <span className={css.pre_text}>
          Logaxp for Customers
        </span>
        <h2 className={css.heading}>
          Discover Top Service Providers Near You!
        </h2>
        <p className={css.text_body}>
          Looking for trusted service providers in your area?
          Join our community and unlock a world of reliable
          services right at your fingertips.
        </p>
        <div className={css.service_row_footer}>
          <Link to={routes.user.registeration} className={css.join_link}>
            Join as a Customer
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const WhyChooseUs = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Why LogaXP</span>
    <h1 className={css.section_heading}>Why Choose Us</h1>
    <div className={css.reason_grid}>
      {reasons.map(({ id, title, text }) => (
        <article key={id} className={`${css.reason_panel} ${css[id]}`}>
          <h1 className={css.reason_heading}>{title}</h1>
          <p className={css.reason_text}>{text}</p>
        </article>
      ))}
    </div>
  </section>
);

const EmailSubscriptionPanel = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const notification = useNotification();

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === EMAIL) {
      setEmail(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!matchesEmail(email)) {
      notification.showError('Invalid Email Address!');
      return;
    }

    setBusy(true);
    postResource(null, 'subscribers', { email }, true)
      .then(() => {
        setBusy(false);
        setEmail('');
        notification.showSuccess('Thanks for subscribing to our Newsletter.');
      })
      .catch(() => {
        setBusy(false);
        notification.showError('An error occurred while performing operaion. Please try again.');
      });
  }, [email, setBusy, setEmail]);

  return (
    <div className={css.subscription_panel}>
      <div className={css.subscription_left}>
        <span className={css.subscription_heading}>
          Newsletter
        </span>
        <span className={css.subscription_text}>
          Be the first to know  about discounts, offers and events
        </span>
      </div>
      <form onSubmit={handleSubmit} className={css.subscription_form}>
        <input
          type="email"
          name={EMAIL}
          value={email}
          placeholder="Enter Email Address"
          className={css.subscription_email}
          onChange={handleValueChange}
          disabled={busy}
        />
        <button type="submit" className={css.subscription_submit_btn} disabled={busy}>
          Subscribe
        </button>
        {busy ? (
          <Ring size={18} color="#fff" />
        ) : (
          null
        )}
      </form>
    </div>
  );
};

const Footer = () => (
  <footer className={`${css.section_row} ${css.footer}`}>
    <EmailSubscriptionPanel />
    <div className={css.footer_links_panel}>
      <section className={css.footer_address_col}>
        <h1 className={css.footer_address_col_heading}>
          <span>Loga</span>
          <span className={css.accent}>XP</span>
        </h1>
        <p className={css.footer_address_col_text}>
          Stay updated with the latest news, tips, and exciting updates
          by following us on our social media platforms.
          Let&apos;s connect and share the journey together!
        </p>
        <p
          className={`${css.footer_address_col_text} ${css.footer_address} ${css.pre_icon}`}
        >
          1105 Berry Street, Old Hickory, Tennessee 37138
        </p>
        <div className={css.footer_address_col_social_media_panel}>
          <a
            className={css.footer_social_media_link}
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="linkedin"
          >
            <span className={`${css.icon} ${css.linkedin}`} />
          </a>
          <a
            className={css.footer_social_media_link}
            href="https://twitter.com/LogaXp"
            target="_blank"
            rel="noreferrer"
            aria-label="twitter"
          >
            <span className={`${css.icon} ${css.twitter}`} />
          </a>
          <a
            className={css.footer_social_media_link}
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="instagram"
          >
            <span className={`${css.icon} ${css.instagram}`} />
          </a>
          <a
            className={css.footer_social_media_link}
            href="https://www.facebook.com/profile.php?id=100092408692096"
            target="_blank"
            rel="noreferrer"
            aria-label="facebook"
          >
            <span className={`${css.icon} ${css.facebook}`} />
          </a>
        </div>
      </section>
      <div className={css.footer_cols_panel}>
        <section className={css.footer_col}>
          <h1 className={`${css.accent} ${css.footer_col_heading}`}>
            Products
          </h1>
          <div className={css.footer_col_links_wrap}>
            {products.map(({ text, href }) => (
              <a key={text} className={css.footer_col_link} href={href} target="_blank" rel="noreferrer">
                {text}
              </a>
            ))}
          </div>
        </section>
        <section className={css.footer_col}>
          <h1 className={`${css.accent} ${css.footer_col_heading}`}>
            Business Types
          </h1>
          <div className={css.footer_col_links_wrap}>
            {businessTypes.map((text) => (
              <span key={text} className={css.footer_col_link}>
                {text}
              </span>
            ))}
          </div>
        </section>
        <section className={css.footer_col}>
          <h1 className={`${css.accent} ${css.footer_col_heading}`}>
            Company
          </h1>
          <div className={css.footer_col_links_wrap}>
            {site.map(({ text, href }) => (
              <Link key={text} className={css.footer_col_link} to={href}>
                {text}
              </Link>
            ))}
            <a
              className={css.footer_col_link}
              href="https://blob.logxp.com/appointments"
              target="_blank"
              rel="noreferrer"
            >
              Blog
            </a>
          </div>
        </section>
        <section className={css.footer_col}>
          <h1 className={`${css.accent} ${css.footer_col_heading}`}>
            Support
          </h1>
          <div className={css.footer_col_links_wrap}>
            <a
              className={`${css.footer_col_link} ${css.pre_icon} ${css.telephone}`}
              href="tel:+1 (615) 930-6090"
            >
              +1 (615) 930-6090
            </a>
            <a
              className={`${css.footer_col_link} ${css.pre_icon} ${css.telephone}`}
              href="tel:+1 (832) 946-5563"
            >
              +1 (832) 946-5563
            </a>
            <a
              className={`${css.footer_col_link} ${css.pre_icon} ${css.telephone}`}
              href="tel:+2348031332801"
            >
              +2348031332801
            </a>
            <a
              href="mailto:enquiries@logaxp.com"
              className={`${css.footer_col_link} ${css.pre_icon} ${css.email}`}
              target="_blank"
              rel="noreferrer"
            >
              enquiries@logaxp.com
            </a>
          </div>
        </section>
      </div>
    </div>
    <div className={css.footer_copyright_panel}>
      <span>© 2023. LogaXP. All Rights Reserved</span>
      <div>
        <Link to={routes.termsAndConditions} className={css.terms_link}>
          Terms of Use
        </Link>
        <Link to={routes.privacyPolicy} className={css.privacy_link}>
          Privacy & Security
        </Link>
        <Link to={routes.returnPolicy} className={css.return_policy}>
          Return Policy
        </Link>
      </div>
    </div>
  </footer>
);

const Home = () => (
  <div className={css.container}>
    <Header />
    <SearchRow />
    <TrustedBy />
    <Steps />
    <WhyChooseUs />
    <GrowWithUs />
    <SubscriptionPanel />
    <FindServices />
    <Testimonial />
    <FrequentQuestions />
    <Footer />
  </div>
);

export default Home;
