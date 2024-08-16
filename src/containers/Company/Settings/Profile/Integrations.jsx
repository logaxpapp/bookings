import PropTypes from 'prop-types';
import css from '../styles.module.css';
import { childrenProps } from '../../../../utils/propTypes';

const IntegrationText = ({
  className,
  heading,
  text,
}) => (
  <section className={`${className} ${css.integration_text} flex items-center gap-4`}>
    <div className="flex flex-col gap-[6px]">
      <h1 className="m-0 p-0 font-medium text-[#5c5c5c] text-base">
        {heading}
      </h1>
      <p className="m-0 p-0 text-xs text-[#5c5c5c] font-normal">
        {text}
      </p>
    </div>
  </section>
);

IntegrationText.propTypes = {
  className: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const IntegrationRow = ({ children }) => (
  <div className="w-full max-w-[615px] flex items-center justify-between">
    {children}
  </div>
);

IntegrationRow.propTypes = {
  children: childrenProps,
};

IntegrationRow.defaultProps = {
  children: null,
};

const DisconnectButton = ({ className, onClick }) => (
  <button
    type="button"
    className={`flex items-center gap-2 bg-transparent outline-none border-none cursor-pointer ${css.integration_btn} ${className}`}
    onClick={onClick}
  >
    <span className="font-medium text-xs text-[#5c5c5c] pointer-events-none">
      Disconnect
    </span>
  </button>
);

DisconnectButton.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Integrations = () => (
  <div>
    <IntegrationRow>
      <IntegrationText
        className={css.calendar}
        heading="Link your calendars"
        text="Get a link to sync your logaxp bookings calendar"
      />
      <button
        type="button"
        className="py-2 px-9 hover:scale-105 rounded-3xl bg-transparent outline-none cursor-pointer transition-all"
        style={{ border: '1px solid #e9ebf8' }}
      >
        Get Link
      </button>
    </IntegrationRow>
  </div>
);

export default Integrations;
