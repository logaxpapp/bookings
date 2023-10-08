const routes = {
  home: '/',
  login: '/auth',
  register: '/signup',
  company: {
    base: '/companies',
    dashboard: '',
    profile: 'profile',
    calendar: 'calendar',
    employees: 'employees',
    settings: {
      base: 'settings',
      details: '',
      serviceCategories: 'service-categories',
      serviceImages: (serviceId) => `services/${serviceId}/images`,
      services: 'services',
      timeSlots: 'time-slots',
      newTimeSlots: 'time-slots/new',
    },
    setup: 'setup',
    subscriptions: 'subscriptions',
    subscriptionRenewal: 'subscription-renewal',
    absolute: {
      dashboard: '/companies',
      calendar: '/companies/calendar',
      employees: '/companies/employees',
      profile: '/companies/profile',
      settings: {
        base: '/companies/settings',
        details: '/companies/settings',
        serviceCategories: '/companies/settings/service-categories',
        serviceImages: (serviceId) => `/companies/settings/services/${serviceId}/images`,
        services: '/companies/settings/services',
        timeSlots: '/companies/settings/time-slots',
        newTimeSlots: '/companies/settings/time-slots/new',
      },
      setup: '/companies/setup',
      subscriptions: '/companies/subscriptions',
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
      absolute: {
        home: '/users',
        calendar: '/users/calendar',
        providers: (providerId) => `/users/providers/${providerId}`,
        search: '/users/search',
        settings: '/users/settings',
      },
    },
    login: '/users/signin',
    registeration: '/users/signup',
    passwordRecovery: '/users/password-recovery',
    emailVerification: (id) => `/users/${id}/verify-email-address`,
  },
  pricing: '/pricing',
  contact: '/contact',
  subscriptions: '/companies/signup/subscriptions',
  signupSuccess: '/signup/success',
  passwordReset: '/:resource/password-reset/:token',
  passwordRecoverySuccess: '/password-recoveries',
  passwordResetSuccess: '/password-reset',
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
  search: '/search',
};

export default routes;
