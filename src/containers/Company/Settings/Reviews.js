import { useState } from 'react';
import { Heading, Heading1 } from '../../Aside';
import { Switch } from '../../../components/Inputs';
import MenuSelect from '../../../components/MenuSelect';
import emptyPayments from '../../../assets/images/payments.png';
import { usePrefereceFields } from '../../../utils/hooks';

const ENABLE_REVIEWS = 'enable_reviews';

const filters = ['All Reviews', 'Pending Reviews'];

const Reviews = () => {
  const [filter, setFilter] = useState(filters[1]);
  const {
    busy,
    fields,
    hasChanges,
    setFields,
    update,
  } = usePrefereceFields([ENABLE_REVIEWS]);

  const handleChecked = ({ target: { name, checked } }) => setFields(
    (fields) => ({ ...fields, [name]: checked }),
  );

  return (
    <div className="w-full h-full overflow-auto">
      <section className="w-full max-w-[600px] flex flex-col gap-10">
        <Heading1>Reviews</Heading1>
        <div className="flex flex-col gap-1">
          <p className="m-0 font-semibold text-base text-[#011c39]">
            Manage Reviews
          </p>
          <p className="m-0 font-normal text-sm text=[#5c5c5c]">
            Automate review requests and showcase 5-star feedback on your Booking Page
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border border-[#cbd5e1] rounded-lg px-5 py-3">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-[#8e98a8]">
                Enable Reviews
              </span>
              <span className="font-medium text-sm text-[#8e98a8]">
                Customers will receive review requests by email.
              </span>
            </div>
            <Switch
              name={ENABLE_REVIEWS}
              checked={fields[ENABLE_REVIEWS]}
              onChange={handleChecked}
            />
          </div>
          {hasChanges ? (
            <div className="flex justify-end">
              <button
                type="button"
                className={`btn ${busy ? 'busy' : ''}`}
                onClick={() => update()}
              >
                Update
              </button>
            </div>
          ) : null}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm text-[#5c5c5c]">
              Reviews
            </span>
            <MenuSelect
              name="filter"
              value={filter}
              options={filters}
              onChange={(name, value) => setFilter(value)}
              plain
            />
          </div>
          <section className="w-[600px] flex-1 flex flex-col justify-center items-center gap-7 rounded-lg border border-[#cbd5e1] py-10">
            <div className="w-max flex flex-col items-center gap-7">
              <header className="flex flex-col items-center gap-3">
                <Heading>{`No${filter === filters[1] ? ' pending' : ''} reviews`}</Heading>
                <p className="m-0 w-[359px] text-center">
                  Reviews from your customers will appear here.
                  Publish, hide or delete them at any time.
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
        </div>
      </section>
    </div>
  );
};

export default Reviews;
