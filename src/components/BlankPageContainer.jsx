import { childrenProps } from '../utils/propTypes';
import Header from '../containers/Header';
import placeholder from '../assets/images/hero-placeholder.jpg';

const BlankPageContainer = ({ children }) => (
  <div className="flex flex-col w-full h-screen overflow-hidden relative">
    <Header />
    <img className="w-full flex-1" src={placeholder} alt="site banner" />
    {children}
  </div>
);

BlankPageContainer.propTypes = {
  children: childrenProps,
};

BlankPageContainer.defaultProps = {
  children: null,
};

export default BlankPageContainer;
