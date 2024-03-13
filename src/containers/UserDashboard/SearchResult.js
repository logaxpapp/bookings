/* eslint-disable no-param-reassign */
import { useState } from 'react';
import image from '../../assets/images/WhatsApp Image 2023-12-13 at 17.03.01_67092e8d.jpg';
import ServiceModal from '../../components/ServiceModal';

const SearchResult = () => {
  // const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([
    {
      logo: image,
      title: 'Telesvade',
      address: 'No. 24 Ajengunle Street, Leventis, coca cola, Ibadan, Oyo State, Nigeria  ',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order',
      services: [
        {
          title: 'Craw cut',
          price: '$200.00',
          duration: '45 Min',
          deposit: '$10.00',
          showModal: false,
        },
        {
          title: 'Mohawk',
          price: '$200.00',
          duration: '45 Min',
          deposit: '$10.00',
          showModal: false,
        },
      ],
    },
    {
      logo: image,
      title: 'Telesvade',
      address: 'No. 24 Ajengunle Street, Leventis, coca cola, Ibadan, Oyo State, Nigeria  ',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order',
      services: [
        {
          title: 'Craw cut',
          price: '$200.00',
          duration: '45 Min',
          deposit: '$10.00',
          showModal: false,
        },
        {
          title: 'Mohawk',
          price: '$200.00',
          duration: '45 Min',
          deposit: '$10.00',
          showModal: false,
        },
      ],

    },
    {
      logo: image,
      title: 'Telesvade',
      address: 'No. 24 Ajengunle Street, Leventis, coca cola, Ibadan, Oyo State, Nigeria  ',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order',
      services: [
        {
          title: 'Craw cut',
          price: '$200.00',
          duration: '45 Min',
          deposit: '$10.00',
          showModal: false,
        },
        {
          title: 'Mohawk',
          price: '$200.00',
          duration: '45 Min',
          deposit: '$10.00',
          showModal: false,
        },
      ],
    },
  ]);

  const toggleModal = (i, k) => {
    setData((prevData) => {
      const updatedData = [...prevData]; // Create a copy of the previous data array
      const updatedServices = [...updatedData[i].services];
      updatedServices[k].showModal = !updatedServices[k].showModal;
      updatedData[i].services = updatedServices;
      return updatedData; // Return the updated data array
    });
  };

  return (
    <>
      {data.map((e, j) => (
        <div key={e.title} className="my-8 ml-8 mr-16 w-full grid grid-cols-2 gap-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <div>
            <img className="rounded-t-lg" src={e.logo} alt="" />
          </div>

          <div className="p-5 dark:bg-boxdark">
            {/* <a href="/"> */}
            <h5 className="mb-2  text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {e.title}
            </h5>
            {/* </a> */}
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              {e.address}
              .
            </p>
            {e.services.map((i, k) => (
              <div className="py-4" key={i.title}>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{i.title}</span>
                <div className="grid grid-cols-4">
                  <div>
                    <div className="text-[#89E101]">Price</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{i.price}</div>
                  </div>
                  <div>
                    <div className="text-[#89E101]">Duration</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{i.duration}</div>
                  </div>
                  <div>
                    <div className="text-[#89E101]">
                      Deposit
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{i.deposit}</div>
                  </div>
                  <div>
                    <button onClick={() => toggleModal(j, k)} type="button" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Book</button>
                  </div>
                  {i.showModal && <ServiceModal service={i} showModal={i.showModal} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResult;
