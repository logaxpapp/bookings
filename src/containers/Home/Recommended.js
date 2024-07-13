import React, { useEffect, useState } from 'react';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

// Sample images, replace with your actual imports
import bugQueuesImage from '../../assets/images/case4.jpg';
import productBriefImage from '../../assets/images/case5.jpg';
import simpleSprintsImage from '../../assets/images/case7.jpg';
import roadmapTimelineImage from '../../assets/images/case6.jpg';
import { useWindowSize } from '../../lib/Dialog';

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

const getVisibleItems = (allItems, start, count) => {
  const visibleItems = [];
  for (let i = 0; i < count; i += 1) {
    const itemIndex = (start + i) % mockData.length;
    visibleItems.push({ ...allItems[itemIndex], key: i });
  }

  return visibleItems;
};

const Recommended = () => {
  const [items, setItems] = useState({
    startIndex: 0,
    count: 1,
    visible: getVisibleItems(mockData, 0, 1),
  });
  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    let count = Math.floor(windowWidth / 240);

    if (count < 1) {
      count = 1;
    } else if (count > 5) {
      count = 5;
    }

    setItems((items) => ({
      ...items,
      count,
      visible: getVisibleItems(mockData, items.startIndex, count),
    }));
  }, [windowWidth]);

  const handleIconClick = () => {
    setItems((items) => {
      const startIndex = (items.startIndex + 2) % mockData.length;

      return {
        startIndex,
        count: items.count,
        visible: getVisibleItems(mockData, startIndex, items.count),
      };
    });
  };

  return (
    <div className="w-full p-5">
      <h1 className="text-xs text-red-500 font-bold mb-4">Recommended</h1>
      <h2 className="text-2xl font-md text-gray-400 mb-4">We recommend based on ratings and popularity</h2>
      {/* <p className="my-4 border-b-4 border-black font-bold w-20"></p> */}
      {/* eslint-disable-next-line no-nested-ternary */}
      <div className={`relative grid gap-2 ${items.count === 1 ? 'grid-cols-1' : items.count === 2 ? 'grid-cols-2' : items.count === 3 ? 'grid-cols-3' : items.count === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
        {items.visible.map((item) => (
          <div className="w-full h-64 relative overflow-hidden shadow-lg" key={item.key}>
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
        <div className="w-full h-full absolute left-0 top-0 flex justify-end items-center px-4 group">
          <button
            aria-label="next"
            type="button"
            className="flex sm:hidden justify-center items-center bg-transparent border-none outline-none pointer-events-auto group-hover:flex"
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
    </div>
  );
};

export default Recommended;
