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
import TextBox, {
  parseAmount,
  parseDuration,
} from '../../../components/TextBox';
import {
  currencyHelper,
  notification,
} from '../../../utils';
import LoadingButton from '../../../components/LoadingButton';

const CATEGORY = 'category';
const DEPOSIT = 'deposit';
const DESCRIPTION = 'description';
const DURATION = 'duration';
const NAME = 'name';
const PRICE = 'price';
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
      if (value.length > MAXIMUM_DESCRIPTION_LENGTH) {
        setHasDescriptionError(true);
      } else {
        setDescription(value);
        setHasDescriptionError(false);
      }
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

    dispatch(updateServiceAsync(data, service, category, completedHandler));
  };

  return (
    <section className="flex flex-col p-10 gap-6">
      <h1 className="pb-6 border-b border-b-gray-200">
        {service ? 'Update Service' : 'New Service'}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 max-w-80">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-sm">Category</div>
            <div className="select">
              <select
                name={CATEGORY}
                value={categoryId}
                onChange={handleValueChange}
                disabled={!!service}
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
        <label className="input-label" htmlFor={DESCRIPTION}>
          <span className="input-label-text">Description</span>
          <textarea
            name={DESCRIPTION}
            id={DESCRIPTION}
            value={description}
            className="resize-none p-3 border border-[#ededed] h-20"
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
          <button type="submit" className="control-btn" disabled={busy}>
            {service ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </section>
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
      <h1 className="pb-6 border-b border-b-gray-200">
        {category ? 'Update Category' : 'New Category'}
      </h1>
      <TextBox
        type="text"
        name={NAME}
        id={NAME}
        label="Enter Category Name"
        value={name}
        onChange={({ target: { value } }) => setName(value)}
      />
      <LoadingButton
        type="submit"
        label="Create"
        loading={busy}
        styles={{
          marginTop: 0,
        }}
      />
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
