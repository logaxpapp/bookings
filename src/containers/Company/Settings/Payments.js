import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom/dist';
import PropTypes from 'prop-types';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import { Heading, Heading2 } from '../../Aside';
import { Switch } from '../../../components/Inputs';
import plus from '../../../assets/images/plus.svg';
import { selectServiceCategories } from '../../../redux/companySlice';
import { DatePicker2 } from '../../../components/DatePicker';
import emptyPayments from '../../../assets/images/payments.png';
import { companyProps } from '../../../utils/propTypes';
import { paymentMethods } from '../../../utils/payments';
import { classNames } from '../../../utils';
import GridPanel from '../../../components/GridPanel';

const SERVICES = 'services';

const today = new Date();

const tabs = {
  integrations: 'Payment Integrations',
  settings: 'Payment Settings',
  history: 'Payment History',
};

const headers = Object.values(tabs);

const PaymentMethodCard = ({ method, company }) => {
  const integrated = useMemo(() => (
    company.paymentMethods.find(({ name }) => name === method.id)
  ), [method]);

  const handleClick = () => {
    if (integrated) {
      // TODO:
    } else {
      // TODO:
    }
  };

  return (
    <section className="flex flex-col gap-5 rounded-lg pt-5 pb-3 pl-8 pr-4 bg-[#f8fafc] border border-[#cbd5e1]">
      <header className="flex items-center gap-2">
        <img
          src={method.icon}
          alt={method.id}
          className="h-6"
        />
        <h1 className="m-0 font-bold text-base text-[#011c39]">
          {method.name}
        </h1>
      </header>
      <p className="font-medium text-xs text-[#011c39] pr-12">
        {method.slogan}
      </p>
      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={handleClick}
          className={classNames(
            'rounded-lg py-1 px-3 font-normal text-xs text-white transition-transform hover:scale-105',
            integrated ? 'bg-[#f00]' : 'bg-[#0f0]',
          )}
        >
          {integrated ? 'Remove App' : 'Integrate App'}
        </button>
      </div>
    </section>
  );
};

PaymentMethodCard.propTypes = {
  method: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    slogan: PropTypes.string,
    icon: PropTypes.string,
  }).isRequired,
  company: companyProps.isRequired,
};

const Integrations = ({ company }) => (
  <section className="h-full overflow-y-auto">
    <GridPanel minimumChildWidth={300}>
      {paymentMethods.map((method) => (
        <div key={method.id} className="p-3">
          <PaymentMethodCard method={method} company={company} />
        </div>
      ))}
    </GridPanel>
  </section>
);

Integrations.propTypes = {
  company: companyProps.isRequired,
};

const Settings = () => {
  const [fields, setFields] = useState({
    acceptPayments: false,
    payUpfront: false,
  });

  const fieldKeys = Object.keys(fields);

  const handleChange = ({ target: { checked, name } }) => setFields(
    (fields) => ({ ...fields, [name]: checked }),
  );

  return (
    <section className="w-[600px]">
      <Heading2>Booking Payment Preferences</Heading2>
      <p className="m-0 text-sm text-[#5c5c5c]">
        Manage how customers pay for your services
      </p>
      <div className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between border border-[#cbd5e1] rounded-lg px-5 py-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-base text-[#8e98a8]">
              Accept Booking Payments
            </span>
            <span className="font-medium text-sm text-[#8e98a8]">
              Allow customers to pay online ahead of time
            </span>
          </div>
          <Switch name={fieldKeys[0]} checked={fields.acceptPayments} onChange={handleChange} />
        </div>
        <div className="flex items-center justify-between border border-[#cbd5e1] rounded-lg px-5 py-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-base text-[#8e98a8]">
              Require payment upfront
            </span>
            <span className="font-medium text-sm text-[#8e98a8]">
              Switch off for payment to be optional at the time of booking.
            </span>
          </div>
          <Switch name={fieldKeys[1]} checked={fields.payUpfront} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-5">
          <span className="font-medium text-sm text-[#8e98a8]">
            Would you like to apply additional charges or reductions, like taxes or discounts?
          </span>
          <button
            type="button"
            className="flex gap-1 bg-transparent px-8 py-3 rounded-3xl w-max"
            style={{ border: '1px solid #e9ebf8' }}
          >
            <span
              aria-hidden="true"
              className="w-5 h-5 flex-none bg-cover"
              style={{ backgroundImage: `url(${plus})` }}
            />
            <span className="text-[#8e98a8]">Add charge or reduction</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const History = () => {
  const categories = useSelector(selectServiceCategories);
  const services = useMemo(() => categories.reduce(
    (memo, cat) => [...memo, ...cat.services], [],
  ));
  const [service, setService] = useState(null);
  const [dates, setDates] = useState({
    start: today,
    end: today,
  });

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === SERVICES) {
      setService(value ? services.find(({ id }) => id === Number.parseInt(value, 10)) : null);
    }
  };

  return (
    <section className="w-full h-full flex-1 max-w-[800px] flex flex-col gap-16">
      <div className="w-full flex flex-wrap items-center gap-4">
        <label htmlFor={SERVICES} className="bold-select-wrap max-w-lg">
          <div className="bold-select caret bg-[#f8fafc] border border-[#cbd5e1]">
            <select
              name={SERVICES}
              id={SERVICES}
              value={service?.id || ''}
              onChange={handleValueChange}
            >
              <option value="">All Services</option>
              {services.map(({ id, name }) => (
                <option value={id} key={id}>{name}</option>
              ))}
            </select>
          </div>
        </label>
        <DatePicker2
          initialDate={dates.start}
          onChange={(date) => setDates((dates) => ({ ...dates, start: date }))}
        />
        <DatePicker2
          initialDate={dates.end}
          onChange={(date) => setDates((dates) => ({ ...dates, end: date }))}
        />
        <button
          type="button"
          className="bg-[#011c39] text-white rounded-[10px] py-4 px-10 text-base font-medium"
        >
          Generate
        </button>
      </div>
      <section className="w-[600px] flex-1 flex flex-col justify-center items-center gap-7">
        <div className="w-max flex flex-col items-center gap-7">
          <header className="flex flex-col items-center gap-3">
            <Heading>No Payments To Display</Heading>
            <p className="m-0 w-80 text-center">
              Click &quot;Generate&quot; button or try a different range
            </p>
          </header>
          <img
            aria-hidden="true"
            src={emptyPayments}
            className="w-44 h-44"
            alt="empty"
          />
        </div>
      </section>
    </section>
  );
};

const Payments = () => {
  const [company] = useOutletContext();
  const [tab, setTab] = useState(headers[0]);

  return (
    <section className="flex flex-col gap-6 h-full overflow-y-auto overflow-x-hidden">
      <TabHeaders headers={headers} setTab={setTab} tab={tab} />
      <TabBody tab={tab} header={tabs.integrations}>
        <Integrations company={company} />
      </TabBody>
      <TabBody tab={tab} header={tabs.settings}>
        <Settings company={company} />
      </TabBody>
      <TabBody tab={tab} header={tabs.history}>
        <History company={company} />
      </TabBody>
    </section>
  );
};

export default Payments;
