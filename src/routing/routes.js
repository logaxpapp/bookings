const routes = {
  home: '/',
  login: '/auth',
  register: '/signup',
  providerPage: (code) => `/providers/${code}`,
  company: {
    base: '/companies',
    dashboard: '',
    services: {
      home: 'services',
      categories: 'categories',
      timeSlots: 'time-slots',
      newTimeSlot: 'time-slots/new',
      appointments: 'appointments',
    },
    customers: 'customers',

    profile: 'profile',
    calendar: 'calendar',
    employees: 'employees',
    card: 'card',
    returnPolicy: 'return-policy',
    settings: {
      base: 'settings',
      brand: '',
      profile: 'profile',
      team: 'team',
      services: 'services',
      general: 'general',
      page: 'page',
      payments: 'payments',
      reports: 'reports',
      billing: 'billing',
      notifications: 'notifications',
      reviews: 'reviews',
      downloads: 'downloads',
      activities: 'activities',
      refer: 'refer',
    },
    setup: 'setup',
    subscriptions: 'subscriptions',
    subscriptionChange: 'subscription-change',
    subscriptionRenewal: 'subscription-renewal',
    absolute: {
      dashboard: '/companies',
      services: {
        home: '/companies/services',
        categories: '/companies/services/categories',
        timeSlots: '/companies/services/time-slots',
        newTimeSlot: '/companies/services/time-slots/new',
        appointments: '/companies/services/appointments',
      },
      customers: '/companies/customers',

      calendar: '/companies/calendar',
      employees: '/companies/employees',
      profile: '/companies/profile',
      card: '/companies/card',
      returnPolicy: '/companies/return-policy',
      settings: {
        base: '/companies/settings',
        brand: '/companies/settings',
        profile: '/companies/settings/profile',
        team: '/companies/settings/team',
        services: '/companies/settings/services',
        general: '/companies/settings/general',
        page: '/companies/settings/page',
        payments: '/companies/settings/payments',
        reports: '/companies/settings/reports',
        billing: '/companies/settings/billing',
        notifications: '/companies/settings/notifications',
        reviews: '/companies/settings/reviews',
        downloads: '/companies/settings/downloads',
        activities: '/companies/settings/activities',
        refer: 'refer',
        serviceImages: () => '',
      },
      setup: '/companies/setup',
      subscriptions: '/companies/subscriptions',
      subscriptionChange: '/companies/subscription-change',
      subscriptionRenewal: '/companies/subscription-renewal',
      emailVerification: (id) => `/companies/${id}/verify-email-address`,
      login: '/companies/signin',
      passwordRecovery: '/companies/password-recovery',
      registration: '/companies/signup',
    },
  },
  user: {
    base: '/users',
    dashboard: {
      home: '',
      calendar: 'calendar',
      providers: (providerId) => `providers/${providerId}`,
      search: 'search',
      settings: 'settings',
      bookmarks: 'bookmarks',
      appointments: 'appointments',
      absolute: {
        home: '/users',
        calendar: '/users/calendar',
        providers: (providerId) => `/users/providers/${providerId}`,
        search: '/users/search',
        settings: '/users/settings',
        bookmarks: '/users/bookmarks',
        appointments: '/users/appointments',
        appointmentHistories: '/users/appointment-histories',
      },
    },
    login: '/users/signin',
    registeration: '/users/signup',
    emailVerification: (id) => `/users/${id}/verify-email-address`,
  },
  pricing: '/pricing',
  contact: '/contact',
  returnPolicy: '/return-policy',
  termsAndConditions: '/terms-and-conditions',
  privacyPolicy: '/privacy-policy',
  signupSuccess: '/signup/success',
  passwordReset: '/:resource/password-reset/:token',
  passwordResetSuccess: '/password-reset',
  emailVerified: (resource) => `/${resource}/verified`,
  stripe: {
    accountLinks: {
      refresh: '/stripe/account_links/refresh',
      return: (id) => `/stripe/account_links/${id}/return`,
    },
    deposits: {
      elementHost: (intentId) => `/stripe/payments/deposits/${intentId}`,
      return: (intentId) => `/stripe/payments/deposits/${intentId}/return`,
    },
    subscriptions: {
      elementHost: (intentId) => `/stripe/payments/subscriptions/${intentId}`,
      return: (intentId) => `/stripe/payments/subscriptions/${intentId}/return`,
    },
  },
  paystack: {
    payment: (type) => `/paystack-payment-callback/type/${type}`,
  },
  search: '/search',
  invalidLink: 'invalid-link',
};

export default routes;
