import PropTypes from 'prop-types';

export const childrenProps = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.elementType,
  PropTypes.arrayOf(PropTypes.elementType),
]);

export const periodProps = PropTypes.shape({
  id: PropTypes.number,
  start: PropTypes.number,
  end: PropTypes.number,
  weekday: PropTypes.string,
  type: PropTypes.string,
});

export const plainCityProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  stateId: PropTypes.number,
});

export const stateProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  countryId: PropTypes.number,
  cities: PropTypes.arrayOf(plainCityProps),
});

export const countryProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  code: PropTypes.string,
  currency: PropTypes.string,
  currencySymbol: PropTypes.string,
  states: PropTypes.arrayOf(stateProps),
});

export const plainCountryProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  code: PropTypes.string,
  currency: PropTypes.string,
  currencySymbol: PropTypes.string,
});

export const plainStateProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  country: plainCountryProps,
});

export const cityProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  state: plainStateProps,
});

export const locationProps = PropTypes.shape({
  latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});

export const timeSlotProps = PropTypes.shape({
  number: PropTypes.number,
  time: PropTypes.string,
  serviceId: PropTypes.number,
});

export const imageProps = PropTypes.shape({
  id: PropTypes.number,
  url: PropTypes.string,
});

export const serviceProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  price: PropTypes.number,
  duration: PropTypes.number,
  minDeposit: PropTypes.number,
  serviceId: PropTypes.number,
  timeSlotProps: PropTypes.arrayOf(timeSlotProps),
  images: PropTypes.arrayOf(imageProps),
});

export const serviceCategoryProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  companyId: PropTypes.number,
  services: PropTypes.arrayOf(serviceProps),
});

export const companyProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  profilePicture: PropTypes.string,
  coverPicture: PropTypes.string,
  city: cityProps,
  country: countryProps,
  location: locationProps,
  serviceCategories: PropTypes.arrayOf(serviceCategoryProps),
  workingHours: PropTypes.arrayOf(periodProps),
  breaks: PropTypes.arrayOf(periodProps),
});

export const servicePropsEx = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  price: PropTypes.number,
  duration: PropTypes.number,
  minDeposit: PropTypes.number,
  serviceId: PropTypes.number,
  company: companyProps,
  images: PropTypes.arrayOf(imageProps),
});

export const timeSlotPropsEx = PropTypes.shape({
  number: PropTypes.number,
  time: PropTypes.string,
  serviceId: PropTypes.number,
  service: servicePropsEx,
});

export const priceProps = PropTypes.shape({
  id: PropTypes.number,
  amount: PropTypes.string,
  country: plainCountryProps,
});

export const subscriptionProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  status: PropTypes.string,
  description: PropTypes.string,
  paymentMethod: PropTypes.string,
});

export const featureTextProps = PropTypes.shape({
  id: PropTypes.number,
  text: PropTypes.string,
  isDisplayed: PropTypes.bool,
  plans: PropTypes.arrayOf(PropTypes.number),
});

export const planProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  prices: PropTypes.arrayOf(priceProps),
  currencySymbol: PropTypes.string,
  freePeriod: PropTypes.number,
  featureTexts: PropTypes.arrayOf(featureTextProps),
});

export const userProps = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  email: PropTypes.string,
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  phoneNumber: PropTypes.string,
  city: cityProps,
});

export const correspondenceProps = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  content: PropTypes.string,
  senderId: PropTypes.number,
  senderType: PropTypes.string,
  referenceId: PropTypes.number,
  referenceType: PropTypes.string,
});

export const appointmentProps = PropTypes.shape({
  id: PropTypes.number,
  customer: userProps,
  timeSlot: timeSlotPropsEx,
  status: PropTypes.string,
  deposit: PropTypes.number,
  messages: PropTypes.arrayOf(correspondenceProps),
});

export const notificationTimeProps = PropTypes.shape({
  id: PropTypes.number,
  quantity: PropTypes.number,
  unit: PropTypes.string,
  method: PropTypes.string,
});
