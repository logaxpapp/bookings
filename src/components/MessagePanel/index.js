import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import { SvgButton, colors, paths } from '../svg';

/* eslint-disable jsx-a11y/label-has-associated-control */

const CLOSE_MESSAGES = 'close messages';
const MESSAGE_CONTENT = 'message content';

const MessagePanel = ({
  messages,
  username,
  title,
  rider,
  onSubmit,
  onClose,
}) => {
  const [content, setContent] = useState('');
  const form = useRef(null);

  const handleClick = useCallback(({ target: { name } }) => {
    if (name === CLOSE_MESSAGES) {
      onClose();
    }
  }, [onClose]);

  const handleValueChange = useCallback(({ target: { name, value } }) => {
    if (name === MESSAGE_CONTENT) {
      setContent(value);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const message = content.trim();
    setContent('');
    onSubmit(message);
  }, [content, setContent]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey) {
        setContent((content) => `${content}\n`);
      } else {
        handleSubmit(e);
      }
    }
  }, [handleSubmit, setContent]);

  return (
    <section className={css.message_panel}>
      <header className={css.message_panel_header}>
        <div className={css.message_panel_header_title}>
          <span>{title}</span>
          {rider ? (
            <span className={css.message_panel_service_title_rider}>{rider}</span>
          ) : null}
        </div>
      </header>
      <div className={css.message_panel_body}>
        {messages.length ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${css.message_content} ${msg.senderName === username ? css.right : css.left}`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <div className={css.message_panel_empty_msg}>
            Start a conversation!
          </div>
        )}
      </div>
      <form ref={form} onSubmit={handleSubmit} className={css.message_form}>
        <label className={css.message_label} data-value={content}>
          <textarea
            type="text"
            name={MESSAGE_CONTENT}
            value={content}
            className={css.message_input}
            onChange={handleValueChange}
            onKeyUp={handleKeyPress}
            rows={1}
          />
        </label>
      </form>
      <SvgButton
        type="button"
        title="Close"
        name={CLOSE_MESSAGES}
        color={colors.delete}
        path={paths.close}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
        onClick={handleClick}
        sm
      />
    </section>
  );
};

MessagePanel.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    senderName: PropTypes.string,
    content: PropTypes.string,
  })),
  username: PropTypes.string.isRequired,
  title: PropTypes.string,
  rider: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

MessagePanel.defaultProps = {
  title: 'Messages',
  rider: '',
  messages: [],
};

export default MessagePanel;

/* eslint-enable jsx-a11y/label-has-associated-control */
