/* eslint-disable react/prop-types */
/* eslint-disable import/extensions */
import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../../components/Sidebar';
import UserMenu from '../../components/UserMenu';
import Notifications from '../../components/Notifications';
import { useWindowSize } from '../../lib/hooks';
import DarkModeSwitcher from '../../components/Header/DarkModeSwitcher';

const UserLayout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { width } = useWindowSize();
  const isHamburgerVisible = width < 1024;

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <header className="flex justify-between items-center h-16 px-8 border-b border-slate-200 dark:border-[#3f444f]">
            <div aria-hidden={!isHamburgerVisible} className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                aria-hidden={sidebarOpen}
                aria-label="Toggle"
                aria-controls="sidebar"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                className="block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
              >
                <span className="relative block h-5.5 w-5.5 cursor-pointer">
                  <span className="du-block absolute right-0 h-full w-full">
                    <span
                      className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-slate-400 delay-[0] duration-200 ease-in-out dark:bg-white ${
                        !sidebarOpen && '!w-full delay-300'
                      }`}
                    />
                    <span
                      className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-slate-400 delay-150 duration-200 ease-in-out dark:bg-white ${
                        !sidebarOpen && 'delay-400 !w-full'
                      }`}
                    />
                    <span
                      className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-slate-400 delay-200 duration-200 ease-in-out dark:bg-white ${
                        !sidebarOpen && '!w-full delay-500'
                      }`}
                    />
                  </span>
                  <span className="absolute right-0 h-full w-full rotate-45">
                    <span
                      className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-slate-400 delay-300 duration-200 ease-in-out dark:bg-white ${
                        !sidebarOpen && '!h-0 !delay-[0]'
                      }`}
                    />
                    <span
                      className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-slate-400 duration-200 ease-in-out dark:bg-white ${
                        !sidebarOpen && '!h-0 !delay-200'
                      }`}
                    />
                  </span>
                </span>
              </button>
            </div>
            <div className="flex gap-2 items-center py-4">
              <DarkModeSwitcher />
              <Notifications notifications={[]} />
              <UserMenu />
            </div>
          </header>
          <Outlet context={[user]} />
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

export default UserLayout;
