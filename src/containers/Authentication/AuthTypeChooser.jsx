import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import LogoLink from '../../components/LogoLink';
import logo from '../../assets/images/logaxp.png';

const AuthTypeChooser = ({ companyRoute, userRoute }) => (
  <section
    className="relative flex flex-col justify-center items-center p-2 gap-8 w-4/5 md:w-[512px] xl:w-[1062px] h-[320px] xl:h-[543px] xl:gap-12"
  >
    <img
      aria-hidden="true"
      alt="logo"
      src={logo}
      className="absolute left-0 top-0 w-full h-full opacity-10"
    />
    <div aria-hidden="true" className="w-full absolute top-4 left-12">
      <LogoLink />
    </div>
    <Link to={userRoute} className="w-11/12 md:w-[380px] xl:w-[512px] bg-[#89E101] h-[60px] xl:h-[85px] rounded-3xl cursor-pointer flex justify-center items-center hover:scale-105 transition-all relative">
      <span className="font-bold text-2xl text-[#011c39]">
        I am a user
      </span>
    </Link>
    <Link to={companyRoute} className="w-11/12 md:w-[380px] xl:w-[512px] h-[60px] xl:h-[85px] rounded-3xl cursor-pointer flex justify-center items-center hover:scale-105 transition-all  border-[1.5px] border-[#00000080] dark:border-slate-700 relative">
      <span className="font-bold text-2xl text-[#011c39] dark:text-white">
        I am a service provider
      </span>
    </Link>
  </section>
);

AuthTypeChooser.propTypes = {
  companyRoute: PropTypes.string.isRequired,
  userRoute: PropTypes.string.isRequired,
};

export default AuthTypeChooser;
