import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Heading } from '../../Aside';
import { selectServiceCategories } from '../../../redux/companySlice';
import { DatePicker2 } from '../../../components/DatePicker';
import emptyPayments from '../../../assets/images/payments.png';

const SERVICES = 'services';

const today = new Date();

const Reports = () => {
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
    <section className="w-full h-full flex-1 max-w-[800px] flex flex-col gap-8">
      <Heading>Reports</Heading>
      <div className="flex flex-col gap-16">
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
              <Heading>No Report genrated</Heading>
              <p className="m-0 w-80 text-center">
                Select a date range and click &quot;Generate&quot;
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
  );
};

export default Reports;
