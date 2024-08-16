import css from './style.module.css';
import SubscriptionPanel from '../Pricing/Subscription';
import Header from '../Header';
import PublicRouteContainer from '../PublicRouteContainer';

const Subscriptions = () => (
  <PublicRouteContainer>
    <div>
      <Header />
      <div className="px-6 py-6">
        <main className="max-w-280 mx-auto">
          <h1 className={css.heading}>Please Select A Subscription Plan To Proceed</h1>
          <SubscriptionPanel showNotice />
        </main>
      </div>
    </div>
  </PublicRouteContainer>
);

export default Subscriptions;
