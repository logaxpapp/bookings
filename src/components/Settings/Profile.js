/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable arrow-body-style */
import logo from '../../assets/images/cityscape.jpg';

const Profile = () => {
  return (
    <>
      <div className="mx-8 text-xl fond-[600]">Profile</div>
      <p className="mx-8 text-sm text-gray-300">Update your profile</p>
      <div className="mx-8 mt-4 grid grid-cols-2 gap-8 w-6/12">
        <div>
          <label
            htmlFor="name"
            className="block text-[18px] font-[600] leading-6 text-gray-900"
          >
            Profile Picture
          </label>
        </div>
        <div className="items-center grid grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="alternative test" />
          </div>
          <div>
            Remove
          </div>
          <div>
            Update
          </div>
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-[18px] font-[600] leading-6 text-gray-900"
          >
            First name
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
            Last name
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
        <div>
          <label
            htmlFor="name"
            className="block text-[18px]  font-[600] leading-6 text-gray-900"
          >
            Email
          </label>
        </div>
        <div>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              name="firstName"
              type="email"
              className="w-full py-2 px-3 px-2 h-[40px] rounded-lg outline outline-offset-2 outline-2 leading-tight focus:outline-indigo-600 focus:shadow-outline"
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
            Phone Number
          </label>
        </div>
        <div>
          <div className="relative mt-2 rounded-lg shadow-sm">
            <div className="absolute top-0 bottom-[13px] h-[100%] px-2 start-0 flex items-center ps-1.5 pointer-events-none">
              234
            </div>
            <input
              name="phoneNumber"
              type="tel"
              className="w-full  ps-10 py-2.5 pl-12 h-[40px]  rounded-lg outline outline-offset-2 outline-2 leading-tight focus:outline-indigo-600 focus:shadow-outline"
              placeholder="80xxxxxxxx"
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
