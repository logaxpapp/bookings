import { useOutletContext } from 'react-router';
import { useDispatch } from 'react-redux';
import FieldRow from './FieldRow';
import defaultUsericon from '../../assets/images/av.png';
import { updateUserAsync } from '../../redux/userSlice';
import { notification } from '../../utils';

const Profile = () => {
  const [user] = useOutletContext();
  const dispatch = useDispatch();

  const handleEditUser = (name, value, callback) => {
    if (name === 'firstname') {
      if (!(value && value.length > 0)) {
        notification.showError('Firstname MUST be at least 2 characters!');
        callback('Invalid value for Firstname');
        return;
      }
    } else if (name === 'lastname') {
      if (!(value && value.length > 0)) {
        notification.showError('Lastname MUST be at least 2 characters!');
        callback('Invalid value for Lastname');
        return;
      }
    }

    dispatch(updateUserAsync({ name, value }, callback));
  };

  return (
    <section className="flex-1 h-full overflow-auto flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <h1 className="font-semmibold text-2xl text-[#393939] dark:text-white">Profile</h1>
        <p className="text-sm text-[#8E98A8] dark:text-[#dfe2e6]">Update your profile</p>
      </header>
      <div className="flex flex-col gap-8 w-6/12 pb-8">
        <div className="flex items-center">
          <span className="min-w-60 font-semibold text-[#011c39] dark:text-gray">
            Profile Picture
          </span>
          <div className="flex items-center gap-6">
            <img
              src={user.profilePicture || defaultUsericon}
              alt="!"
              className="w-10 h-10 rounded-lg object-cover"
            />
            {user.profilePicture ? (
              <button
                type="button"
                className="bg-transparent text-[#8E98A8] text-sm font-medium p-0"
              >
                Remove
              </button>
            ) : null}
            <button
              type="button"
              className="bg-transparent text-[#89E101] text-sm font-medium p-0"
            >
              Update
            </button>
          </div>
        </div>
        <FieldRow
          name="firstname"
          value={user.firstname}
          label="Firstname"
          onEdit={handleEditUser}
        />
        <FieldRow
          name="lastname"
          value={user.lastname}
          label="Lastname"
          onEdit={handleEditUser}
        />
        <FieldRow value={user.email} label="Email" />
        <FieldRow value={user.phoneNumber} label="Phone Number" />
      </div>
    </section>
  );
};

export default Profile;
