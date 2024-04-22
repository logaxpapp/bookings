import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import { AddressFields } from '../../containers/Address';
import { loadCountriesAsync, selectCountries } from '../../redux/countriesSlice';
import { updateUserAddressAsync } from '../../redux/userSlice';

const UserAddress = () => {
  const countries = useSelector(selectCountries);
  const [user] = useOutletContext();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!countries) {
      dispatch(loadCountriesAsync(() => {}));
    }
  }, []);

  const handleUpdateAddress = (address, callback) => {
    dispatch(updateUserAddressAsync(address, callback));
  };

  return (
    <section className="flex-1 h-full overflow-auto flex flex-col">
      <header className="flex flex-col gap-4">
        <h1 className="font-semmibold text-2xl text-[#393939] dark:text-white">My Address</h1>
        <p className="text-sm text-[#8E98A8] dark:text-[#dfe2e6]">Update your address</p>
      </header>
      <div className="flex flex-col gap-8 w-6/12 pb-8">
        <AddressFields
          address={user.address}
          countries={countries || []}
          onEdit={handleUpdateAddress}
          bottomControl
        />
      </div>
    </section>
  );
};

export default UserAddress;
