/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import { useOutletContext } from 'react-router-dom';
import SearchResult from './SearchResult';

const UserHome = () => {
  const [search] = useOutletContext();
  return (
    <>
      {!search && (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        events={[
          { title: 'event 1', date: '2019-04-01' },
          { title: 'event 2', date: '2019-04-02' },
        ]}
      />
      )}
      {search && (
      <SearchResult />
      )}
    </>
  );
};
export default UserHome;
