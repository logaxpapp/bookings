import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom/dist';
import PropTypes from 'prop-types';
import { TabBody, TabHeaders } from '../../../components/TabControl';
import { Heading, Heading2 } from '../../Aside';
import { Switch } from '../../../components/Inputs';
import plus from '../../../assets/images/plus.svg';
import {
  createAdditionalChargeAsync,
  fetchConnectedAccountAsync,
  removeAdditionalChargeAsync,
  selectPaymentMethods,
  selectServiceCategories,
  selectToken,
  updateAdditionalChargeAsync,
  updateConnectedAccountAsync,
} from '../../../redux/companySlice';
import { DatePicker2 } from '../../../components/DatePicker';
import emptyPayments from '../../../assets/images/payments.png';
import { companyProps } from '../../../utils/propTypes';
import GridPanel from '../../../components/GridPanel';
import { paymentMethods } from '../../../utils/payments';
import payments from '../../../payments';
import { usePrefereceFields } from '../../../utils/hooks';
import { Input, getAmount, parseAmount } from '../../../components/TextBox';
import MenuSelect from '../../../components/Inputs/MenuSelect';
import { currencyHelper, notification } from '../../../utils';
import {
  Svg,
  SvgButton,
  colors,
  paths,
} from '../../../components/svg';
import Modal from '../../../components/Modal';

const ACCEPT_PAYMENTS = 'accept_payments';
const ACTIVE = 'active';
const AMOUNT = 'amount';
const AMOUNT_TYPE = 'amount_type';
const REQUIRE_PAYMENTS_UPFRONT = 'require_payments_upfront';
const ACTIVATE = 'activate';
const DEACTIVATE = 'deativate';
const DELETE = 'delete';
const EDIT = 'edit';
const INTEGRATE = 'integrate';
const REASON = 'reason';
const SERVICES = 'services';

const today = new Date();

const tabs = {
  integrations: 'Payment Integrations',
  settings: 'Payment Settings',
  history: 'Payment History',
};

const headers = Object.values(tabs);

const amountTypes = ['Fixed', 'Percent'];

const additionalChargeProps = PropTypes.shape({
  id: PropTypes.number,
  reason: PropTypes.string,
  amount: PropTypes.number,
  amountType: PropTypes.string,
  active: PropTypes.bool,
});

const PaymentMethodCard = ({ providerName, company }) => {
  const [busy, setBusy] = useState(false);
  const token = useSelector(selectToken);
  const [account, provider] = useMemo(() => (
    [
      company.connectedAccounts.find(({ identifier }) => identifier === providerName),
      paymentMethods.find(({ id }) => id === providerName),
    ]
  ), [providerName, company]);
  const dispatch = useDispatch();

  const handleClick = ({ target: { name } }) => {
    if (name === ACTIVATE || name === DEACTIVATE) {
      const data = {
        status: name === ACTIVATE ? 'active' : 'inactive',
      };

      setBusy(true);
      dispatch(updateConnectedAccountAsync(account.id, data, () => setBusy(false)));
    } else if (name === INTEGRATE) {
      const handler = payments.getHandler(name);
      if (!handler) {
        return;
      }
      setBusy(true);
      handler.setupPaymentMethod(token, (update) => {
        if (update) {
          dispatch(fetchConnectedAccountAsync(() => setBusy(false)));
        } else {
          setBusy(false);
        }
      });
    }
  };

  return (
    <section className="flex flex-col gap-5 rounded-lg pt-5 pb-3 pl-8 pr-4 bg-[#f8fafc] border border-[#cbd5e1]">
      <header className="flex items-center gap-2">
        <img
          src={provider.icon}
          alt={provider.id}
          className="h-6"
        />
        <h1 className="m-0 font-bold text-base text-[#011c39]">
          {provider.name}
        </h1>
      </header>
      <p className="font-medium text-xs text-[#011c39] pr-12">
        {provider.slogan}
      </p>
      <div className="flex justify-end pt-3">
        {account ? (
          <>
            {account.status === 'active' ? (
              <button
                type="button"
                name={DEACTIVATE}
                onClick={handleClick}
                className="rounded-lg py-1 px-3 font-normal text-xs text-white transition-transform hover:scale-105 bg-[#df3b3b] disabled:bg-[#8b4343]"
                disabled={busy}
              >
                Deactivate
              </button>
            ) : (
              <>
                {account.status === 'inactive' ? (
                  <button
                    type="button"
                    name={ACTIVATE}
                    onClick={handleClick}
                    className="rounded-lg py-1 px-3 font-normal text-xs text-white transition-transform hover:scale-105 bg-[#2a832a] disabled:bg-[#537c53]"
                    disabled={busy}
                  >
                    Activate
                  </button>
                ) : (
                  <span
                    className="rounded-lg py-1 px-3 font-normal text-xs text-white transition-transform hover:scale-105 bg-[#b18534]"
                  >
                    Pending
                  </span>
                )}
              </>
            )}
          </>
        ) : (
          <button
            type="button"
            name={INTEGRATE}
            onClick={handleClick}
            className="rounded-lg py-1 px-3 font-normal text-xs text-white transition-transform hover:scale-105 bg-[#2a832a] disabled:bg-[#537c53]"
            disabled={busy}
          >
            Integrate App
          </button>
        )}
      </div>
    </section>
  );
};

PaymentMethodCard.propTypes = {
  providerName: PropTypes.string.isRequired,
  company: companyProps.isRequired,
};

const Integrations = ({ company }) => {
  const methods = useSelector(selectPaymentMethods);

  return (
    <section className="h-full overflow-y-auto">
      <GridPanel minimumChildWidth={300}>
        {methods.map((method) => (
          <div key={method} className="p-3">
            <PaymentMethodCard providerName={method} company={company} />
          </div>
        ))}
      </GridPanel>
    </section>
  );
};

Integrations.propTypes = {
  company: companyProps.isRequired,
};

const PaymentPreferences = () => {
  const {
    busy,
    fields,
    hasChanges,
    setFields,
    update,
  } = usePrefereceFields([ACCEPT_PAYMENTS, REQUIRE_PAYMENTS_UPFRONT]);

  const handleChange = ({ target: { checked, name } }) => setFields(
    (fields) => ({ ...fields, [name]: checked }),
  );

  return (
    <section className="p-4 border border-[#cbd5e1] rounded mt-5">
      <div className="flex items-center justify-between border border-[#cbd5e1] rounded-lg px-5 py-4 mb-5">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-base text-[#8e98a8]">
            Accept Booking Payments
          </span>
          <span className="font-medium text-sm text-[#8e98a8]">
            Allow customers to pay online ahead of time
          </span>
        </div>
        <Switch name={ACCEPT_PAYMENTS} checked={fields[ACCEPT_PAYMENTS]} onChange={handleChange} />
      </div>
      <div className="flex items-center justify-between border border-[#cbd5e1] rounded-lg py-4 px-5">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-base text-[#8e98a8]">
            Require payment upfront
          </span>
          <span className="font-medium text-sm text-[#8e98a8]">
            Switch off for payment to be optional at the time of booking.
          </span>
        </div>
        <Switch
          name={REQUIRE_PAYMENTS_UPFRONT}
          checked={fields[REQUIRE_PAYMENTS_UPFRONT]}
          onChange={handleChange}
        />
      </div>
      {hasChanges ? (
        <div className="flex justify-end pt-6">
          <button
            type="button"
            className={`btn ${busy ? 'busy' : ''}`}
            onClick={() => update()}
          >
            Update
          </button>
        </div>
      ) : null}
    </section>
  );
};

const AdditionalChargeEditor = ({
  charge,
  busy,
  setBusy,
  onClose,
}) => {
  const [fields, setFields] = useState({
    [REASON]: '',
    [AMOUNT]: '',
    [AMOUNT_TYPE]: amountTypes[0],
    [ACTIVE]: true,
  });

  const [errors, setErrors] = useState({
    [REASON]: false,
    [AMOUNT]: false,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (charge) {
      setFields({
        [REASON]: charge.reason,
        [AMOUNT]: charge.amountType === amountTypes[0]
          ? currencyHelper.fromDecimal(charge.amount / 100)
          : charge.amount,
        [AMOUNT_TYPE]: charge.amountType,
        [ACTIVE]: charge.active,
      });
    }
  }, [charge]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    if (fields[REASON].length < 5) {
      errors[REASON] = true;
    }

    if (!fields[AMOUNT]) {
      errors[AMOUNT] = true;
    }

    setErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    if (charge) {
      const data = {};

      [REASON, ACTIVE].forEach((key) => {
        if (fields[key] !== charge[key]) {
          data[key] = fields[key];
        }
      });

      if (fields[AMOUNT_TYPE] !== charge.amountType) {
        data[AMOUNT_TYPE] = fields[AMOUNT_TYPE];
      }

      if (fields[AMOUNT] !== charge.amount) {
        if (fields[AMOUNT_TYPE] === amountTypes[0]) {
          data[AMOUNT] = getAmount(fields[AMOUNT]);
        } else {
          data[AMOUNT] = fields[AMOUNT];
        }
      }

      if (!Object.keys(data).length) {
        notification.showInfo('No changes detected!');
        return;
      }

      setBusy(true);
      dispatch(updateAdditionalChargeAsync(charge.id, data, (err) => {
        setBusy(false);
        if (!err) {
          onClose();
        }
      }));

      return;
    }

    setBusy(true);
    dispatch(createAdditionalChargeAsync({
      ...fields,
      [AMOUNT]: fields[AMOUNT_TYPE] === amountTypes[0] ? getAmount(fields[AMOUNT]) : fields[AMOUNT],
    }, (err) => {
      setBusy(false);
      if (!err) {
        onClose();
      }
    }));
  };

  const handleValueChange = ({ target: { checked, name, value } }) => {
    if (name === REASON) {
      setFields((fields) => ({ ...fields, [name]: value }));
      setErrors((errors) => {
        const hasError = value.length < 5;

        return hasError === errors[name] === hasError ? errors : { ...errors, [name]: hasError };
      });
    } else if (name === AMOUNT) {
      const amount = parseAmount(value);
      setFields((fields) => ({ ...fields, [name]: amount }));

      setErrors((errors) => {
        const hasError = !value || value === '0';

        return hasError === errors[name] ? errors : { ...errors, [name]: hasError };
      });
    } else if (name === ACTIVE) {
      setFields((fields) => ({ ...fields, [name]: checked }));
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <section className="flex flex-col p-10 gap-6">
        <h1 className="pb-6 border-b border-b-gray-200 font-semibold text-lg">
          {charge ? 'Update Charge' : 'New Charge'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            name={REASON}
            value={fields[REASON]}
            label="Reason"
            error={errors[REASON] ? 'reason MUST be at least 5 characters!' : ''}
            onChange={handleValueChange}
          />
          <Input
            type="text"
            name={AMOUNT}
            value={fields[AMOUNT]}
            label="Amount"
            error={errors[AMOUNT] ? 'amount is required!' : ''}
            onChange={handleValueChange}
          />
          <div className="flex flex-col gap-1 w-max pt-4">
            <span className="font-medium text-xl text-[#011c39]">Amount Type</span>
            <MenuSelect
              value={fields[AMOUNT_TYPE]}
              options={amountTypes}
              onSelect={(value) => setFields((fields) => ({ ...fields, [AMOUNT_TYPE]: value }))}
            />
          </div>
          <div className="flex items-center gap-6 pt-4">
            <span className="font-medium text-xl text-[#011c39]">
              Active
            </span>
            <Switch
              name={ACTIVE}
              checked={fields[ACTIVE]}
              onChange={handleValueChange}
            />
          </div>
          <div className="flex justify-center pt-4">
            <button type="submit" className={`btn ${busy ? 'busy' : ''}`}>
              {charge ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

AdditionalChargeEditor.propTypes = {
  charge: additionalChargeProps,
  busy: PropTypes.bool,
  setBusy: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AdditionalChargeEditor.defaultProps = {
  charge: null,
  busy: false,
};

const AdditionalChargeRow = ({
  charge,
  currencySymbol,
  onRequestEdit,
  onRequestDelete,
}) => {
  const text = useMemo(() => {
    if (charge.amountType === amountTypes[0]) {
      return `${currencySymbol}${charge.amount / 100}`;
    }

    return `${charge.amount}%`;
  }, [charge, currencySymbol]);

  const handleClick = ({ target: { name } }) => {
    if (name === DELETE) {
      onRequestDelete(charge);
    } else if (name === EDIT) {
      onRequestEdit(charge);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative">
        <span className="clip">
          {charge.active ? 'Active' : 'Inactive'}
        </span>
        <div
          aria-hidden="true"
          className="w-6 h-6 border border-[#cbd5e1]"
        >
          {charge.active ? <Svg color="#89E101" path={paths.checkbox} /> : null}
        </div>
      </div>
      <span className="flex-1 font-semibold text-lg text-[#5c5c5c]">
        {charge.reason}
      </span>
      <span className="font-semibold text-lg text-[#5c5c5c]">
        {text}
      </span>
      <SvgButton
        type="button"
        name={EDIT}
        color="#5c5c5c"
        title="Edit"
        path={paths.pencilOutline}
        onClick={handleClick}
      />
      <SvgButton
        type="button"
        name={DELETE}
        color={colors.delete}
        title="Edit"
        path={paths.delete}
        onClick={handleClick}
      />
    </div>
  );
};

AdditionalChargeRow.propTypes = {
  charge: additionalChargeProps.isRequired,
  currencySymbol: PropTypes.string.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
  onRequestEdit: PropTypes.func.isRequired,
};

const Settings = ({ company }) => {
  const [editModal, setEditModal] = useState({
    charge: null,
    isOpen: false,
    busy: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    charge: null,
    busy: false,
  });

  const dispatch = useDispatch();

  const handleDelete = () => {
    if (!deleteModal.charge) {
      return;
    }

    setDeleteModal((modal) => ({ ...modal, busy: true }));
    dispatch(removeAdditionalChargeAsync(deleteModal.charge.id, () => setDeleteModal({
      charge: null,
      busy: false,
    })));
  };

  const requestDelete = (charge) => setDeleteModal({ charge, busy: false });

  const requestEdit = (charge) => setEditModal({ charge, isOpen: true, busy: false });

  return (
    <section className="w-[600px]" id="company-payments-settings-panel">
      <Heading2>Booking Payment Preferences</Heading2>
      <p className="m-0 text-sm text-[#5c5c5c]">
        Manage how customers pay for your services
      </p>
      <PaymentPreferences />
      {company.additionalCharges.length ? (
        <section className="flex flex-col gap-5 border border-[#cbd5e1] rounded p-4 mt-6">
          {company.additionalCharges.map((charge) => (
            <AdditionalChargeRow
              key={charge.id}
              charge={charge}
              currencySymbol={company.country.currencySymbol}
              onRequestDelete={requestDelete}
              onRequestEdit={requestEdit}
            />
          ))}
        </section>
      ) : null}
      <div className="flex flex-col gap-3 pt-6">
        <div className="flex flex-col gap-5">
          <span className="font-medium text-sm text-[#8e98a8]">
            Would you like to apply additional charges or reductions, like taxes or discounts?
          </span>
          <button
            type="button"
            className="flex gap-1 bg-transparent px-8 py-3 rounded-3xl w-max"
            style={{ border: '1px solid #e9ebf8' }}
            onClick={() => setEditModal({ charge: null, isOpen: true, busy: false })}
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
      <Modal
        isOpen={editModal.isOpen || editModal.busy}
        parentSelector={() => document.querySelector('#company-payments-settings-panel')}
        onRequestClose={() => {
          if (!editModal.busy) {
            setEditModal({ charge: null, busy: false });
          }
        }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <AdditionalChargeEditor
          charge={editModal.charge}
          busy={editModal.busy}
          setBusy={((busy) => setEditModal((modal) => ({ ...modal, busy })))}
          onClose={() => setEditModal({ charge: null, busy: false, isOpen: false })}
        />
      </Modal>
      <Modal
        isOpen={!!deleteModal.charge || deleteModal.busy}
        parentSelector={() => document.querySelector('#company-payments-settings-panel')}
        onRequestClose={() => {
          if (!deleteModal.busy) {
            setDeleteModal({ isOpen: false, busy: false, customer: null });
          }
        }}
        style={{ content: { maxWidth: 400 } }}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="py-5 px-8">
          <p className="m-0 px-4 flex flex-col gap-3">
            <span className="font-medium text-lg">
              {`The charge "${deleteModal.charge?.reason}" will be permanently deleted!`}
            </span>
            <span className="text-lg font-semibold text-center">
              Do yo wish to continue?
            </span>
          </p>
          <div className="pt-6 px-4 flex items-center justify-end">
            <button
              type="button"
              className={`btn danger ${deleteModal.busy ? 'busy' : ''}`}
              onClick={handleDelete}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

Settings.propTypes = {
  company: companyProps.isRequired,
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
