import { createSlice } from '@reduxjs/toolkit';
import {
  authenticateCompany,
  deleteResource,
  fetchResources,
  postResource,
  updateResource,
} from '../api';
import {
  LOCAL_TIME_DIFFERENCE,
  camelCase,
  camelCaseObjectProps,
  dateUtils,
  notification,
} from '../utils';
import { updateProvider } from './serviceProvidersSlice';
import AppStorage from '../utils/appStorage';

const storage = AppStorage.getInstance();

const ACCESS_MESSAGE = 'You do not have access to requested resource!';

const periodTypes = {
  working_hours: 'workingHours',
  breaks: 'breaks',
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'company',
  initialState: {
    token: null,
    company: null,
    subscription: null,
    authenticating: false,
    authenticationError: null,
    serviceCategories: [],
    timeSlots: {},
    appointments: {},
    weeklyAppointments: {},
    employee: null,
    employees: [],
    customers: [],
    permissions: {},
    employeePermissions: {},
    openMessages: [],
    maxOpenMessages: 4,
    paymentMethods: [],
    mostRecentActivities: [],
    activities: {
      data: {},
      dates: [],
      state: {
        loading: false,
        loaded: false,
        nextPage: 1,
        totalPages: 0,
      },
    },
    timesBeforeNotifications: [],
  },
  reducers: {
    setAuthenticating: (state, { payload }) => {
      state.authenticating = payload;
    },
    setup: (state, { payload }) => {
      state.company = payload.company;
      state.token = payload.token;
      state.subscription = payload.subscription;
      state.serviceCategories = payload.serviceCategories;
      state.employee = payload.employee;
      state.employees = payload.employees;
      state.customers = payload.customers;
      state.permissions = payload.permissions;
      state.employeePermissions = payload.employeePermissions;
      state.authenticating = false;
      state.paymentMethods = payload.paymentMethods;
      state.mostRecentActivities = payload.activities;
      state.timesBeforeNotifications = payload.timesBeforeNotifications;
      storage.setEmployeeToken(payload.token);
    },
    teardown: (state) => {
      state.company = null;
      state.token = null;
      state.subscription = null;
      state.authenticating = false;
      state.authenticationError = null;
      state.serviceCategories = [];
      state.timeSlots = {};
      state.appointments = {};
      state.weeklyAppointments = {};
      state.employee = null;
      state.employees = [];
      state.permissions = {};
      state.employeePermissions = {};
      state.paymentMethods = [];
      state.mostRecentActivities = [];
      state.activities = {
        data: {},
        dates: [],
        state: {
          loading: false,
          loaded: false,
          nextPage: 1,
          totalPages: 0,
        },
      };
      state.timesBeforeNotifications = [];
      storage.unsetEmployeeToken();
    },
    setCompany: (state, { payload }) => {
      state.company = payload;
      state.authenticating = false;
    },
    setAuthenticationError: (state, { payload }) => {
      state.authenticationError = payload;
      state.authenticating = false;
    },
    updateCompany: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.company[camelCase(key)] = payload[key];
      });
    },
    setSubscription: (state, { payload }) => {
      state.subscription = payload;
    },
    setServiceCategories: (state, { payload }) => {
      state.serviceCategories = payload;
    },
    addTimeSlotsForDate: (state, { payload: { date, slots } }) => {
      state.timeSlots[date] = slots;
    },
    addTimeSlot: (state, { payload }) => {
      if (Array.isArray(payload)) {
        payload.forEach((slot) => {
          const date = dateUtils.toNormalizedString(slot.time);
          if (state.timeSlots[date]) {
            state.timeSlots[date].push(slot);
          }
        });
        return;
      }

      const date = dateUtils.toNormalizedString(payload.time);
      if (state.timeSlots[date]) {
        state.timeSlots[date].push(payload);
      }
    },
    updateTimeSlot: (state, { payload: { newSlot, oldSlot } }) => {
      const newDate = dateUtils.toNormalizedString(newSlot.time);
      const oldDate = dateUtils.toNormalizedString(oldSlot.time);

      if (oldDate === newDate) {
        if (state.timeSlots[oldDate]) {
          state.timeSlots[oldDate] = state.timeSlots[oldDate].reduce((slots, slot) => [
            ...slots,
            slot.id === oldSlot.id ? newSlot : slot,
          ], []);
        }
      } else {
        if (state.timeSlots[oldDate]) {
          state.timeSlots[oldDate] = state.timeSlots[oldDate].filter(
            (slot) => slot.id !== oldSlot.id,
          );
        }
        if (state.timeSlots[newDate]) {
          state.timeSlots[newDate].push(newSlot);
        }
      }
    },
    deleteTimeSlot: (state, { payload }) => {
      const date = dateUtils.toNormalizedString(payload.time);
      if (state.timeSlots[date]) {
        state.timeSlots[date] = state.timeSlots[date].filter(
          (slot) => slot.id !== payload.id,
        );
      }
    },
    deleteTimeSlots: (state, { payload }) => {
      if (state.timeSlots[payload]) {
        state.timeSlots[payload] = [];
      }
    },
    setAppointments: (state, { payload }) => {
      state.appointments = payload;
    },
    addAppointmentsForDate: (state, { payload: { date, appointments } }) => {
      state.appointments[date] = appointments;
    },
    addAppointment: (state, { payload }) => {
      const date = dateUtils.toNormalizedString(payload.timeSlot.time);
      if (state.appointments[date]) {
        state.appointments[date].push(payload);
      }
      if (state.weeklyAppointments[date]) {
        state.weeklyAppointments[date].push(payload);
      } else {
        state.weeklyAppointments[date] = [payload];
      }
    },
    updateAppointment: (state, { payload: { newAppointment, oldAppointment } }) => {
      const newDate = dateUtils.toNormalizedString(newAppointment.timeSlot.time);
      const oldDate = dateUtils.toNormalizedString(oldAppointment.timeSlot.time);

      if (oldDate === newDate) {
        if (state.appointments[oldDate]) {
          state.appointments[oldDate] = state.appointments[oldDate].reduce(
            (appointments, appointment) => [
              ...appointments,
              appointment.id === oldAppointment.id ? newAppointment : appointment,
            ],
            [],
          );
        }

        if (state.weeklyAppointments[oldDate]) {
          state.weeklyAppointments[oldDate] = state.weeklyAppointments[oldDate].reduce(
            (appointments, appointment) => [
              ...appointments,
              appointment.id === oldAppointment.id ? newAppointment : appointment,
            ],
            [],
          );
        }
      } else {
        if (state.appointments[oldDate]) {
          state.appointments[oldDate] = state.appointments[oldDate].filter(
            (appointment) => appointment.id !== oldAppointment.id,
          );
        }
        if (state.appointments[newDate]) {
          state.appointments[newDate].push(newAppointment);
        }

        if (state.weeklyAppointments[oldDate]) {
          state.weeklyAppointments[oldDate] = state.weeklyAppointments[oldDate].filter(
            (appointment) => appointment.id !== oldAppointment.id,
          );
        }
        if (state.weeklyAppointments[newDate]) {
          state.weeklyAppointments[newDate].push(newAppointment);
        }
      }
    },
    setWeeklyAppointments: (state, { payload }) => {
      state.weeklyAppointments = payload;
    },
    deleteAppointment: (state, { payload }) => {
      const date = dateUtils.toNormalizedString(payload.timeSlot.time);
      if (state.appointments[date]) {
        state.appointments[date] = state.appointments[date].filter(
          (appointment) => appointment.id !== payload.id,
        );
      }
    },
    addAppointmentMessage: (state, { payload: { appointment, message } }) => {
      const date = dateUtils.toNormalizedString(appointment.timeSlot.time);
      let appointments = state.appointments[date];
      if (appointments) {
        state.appointments[date] = appointments.map((app) => (
          app.id === appointment.id ? { ...app, messages: [message, ...app.messages] } : app
        ));
      }

      appointments = state.weeklyAppointments[date];
      if (appointments) {
        state.weeklyAppointments[date] = appointments.map((app) => (
          app.id === appointment.id ? { ...app, messages: [message, ...app.messages] } : app
        ));
      }

      state.openMessages = state.openMessages.map(
        (app) => (app.id === appointment.id
          ? { ...app, messages: [message, ...app.messages] }
          : app),
      );
    },
    addReceivedAppointmentMessage: (state, { payload }) => {
      let dates = Object.keys(state.appointments);
      const refId = payload.referenceId;
      for (let i = 0; i < dates.length; i += 1) {
        const appointment = state.appointments[dates[i]].find(({ id }) => id === refId);
        if (appointment) {
          state.appointments[dates[i]] = state.appointments[dates[i]].map((app) => (
            app.id === refId ? { ...app, messages: [payload, ...app.messages] } : app
          ));
          break;
        }
      }

      dates = Object.keys(state.weeklyAppointments);

      for (let i = 0; i < dates.length; i += 1) {
        const appointment = state.weeklyAppointments[dates[i]].find(({ id }) => id === refId);
        if (appointment) {
          state.weeklyAppointments[dates[i]] = state.weeklyAppointments[dates[i]].map((app) => (
            app.id === refId ? { ...app, messages: [payload, ...app.messages] } : app
          ));
          break;
        }
      }

      state.openMessages = state.openMessages.map(
        (app) => (app.id === refId ? { ...app, messages: [payload, ...app.messages] } : app),
      );
    },
    addAppointmentUpdateRequest: (state, { payload }) => {
      let dates = Object.keys(state.appointments);
      for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const appointment = state.appointments[date].find(({ id }) => id === payload.appointmentId);
        if (appointment) {
          state.appointments[date] = state.appointments[date].map((app) => {
            if (app.id !== appointment.id) {
              return app;
            }
            return {
              ...app,
              appointmentUpdateRequests: [payload, ...app.appointmentUpdateRequests],
            };
          });
          break;
        }
      }

      dates = Object.keys(state.weeklyAppointments);
      for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const appointment = state.weeklyAppointments[date].find(
          ({ id }) => (id === payload.appointmentId),
        );
        if (appointment) {
          state.weeklyAppointments[date] = state.weeklyAppointments[date].map((app) => {
            if (app.id !== appointment.id) {
              return app;
            }
            return {
              ...app,
              appointmentUpdateRequests: [payload, ...app.appointmentUpdateRequests],
            };
          });
          break;
        }
      }
    },
    updateAppointmentUpdateRequest: (state, { payload }) => {
      let dates = Object.keys(state.appointments);
      for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const appointment = state.appointments[date].find(({ id }) => id === payload.appointmentId);
        if (appointment) {
          state.appointments[date] = state.appointments[date].map((app) => {
            if (app.id !== appointment.id) {
              return app;
            }
            return {
              ...app,
              appointmentUpdateRequests: app.appointmentUpdateRequests.map(
                (request) => (request.id === payload.id ? payload : request),
              ),
            };
          });
          break;
        }
      }

      dates = Object.keys(state.weeklyAppointments);
      for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const appointment = state.weeklyAppointments[date].find(
          ({ id }) => (id === payload.appointmentId),
        );
        if (appointment) {
          state.weeklyAppointments[date] = state.weeklyAppointments[date].map((app) => {
            if (app.id !== appointment.id) {
              return app;
            }
            return {
              ...app,
              appointmentUpdateRequests: app.appointmentUpdateRequests.map(
                (request) => (request.id === payload.id ? payload : request),
              ),
            };
          });
          break;
        }
      }
    },
    addEmployee: (state, { payload }) => {
      state.employees.push(payload);
    },
    updateEmployee: (state, { payload: { id, data } }) => {
      state.employees = state.employees.map((emp) => (
        emp.id === id ? { ...emp, ...data } : emp
      ));
    },
    removeEmployee: (state, { payload }) => {
      state.employees = state.employees.filter(({ id }) => id !== payload);
    },
    addCustomer: (state, { payload }) => {
      state.customers.push(payload);
    },
    updateCustomer: (state, { payload: { id, data } }) => {
      state.customers = state.customers.map((cus) => (
        cus.id === id ? data : cus
      ));
    },
    removeCustomer: (state, { payload }) => {
      state.customers = state.customers.filter(({ id }) => id !== payload);
    },
    setOpenMessages: (state, { payload }) => {
      state.openMessages = payload;
    },
    openAppointmentMessages: (state, { payload }) => {
      if (state.openMessages.find(({ id }) => id === payload.referenceId)) {
        return;
      }

      state.openMessages.push(payload);
      if (state.openMessages.length > state.maxOpenMessages) {
        state.openMessages.shift();
      }
    },
    closeAppointmentMessage: (state, { payload }) => {
      state.openMessages = state.openMessages.filter(({ id }) => id !== payload.id);
    },
    setMaxOpenMessages: (state, { payload }) => {
      state.maxOpenMessages = payload;
      if (state.openMessages.length > payload) {
        while (payload > state.openMessages.length) {
          state.openMessages.shift();
        }
      }
    },
    setActivityLoading: (state, { payload }) => {
      state.activities = {
        ...state.activities,
        state: {
          ...state.activities.state,
          loading: payload,
        },
      };
    },
    updateActivities: (state, { payload }) => {
      const sorted = payload.data;
      sorted.sort(
        (a1, a2) => new Date(a1.date).getTime() - new Date(a2.date).getTime(),
      );

      const resultObject = { ...state.activities.data };

      sorted.forEach((act) => {
        const date = new Date(act.date);
        const dateString = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const time = date.toLocaleTimeString('en-US', {
          hour12: true,
          hour: 'numeric',
          minute: 'numeric',
        });

        let arr = resultObject[dateString];

        if (!arr) {
          arr = [];
          resultObject[dateString] = arr;
        }

        arr.push({
          id: act.id,
          description: act.description,
          by: `${act.employee.firstname} ${act.employee.lastname}`,
          time,
        });
      });

      state.activities = {
        data: resultObject,
        dates: Object.keys(resultObject),
        state: {
          loading: false,
          loaded: true,
          ...payload.meta,
        },
      };
    },
    addTimeBeforeNotifications: (state, { payload }) => {
      state.timesBeforeNotifications = [payload, ...state.timesBeforeNotifications];
    },
    updateTimeBeforeNotifications: (state, { payload: { id, data } }) => {
      state.timesBeforeNotifications = state.timesBeforeNotifications.map(
        (time) => (time.id === id ? { ...time, ...data } : time),
      );
    },
    removeTimeBeforeNotifications: (state, { payload }) => {
      state.timesBeforeNotifications = state.timesBeforeNotifications.filter(
        (time) => time.id !== payload,
      );
    },
  },
});

export const {
  setAuthenticating,
  setAuthenticationError,
  setCompany,
  setSubscription,
  setup,
  teardown,
  updateCompany,
  setServiceCategories,
  addTimeSlotsForDate,
  addTimeSlot,
  deleteTimeSlot,
  deleteTimeSlots,
  updateTimeSlot,
  setAppointments,
  addAppointmentsForDate,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  setWeeklyAppointments,
  addAppointmentMessage,
  addReceivedAppointmentMessage,
  addEmployee,
  updateEmployee,
  removeEmployee,
  addCustomer,
  updateCustomer,
  removeCustomer,
  openAppointmentMessages,
  closeAppointmentMessage,
  setMaxOpenMessages,
  setOpenMessages,
  addAppointmentUpdateRequest,
  updateAppointmentUpdateRequest,
  setActivityLoading,
  updateActivities,
  addTimeBeforeNotifications,
  updateTimeBeforeNotifications,
  removeTimeBeforeNotifications,
} = slice.actions;

export const loginAsync = (email, password, callback) => (dispatch) => {
  dispatch(setAuthenticating(true));
  authenticateCompany(email, password)
    .then((company) => {
      dispatch(setup(company));
      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      dispatch(setAuthenticationError(message));
      if (callback) {
        callback(message);
      }
    });
};

let fetchingCompany = false;

export const fetchCompanyAsync = (token, callback) => (dispatch) => {
  if (fetchingCompany) {
    return;
  }

  fetchingCompany = true;

  fetchResources('companies/auth/re-auth', token, true)
    .then((data) => {
      dispatch(setup(data));
      storage.setEmployeeToken(token);
      if (callback) {
        callback(null);
      }
      fetchingCompany = false;
    })
    .catch(({ message }) => {
      if (callback) {
        callback(message);
      }
      fetchingCompany = false;
    });
};

export const logout = () => (dispatch) => {
  dispatch(teardown());
};

export const updateCompanyAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(token, `companies/${company.id}`, data, true)
    .then(() => {
      const newData = { ...data };
      if (data.working_hours_start || data.working_hours_end) {
        const officeHours = {};
        if (data.working_hours_start) {
          officeHours.start = data.working_hours_start;
          delete data.working_hours_start;
        } else if (company.officeHours && company.officeHours.start) {
          officeHours.start = company.officeHours.start;
        }

        if (data.working_hours_end) {
          officeHours.end = data.working_hours_end;
          delete data.working_hours_end;
        } else if (company.officeHours && company.officeHours.end) {
          officeHours.end = company.officeHours.end;
        }

        newData.officeHours = officeHours;
      }
      dispatch(updateCompany(newData));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const addCompanyPeriodAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  postResource(token, `companies/${company.id}/periods`, data, true)
    .then((period) => {
      const prop = periodTypes[period.type];
      dispatch(updateCompany({ [prop]: [...company[prop], period] }));
      callback(null, period);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const deleteCompanyPeriodAsync = (id, type, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  deleteResource(token, `companies/${company.id}/periods/${id}`, true)
    .then(() => {
      const prop = periodTypes[type];
      dispatch(updateCompany({ [prop]: company[prop].filter((period) => period.id !== id) }));
      callback();
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const addCompanyTimeOffAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  postResource(token, `companies/${company.id}/time-offs`, data, true)
    .then((timeOff) => {
      dispatch(updateCompany({ timeOffs: [...company.timeOffs, timeOff] }));
      callback(null, timeOff);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const deleteCompanyTimeOffAsync = (id, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  deleteResource(token, `companies/${company.id}/time-offs/${id}`, true)
    .then(() => {
      dispatch(updateCompany({
        timeOffs: company.timeOffs.filter((timeOff) => timeOff.id !== id),
      }));
      callback();
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const updateCompanyCityAsync = (
  city,
  state,
  country,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(token, `companies/${company.id}`, { city_id: city.id }, true)
    .then(() => {
      const lCountry = { ...country };
      delete lCountry.states;
      const lState = { ...state, country: lCountry };
      delete lState.cities;
      dispatch(updateCompany({ city: { ...city, state: lState } }));
      notification.showSuccess('City successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateCompanyLocationAsync = (
  latitude,
  longitude,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(token, `companies/${company.id}`, { latitude, longitude }, true)
    .then(() => {
      dispatch(updateCompany({ location: { latitude, longitude } }));
      notification.showSuccess('Location successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateCompanyAddressAsync = (
  data,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  postResource(token, `companies/${company.id}/address`, data, true)
    .then((address) => {
      dispatch(updateCompany({ address }));
      notification.showSuccess('Address successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateCompanyImages = (
  url,
  type,
  propertyName,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  postResource(token, `companies/${company.id}/images?type=${type}`, { url }, true)
    .then(() => {
      const data = { [propertyName]: url };
      dispatch(updateCompany(data));
      dispatch(updateProvider({ id: company.id, data }));
      notification.showSuccess(`${propertyName} successfully updated.`);
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const loadSubscriptionAsync = (callback) => (dispatch, getState) => {
  const { company: { token, subscription } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  fetchResources(`subscriptions/${subscription.id}`, token, true)
    .then((subscription) => {
      dispatch(setSubscription(subscription));
      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const updateSubscriptionAsync = (
  subscription,
  { priceId },
  callback,
) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(token, `subscriptions/${subscription.id}`, { price_id: priceId }, true)
    .then((subscription) => {
      dispatch(setSubscription(subscription));
      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const updateSubscriptionPlanAsync = (priceId, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(token, 'subscriptions/update-plan', { price_id: priceId }, true)
    .then((subscription) => {
      dispatch(setSubscription(subscription));
      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const createServiceCategoryAsync = (name, callback) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  postResource(token, 'service_categories', { name }, true)
    .then((category) => {
      dispatch(setServiceCategories([...serviceCategories, category]));
      callback(null, category);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateServiceCategoryAsync = (id, name, callback) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  updateResource(token, `service_categories/${id}`, { name }, true)
    .then(() => {
      const categories = [];
      serviceCategories.forEach((cat) => categories.push(
        cat.id === id ? { ...cat, name } : cat,
      ));
      dispatch(setServiceCategories(categories));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const deleteServiceCategoryAsync = (id, callback) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  deleteResource(token, `service_categories/${id}`, true)
    .then(() => {
      dispatch(setServiceCategories(serviceCategories.filter((c) => c.id !== id)));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const createServiceAsync = (data, category, callback) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  postResource(token, `service_categories/${category.id}/services`, data, true)
    .then((service) => {
      const categories = [];
      serviceCategories.forEach((cat) => {
        categories.push(
          cat.id !== category.id
            ? cat
            : {
              ...category,
              services: [
                ...category.services,
                service,
              ],
            },
        );
      });

      dispatch(setServiceCategories(categories));
      callback(null, service);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateServiceAsync = (data, service, category, callback) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  updateResource(token, `services/${service.id}`, data, true)
    .then(() => {
      const newService = { ...service, description: data.description || '' };
      if (data.name) {
        newService.name = data.name;
      }
      if (data.price) {
        newService.price = data.price;
      }
      if (data.duration) {
        newService.duration = data.duration;
      }
      if (data.min_deposit) {
        newService.minDeposit = data.min_deposit;
      }

      const categories = [];

      if (data.category_id && data.category_id !== category.id) {
        serviceCategories.forEach((cat) => {
          if (cat.id === data.category_id) {
            categories.push({ ...cat, services: [...cat.services, newService] });
          } else if (cat.id === category.id) {
            categories.push(
              { ...cat, services: cat.services.filter(({ id }) => id !== service.id) },
            );
          } else {
            categories.push(cat);
          }
        });
      } else {
        serviceCategories.forEach((cat) => categories.push(
          cat.id === category.id
            ? { ...cat, services: cat.services.map((s) => (s.id === service.id ? newService : s)) }
            : cat,
        ));
      }

      dispatch(setServiceCategories(categories));

      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const deleteServiceAsync = (id, category, callback) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  deleteResource(token, `services/${id}`, true)
    .then(() => {
      const categories = [];
      serviceCategories.forEach((cat) => {
        categories.push(
          cat.id !== category.id
            ? cat
            : {
              ...cat,
              services: category.services.filter((serv) => serv.id !== id),
            },
        );
      });

      dispatch(setServiceCategories(categories));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const createServiceImageAsync = (
  data,
  service,
  category,
  callback,
) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  postResource(token, `services/${service.id}/images`, data, true)
    .then((image) => {
      const newCategories = serviceCategories.reduce((memo, current) => {
        if (current.id !== category.id) {
          return [...memo, current];
        }

        const services = category.services.reduce((memo, current) => {
          if (current.id !== service.id) {
            return [...memo, current];
          }

          return [
            ...memo,
            {
              ...service,
              images: [...service.images, image],
            },
          ];
        }, []);

        return [...memo, { ...current, services }];
      }, []);

      dispatch(setServiceCategories(newCategories));
      callback(null, image);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const deleteServiceImageAsync = (
  id,
  service,
  category,
  callback,
) => (dispatch, getState) => {
  const { company: { token, serviceCategories } } = getState();

  if (!token) {
    notification.showError('UnAuthorized Action Detected!');
    callback(ACCESS_MESSAGE);
  }

  deleteResource(token, `services/${service.id}/images/${id}`, true)
    .then(() => {
      const newCategories = serviceCategories.reduce((memo, current) => {
        if (current.id !== category.id) {
          return [...memo, current];
        }

        const services = category.services.reduce((memo, current) => {
          if (current.id !== service.id) {
            return [...memo, current];
          }

          return [
            ...memo,
            {
              ...service,
              images: service.images.filter((img) => img.id !== id),
            },
          ];
        }, []);

        return [...memo, { ...current, services }];
      }, []);

      dispatch(setServiceCategories(newCategories));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const getTimeSlotsAsync = (date, callback) => (dispatch, getState) => {
  const { company: { company, token, timeSlots } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  const slots = timeSlots[date];
  if (slots) {
    callback(null, slots);
    return;
  }

  fetchResources(
    `companies/${company.id}/time_slots?date=${date}&offest=${LOCAL_TIME_DIFFERENCE}`,
    token,
    true,
  )
    .then((slots) => {
      dispatch(addTimeSlotsForDate({ date, slots }));
      callback(null, slots);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const loadTimeSlotsAsync = (date, callback) => (dispatch, getState) => {
  const { company: { company, token } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  fetchResources(`companies/${company.id}/time_slots?date=${date}`, token, true)
    .then((slots) => {
      dispatch(addTimeSlotsForDate({ date, slots }));
      callback(null, slots);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const createTimeSlotsAsync = (
  data,
  serviceId,
  isBatch,
  callback,
) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized' });
    return;
  }

  postResource(token, `services/${serviceId}/time_slots${isBatch ? '?batch=true' : ''}`, data, true)
    .then((slot) => {
      dispatch(addTimeSlot(slot));
      notification.showSuccess('TimeSlot successfully created!');
      callback(null, slot);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateTimeSlotAsync = (data, slot, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  updateResource(token, `time_slots/${slot.id}`, data, true)
    .then(() => {
      const newSlot = { ...slot };
      if (data.time !== undefined) {
        newSlot.time = data.time;
      }

      dispatch(updateTimeSlot({ newSlot, oldSlot: slot }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const deleteTimeSlotAsync = (slot, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  deleteResource(token, `time_slots/${slot.id}`, true)
    .then(() => {
      dispatch(deleteTimeSlot(slot));
      notification.showSuccess('Time Slot deleted!');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const deleteTimeSlotsAsync = (ids, date, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  postResource(token, 'time_slots/delete-slots', { ids }, true)
    .then(() => {
      dispatch(deleteTimeSlots(date));
      notification.showSuccess('Time Slots deleted!');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError('Failed to delete timeslots!');
      callback(message);
    });
};

const getAppointment = (appointments, weeklyAppointments, id) => {
  let appointment = null;
  let dates = Object.keys(appointments);
  for (let i = 0; i < dates.length; i += 1) {
    appointment = appointments[dates[i]].find((app) => app.id === id);
    if (appointment) {
      return appointment;
    }
  }

  dates = Object.keys(weeklyAppointments);
  for (let i = 0; i < dates.length; i += 1) {
    appointment = weeklyAppointments[dates[i]].find((app) => app.id === id);
    if (appointment) {
      return appointment;
    }
  }

  return null;
};

export const loadAppointmentsAsync = (
  date,
  callback,
  forceLoad = false,
) => (dispatch, getState) => {
  const {
    company: {
      company,
      token,
      appointments,
      weeklyAppointments,
    },
  } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  if (!forceLoad) {
    let apps = appointments[date];
    if (apps) {
      callback(null, apps);
      return;
    }

    apps = weeklyAppointments[date];
    if (apps) {
      dispatch(addAppointmentsForDate({ date, appointments: apps }));
      callback(null, apps);
      return;
    }
  }

  const path = `companies/${company.id}/appointments?offset=${LOCAL_TIME_DIFFERENCE}&date=${date}`;

  fetchResources(path, token, true)
    .then((appointments) => {
      dispatch(addAppointmentsForDate({ date, appointments }));
      callback(null, appointments);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const loadAppointmentsForWekAsync = (weekStartDate, callback) => (dispatch, getState) => {
  const {
    company: {
      company,
      token,
      weeklyAppointments: { week, appointments },
    },
  } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  if (week === weekStartDate) {
    callback(null, appointments);
    return;
  }

  const path = `companies/${company.id}/appointments?offset=${LOCAL_TIME_DIFFERENCE}&from=${weekStartDate}&days=7`;

  fetchResources(path, token, true)
    .then((appointments) => {
      const appointmentsObject = appointments.reduce((memo, appointment) => {
        const date = dateUtils.toNormalizedString(appointment.timeSlot.time);
        const appointmentsForDate = memo[date] || [];
        return { ...memo, [date]: [...appointmentsForDate, appointment] };
      }, {});

      dispatch(setWeeklyAppointments(appointmentsObject));
      callback(null, appointments);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const createCustomAppointmentAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    callback({ message: 'UnAuthorized!' });
    return;
  }

  postResource(token, 'appointments/custom', data, true)
    .then((appointment) => {
      dispatch(addAppointment(appointment));
      callback(null, appointment);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while creating appointment!');
      callback(message);
    });
};

export const updateAppointmentAsync = (
  data,
  appointment,
  callback,
) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(token, `appointments/${appointment.id}`, data, true)
    .then(() => {
      const newAppointment = { ...appointment, ...data };

      dispatch(updateAppointment({ newAppointment, oldAppointment: appointment }));

      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const sendAppointmentMessageAsync = (
  appointment,
  data,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback({ message: 'UnAuthorized!' });
    }
    return;
  }

  postResource(
    token,
    `companies/${company.id}/appointments/${appointment.id}/correspondences`,
    data,
    true,
  )
    .then((message) => {
      dispatch(addAppointmentMessage({ appointment, message }));
      if (callback) {
        callback(null, message);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const openAppointmentMessage = (message, callback) => (dispatch, getState) => {
  dispatch(addReceivedAppointmentMessage(message));
  const { company: { openMessages } } = getState();
  for (let i = 0; i < openMessages.length; i += 1) {
    if (openMessages[i].id === message.referenceId) {
      callback(true);
      return;
    }
  }

  callback(false);
};

export const sendAppointmentMessageReplyAsync = (
  appointmentId,
  data,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback({ message: 'UnAuthorized!' });
    }
    return;
  }

  postResource(
    token,
    `companies/${company.id}/appointments/${appointmentId}/correspondences`,
    data,
    true,
  )
    .then((message) => {
      dispatch(addReceivedAppointmentMessage(message));
      if (callback) {
        callback(null, message);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const requestAppointmentUpdateAsync = (
  data,
  appointment,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(
    token,
    `companies/${company.id}/appointments/${appointment.id}/appointment_update_requests`,
    data,
    true,
  )
    .then((request) => {
      const newAppointment = {
        ...appointment,
        appointmentUpdateRequests: [
          request,
          ...appointment.appointmentUpdateRequests,
        ],
      };

      dispatch(updateAppointment({ newAppointment, oldAppointment: appointment }));

      if (callback) {
        callback(null, request);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const respondToAppointmentUpdateRequestAsync = (
  status,
  request,
  appointment,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(
    token,
    `companies/${company.id}/appointment_update_requests/${request.id}/respond`,
    { status },
    true,
  )
    .then(() => {
      const newAppointment = {
        ...appointment,
        appointmentUpdateRequests: appointment.appointmentUpdateRequests.map((req) => (
          req.id !== request.id ? req : { ...request, status }
        )),
      };

      dispatch(updateAppointment({ newAppointment, oldAppointment: appointment }));

      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const respondToLiveAppointmentUpdateRequestAsync = (
  status,
  request,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company, appointments } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(
    token,
    `companies/${company.id}/appointment_update_requests/${request.id}/respond`,
    { status },
    true,
  )
    .then(() => {
      let appointment = null;

      const dates = Object.keys(appointments);
      for (let i = 0; i < dates.length; i += 1) {
        appointment = appointments[dates[i]].find(({ id }) => id === request.appointmentId);
        if (appointment) {
          const newAppointment = {
            ...appointment,
            appointmentUpdateRequests: appointment.appointmentUpdateRequests.map((req) => (
              req.id !== request.id ? req : { ...request, status }
            )),
          };

          dispatch(updateAppointment({ newAppointment, oldAppointment: appointment }));
          break;
        }
      }

      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const deleteAppointmentUpdateRequestAsync = (
  request,
  appointment,
  callback,
) => (dispatch, getState) => {
  const {
    company: {
      token,
      company,
      appointments,
      weeklyAppointments,
    },
  } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  deleteResource(
    token,
    `companies/${company.id}/appointment_update_requests/${request.id}`,
    true,
  )
    .then(() => {
      let app = appointment;

      if (typeof app === 'number') {
        app = getAppointment(appointments, weeklyAppointments, appointment);
      }

      if (app) {
        const newAppointment = {
          ...app,
          appointmentUpdateRequests: app.appointmentUpdateRequests.filter((req) => (
            req.id !== request.id
          )),
        };

        dispatch(updateAppointment({ newAppointment, oldAppointment: app }));
      }

      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError(message);
      if (callback) {
        callback(message);
      }
    });
};

export const createEmployeeAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(token, 'employees', data, true)
    .then((employee) => {
      dispatch(addEmployee(employee));
      callback(null, employee);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateEmployeeAsync = (id, data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(token, `employees/${id}`, data, true)
    .then(() => {
      dispatch(updateEmployee({ id, data }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const removeEmployeeAsync = (id, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  deleteResource(token, `employees/${id}`, true)
    .then(() => {
      dispatch(removeEmployee(id));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const createCustomerAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(token, 'customers', data, true)
    .then((customer) => {
      dispatch(addCustomer(customer));
      callback(null, customer);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateCustomerAsync = (id, data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(token, `customers/${id}`, data, true)
    .then((customer) => {
      dispatch(updateCustomer({ id, data: customer }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const removeCustomerAsync = (id, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  deleteResource(token, `customers/${id}`, true)
    .then(() => {
      dispatch(removeCustomer(id));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const createAdditionalChargeAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(token, 'additional_charges', data, true)
    .then((charge) => {
      dispatch(updateCompany({
        additionalCharges: [...company.additionalCharges, charge],
      }));
      callback(null, charge);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateAdditionalChargeAsync = (id, data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(token, `additional_charges/${id}`, data, true)
    .then((updatedCharge) => {
      dispatch(updateCompany({
        additionalCharges: company.additionalCharges.map(
          (charge) => (charge.id === id ? updatedCharge : charge),
        ),
      }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const removeAdditionalChargeAsync = (id, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  deleteResource(token, `additional_charges/${id}`, true)
    .then(() => {
      dispatch(updateCompany({
        additionalCharges: company.additionalCharges.filter((charge) => charge.id !== id),
      }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updatePasswordAsync = (
  data,
  callback,
) => (dispatch, getState) => {
  const { company: { token, employee } } = getState();

  if (!(token && employee)) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(token, `employees/${employee.id}/password`, data, true)
    .then(() => {
      notification.showSuccess('Password successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateReturnPolicyAsync = (
  key,
  value,
  callback,
) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  const policy = company.returnPolicy;

  const url = `return_policies/${policy ? policy.id : 0}`;

  updateResource(token, url, { [key]: value }, true)
    .then((policy) => {
      dispatch(updateCompany({ ...company, returnPolicy: policy }));

      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updatePreferencesAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(token, `companies/${company.id}`, data, true)
    .then(() => {
      const newData = Object.keys(data).reduce((memo, key) => ({
        ...memo,
        [camelCase(key)]: data[key],
      }), {});
      dispatch(updateCompany({ preferences: { ...company.preferences, ...newData } }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const fetchConnectedAccountAsync = (callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  fetchResources('connected_accounts', token, true)
    .then((connectedAccounts) => {
      dispatch(updateCompany({ connectedAccounts }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

export const updateConnectedAccountAsync = (id, data, callback) => (dispatch, getState) => {
  const { company: { token, company } } = getState();

  if (!token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(token, `connected_accounts/${id}`, data, true)
    .then(() => {
      dispatch(updateCompany({
        connectedAccounts: company.connectedAccounts.map((account) => (
          account.id === id ? { ...account, ...data } : account
        )),
      }));
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      callback(message);
    });
};

let loadingActiities = false;

export const loadActivitiesAsync = (callback) => (dispatch, getState) => {
  if (loadingActiities) {
    if (callback) {
      callback();
    }

    return;
  }

  loadingActiities = true;

  const {
    company: {
      token,
      activities: {
        state: {
          loading,
          nextPage,
        },
      },
    },
  } = getState();

  if (!token) {
    loadingActiities = false;
    if (callback) {
      callback(ACCESS_MESSAGE);
    }

    return;
  }

  if (loading || !nextPage) {
    loadingActiities = false;
    if (callback) {
      callback();
      return;
    }
  }

  dispatch(setActivityLoading(true));

  fetchResources(`activities?page=${nextPage}`, token, true)
    .then((activities) => {
      dispatch(updateActivities(activities));
      loadingActiities = false;
      if (callback) {
        callback(null);
      }
    })
    .catch(({ message }) => {
      notification.showError('An error occurred while performing action!');
      loadingActiities = false;
      if (callback) {
        callback(message);
      }
    });
};

export const createTimeBeforeNotificationsAsync = (data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(token, 'time_before_notifications', data, true)
    .then((time) => {
      dispatch(addTimeBeforeNotifications(time));
      callback(null, time);
    })
    .catch(() => {
      notification.showError('Failed to create time before notification');
      callback('Failed to create time before notification');
    });
};

export const updateTimeBeforeNotificationsAsync = (id, data, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(token, `time_before_notifications/${id}`, data, true)
    .then(() => {
      const newData = camelCaseObjectProps(data);
      dispatch(updateTimeBeforeNotifications({ id, data: newData }));
      callback(null);
    })
    .catch(() => {
      notification.showError('Failed to update time before notification');
      callback('Failed to update time before notification');
    });
};

export const deleteTimeBeforeNotificationsAsync = (id, callback) => (dispatch, getState) => {
  const { company: { token } } = getState();

  if (!token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  deleteResource(token, `time_before_notifications/${id}`, true)
    .then(() => {
      dispatch(removeTimeBeforeNotifications(id));
      callback(null);
    })
    .catch(() => {
      notification.showError('Failed to delete time before notification');
      callback('Failed to delete time before notification');
    });
};

export const selectToken = (state) => state.company.token;

export const selectCompany = (state) => state.company.company;

export const selectAuthenticatingCompany = (state) => state.company.authenticating;

export const selectCompanyAuthenticationError = (state) => state.company.authenticationError;

export const selectServiceCategories = (state) => state.company.serviceCategories;

export const selectTimeSlots = (state) => state.company.timeSlots;

export const selectAppointments = (state) => state.company.appointments;

export const selectWeeklyAppointments = (state) => state.company.weeklyAppointments;

export const selectSubscription = (state) => state.company.subscription;

export const selectEmployee = (state) => state.company.employee;

export const selectCustomers = (state) => state.company.customers;

export const selectEmployees = (state) => state.company.employees;

export const selectPermissions = (state) => state.company.permissions;

export const selectEmplyeePermissions = (state) => state.company.employeePermissions;

export const selectOpenMessages = (state) => state.company.openMessages;

export const selectPaymentMethods = (state) => state.company.paymentMethods;

export const selectMostRecentActivities = (state) => state.company.mostRecentActivities;

export const selectActivities = (state) => state.company.activities;

export const selectTimesBeforeNotifications = (state) => state.company.timesBeforeNotifications;

export default slice.reducer;

/* eslint-enable no-param-reassign */
