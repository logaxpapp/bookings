import css from './style.module.css';
import SubscriptionPanel from '../Pricing/Subscription';
import Header from '../Header';
import PublicRouteContainer from '../PublicRouteContainer';

const Subscriptions = () => (
  <PublicRouteContainer>
    <div className={css.container}>
      <Header />
      <main className={css.main}>
        <h1 className={css.heading}>Please Select A Subscription Plan To Proceed</h1>
        <SubscriptionPanel showNotice />
      </main>
    </div>
  </PublicRouteContainer>
);

export default Subscriptions;
