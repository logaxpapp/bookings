/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable arrow-body-style */
const HomeLocation = () => {
  return (
    <>
      <div className="mx-8 text-xl fond-[600]">Home Location</div>
      <p className="mx-8 text-sm text-gray-300">Update your profile</p>
      <div className="mx-8 mt-4 grid grid-cols-2 gap-8 w-6/12">
        <div>
          <label
            htmlFor="name"
            className="block text-[18px] font-[600] leading-6 text-gray-900"
          >
            Latitude
          </label>
        </div>
        <div>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              name="firstName"
              type="text"
              className="w-full py-2 px-3 leading-tight h-[40px] focus:outline-indigo-600 rounded-lg px-2 outline outline-offset-2 outline-2 focus:outline-none focus:shadow-outline"
              placeholder="Firstname"
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-[18px] font-[600] leading-6 text-gray-900"
          >
            Longitude
          </label>
        </div>
        <div>
          <div className="mt-2 rounded-md shadow-sm">
            <input
              name="firstName"
              type="text"
              className="w-full px-2 rounded-lg outline outline-offset-2 outline-2 rounded-lg h-[40px] focus:outline-indigo-600 leading-tight focus:shadow-outline"
              placeholder="Firstname"
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeLocation;
