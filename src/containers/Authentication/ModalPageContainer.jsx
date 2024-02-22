import { childrenProps } from '../../utils/propTypes';
import Header from '../Header';
import placeholder from '../../assets/images/hero-placeholder.jpg';

const ModalPageContainer = ({ children }) => (
  <div className="flex flex-col w-full h-screen overflow-hidden">
    <Header />
    <img className="w-full flex-1" src={placeholder} alt="site banner" />
    {children}
  </div>
);

ModalPageContainer.propTypes = {
  children: childrenProps,
};

ModalPageContainer.defaultProps = {
  children: null,
};

export default ModalPageContainer;
