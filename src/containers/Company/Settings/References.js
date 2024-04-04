import { Heading1 } from '../../Aside';

const COPY_LINK = 'copy_link';
const SEND_EMAIL = 'send_email';

const References = () => {
  const handleClick = () => {
    // TODO:
  };

  return (
    <div className="h-full">
      <section className="flex flex-col gap-7 w-full max-w-[600px]">
        <header className="flex flex-col gap-1">
          <Heading1>Refer a Friend</Heading1>
          <p className="m-0 font-normal text-sm text-[#5c5c5c]">
            Refer a friend, so they can create their own account
          </p>
        </header>
        <div className="flex items-center gap-3">
          <button
            type="button"
            name={COPY_LINK}
            onClick={handleClick}
            className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#011c39] text-white"
          >
            Copy Link
          </button>
          <button
            type="button"
            name={SEND_EMAIL}
            onClick={handleClick}
            className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#e9ebf8] text-[#5c5c5c]"
          >
            Email
          </button>
        </div>
      </section>
    </div>
  );
};

export default References;
