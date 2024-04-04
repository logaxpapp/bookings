import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Heading1 } from '../../Aside';
import { selectActivities } from '../../../redux/companySlice';

const Activities = () => {
  const allActivities = useSelector(selectActivities);
  const [activities, dates] = useMemo(() => {
    const sorted = [...allActivities];
    sorted.sort(
      (a1, a2) => new Date(a1.date).getTime() - new Date(a2.date).getTime(),
    );

    const resultObject = {};

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

    return [resultObject, Object.keys(resultObject)];
  }, []);

  return (
    <div className="h-full overflow-auto">
      <section className="flex flex-col gap-7 w-full max-w-[600px]">
        <header className="flex flex-col gap-1">
          <Heading1>Activities</Heading1>
          <p className="m-0 font-normal text-sm text-[#5c5c5c]">
            View your most recent booking activities.
          </p>
        </header>
        <div className="flex flex-col gap-6">
          {dates.map((date) => {
            const acts = activities[date];

            return (
              <section key={date} className="flex flex-col gap-3">
                <h1 className="m-0 font-medium text-sm text-[#2e2e2e]">
                  {date}
                </h1>
                {acts.map((act) => (
                  <section key={act.date} className="flex items-center gap-4 font-medium text-sm text-[#8e98a8]">
                    <h1 className="m-0 font-normal text-sm">
                      {act.time}
                    </h1>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full text-white bg-[#5643cc] flex justify-center items-center">
                        <span>{act.by[0]}</span>
                      </div>
                      <span>{act.by}</span>
                    </div>
                    <p className="m-0">
                      {act.description}
                    </p>
                  </section>
                ))}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Activities;
