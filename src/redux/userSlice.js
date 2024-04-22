import { createSlice } from '@reduxjs/toolkit';
import {
  authenticateUser,
  updateResource,
  fetchResources,
  postResource,
  deleteResource,
} from '../api';
import {
  camelCase,
  dateUtils,
  LOCAL_TIME_DIFFERENCE,
  notification,
} from '../utils';
import AppStorage from '../utils/appStorage';

const storage = AppStorage.getInstance();

const ACCESS_MESSAGE = 'You do not have access to requested resource!';

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    authenticating: false,
    authenticationError: null,
    loadingAppointments: false,
    appointments: {},
    openMessages: [],
    maxOpenMessages: 4,
  },
  reducers: {
    setAuthenticating: (state, { payload }) => {
      state.authenticating = payload;
    },
    setUser: (state, { payload }) => {
      state.user = payload;
      if (payload) {
        storage.setUserToken(payload.token);
      } else {
        storage.unsetUserToken();
      }
      state.authenticating = false;
    },
    setAuthenticationError: (state, { payload }) => {
      state.authenticationError = payload;
      state.authenticating = false;
    },
    updateUser: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.user[camelCase(key)] = payload[key];
      });
    },
    setLoadingAppointments: (state, { payload }) => {
      state.loadingAppointments = payload;
    },
    setAppointments: (state, { payload }) => {
      state.appointments = payload;
      state.loadingAppointments = false;
    },
    addAppointment: (state, { payload }) => {
      const date = dateUtils.toNormalizedString(payload.timeSlot.time);
      if (state.appointments[date]) {
        state.appointments[date].push(payload);
      }
    },
    addAppointmentsForDate: (state, { payload: { date, appointments } }) => {
      state.appointments[date] = appointments;
    },
    updateAppointment: (state, { payload }) => {
      const date = dateUtils.toNormalizedString(payload.timeSlot.time);
      if (state.appointments[date]) {
        state.appointments[date] = state.appointments[date].map(
          (app) => (app.id === payload.id ? payload : app),
        );
      }
    },
    updateAppointmentTimeSlot: (state, { payload: { appointment, newSlot } }) => {
      const oldDate = dateUtils.toNormalizedString(appointment.timeSlot.time);
      const newDate = dateUtils.toNormalizedString(newSlot.time);
      if (oldDate === newDate) {
        const slots = state.appointments[oldDate];
        if (slots) {
          state.appointments[oldDate] = slots.map(
            (app) => (app.id === appointment.id ? { ...appointment, timeSlot: newSlot } : app),
          );
        }
      } else {
        const newAppointments = state.appointments[newDate];
        if (newAppointments) {
          state.appointments[newDate] = [{ ...appointment, timeSlot: newSlot }, ...newAppointments];
        }
        const oldAppointments = state.appointments[oldDate];
        if (oldAppointments) {
          state.appointments[oldDate] = oldAppointments.filter(({ id }) => id !== appointment.id);
        }
      }
    },
    deleteAppointment: (state, { payload }) => {
      const date = dateUtils.toNormalizedString(payload.timeSlot.time);
      if (state.appointments[date]) {
        state.appointments[date] = state.appointments[date].filter(({ id }) => id !== payload.id);
      }
    },
    addAppointmentUpdateRequest: (state, { payload }) => {
      const dates = Object.keys(state.appointments);
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
    },
    updateAppointmentUpdateRequest: (state, { payload }) => {
      const dates = Object.keys(state.appointments);
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
    },
    addAppointmentMessage: (state, { payload: { appointment, message } }) => {
      const date = dateUtils.toNormalizedString(appointment.timeSlot.time);
      const appointments = state.appointments[date];
      if (appointments) {
        state.appointments[date] = appointments.map((app) => (
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
      const dates = Object.keys(state.appointments);
      const refId = payload.referenceId;
      for (let i = 0; i < dates.length; i += 1) {
        const appointment = state.appointments[dates[i]].find(({ id }) => id === refId);
        if (appointment) {
          state.appointments[dates[i]] = state.appointments[dates[i]].map((app) => (
            (app.id === refId ? { ...app, messages: [payload, ...app.messages] } : app)
          ));
          break;
        }
      }
      state.openMessages = state.openMessages.map(
        (app) => (app.id === refId ? { ...app, messages: [payload, ...app.messages] } : app),
      );
    },
    setOpenMessagesAppointmentId: (state, { payload }) => {
      state.openMessages = payload;
    },
    openAppointmentMessages: (state, { payload }) => {
      if (state.openMessages.find(({ id }) => id === payload)) {
        return;
      }

      state.openMessages.push(payload);
      if (state.openMessages.length > state.maxOpenMessages) {
        state.openMessages.shift();
      }
    },
    closeAppointmentMessage: (state, { payload }) => {
      state.openMessages = state.openMessages.filter(
        ({ id }) => id !== payload.id,
      );
    },
    setMaxOpenMessages: (state, { payload }) => {
      state.maxOpenMessages = payload;
      if (state.openMessages.length > payload) {
        while (payload > state.openMessages.length) {
          state.openMessages.shift();
        }
      }
    },
  },
});
/* eslint-enable no-param-reassign */

export const {
  setAuthenticating,
  setAuthenticationError,
  setUser,
  updateUser,
  setAppointments,
  setLoadingAppointments,
  addAppointment,
  addAppointmentsForDate,
  updateAppointment,
  updateAppointmentTimeSlot,
  deleteAppointment,
  addAppointmentMessage,
  addReceivedAppointmentMessage,
  openAppointmentMessages,
  closeAppointmentMessage,
  setMaxOpenMessages,
  setOpenMessagesAppointmentId: setOpenMessages,
  addAppointmentUpdateRequest,
  updateAppointmentUpdateRequest,
} = slice.actions;

export const loginAsync = (email, password, callback) => (dispatch) => {
  dispatch(setAuthenticating(true));
  authenticateUser(email, password)
    .then((user) => {
      dispatch(setUser(user));
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

let fetchingUser = false;

export const fetchUserAsync = (token, callback) => (dispatch) => {
  if (fetchingUser) {
    return;
  }

  fetchingUser = true;
  fetchResources('users/auth/re-auth', token, true)
    .then((data) => {
      dispatch(setUser({ ...data, token }));
      if (callback) {
        callback(null);
      }
      fetchingUser = false;
    })
    .catch(({ message }) => {
      if (callback) {
        callback(message);
      }
      fetchingUser = false;
    });
};

export const logout = () => (dispatch) => {
  dispatch(setUser(null));
};

export const updateUserAsync = (
  data,
  callback,
) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(user.token, `users/${user.id}`, data, true)
    .then(() => {
      dispatch(updateUser(data));
      notification.showSuccess('Details successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateUserAddressAsync = (
  data,
  callback,
) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user) {
    callback(ACCESS_MESSAGE);
    return;
  }

  postResource(user.token, `users/${user.id}/address`, data, true)
    .then((address) => {
      dispatch(updateUser({ address }));
      notification.showSuccess('Address successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const updateUserCityAsync = (
  city,
  state,
  country,
  callback,
) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(user.token, `users/${user.id}`, { city_id: city.id }, true)
    .then(() => {
      const lCountry = { ...country };
      delete lCountry.states;
      const lState = { ...state, country: lCountry };
      delete lState.cities;
      dispatch(updateUser({ city: { ...city, state: lState } }));
      notification.showSuccess('City successfully updated.');
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
  const { user: { user } } = getState();

  if (!user) {
    callback(ACCESS_MESSAGE);
    return;
  }

  updateResource(user.token, `users/${user.id}/password`, data, true)
    .then(() => {
      notification.showSuccess('Password successfully updated.');
      callback(null);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

const getAppointment = (appointments, id) => {
  let appointment = null;
  const dates = Object.keys(appointments);
  for (let i = 0; i < dates.length; i += 1) {
    appointment = appointments[dates[i]].find((app) => app.id === id);
    if (appointment) {
      return appointment;
    }
  }

  return null;
};

export const loadAppointmentsAsync = (options, callback) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user.token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  let path = `users/${user.id}/appointments?offset=${LOCAL_TIME_DIFFERENCE}`;
  if (options.date) {
    path = `${path}&date=${options.date}`;
  } else if (options.from) {
    if (options.to) {
      path = `${path}&from=${options.from}&to=${options.to}`;
    } else if (options.days) {
      path = `${path}&from=${options.from}&days=${options.days}`;
    }
  }

  dispatch(setLoadingAppointments(true));

  fetchResources(path, user.token, true)
    .then((appointments) => {
      const appointmentsObject = appointments.reduce((memo, appointment) => {
        const date = dateUtils.toNormalizedString(appointment.timeSlot.time);
        const appointmentsForDate = memo[date] || [];
        return { ...memo, [date]: [...appointmentsForDate, appointment] };
      }, {});

      dispatch(setAppointments(appointmentsObject));
      callback(null, appointments);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const fetchAppointmentAsync = (id, callback) => (dispatch, getState) => {
  const { user: { user, appointments } } = getState();

  if (!user.token) {
    callback(ACCESS_MESSAGE);
    return;
  }

  const appointment = getAppointment(appointments, id);

  if (appointment) {
    callback(null, appointment);
    return;
  }

  fetchResources(`users/${user.id}/appointments/${id}`, user.token, true)
    .then((appointment) => {
      callback(null, appointment);
    })
    .catch(({ message }) => {
      notification.showError(message);
      callback(message);
    });
};

export const sendAppointmentMessageAsync = (
  appointment,
  data,
  callback,
) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user.token) {
    if (callback) {
      callback({ message: 'UnAuthorized!' });
    }
    return;
  }

  postResource(
    user.token,
    `users/${user.id}/appointments/${appointment.id}/correspondences`,
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

export const sendAppointmentMessageReplyAsync = (
  appointmentId,
  data,
  callback,
) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user.token) {
    if (callback) {
      callback({ message: 'UnAuthorized!' });
    }
    return;
  }

  postResource(
    user.token,
    `users/${user.id}/appointments/${appointmentId}/correspondences`,
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

export const openAppointmentMessage = (message, callback) => (dispatch, getState) => {
  dispatch(addReceivedAppointmentMessage(message));
  const { user: { openMessages } } = getState();
  for (let i = 0; i < openMessages.length; i += 1) {
    if (openMessages[i].id === message.referenceId) {
      callback(true);
      return;
    }
  }

  callback(false);
};

export const requestAppointmentUpdateAsync = (
  data,
  appointment,
  callback,
) => (dispatch, getState) => {
  const { user: { user } } = getState();

  if (!user.token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  postResource(
    user.token,
    `users/${user.id}/appointments/${appointment.id}/appointment_update_requests`,
    data,
    true,
  )
    .then((request) => {
      dispatch(updateAppointment({
        ...appointment,
        appointmentUpdateRequests: [
          request,
          ...appointment.appointmentUpdateRequests,
        ],
      }));

      notification.showSuccess('Your request was successfully sent to the service provider.');

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
  const { user: { user } } = getState();

  if (!user.token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(
    user.token,
    `users/${user.id}/appointment_update_requests/${request.id}/respond`,
    { status },
    true,
  )
    .then(() => {
      dispatch(updateAppointment({
        ...appointment,
        appointmentUpdateRequests: appointment.appointmentUpdateRequests.map((req) => (
          req.id !== request.id ? req : { ...request, status }
        )),
      }));

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

export const respondToLiveAppointmentUpdateRequestAsync = (
  status,
  request,
  callback,
) => (dispatch, getState) => {
  const { user: { user, appointments } } = getState();

  if (!user.token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(
    user.token,
    `users/${user.id}/appointment_update_requests/${request.id}/respond`,
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

export const updateAppointmentTimeSlotAsync = (
  slot,
  request,
  appointment,
  callback,
) => (dispatch, getState) => {
  const { user: { user, appointments } } = getState();

  if (!user.token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  updateResource(
    user.token,
    `/users/${user.id}/appointment_update_requests/${request.id}`,
    { time_slot_id: slot.id },
    true,
  )
    .then(() => {
      const date = dateUtils.toNormalizedString(slot.time);
      if (appointments[date]) {
        dispatch(updateAppointmentTimeSlot({
          appointment: {
            ...appointment,
            appointmentUpdateRequests: appointment.appointmentUpdateRequests.filter(
              ({ id }) => (id !== request.id),
            ),
          },
          newSlot: { ...appointment.timeSlot, id: slot.id, time: slot.time },
        }));

        if (callback) {
          callback(null);
        }
      } else {
        dispatch(deleteAppointment(appointment));
        fetchResources(
          `users/${user.id}/appointments?date=${date}&offset=${LOCAL_TIME_DIFFERENCE}`,
          user.token,
          true,
        )
          .then((apps) => {
            dispatch(addAppointmentsForDate({ appointments: apps, date }));
            callback(null);
          })
          .catch(({ message }) => {
            notification.showError(message);
            callback(message);
          });
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
  const { user: { user, appointments } } = getState();

  if (!user.token) {
    if (callback) {
      callback(ACCESS_MESSAGE);
    }
    return;
  }

  deleteResource(
    user.token,
    `/users/${user.id}/appointment_update_requests/${request.id}`,
    true,
  )
    .then(() => {
      let app = appointment;
      if (typeof app === 'number') {
        app = getAppointment(appointments, appointment);
      }

      if (app) {
        dispatch(updateAppointment({
          ...app,
          appointmentUpdateRequests: app.appointmentUpdateRequests.filter((req) => (
            req.id !== request.id
          )),
        }));
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

export const selectUser = (state) => state.user.user;

export const selectAuthenticatingUser = (state) => state.user.authenticating;

export const selectUserAuthenticationError = (state) => state.user.authenticationError;

export const selectLoadingAppointments = (state) => state.user.loadingAppointments;

export const selectAppointments = (state) => state.user.appointments;

export const selectOpenMessages = (state) => state.user.openMessages;

export default slice.reducer;
