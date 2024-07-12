import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
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
    <section className="w-60 h-full max-h-70 relative flex flex-col overflow-hidden pointer-events-auto bg-white dark:bg-[#222d3a] border border-[#ddd] dark:border-[#1c2530]">
      <header className="p-1 text-white bg-[#0f5abd]">
        <div className="flex flex-col gap-1.5 text-sm">
          <span>{title}</span>
          {rider ? (
            <span className="text-[#c9d0d5] text-xs">{rider}</span>
          ) : null}
        </div>
      </header>
      <div className="flex-1 flex flex-col gap-2 p-1 overflow-auto">
        {messages.length ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-2 text-sm border border-[#dbdbdb] dark:border-[#151b24] text-[#011c39] dark:text-slate-100 ${msg.senderName === username ? 'ml-8 bg-[#f6f8fd] dark:bg-[#1f2733]' : 'mr-8 bg-[#e9ebf0] dark:bg-[#161d27]'}`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <div className="text-[#8f9cb5] dark:text-slate-200 text-sm py-8 px-4 text-center">
            Start a conversation!
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="pt-4 pb-2 px-2">
        <label className="max-h-20 overflow-auto p-2 grid grid-cols-2 grid-rows-2 align-top items-stretch relative rounded-sm border border-[#cadde7] dark:border-[#1e2631] after:content-[attr(data-value)] after:invisible after:whitespace-pre-wrap after:col-start-1 after:col-span-2 after:row-start-1 after:row-span-2" data-value={content}>
          <textarea
            type="text"
            name={MESSAGE_CONTENT}
            value={content}
            className="block w-full resize-none col-start-1 col-span-2 row-start-1 row-span-2 bg-transparent text-[#5c5c5c] dark:text-white"
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
