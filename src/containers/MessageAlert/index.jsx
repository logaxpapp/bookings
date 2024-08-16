import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import TextBox from '../../components/TextBox';
import { SvgButton, colors, paths } from '../../components/svg';
import { useDialog } from '../../lib/Dialog';

const CLOSE = 'close';
const CONTENT = 'content';

export const MessageAlert = ({
  message,
  title,
  onSubmit,
  onClose,
}) => {
  const [sliderClass, setSliderClass] = useState(css.slider);
  const [content, setContent] = useState('');

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === CONTENT) {
      setContent(value);
    }
  }, []);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE) {
      setSliderClass(css.slider);
      setTimeout(onClose, 500);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (content) {
      onSubmit({ content }, (err) => {
        if (!err) {
          setSliderClass(css.slider);
          setTimeout(onClose, 500);
        }
      });
    }
  }, [content, onSubmit, onClose, setSliderClass]);

  useEffect(() => {
    setSliderClass(`${css.slider} ${css.open}`);
  }, []);

  return (
    <div className={css.container}>
      <div className={sliderClass}>
        <section className={css.panel}>
          <header className={css.header}>
            <h1 className={`ellipsis ${css.heading}`}>{title}</h1>
            <SvgButton
              type="button"
              name={CLOSE}
              title="Close"
              color={colors.delete}
              path={paths.close}
              onClick={handleClick}
              sm
            />
          </header>
          <div className={css.content_wrap}>
            <p className={css.content}>{message}</p>
          </div>
          <form className={css.form} onSubmit={handleSubmit}>
            <TextBox
              type="text"
              id={CONTENT}
              name={CONTENT}
              value={content}
              onChange={handleValueChange}
              style={{
                border: '1px solid #d4e3eb',
                borderRadius: '4px 0 0 4px',
              }}
              containerStyle={{
                marginBottom: 0,
                flex: 1,
              }}
              hideErrorOnNull
            />
            <button type="submit" className={css.submit_btn}>
              Reply
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

MessageAlert.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

MessageAlert.defaultProps = {
  message: '',
  title: '',
};

export const useMessageAlert = () => {
  const dialog = useDialog();

  return {
    show: (message, title, onSubmit) => {
      let popup;
      const handleClose = () => popup.close();
      popup = dialog.show(
        <MessageAlert
          message={message}
          onSubmit={onSubmit}
          onClose={handleClose}
          title={title}
        />,
      );
    },
  };
};
