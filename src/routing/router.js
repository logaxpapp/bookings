import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import Home from '../containers/Home';
import Contact from '../containers/Contact';
import Pricing from '../containers/Pricing';
import Login from '../containers/Login';
import CompanyLogin from '../containers/Login/CompanyLogin';
import UserLogin from '../containers/Login/UserLogin';
import CompanyRegistration from '../containers/Registration/CompanyRegistration';
import UserRegistration from '../containers/Registration/UserRegistration';
import Company from '../containers/Company';
import Dashboard from '../containers/Company/Dashboard';
import CompanySettings, { CompanyDetailsSettings } from '../containers/Company/Settings';
import ServiceCategories from '../containers/Company/Settings/ServiceCategories';
import TimeSlots, { NewTimeSlot } from '../containers/Company/Settings/TimeSlots';
import Setup from '../containers/Company/Setup';
import User from '../containers/User';
import UserDashboard from '../containers/User/Dashboard';
import Error404 from '../containers/Error404';
import Registration from '../containers/Registration';
import Subscriptions from '../containers/Subscriptions';
import {
  CompanyEmailVerification,
  UserEmailVerification,
} from '../containers/Registration/EmailVerification';
import {
  CompanyPasswordRecovery,
  PasswordResetForm,
  PasswordResetSuccess,
  UserPasswordRecovery,
} from '../containers/Login/PasswordRecovery';
import Services from '../containers/Company/Settings/Services';
import ProfilePage from '../containers/Company/ProfilePage';
import ServiceImages from '../containers/Company/Settings/ServiceImages';
import UserSearch from '../containers/User/Search';
import Provider from '../containers/User/Provider';
import Calendar from '../containers/Company/Calendar';
import AccountLinksRefresh from '../containers/Company/Stripe/AccountLinksRefresh';
import AccountLinksReturn from '../containers/Company/Stripe/AccountLinksReturn';
import StripeDepositPaymentWindow from '../containers/Company/Stripe/DepositPaymentWindow';
import StripeDepositReturnWindow from '../containers/Company/Stripe/DepositReturnWindow';
import Employees from '../containers/Company/Employees';
import Search from '../containers/Search';
import UpdateSubscriptionPage from '../containers/Company/Setup/UpdateSubscriptionPage';
import SubscriptionRenewal from '../containers/Company/SubscriptionRenewal';
import StripeSubscriptionPaymentWindow from '../containers/Company/Stripe/StripeSubscriptionPaymentWindow';
import StripeSubscriptionReturnWindow from '../containers/Company/Stripe/StripeSubscriptionReturnWindow';
import { PaystackIntentCallbackWindow } from '../payments/Paystack';

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
    path: routes.pricing,
    element: <Pricing />,
  },
  {
    path: routes.company.absolute.subscriptions,
    element: <Subscriptions />,
  },
  {
    path: routes.login,
    element: <Login />,
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
    path: routes.company.absolute.passwordRecovery,
    element: <CompanyPasswordRecovery />,
  },
  {
    path: routes.user.passwordRecovery,
    element: <UserPasswordRecovery />,
  },
  {
    path: routes.passwordReset,
    element: <PasswordResetForm />,
  },
  {
    path: routes.passwordResetSuccess,
    element: <PasswordResetSuccess />,
  },
  {
    path: routes.register,
    element: <Registration />,
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
    path: routes.search,
    element: <Search />,
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
        path: routes.company.calendar,
        element: <Calendar />,
      },
      {
        path: routes.company.profile,
        element: <ProfilePage />,
      },
      {
        path: routes.company.settings.base,
        element: <CompanySettings />,
        children: [
          {
            path: routes.company.settings.details,
            element: <CompanyDetailsSettings />,
          },
          {
            path: routes.company.settings.serviceCategories,
            element: <ServiceCategories />,
          },
          {
            path: routes.company.settings.serviceImages(':service_id'),
            element: <ServiceImages />,
          },
          {
            path: routes.company.settings.services,
            element: <Services />,
          },
          {
            path: routes.company.settings.newTimeSlots,
            element: <NewTimeSlot />,
          },
          {
            path: routes.company.settings.timeSlots,
            element: <TimeSlots />,
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
    ],
  },
  {
    path: routes.user.base,
    element: <User />,
    children: [
      {
        path: '',
        element: <UserDashboard />,
      },
      {
        path: routes.user.dashboard.search,
        element: <UserSearch />,
      },
      {
        path: routes.user.dashboard.providers(':provider_id'),
        element: <Provider />,
      },
    ],
  },
  {
    path: routes.company.absolute.emailVerification(':id'),
    element: <CompanyEmailVerification />,
  },
  {
    path: routes.user.emailVerification(':id'),
    element: <UserEmailVerification />,
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
    path: '*',
    element: <Error404 />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
