import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import css from './style.module.css';
import { Ring } from '../../components/LoadingButton';
import { notification } from '../../utils';
import { postResource } from '../../api';
import { matchesEmail } from '../../components/TextBox';
import routes from '../../routing/routes';

const EMAIL = 'email';

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

const siteRoutes = [
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

const EmailSubscriptionPanel = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

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
  <footer className={css.footer}>
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
            href="www.linkedin.com/in/logaxp"
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
            href="https://www.instagram.com/logaxpapp"
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
            {siteRoutes.map(({ text, href }) => (
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
        <a
          href="https://logaxp.com/terms-conditions"
          target="_blank"
          className={css.terms_link}
          rel="noreferrer"
        >
          Terms of Use
        </a>
        <a
          href="https://logaxp.com/privacy-policy"
          target="_blank"
          className={`${css.terms_link} ${css.privacy_link}`}
          rel="noreferrer"
        >
          Privacy & Security
        </a>
        <Link className={css.terms_link} to={routes.returnPolicy}>Return Policy</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
