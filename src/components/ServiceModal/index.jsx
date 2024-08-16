/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React from 'react';

export default function ServiceModal(props) {
  const { showModal, setShowModal, service } = props;
  return (
    <>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="dark:bg-boxdark relative w-auto my-6 mx-auto max-w-3xl">
              {/* content */}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-boxdark outline-none focus:outline-none">
                {/* header */}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <button
                    type="button"
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto">
                  <div className="mx-16 flex flex-row gap-4">
                    <div className="w-6/12">
                      <div className="py-4" key={service.title}>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {service.title}
                        </span>
                        <div className="grid grid-cols-3">
                          <div>
                            <div className="text-[#89E101]">Price</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {service.price}
                            </div>
                          </div>
                          <div>
                            <div className="text-[#89E101]">Duration</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {service.duration}
                            </div>
                          </div>
                          <div>
                            <div className="text-[#89E101]">Deposit</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {service.deposit}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-5/12">
                      <input type="date" />
                    </div>
                    <div className="flex flex-col w-1/12">
                      <div>
                        <button type="button" className="text-white bg-transparent hover:bg-[#89E101] text-[#89E101] hover:text-black focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">10:00</button>
                      </div>
                      <div>
                        <button type="button" className="text-white bg-transparent hover:text-black hover:bg-[#89E101] text-[#89E101] focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">11:00</button>
                      </div>
                      <div>
                        <button type="button" className="text-white bg-transparent hover:text-black hover:bg-[#89E101] text-[#89E101] focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">10:00</button>
                      </div>
                      <div>
                        <button type="button" className="text-white bg-transparent hover:text-black hover:bg-[#89E101] text-[#89E101] focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">10:00</button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* footer */}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-[#000] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Pay Deposit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black" />
        </>
      ) : null}
    </>
  );
}
