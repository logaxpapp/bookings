import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import PropTypes from 'prop-types';
import css from './styles.module.css';
import TextBox, {
  parseAmount,
  parseDuration,
} from '../../../components/TextBox';
import {
  SvgButton,
  SvgLink,
  colors,
  paths,
} from '../../../components/svg';
import {
  currencyHelper,
  notification,
  toDuration,
} from '../../../utils';
import { NewButton } from '../../../components/Buttons';
import { useConfirmDialog, useDialog } from '../../../lib/Dialog';
import SlideDialog from '../../../components/SlideInDialog';
import {
  createServiceAsync,
  deleteServiceAsync,
  selectServiceCategories,
  updateServiceAsync,
} from '../../../redux/companySlice';
import { useBusyDialog } from '../../../components/LoadingSpinner';
import routes from '../../../routing/routes';
import { useWindowSize } from '../../../lib/hooks';
import GridPanel from '../../../components/GridPanel';
import PageHeader from '../../PageHeader';
import { serviceProps } from '../../../utils/propTypes';

const BASE = 'base';
const CATEGORY = 'category';
const DELETE = 'delete';
const DEPOSIT = 'deposit';
const DESCRIPTION = 'description';
const DURATION = 'duration';
const EDIT = 'edit';
const HOURS = 'hours';
const MINUTES = 'minutes';
const NAME = 'name';
const NEW = 'new';
const PRICE = 'price';
const SECONDS = 'seconds';
const SHOW_DETAILS = 'show_details';
const SUB = 'sub';
const MAXIMUM_DESCRIPTION_LENGTH = 100;

/**
 * @param {string} str
 */
const getAmount = (str) => {
  if (!str) {
    return 0;
  }

  if (typeof str === 'number') {
    return str;
  }

  const parts = str.split('.').map((p) => (Number.isNaN(p) ? 0 : Number.parseInt(p, 10)));
  if (!parts.length) {
    return 0;
  }

  let amount = 100 * parts[0];
  if (parts.length > 1) {
    amount += parts[1];
  }

  return amount;
};

/**
 * @param {string} str
 */
const getDuration = (str) => {
  if (!str) {
    return 0;
  }
  if (typeof str === 'number') {
    return 3600 * str;
  }
  const parts = str.split(':').map((p) => (Number.isNaN(p) ? 0 : Number.parseInt(p, 10)));
  if (!parts.length) {
    return 0;
  }

  let duration = 3600 * parts[0];
  if (parts.length > 1) {
    duration += 60 * parts[1];
  }
  if (parts.length > 2) {
    duration += parts[2];
  }

  return duration;
};

const getDurationText = (num) => {
  let number = Number.parseInt(num, 10);
  let duration = '0:';
  if (number >= 3600) {
    duration = `${Math.floor(number / 3600)}:`;
    number %= 3600;
  }

  duration = `${duration}${Math.floor(number / 60)}`;
  number %= 60;
  if (number) {
    duration = `${duration}:${number}`;
  }

  return duration;
};

/**
 * @param {Object} props
 * @param {import('../../../types').NamedStyle} props.style
 */
const AmountInput = ({
  name,
  value,
  label,
  error,
  symbol,
  onChange,
  style,
}) => {
  const [amount, setAmount] = useState({ base: '', sub: '' });

  useEffect(() => {
    const val = currencyHelper.toUnits(value);
    setAmount({ base: val.base || '', sub: val.sub || '' });
  }, [value, setAmount]);

  const handleValueChange = useCallback(({ target: { name: inputName, value } }) => {
    let intValue = 0;
    if (value) {
      intValue = Number.parseInt(value, 10);
      if (!value) {
        return;
      }
    }

    if (inputName === BASE) {
      onChange(name, (100 * intValue) + (amount.sub || 0));
    } else if (inputName === SUB) {
      if (intValue > 99) {
        return;
      }

      onChange(name, 100 * (amount.base || 0) + intValue);
    }
  }, [name, amount, onChange]);

  return (
    <div className={`${css.custom_input_wrap} ${css.amount_input_wrap}`}>
      <span className={css.custom_input_label}>{label}</span>
      <div style={style} className={css.custom_input_wrap_inner}>
        <span className={css.amount_symbol}>{symbol}</span>
        <input type="text" name={BASE} value={amount.base} onChange={handleValueChange} />
        <span className={css.amount_input_dot_separator} />
        <input type="text" name={SUB} value={amount.sub} onChange={handleValueChange} />
      </div>
      {error ? <div className={css.custom_input_error}>{error}</div> : null}
    </div>
  );
};

AmountInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  symbol: PropTypes.string,
  style: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
};

AmountInput.defaultProps = {
  value: '',
  label: 'Duration',
  error: null,
  symbol: '$',
  style: {},
};

/**
 * @param {Object} props
 * @param {import('../../../types').NamedStyle} props.style
 */
const DurationInput = ({
  name,
  value,
  label,
  error,
  onChange,
  style,
  includeSeconds,
}) => {
  const [duration, setDuration] = useState({ hrs: '', mins: '', secs: '' });

  useEffect(() => {
    const hrs = Math.floor(value / 3600) || '';
    const rem = value % 3600;
    const mins = Math.floor(rem / 60) || '';
    const secs = (rem % 60) || '';

    setDuration({ hrs, mins, secs });
  }, [value, setDuration]);

  const handleValueChange = useCallback(({ target: { name: inputName, value } }) => {
    let intValue = 0;
    if (value) {
      intValue = Number.parseInt(value, 10);
      if (!value) {
        return;
      }
    }

    if (inputName === HOURS) {
      onChange(name, (3600 * intValue) + (60 * (duration.mins || 0)) + (duration.secs || 0));
    } else if (inputName === MINUTES) {
      if (intValue > 59) {
        return;
      }

      onChange(name, (3600 * (duration.hrs || 0)) + (60 * intValue) + (duration.secs || 0));
    } else if (inputName === SECONDS) {
      if (intValue > 59) {
        return;
      }

      onChange(name, (3600 * (duration.hrs || 0)) + (60 * (duration.mins || 0)) + intValue);
    }
  }, [name, duration, onChange]);

  return (
    <div className={css.custom_input_wrap}>
      <span className={css.custom_input_label}>{label}</span>
      <div style={style} className={css.custom_input_wrap_inner}>
        <span>hrs</span>
        <input type="text" name={HOURS} value={duration.hrs} onChange={handleValueChange} />
        <span>mins</span>
        <input type="text" name={MINUTES} value={duration.mins} onChange={handleValueChange} />
        {includeSeconds ? (
          <>
            <span>secs</span>
            <input type="text" name={SECONDS} value={duration.secs} onChange={handleValueChange} />
          </>
        ) : null}
      </div>
      {error ? <div className={css.custom_input_error}>{error}</div> : null}
    </div>
  );
};

DurationInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.shape({}),
  includeSeconds: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

DurationInput.defaultProps = {
  value: '',
  label: 'Duration',
  error: null,
  style: {},
  includeSeconds: false,
};

const ServiceEditor = ({ service, category, onClose }) => {
  const [isOpen, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [deposit, setDeposit] = useState('');
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [durationError, setDurationError] = useState('');
  const [categoryId, setCategoryId] = useState();
  const [hasDescriptionError, setHasDescriptionError] = useState(false);
  const categories = useSelector(selectServiceCategories);
  const busyDialog = useBusyDialog();
  const dispatch = useDispatch();

  useEffect(() => {
    if (category) {
      setCategoryId(category.id);
    } else if (categories.length) {
      setCategoryId(categories[0].id);
    }
    setEdit(!!service);
  }, []);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPrice(currencyHelper.fromDecimal(service.price / 100));
      setDuration(getDurationText(service.duration));
      setDeposit(currencyHelper.fromDecimal(service.minDeposit / 100));
    }
  }, [service]);

  useEffect(() => setOpen(true), []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === NAME) {
      setName(value);
    } else if (name === PRICE) {
      setPrice(parseAmount(value));
    } else if (name === DEPOSIT) {
      setDeposit(parseAmount(value));
    } else if (name === DURATION) {
      setDuration(parseDuration(value));
    } else if (name === CATEGORY) {
      setCategoryId(Number.parseInt(value, 10));
    } else if (name === DESCRIPTION) {
      if (value.length > MAXIMUM_DESCRIPTION_LENGTH) {
        setHasDescriptionError(true);
      } else {
        setDescription(value);
        setHasDescriptionError(false);
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, 500);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    let hasError = false;
    const intPrice = getAmount(price);
    const minDeposit = getAmount(deposit);
    const intDuration = getDuration(duration);

    if (!name) {
      setNameError('Name is required!');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!intPrice) {
      setPriceError('Price is invalid!');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (!intDuration) {
      setDurationError('Duration is invalid!');
      hasError = true;
    } else {
      setDurationError('');
    }

    if (hasError) {
      return;
    }

    let data;
    let popup;
    let completedHandler;

    if (!service) {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) {
        notification.showError('Please select a category!');
        return;
      }

      data = {
        name,
        price: intPrice,
        duration: intDuration,
        min_deposit: minDeposit,
        category_id: categoryId,
      };

      if (description) {
        data.description = description;
      }

      popup = busyDialog.show('Creating Service ...');
      completedHandler = (err) => {
        popup.close();
        if (!err) {
          onClose();
        }
      };
      dispatch(createServiceAsync(data, cat, completedHandler));
      return;
    }

    data = {};
    if (name !== service.name) {
      data.name = name;
    }
    if (intPrice !== service.price) {
      data.price = intPrice;
    }
    if (intDuration !== service.duration) {
      data.duration = intDuration;
    }
    if (minDeposit !== service.minDeposit) {
      data.min_deposit = minDeposit;
    }
    if (description !== service.description) {
      data.description = description;
    }

    if (!Object.keys(data).length) {
      notification.showInfo('You have NOT made any changes!');
      return;
    }

    popup = busyDialog.show('Updating Service ...');
    completedHandler = (err) => {
      popup.close();
      if (!err) {
        onClose();
      }
    };

    dispatch(updateServiceAsync(data, service, category, completedHandler));
  }, [
    service, category, categories, name, price, duration,
    deposit, categoryId, description,
  ]);

  return (
    <SlideDialog isIn={isOpen}>
      <section className={css.service_editor}>
        <h1 className={`${css.h1} ${css.pad}`}>
          {service ? 'Update Service' : 'New Service'}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className={css.service_editor_inputs_wrap}>
            <div className={css.custom_input_wrap}>
              <div className={css.custom_input_label}>Category</div>
              <div className="select">
                <select
                  name={CATEGORY}
                  value={categoryId}
                  onChange={handleValueChange}
                  disabled={isEdit}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <TextBox
              type="text"
              id={NAME}
              name={NAME}
              value={name}
              label="Name"
              error={nameError}
              style={{ backgroundColor: '#edf1f7' }}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
            />
            <TextBox
              type="text"
              id={PRICE}
              name={PRICE}
              value={price}
              label="Price"
              placeholder="10.50"
              error={priceError}
              style={{ backgroundColor: '#edf1f7' }}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
            />
            <TextBox
              type="text"
              id={DURATION}
              name={DURATION}
              value={duration}
              label="Duration"
              placeholder="1:30"
              error={durationError}
              style={{ backgroundColor: '#edf1f7' }}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
            />
            <TextBox
              type="text"
              id={DEPOSIT}
              name={DEPOSIT}
              value={deposit}
              label="Deposit"
              placeholder="1.00"
              style={{ backgroundColor: '#edf1f7' }}
              containerStyle={{ marginBottom: 0 }}
              onChange={handleValueChange}
            />
          </div>
          <label className={`input-label ${css.description_wrap}`} htmlFor={DESCRIPTION}>
            <span className="input-label-text">Description</span>
            <textarea
              name={DESCRIPTION}
              id={DESCRIPTION}
              value={description}
              className={css.description}
              onChange={handleValueChange}
              placeholder={`Enter optional description. Maximum length is ${MAXIMUM_DESCRIPTION_LENGTH} characters ...`}
            />
            {hasDescriptionError ? (
              <span className="input-error">
                {`Maximum allowed length is ${MAXIMUM_DESCRIPTION_LENGTH}.`}
              </span>
            ) : null}
          </label>
          <div className="form-controls pad">
            <button type="submit" className="control-btn">
              {service ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
        <SvgButton
          type="button"
          path={paths.close}
          color={colors.delete}
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
          }}
          sm
        />
      </section>
    </SlideDialog>
  );
};

ServiceEditor.propTypes = {
  service: serviceProps,
  category: PropTypes.shape({
    id: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
};

ServiceEditor.defaultProps = {
  service: null,
  category: null,
};

const ServiceRow = ({
  service,
  category,
  currencySymbol,
  onEdit,
  onDelete,
}) => {
  const [params, setParams] = useState({
    price: '',
    duration: '',
    deposit: '',
  });

  const dialog = useDialog();

  useEffect(() => {
    const price = currencyHelper.toString(service.price, currencySymbol);
    const duration = toDuration(service.duration);
    const deposit = currencyHelper.toString(service.minDeposit, currencySymbol);
    setParams({ price, duration, deposit });
  }, [service, setParams]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === EDIT) {
      onEdit(service, category);
    } else if (name === DELETE) {
      onDelete(service, category);
    } else if (name === SHOW_DETAILS) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <div className="dialog">
          <section className="bold-dialog-body">
            <span>{service.description || 'You have not added any description.'}</span>
            <SvgButton
              color={colors.delete}
              path={paths.close}
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
              }}
            />
          </section>
        </div>,
      );
    }
  }, [service, category, onEdit, onDelete, dialog]);

  return (
    <tr>
      <td>{service.name}</td>
      <td>{params.price}</td>
      <td>{params.duration}</td>
      <td>{params.deposit}</td>
      <td aria-label="show details" className="control">
        <SvgButton
          type="button"
          name={SHOW_DETAILS}
          path={paths.details}
          title="Description"
          onClick={handleClick}
          sm
        />
      </td>
      <td aria-label="edit" className="control">
        <SvgButton
          type="button"
          name={EDIT}
          path={paths.pencil}
          title="Edit"
          onClick={handleClick}
          sm
        />
      </td>
      <td aria-label="Manage Service Images" className="control">
        <SvgLink
          to={routes.company.absolute.settings.serviceImages(service.id)}
          title="Manage Service Images"
          path={paths.imagePlus}
          sm
        />
      </td>
      <td aria-label="delete" className="control">
        <SvgButton
          type="button"
          name={DELETE}
          path={paths.delete}
          title="Delete"
          color={colors.delete}
          onClick={handleClick}
          sm
        />
      </td>
    </tr>
  );
};

ServiceRow.propTypes = {
  service: serviceProps.isRequired,
  category: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  currencySymbol: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const ServiceCard = ({
  service,
  category,
  currencySymbol,
  onEdit,
  onDelete,
}) => {
  const [params, setParams] = useState({
    price: '',
    duration: '',
    deposit: '',
  });

  const dialog = useDialog();

  useEffect(() => {
    const price = currencyHelper.toString(service.price, currencySymbol);
    const duration = toDuration(service.duration);
    const deposit = currencyHelper.toString(service.minDeposit, currencySymbol);
    setParams({ price, duration, deposit });
  }, [service, setParams]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === EDIT) {
      onEdit(service, category);
    } else if (name === DELETE) {
      onDelete(service, category);
    } else if (name === SHOW_DETAILS) {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <div className="dialog">
          <section className="bold-dialog-body">
            <span>{service.description || 'You have not added any description.'}</span>
            <SvgButton
              color={colors.delete}
              path={paths.close}
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
              }}
            />
          </section>
        </div>,
      );
    }
  }, [service, category, onEdit, onDelete, dialog]);

  return (
    <section className={`card ${css.service_card}`}>
      <div className="card-body">
        <div className="card-row">
          <span className={`card-label ${css.service_card_label}`}>Name</span>
          <span className="ellipsis card-value" title={service.name}>
            {service.name}
          </span>
        </div>
        <div className="card-row">
          <span className={`card-label ${css.service_card_label}`}>Price</span>
          <span className="ellipsis card-value" title={params.price}>
            {params.price}
          </span>
        </div>
        <div className="card-row">
          <span className={`card-label ${css.service_card_label}`}>Duration</span>
          <span className="ellipsis card-value" title={params.duration}>
            {params.duration}
          </span>
        </div>
        <div className="card-row">
          <span className={`card-label ${css.service_card_label}`}>Deposit</span>
          <span className="ellipsis card-value" title={params.deposit}>
            {params.deposit}
          </span>
        </div>
      </div>
      <div className="card-footer">
        <SvgButton
          type="button"
          name={SHOW_DETAILS}
          path={paths.details}
          title="Description"
          onClick={handleClick}
          sm
        />
        <SvgButton
          type="button"
          name={EDIT}
          path={paths.pencil}
          title="Edit"
          onClick={handleClick}
          sm
        />
        <SvgLink
          to={routes.company.absolute.settings.serviceImages(service.id)}
          title="Manage Service Images"
          path={paths.imagePlus}
          sm
        />
        <SvgButton
          type="button"
          name={DELETE}
          path={paths.delete}
          title="Delete"
          color={colors.delete}
          onClick={handleClick}
          sm
        />
      </div>
    </section>
  );
};

ServiceCard.propTypes = {
  service: serviceProps.isRequired,
  category: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  currencySymbol: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const ServicesTable = ({
  categories,
  currencySymbol,
  onEdit,
  onDelete,
}) => (
  <div className={`table-card ${css.services_table_wrap}`}>
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Duration</th>
          <th>Minimum Deposit</th>
          <th colSpan={4}>Actions</th>
        </tr>
      </thead>
      {categories.map((cat) => (
        <tbody key={cat.id}>
          <tr className={`header ${css.table_heading_row}`}>
            <td
              colSpan={7}
              className={css.table_heading}
              style={{ padding: '8px' }}
            >
              {cat.name}
            </td>
          </tr>
          {cat.services.length ? (
            <>
              {cat.services.map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  category={cat}
                  currencySymbol={currencySymbol}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </>
          ) : (
            <tr className="header">
              <td
                className={`${css.empty_notice} ${css.small}`}
                style={{ textAlign: 'center' }}
                colSpan={7}
              >
                No services found!
              </td>
            </tr>
          )}
        </tbody>
      ))}
    </table>
  </div>
);

ServicesTable.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    services: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
    })),
  })).isRequired,
  currencySymbol: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const ServicesGrid = ({
  categories,
  currencySymbol,
  onEdit,
  onDelete,
}) => (
  <section className={css.services_grid_panel}>
    {categories.map((cat) => (
      <section key={cat.id}>
        <h1 className={css.services_grid_heading}>{cat.name}</h1>
        <GridPanel minimumChildWidth={240}>
          {cat.services.map((service) => (
            <div key={service.id} className="card-center">
              <ServiceCard
                service={service}
                category={cat}
                currencySymbol={currencySymbol}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </GridPanel>
      </section>
    ))}
  </section>
);

ServicesGrid.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    services: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
    })),
  })).isRequired,
  currencySymbol: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const Services = () => {
  const [panelClass, setPanelClass] = useState(css.services_panel);
  const categories = useSelector(selectServiceCategories);
  const [company] = useOutletContext();
  const panel = useRef(null);
  const dialog = useDialog();
  const busyDialog = useBusyDialog();
  const confirmDialog = useConfirmDialog();
  const dispatch = useDispatch();
  const { width } = useWindowSize();

  useEffect(() => {
    setPanelClass(`${css.services_panel} ${panel.current.clientWidth < 640 ? css.mini : ''}`);
  }, [width]);

  const handleEdit = useCallback((service, category) => {
    let popup;
    const handleClose = () => popup.close();
    popup = dialog.show(
      <ServiceEditor service={service} category={category} onClose={handleClose} />,
      { modal: true, centered: false, transparent: false },
    );
  }, [categories]);

  const handleDelete = useCallback((service, category) => {
    confirmDialog.show(
      `The service '${service.name}' will be permanently deleted.`,
      'Do you wish to continue?',
      (confirmed) => {
        if (confirmed) {
          const popup = busyDialog.show('Deleting Service  ...');
          dispatch(deleteServiceAsync(service.id, category, popup.close));
        }
      },
    );
  }, [categories]);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === NEW) {
      if (!categories.length) {
        notification.showError('No categories found!');
        return;
      }

      handleEdit(null);
    }
  }, [categories, handleEdit]);

  return (
    <section className={`${css.content} ${css.overflow_hidden}`}>
      <PageHeader title="Services">
        <NewButton name={NEW} text="New Service" onClick={handleClick} />
      </PageHeader>
      <div ref={panel} className={`table-wrap ${panelClass}`}>
        {categories.length ? (
          <>
            <ServicesTable
              categories={categories}
              currencySymbol={company.country.currencySymbol}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <ServicesGrid
              categories={categories}
              currencySymbol={company.country.currencySymbol}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <div className={css.empty_notice}>
            No categories found.
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
