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
import Footer from '../Footer';
import FrequentQuestions from './FrequentQuestions';

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
