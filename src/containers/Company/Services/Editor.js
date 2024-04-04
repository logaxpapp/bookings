import {
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  createServiceAsync,
  createServiceCategoryAsync,
  selectServiceCategories,
  updateServiceAsync,
  updateServiceCategoryAsync,
} from '../../../redux/companySlice';
import { serviceCategoryProps, serviceProps } from '../../../utils/propTypes';
import {
  getAmount,
  getDuration,
  getDurationText,
  parseAmount,
  parseDuration,
} from '../../../components/TextBox';
import {
  currencyHelper,
  notification,
} from '../../../utils';

const CATEGORY = 'category';
const DEPOSIT = 'deposit';
const DESCRIPTION = 'description';
const DURATION = 'duration';
const NAME = 'name';
const PRICE = 'price';
const MAXIMUM_DESCRIPTION_LENGTH = 100;

export const ServiceEditor = ({
  busy,
  service,
  setBusy,
  onClose,
}) => {
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
  const dispatch = useDispatch();

  useEffect(() => {
    let category = null;

    if (service) {
      category = categories.find((cat) => cat.services.find(({ id }) => id === service.id));
    }

    if (category) {
      setCategoryId(category.id);
    } else if (categories.length) {
      setCategoryId(categories[0].id);
    }
  }, []);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPrice(currencyHelper.fromDecimal(service.price / 100));
      setDuration(getDurationText(service.duration));
      setDeposit(currencyHelper.fromDecimal(service.minDeposit / 100));
      setDescription(service.description || '');
    }
  }, [service]);

  const handleValueChange = ({ target: { name, value } }) => {
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
      let desc = value;
      let error = false;

      if (value.length > MAXIMUM_DESCRIPTION_LENGTH) {
        desc = value.substring(0, 100);
        error = true;
      }

      setDescription(desc);
      setHasDescriptionError(error);
    }
  };

  const handleSubmit = (e) => {
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
    const completedHandler = (err) => {
      setBusy(false);
      if (!err && onClose) {
        onClose();
      }
    };

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

      setBusy(true);
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

    const category = categories.find((cat) => cat.services.find(({ id }) => id === service.id));

    if (category?.id !== categoryId) {
      data.category_id = categoryId;
    }

    if (!Object.keys(data).length) {
      notification.showInfo('You have NOT made any changes!');
      return;
    }

    setBusy(true);
    dispatch(updateServiceAsync(data, service, category, completedHandler));
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <section className="flex flex-col p-10 gap-6">
        <h1 className="pb-6 border-b border-b-gray-200 font-semibold text-lg">
          {service ? 'Update Service' : 'New Service'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor={CATEGORY} className="bold-select-wrap">
            <span className="label">Select Category</span>
            <div className="bold-select caret">
              <select
                name={CATEGORY}
                value={categoryId}
                onChange={handleValueChange}
                disabled={!!service}
              >
                {categories.length ? null : (
                  <option value="" disabled>-- Select Category --</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-4 w-full">
            <label htmlFor={NAME} className="bold-select-wrap">
              <span className="label">Enter Service Name</span>
              <div className="bold-select">
                <input
                  type="text"
                  name={NAME}
                  id={NAME}
                  value={name}
                  className="text-input"
                  onChange={handleValueChange}
                />
                {nameError ? <span className="input-error">{nameError}</span> : null}
              </div>
            </label>
            <label htmlFor={PRICE} className="bold-select-wrap">
              <span className="label">Price</span>
              <div className="bold-select">
                <input
                  type="text"
                  name={PRICE}
                  id={PRICE}
                  value={price}
                  placeholder="10.50"
                  className="text-input"
                  onChange={handleValueChange}
                />
                {priceError ? <span className="input-error">{priceError}</span> : null}
              </div>
            </label>
            <label htmlFor={DURATION} className="bold-select-wrap">
              <span className="label">Duration</span>
              <div className="bold-select">
                <input
                  type="text"
                  name={DURATION}
                  id={DURATION}
                  value={duration}
                  placeholder="1:30"
                  className="text-input"
                  onChange={handleValueChange}
                />
                {durationError ? <span className="input-error">{durationError}</span> : null}
              </div>
            </label>
            <label htmlFor={DEPOSIT} className="bold-select-wrap">
              <span className="label">Deposit</span>
              <div className="bold-select">
                <input
                  type="text"
                  name={DEPOSIT}
                  id={DEPOSIT}
                  value={deposit}
                  placeholder="1.00"
                  className="text-input"
                  onChange={handleValueChange}
                />
              </div>
            </label>
          </div>
          <label className="bold-select-wrap" htmlFor={DESCRIPTION}>
            <span className="label">Description</span>
            <textarea
              name={DESCRIPTION}
              id={DESCRIPTION}
              value={description}
              rows={4}
              className="text-input resize-none"
              onChange={handleValueChange}
              placeholder={`Enter optional description. Maximum length is ${MAXIMUM_DESCRIPTION_LENGTH} characters ...`}
            />
            {hasDescriptionError ? (
              <span className="input-error">
                {`Maximum allowed length is ${MAXIMUM_DESCRIPTION_LENGTH}.`}
              </span>
            ) : null}
          </label>
          <div className="flex justify-end items-center gap-4 pt-6">
            <button
              type="submit"
              className={`btn ${busy ? 'busy' : ''}`}
            >
              {service ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

ServiceEditor.propTypes = {
  service: serviceProps,
  category: PropTypes.shape({
    id: PropTypes.number,
  }),
  busy: PropTypes.bool,
  setBusy: PropTypes.func,
  onClose: PropTypes.func,
};

ServiceEditor.defaultProps = {
  busy: false,
  service: null,
  category: null,
  onClose: false,
  setBusy: null,
};

export const CategoryEditor = ({
  category,
  onClose,
  setBusy,
}) => {
  const [busy, setPosting] = useState(false);
  const [name, setName] = useState('');
  const categories = useSelector(selectServiceCategories);
  const dispatch = useDispatch();

  useEffect(() => {
    if (setBusy) {
      setBusy(busy);
    }
  }, [busy]);

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name) {
      notification.showError('Please enter the category name!');
      return;
    }

    const cat = categories.find((c) => c.name === name);

    if (cat) {
      const msg = category?.id === cat.id
        ? 'You have not made any changes to name!'
        : 'A category with same name already exists!';

      notification.showError(msg);

      return;
    }

    setPosting(true);

    if (category) {
      dispatch(updateServiceCategoryAsync(category.id, name, (err) => {
        if (!err && onClose) {
          onClose();
        }
      }));
    } else {
      dispatch(createServiceCategoryAsync(name, (err) => {
        if (!err && onClose) {
          onClose();
        }
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-10 gap-6">
      <h1 className="pb-6 border-b border-b-gray-200 font-semibold text-lg">
        {category ? 'Update Category' : 'New Category'}
      </h1>
      <label htmlFor={NAME} className="bold-select-wrap">
        <span className="label">Enter Name</span>
        <div className="bold-select">
          <input
            type="text"
            name={NAME}
            id={NAME}
            value={name}
            className="text-input"
            onChange={({ target: { value } }) => setName(value)}
          />
        </div>
      </label>
      <div className="form-controls pad">
        <button
          type="submit"
          className={`btn ${busy ? 'busy' : ''}`}
          disabled={busy}
        >
          {category ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

CategoryEditor.propTypes = {
  category: serviceCategoryProps,
  onClose: PropTypes.func,
  setBusy: PropTypes.func,
};

CategoryEditor.defaultProps = {
  category: null,
  onClose: null,
  setBusy: null,
};
