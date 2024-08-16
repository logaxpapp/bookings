import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon } from '@heroicons/react/20/solid';
import EmptyListPanel from './EmptyListPanel';

const MARK_READ = 'mark_read';

const notificationProps = PropTypes.shape({
  title: PropTypes.string,
  content: PropTypes.string,
});

const Notification = ({ notification }) => {
  const handleClick = ({ target: { name } }) => {
    if (name === MARK_READ) {
      // TODO:
    }
  };

  return (
    <section className="border border-slate-200 rounded">
      <header className="w-full px-4 pt-2 flex justify-center items-end">
        <h1 className="flex-1 text-base text-[#5c5c5c] font-semibold whitespace-pre-wrap">
          {notification.title}
        </h1>
        <button
          type="button"
          aria-label="mark as read"
          name={MARK_READ}
          className="bg-transparent cursor-pointer"
          onClick={handleClick}
        >
          <CheckIcon title="Mark as read" className="w-[18px] h-[18px] text-green-600 pointer-events-none" />
        </button>
      </header>
      <div className="p-4 pb-2">
        {notification.content}
      </div>
    </section>
  );
};

Notification.propTypes = {
  notification: notificationProps.isRequired,
};

const Notifications = ({ notifications }) => (
  <Menu as="div" className="relative inline-block text-left">
    <div className="relative">
      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-[#d7dde5] dark:text-white border dark:bg-[#24303f] dark:border-[#334255]">
        <BellIcon className="-mr-1 h-5 w-5 text-gray-400 dark:text-white" aria-hidden="true" />
      </Menu.Button>
      <span
        className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1"
      >
        <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75" />
      </span>
    </div>

    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white dark:bg-[#24303f] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-min"
      >
        {notifications.length ? (
          <div className="flex flex-col p-2 w-80 h-115 overflow-auto">
            {notifications.map((notification) => (
              <Notification key={notification.title} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="py-4 w-80">
            <EmptyListPanel
              text="🎉 You've checked all your notifications and there's nothing new to report."
              textClass="font-normal text-lg"
            />
          </div>
        )}
      </Menu.Items>
    </Transition>
  </Menu>
);

Notifications.propTypes = {
  notifications: PropTypes.arrayOf(notificationProps).isRequired,
};

export default Notifications;
