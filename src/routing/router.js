import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import Home from '../containers/Home';
import Contact from '../containers/Contact';
import Pricing from '../containers/Pricing';
import CompanyLogin from '../containers/Authentication/signin/Company';
import UserLogin from '../containers/Authentication/signin/User';
import CompanyRegistration from '../containers/Authentication/signup/Company';
import UserRegistration from '../containers/Authentication/signup/User';
import {
  EmailVerificationFailure,
  EmailVerificationSuccess,
} from '../containers/Authentication/signup/EmailVerifications';
import PasswordResetForm from '../containers/Authentication/signin/PasswordResetForm';
import Company from '../containers/Company';
import Dashboard from '../containers/Company/Dashboard';
import Services, { ServicesDashboard } from '../containers/Company/Services';
import TimeSlots, { NewTimeSlot } from '../containers/Company/Services/TimeSlots';
import CompanySettings from '../containers/Company/Settings';
import Setup from '../containers/Company/Setup';
// import User from '../containers/User';
// import UserDashboard from '../containers/User/Dashboard';
import Error404 from '../containers/Error404';
import Subscriptions from '../containers/Subscriptions';
// import UserSearch from '../containers/User/Search';
// import Provider from '../containers/User/Provider';
import AccountLinksRefresh from '../containers/Company/Stripe/AccountLinksRefresh';
import AccountLinksReturn from '../containers/Company/Stripe/AccountLinksReturn';
import StripeDepositPaymentWindow from '../containers/Company/Stripe/DepositPaymentWindow';
import StripeDepositReturnWindow from '../containers/Company/Stripe/DepositReturnWindow';
import Employees from '../containers/Company/Settings/Employees';
import Search from '../containers/Search';
import UpdateSubscriptionPage from '../containers/Company/Setup/UpdateSubscriptionPage';
import SubscriptionRenewal from '../containers/Company/SubscriptionRenewal';
import StripeSubscriptionPaymentWindow from '../containers/Company/Stripe/StripeSubscriptionPaymentWindow';
import StripeSubscriptionReturnWindow from '../containers/Company/Stripe/StripeSubscriptionReturnWindow';
import { PaystackIntentCallbackWindow } from '../payments/Paystack';
import { CompanyPage } from '../containers/ProviderPage';
import CardEditor from '../containers/Company/CardEditor';
import ReturnPolicy from '../containers/ReturnPolicy';
import CompanyReturnPolicy from '../containers/Company/ReturnPolicy';
import { PrivacyPolicy, TermsAndConditions } from '../containers/TermsAndPrivacy';
import UserHome from '../containers/User/UserHome';
import Settings from '../containers/User/Settings';
import Brand from '../containers/Company/Settings/Brand';
import Profile from '../containers/Company/Settings/Profile';
import General from '../containers/Company/Settings/General';
import Bookings from '../containers/Company/Settings/Bookings';
import Payments from '../containers/Company/Settings/Payments';
import Reports from '../containers/Company/Settings/Reports';
import CompanySubscriptions from '../containers/Company/Settings/Subscriptions';
import Notifications from '../containers/Company/Settings/Notifications';
import Reviews from '../containers/Company/Settings/Reviews';
import Downloads from '../containers/Company/Settings/Downloads';
import Activities from '../containers/Company/Settings/Activities';
import References from '../containers/Company/Settings/References';
import Customers from '../containers/Company/Customers';
import Categories from '../containers/Company/Services/Categories';
import User from '../containers/User';
import UserSearch from '../containers/User/Search';
import UserAppointments from '../containers/User/Appointments';
import UserBookmarks from '../containers/User/Bookmarks';
import UserProvider from '../containers/User/Provider';

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <Home />,
  },
  {
    path: routes.contact,
    element: <Contact />,
  },
  {
    path: routes.termsAndConditions,
    element: <TermsAndConditions />,
  },
  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
  },
  {
    path: routes.returnPolicy,
    element: <ReturnPolicy homepage />,
  },
  {
    path: routes.pricing,
    element: <Pricing />,
  },
  {
    path: routes.company.absolute.subscriptions,
    element: <Subscriptions />,
  },
  {
    path: routes.company.absolute.login,
    element: <CompanyLogin />,
  },
  {
    path: routes.user.login,
    element: <UserLogin />,
  },
  {
    path: routes.passwordReset,
    element: <PasswordResetForm />,
  },
  {
    path: routes.company.absolute.registration,
    element: <CompanyRegistration />,
  },
  {
    path: routes.user.registeration,
    element: <UserRegistration />,
  },
  {
    path: routes.emailVerified(':resource'),
    element: <EmailVerificationSuccess />,
  },
  {
    path: routes.providerPage(':code'),
    element: <CompanyPage />,
  },
  {
    path: routes.search,
    element: <Search />,
  },
  {
    path: routes.user.base,
    element: <User />,
    children: [
      {
        path: routes.user.dashboard.home,
        element: <UserHome />,
      },
      {
        path: routes.user.dashboard.settings,
        element: <Settings />,
      },
      {
        path: routes.user.dashboard.search,
        element: <UserSearch />,
      },
      {
        path: routes.user.dashboard.appointments,
        element: <UserAppointments />,
      },
      {
        path: routes.user.dashboard.bookmarks,
        element: <UserBookmarks />,
      },
      {
        path: routes.user.dashboard.providers(':provider_id'),
        element: <UserProvider />,
      },
    ],
  },
  {
    path: routes.company.base,
    element: <Company />,
    children: [
      {
        path: routes.company.dashboard,
        element: <Dashboard />,
      },
      {
        path: routes.company.services.home,
        element: <Services />,
        children: [
          {
            path: '',
            element: <ServicesDashboard />,
          },
          {
            path: routes.company.services.categories,
            element: <Categories />,
          },
          {
            path: routes.company.services.timeSlots,
            element: <TimeSlots />,
          },
          {
            path: routes.company.services.newTimeSlot,
            element: <NewTimeSlot />,
          },
        ],
      },
      {
        path: routes.company.customers,
        element: <Customers />,
      },
      {
        path: routes.company.settings.base,
        element: <CompanySettings />,
        children: [
          {
            path: routes.company.settings.brand,
            element: <Brand />,
          },
          {
            path: routes.company.settings.profile,
            element: <Profile />,
          },
          {
            path: routes.company.settings.team,
            element: <Employees />,
          },
          {
            path: routes.company.settings.services,
            element: <ServicesDashboard />,
          },
          {
            path: routes.company.settings.general,
            element: <General />,
          },
          {
            path: routes.company.settings.page,
            element: <Bookings />,
          },
          {
            path: routes.company.settings.payments,
            element: <Payments />,
          },
          {
            path: routes.company.settings.reports,
            element: <Reports />,
          },
          {
            path: routes.company.settings.billing,
            element: <CompanySubscriptions />,
          },
          {
            path: routes.company.settings.notifications,
            element: <Notifications />,
          },
          {
            path: routes.company.settings.reviews,
            element: <Reviews />,
          },
          {
            path: routes.company.settings.downloads,
            element: <Downloads />,
          },
          {
            path: routes.company.settings.activities,
            element: <Activities />,
          },
          {
            path: routes.company.settings.refer,
            element: <References />,
          },
        ],
      },
      {
        path: routes.company.setup,
        element: <Setup />,
      },
      {
        path: routes.company.employees,
        element: <Employees />,
      },
      {
        path: routes.company.subscriptionChange,
        element: <UpdateSubscriptionPage />,
      },
      {
        path: routes.company.subscriptionRenewal,
        element: <SubscriptionRenewal />,
      },
      {
        path: routes.company.card,
        element: <CardEditor />,
      },
      {
        path: routes.company.returnPolicy,
        element: <CompanyReturnPolicy />,
      },
    ],
  },
  {
    path: routes.stripe.accountLinks.refresh,
    element: <AccountLinksRefresh />,
  },
  {
    path: routes.stripe.accountLinks.return(':id'),
    element: <AccountLinksReturn />,
  },
  {
    path: routes.stripe.deposits.elementHost(':intent_id'),
    element: <StripeDepositPaymentWindow />,
  },
  {
    path: routes.stripe.deposits.return(':intent_id'),
    element: <StripeDepositReturnWindow />,
  },
  {
    path: routes.stripe.subscriptions.elementHost(':intent_id'),
    element: <StripeSubscriptionPaymentWindow />,
  },
  {
    path: routes.stripe.subscriptions.return(':intent_id'),
    element: <StripeSubscriptionReturnWindow />,
  },
  {
    path: routes.paystack.payment(':type'),
    element: <PaystackIntentCallbackWindow />,
  },
  {
    path: routes.invalidLink,
    element: <EmailVerificationFailure />,
  },
  {
    path: '*',
    element: <Error404 />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
