import React, { useState } from 'react';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

// Sample images, replace with your actual imports
import bugQueuesImage from '../../assets/images/case4.jpg';
import productBriefImage from '../../assets/images/case5.jpg';
import simpleSprintsImage from '../../assets/images/case7.jpg';
import roadmapTimelineImage from '../../assets/images/case6.jpg';

const VISIBLE_ITEMS_COUNT = 5;

const mockData = [
  {
    title: 'Bug Queues',
    image: bugQueuesImage,
    rating: 5.0,
    reviewCount: '2k',
    address: '1234 Main St',
  },
  {
    title: 'Product Brief',
    image: productBriefImage,
    rating: 5.0,
    reviewCount: '2k',
    address: '1234 Main St',
  },
  {
    title: 'Simple Sprints',
    image: simpleSprintsImage,
    rating: 5.0,
    reviewCount: '2k',
    address: '1234 Main St',
  },
  {
    title: 'Roadmap Timeline',
    image: roadmapTimelineImage,
    rating: 5.0,
    reviewCount: '2k',
    address: '1234 Main St',
  },
  {
    title: 'Product Brief',
    image: productBriefImage,
    rating: 5.0,
    reviewCount: '2k',
    address: '1234 Main St',
  },
  {
    title: 'Simple Sprints',
    image: simpleSprintsImage,
    rating: 5.0,
    reviewCount: '2k',
    address: '1234 Main St',
  },
].map((it, idx) => ({ ...it, id: idx + 1 }));

const getVisibleItems = (allItems, start) => {
  const visibleItems = [];
  for (let i = 0; i < VISIBLE_ITEMS_COUNT; i += 1) {
    const itemIndex = (start + i) % mockData.length;
    visibleItems.push(allItems[itemIndex]);
  }

  return visibleItems;
};

const Recommended = () => {
  const [items, setItems] = useState({
    startIndex: 0,
    visible: getVisibleItems(mockData, 0),
  });

  const handleIconClick = () => {
    setItems((items) => {
      const startIndex = (items.startIndex + 2) % mockData.length;

      return {
        startIndex,
        visible: getVisibleItems(mockData, startIndex),
      };
    });
  };

  return (
    <div className="w-full p-5 mb-20">
      <h1 className="text-xs text-red-500 font-bold mb-4">Recommended</h1>
      <h2 className="text-2xl font-md text-gray-400 mb-4">We recommend based on ratings and popularity</h2>
      {/* <p className="my-4 border-b-4 border-black font-bold w-20"></p> */}
      <div className="flex space-x-4">
        {items.visible.map((item) => (
          <div className="w-64 h-64 relative overflow-hidden shadow-lg" key={item.id}>
            <img src={item.image} alt={item.title} className="w-full h-full" />
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-bl-lg">
              <p className="font-bold text-center">{`${item.rating}.0`}</p>
              <p className="text-sm">
                <span className="text-xs">{`${item.reviewCount} reviews`}</span>
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-center">
              <p className="font-bold">{item.title}</p>
              <p className="text-xs">{item.address}</p>
            </div>
          </div>
        ))}
        <button
          aria-label="next"
          type="button"
          className="flex justify-center items-center bg-transparent border-none outline-none"
          onClick={handleIconClick}
        >
          <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="31" fill="white" stroke="black" strokeWidth="2" />
            <foreignObject x="12" y="12" width="40" height="40">
              <ArrowRightCircleIcon className="text-black w-10 h-10" />
            </foreignObject>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Recommended;
