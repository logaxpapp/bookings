/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useOutletContext } from 'react-router';
import QRCode from 'qrcode.react';
import { toPng } from 'html-to-image';
import css from './style.module.css';
import { addressText, notification } from '../../../utils';
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
const PRINT = 'print';
const RESET = 'reset';
const SAVE = 'save';
const STORAGE_KEY = 'businessCardSettings';

const defaultColors = {
  target: 'qrCon',
  qrCon: '#f8f9fa',
  qrBG: '#fff',
  qrFG: '#212121',
  addressBG: '#f8f9fa',
  addressFG: '#000',
  nameFG: '#fff',
};

const CardEditor = () => {
  const [code, setCode] = useState('');
  const [logo, setLogo] = useState(defaultImages.profile);
  const [url, setUrl] = useState('');
  const [borderRadius, setBorderRadius] = useState(0);
  const [colors, setColors] = useState(defaultColors);
  const cardRef = useRef();
  const [company] = useOutletContext();
  const { address } = useMemo(() => ({
    address: addressText(company.address),
  }), [company]);

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
                value={url}
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
                <p className={css.info}>{address}</p>
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
                aria-label="save"
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
                aria-label="reset"
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
