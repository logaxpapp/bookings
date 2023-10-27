/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOutletContext } from 'react-router';
import QRCode from 'qrcode.react';
import { toPng } from 'html-to-image';
import css from './style.module.css';
import { useNotification } from '../../../lib/Notification';
import defaultImages from '../../../utils/defaultImages';
import AppStorage from '../../../utils/appStorage';
import BlendedImageBackground from '../../../components/BlendedImageBackground';
import { Svg, paths } from '../../../components/svg';
import config from '../../../config';
import routes from '../../../routing/routes';
import { parseIntegerInput } from '../../../components/TextBox';
import { Range } from '../../../components/Inputs';

const appStorage = AppStorage.getInstance();

const BORDER_RADIUS = 'border_radius';
const CARD_HEIGHT = 'card_height';
const COLOR = 'color';
const COLOR_TARGET = 'color_target';
const DOWNLOAD = 'download';
const FLIP = 'flip';
const GENERATE = 'generate';
const PRINT = 'print';
const RESET = 'reset';
const SAVE = 'save';
const STORAGE_KEY = 'businessCardSettings';

export const CardEditor1 = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [code, setCode] = useState(0);
  const [colors, setColors] = useState({
    target: 'card',
    card: '#f8f9fa',
    phoneNumber: '#fff',
    company: '#fff',
    booking: '#000',
    rate: '#000',
    qrBG: '#fff',
    qrFG: '#212121',
  });
  const [cardHeight, setCardHeight] = useState(400);
  const [generate, setGenerate] = useState(false);
  const [logo, setLogo] = useState(defaultImages.profile);
  const cardRef = useRef(null);
  const notification = useNotification();

  const [company] = useOutletContext();

  useEffect(() => {
    setCode(`A${company.id + 1000}`);
    if (!company.profilePicture) {
      setLogo(company.profilePicture);
    }
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === CARD_HEIGHT) {
      let newValue = parseInt(value, 10);
      if (newValue > cardHeight) {
        newValue += 4;
      } else if (newValue < cardHeight && newValue > 400) {
        newValue -= 4;
      }
      setCardHeight(newValue);
    } else if (name === COLOR) {
      setColors((colors) => {
        const { target } = colors;
        return { ...colors, [target]: value };
      });
    } else if (name === COLOR_TARGET) {
      setColors((colors) => ({ ...colors, target: value }));
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === DOWNLOAD) {
      toPng(cardRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'logaxp-card.png';
          link.href = dataUrl;
          link.click();
          link.remove();
        })
        .catch(() => {
          notification.showError('An error occured while downloading card! Please try again.');
        });
    } else if (name === FLIP) {
      setIsFlipped((flipped) => !flipped);
    } else if (name === GENERATE) {
      setGenerate(true);
    } else if (name === PRINT) {
      window.print();
    }
  }, []);

  return (
    <div className={css.container}>
      <div style={{ position: 'relative', width: '100%', height: cardHeight }}>
        {/* Card Wrapper */}
        <div ref={cardRef} className={`${css.flip_card} ${isFlipped ? css.flipped : ''}`}>

          {/* Card Front */}
          <div className={css.front}>
            <div className="min-h-screen bg-gray-100 flex justify-center items-center  print:bg-white">
              {/* Main UI Container */}
              <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4 print:hidden">
                {/* ... (rest of your provided JSX code) */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold">
                    LogaXP OnBoarding Application
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Client Barcode Generation
                  </p>
                </div>
                <div className="p-4 border rounded-lg shadow-md space-y-4 bg-white">
                  {/* Section Header */}
                  <div className="border-b pb-2">
                    <h3 className="font-medium text-lg">Client Details</h3>
                    <p className="text-gray-500 text-sm">Provide the client&apos;s name and booking URL.</p>
                  </div>
                  {/* Client Name Input */}
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1" htmlFor="name">
                      Company Name:
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border text-sm rounded-md focus:outline-none focus:border-blue-500"
                      value={company.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1" htmlFor="phone">
                      Phone Number:
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-3 py-2 border text-sm rounded-md focus:outline-none focus:border-blue-500"
                      value={company.phoneNumber}
                      readOnly
                    />
                  </div>
                  {/* Booking URL Input */}
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1" htmlFor="code">
                      Booking URL:
                    </label>
                    <input
                      type="text"
                      id="code"
                      className="w-full text-sm px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                      value={code}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Card Back */}
          <div className={css.back}>
            {/* Here you can add the back of your card's content */}
            {/* Card Configuration */}
            <div className="p-4 border rounded-md shadow-md space-y-4">
              <h2 className="text-lg font-bold">Card Configuration</h2>
              <p className="text-sm text-gray-500">
                Adjust the appearance of the generated card.
              </p>
              <div className="flex space-x-4 items-center gap-4">
                <label className="font-medium" htmlFor={COLOR_TARGET}>Element:</label>
                <select
                  name={COLOR_TARGET}
                  id={COLOR_TARGET}
                  value={colors.target}
                  onChange={handleValueChange}
                  className="p-2 border rounded-md"
                >
                  <option value="card">Card</option>
                  <option value="booking">Booking</option>
                  <option value="rate">Rate</option>
                  <option value="company">Company Name</option>
                  <option value="phoneNumber">Phone Number</option>
                  <option value="qrBG">QR Background</option>
                  <option value="qrFG">QR Text</option>
                </select>
              </div>

              <div className="flex space-x-4 items-center gap-4 mt-2">
                <label className="font-medium" htmlFor={COLOR}>Color:</label>
                <input type="color" name={COLOR} id={COLOR} onChange={handleValueChange} className="p-2 border rounded-md" />
              </div>
            </div>
            {/* Card Size Configuration */}
            <div className="p-4 border rounded-md shadow-md space-y-4">
              <h2 className="text-lg font-bold">Card Size Configuration</h2>
              <p className="text-sm text-gray-500">Adjust the height of the generated card.</p>
              <div className="flex space-x-4 items-center gap-4">
                <label className="font-medium" htmlFor={CARD_HEIGHT}>
                  Card Height (px):
                </label>
                <input
                  type="number"
                  name={CARD_HEIGHT}
                  id={CARD_HEIGHT}
                  value={cardHeight}
                  onChange={handleValueChange}
                  min="400"
                  max="800"
                  className="p-2 border rounded-md w-32"
                />
              </div>
            </div>
          </div>
          {generate ? (
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                name={PRINT}
                className="flex items-center justify-center w-1/2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                onClick={handleClick}
              >
                <i className="fas fa-print mr-2" />
                Print
              </button>
              <button
                type="button"
                name={DOWNLOAD}
                className="flex items-center justify-center w-1/2 bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                onClick={handleClick}
              >
                <i className="fas fa-download mr-2" />
                Download
              </button>
            </div>
          ) : null}
          <button
            type="button"
            name={GENERATE}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            onClick={handleClick}
          >
            Generate Barcode
          </button>
        </div>
        {/* Card Section */}
        {generate ? (
          <div ref={cardRef} className="mt-4 ml-8 border-t border-gray-200 bg-white rounded-lg shadow-md space-y-4 relative" style={{ backgroundColor: colors.card, height: cardHeight, width: '300px' }}>
            <div className="relative w-full h-36">
              <img src={logo} alt="LogaXP Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-xl font-extrabold shadow-text" style={{ color: colors.company }}>{company.name}</h3>

              </div>
              <span
                className="absolute bottom-0 right-0 px-2 py-1 rounded-bl-md text-xs"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black background
                  color: colors.phoneNumber,
                  textShadow: '0 0 5px rgba(0,0,0,0.7)', // text shadow for better visibility
                }}
              >
                <span>Tel: </span>
                {company.phoneNumber}
              </span>
            </div>
            <div className="p-4">
              <div className="flex justify-center items-center mb-2 overflow-hidden bg-transparent">
                <QRCode
                  value={code}
                  size={150}
                  fgColor={colors.qrFG}
                  bgColor={colors.qrBG}
                />
              </div>
              <p className="text-sm text-center" style={{ color: colors.booking }}>
                SCAN FOR BOOKING
              </p>
              <p className="text-xs text-center mt-2" style={{ color: colors.rate }}>
                Rate our service
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const defaultColors = {
  target: 'qrCon',
  qrCon: '#f8f9fa',
  qrBG: '#fff',
  qrFG: '#212121',
  addressBG: '#f8f9fa',
  addressFG: '#000',
  nameFG: '#fff',
};

export const CardEditor = () => {
  const [code, setCode] = useState('');
  const [logo, setLogo] = useState(defaultImages.profile);
  const [url, setUrl] = useState('');
  const [borderRadius, setBorderRadius] = useState(0);
  const [colors, setColors] = useState(defaultColors);
  const cardRef = useRef();
  const notification = useNotification();
  const [company] = useOutletContext();

  useEffect(() => {
    if (company.profilePicture) {
      setLogo(company.profilePicture);
    }

    let settings = appStorage.get(STORAGE_KEY);
    if (settings) {
      // Data may be corrupted
      try {
        settings = JSON.parse(settings);
        setBorderRadius(settings.borderRadius);
        delete settings.borderRadius;
        setColors(settings);
      } catch {
        // Data is corrupted
        appStorage.delete(STORAGE_KEY);
      }
    }

    const code = `A${company.id + 1000}`;

    setUrl(`${config.API_HOST}${routes.providerPage(code)}`);
    setCode(code);
  }, []);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === CARD_HEIGHT) {
      setBorderRadius(parseIntegerInput(value));
    } else if (name === COLOR) {
      setColors((colors) => {
        const { target } = colors;
        return { ...colors, [target]: value };
      });
    } else if (name === COLOR_TARGET) {
      setColors((colors) => ({ ...colors, target: value }));
    } else if (name === BORDER_RADIUS) {
      setBorderRadius(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === DOWNLOAD) {
      toPng(cardRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'logaxp-card.png';
          link.href = dataUrl;
          link.click();
          link.remove();
        })
        .catch(() => {
          notification.showError('An error occured while downloading card! Please try again.');
        });
    } else if (name === PRINT) {
      // window.print();
      toPng(cardRef.current)
        .then((dataUrl) => {
          const win = window.open('', 'PRINT', 'height=400,width=600');

          win.document.write('<html><head><title>Print Card</title>');
          win.document.write('</head><body >');
          win.document.write(`<img src="${dataUrl}" style="width:100%;" />`);
          win.document.write('</body></html>');

          setTimeout(() => {
            win.document.close();
            win.focus();

            win.print();
            win.close();
          }, 10);
        })
        .catch(() => {
          notification.showError('An error occured while printing card! Please try again.');
        });
    } else if (name === RESET) {
      setColors(defaultColors);
      setBorderRadius(0);
    } else if (name === SAVE) {
      const data = { ...colors, borderRadius };
      appStorage.set(STORAGE_KEY, JSON.stringify(data));
      notification.showSuccess('Configuration saved to your device!');
    }
  }, [borderRadius, colors, setBorderRadius, setColors]);

  if (!code) {
    return <></>;
  }

  return (
    <div className={css.container}>
      <div className={css.body}>
        <section
          ref={cardRef}
          className={css.card}
          style={{ backgroundColor: colors.card, borderRadius }}
        >
          <div className={css.card_left}>
            <div className={css.qr_wrap} style={{ backgroundColor: colors.qrCon, borderRadius: `${borderRadius}px 0 0 0` }}>
              <QRCode
                value={code}
                size={150}
                fgColor={colors.qrFG}
                bgColor={colors.qrBG}
              />
            </div>
            <p
              className={css.code_text}
              style={{ color: colors.qrFG, backgroundColor: colors.qrCon }}
            >
              {code}
            </p>
            <div className={css.info_wrap} style={{ backgroundColor: colors.addressBG, color: colors.addressFG, borderRadius: `0 0 0 ${borderRadius}px` }}>
              <div className={css.info_row}>
                <Svg
                  color={colors.addressFG}
                  path={paths.web}
                  style={{ minWidth: 18, minHeight: 18 }}
                  sm
                />
                <p className={css.info}>{url}</p>
              </div>
              <div className={css.info_row}>
                <Svg
                  color={colors.addressFG}
                  path={paths.mapMarker}
                  style={{ minWidth: 18, minHeight: 18 }}
                  sm
                />
                <p className={css.info}>{company.address}</p>
              </div>
            </div>
          </div>
          <div className={css.card_right}>
            <BlendedImageBackground
              containerClass={css.picture_wrap}
              imageClass={css.picture}
              containerStyle={{ borderRadius: `0 ${borderRadius}px ${borderRadius}px 0` }}
              imageStyle={{ borderRadius: `0 ${borderRadius}px ${borderRadius}px 0` }}
              src={logo}
              alt={company.name}
            />
            <div className={`dimmed ${css.provider_name_wrap}`} style={{ color: colors.nameFG }}>
              <span className={css.provider_name}>{company.name}</span>
              <span className={css.proviver_phone_number}>{company.phoneNumber}</span>
            </div>
          </div>
        </section>
        <div className={css.controls}>
          <div className={css.actions}>
            <button
              type="button"
              name={PRINT}
              className={css.action_btn}
              onClick={handleClick}
            >
              <i className="fas fa-print mr-2" />
              <span className={css.action_btn_text}>Print</span>
            </button>
            <button
              type="button"
              name={DOWNLOAD}
              className={css.action_btn}
              onClick={handleClick}
            >
              <i className="fas fa-download mr-2" />
              <span className={css.action_btn_text}>Download</span>
            </button>
          </div>
          <section className={css.config_wrap}>
            <h1 className={css.config_heading}>Card Configuration</h1>
            <div className={css.config_body}>
              <label className={css.config_input_wrap} htmlFor={COLOR_TARGET}>
                <span className={css.config_input_label}>Select Card Element</span>
                <div className="select">
                  <select
                    name={COLOR_TARGET}
                    id={COLOR_TARGET}
                    value={colors.target}
                    onChange={handleValueChange}
                  >
                    <option value="qrCon">QR Container BG</option>
                    <option value="qrBG">QR Background</option>
                    <option value="qrFG">QR Foreground</option>
                    <option value="addressBG">Address Background</option>
                    <option value="addressFG">Address Foreground</option>
                    <option value="nameFG">Company Name</option>
                  </select>
                </div>
              </label>
              <label className={css.config_input_wrap} htmlFor={COLOR}>
                <span className={css.config_input_label}>Color</span>
                <input type="color" name={COLOR} value={colors[colors.target]} onChange={handleValueChange} className={css.color_input} />
              </label>
              <div className={`${css.config_input_wrap} ${css.range_input_wrap}`}>
                <span className={css.config_input_label}>Border Radius</span>
                <Range
                  name={BORDER_RADIUS}
                  value={borderRadius}
                  min={0}
                  max={64}
                  onChange={handleValueChange}
                />
              </div>
            </div>
            <div className={css.config_controls}>
              <button
                type="button"
                name={SAVE}
                className={css.config_control_btn}
                onClick={handleClick}
              >
                <Svg
                  color="#fff"
                  path={paths.save}
                  sm
                />
              </button>
              <button
                type="button"
                name={RESET}
                className={`${css.config_control_btn} ${css.red}`}
                onClick={handleClick}
              >
                <Svg
                  color="#fff"
                  path={paths.restore}
                  sm
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CardEditor;

/* eslint-enaable jsx-a11y/label-has-associated-control */
/* eslint-enable import/no-extraneous-dependencies */
