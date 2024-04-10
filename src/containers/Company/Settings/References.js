import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Heading1 } from '../../Aside';
import { notification } from '../../../utils';
import Editor, { stateFromHtml, stateToHtml } from '../../../components/Editor';
import Modal from '../../../components/Modal';
import { selectEmployee, selectToken } from '../../../redux/companySlice';
import { Input, matchesEmail } from '../../../components/TextBox';
import { postResource } from '../../../api';

const COPY_LINK = 'copy_link';
const SEND_EMAIL = 'send_email';

const head = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <style>
      a {
        text-decoration: none;
        color: #2c59a9;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <main style="width:100%;max-width:600px;margin:auto;color:#444;font-size:18px;line-height:1.5;">
`;

const tail = '</main></body></html>';

const defaultEmail = (employee, url) => {
  const name = `${employee?.firstname} ${employee?.lastname}`;

  return `
    <p>Hi,</p>
    <p>I hope this email finds you well. I'm writing to let you know about an exciting opportunity that your friend ${name} has recommended for you.</p>
    <p>Your friend has been using a fantastic online appointment booking web application called Book Flex, and they've found it incredibly useful for their business. Book Flex not only streamlines appointment scheduling but also helps service providers like you to showcase your services to potential clients.</p>
    <p>With Book Flex, you can easily manage your appointments, attract new clients, and grow your business online. Your friend thought you would benefit greatly from using Book Flex to enhance your service offerings and reach a wider audience.</p>
    <p>Here are some key features of Book Flex:</p>
    <ol>
    <li>Online appointment scheduling: Allow clients to book appointments with you easily and conveniently.</li>
    <li>Service showcase: Showcase your services, expertise, and availability to potential clients.</li>
    <li>Client management: Keep track of client appointments, preferences, and contact details in one place.</li>
    <li>Flexible customization: Customize your booking page to reflect your brand and unique services.</li>
    <li>Mobile-friendly: Access and manage your appointments on the go with Book Flex's mobile app.</li>
    </ol>
    <p>To get started with Book Flex, simply click on the following link to sign up: <a href="${url}" target="_self">${url}</a></p>
    <p>If you have any questions or need assistance getting started, feel free to reach out to the Book Flex support team at <a href="mailto:support@logaxp.com" target="_self">support@logaxp.com</a>. They'll be happy to help you every step of the way.</p>
    <p>Thank you for considering Book Flex as a valuable tool for your business. We look forward to welcoming you aboard!</p>
    <p>Best regards,</p>
    <p>LogaXP Team</p>
  `;
};

const EmailEditor = ({ busy, setBusy, onClose }) => {
  const [email, setEmail] = useState('');
  const employee = useSelector(selectEmployee);
  const initialState = useMemo(() => (
    stateFromHtml(defaultEmail(employee, window.location.origin))
  ));
  const [editorState, setEditorState] = useState(initialState);
  const token = useSelector(selectToken);

  const sendEmail = () => {
    if (!matchesEmail(email)) {
      notification.showError("Please provide your friend's valid email address");
      return;
    }

    let content = stateToHtml(editorState);
    if (!content) {
      notification.showError('Cannot send an invite without content');
      return;
    }

    setBusy(true);
    content = `${head}${content}${tail}`;

    postResource(token, 'references', { email, content }, true)
      .then(() => {
        notification.showSuccess('Invitation successfully sent!');
        onClose();
      })
      .catch(() => {
        notification.showError('Failed to send invitation');
        setBusy(false);
      });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex pb-6">
        <div className="max-w-96">
          <Input
            type="email"
            label="Your Friend's Email"
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </div>
      </div>
      <div className="flex-1 border border-slate-200 overflow-hidden">
        <Editor initialState={initialState} onChange={setEditorState} />
      </div>
      <div className="flex justify-end pt-6">
        <button type="button" onClick={sendEmail} className={`btn ${busy ? 'busy' : ''}`} disabled={busy}>
          Send Message
        </button>
      </div>
    </div>
  );
};

EmailEditor.propTypes = {
  busy: PropTypes.bool,
  setBusy: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EmailEditor.defaultProps = {
  busy: false,
};

const References = () => {
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, busy: false });

  const handleClick = ({ target: { name } }) => {
    if (name === COPY_LINK) {
      if (navigator.clipboard) {
        const url = window.location.origin;
        navigator.clipboard?.writeText(url)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 5000);
          })
          .catch(() => notification.showError('Unable to copy link'));
      } else {
        notification.showError('Unable to copy link');
      }
    } else if (name === SEND_EMAIL) {
      setModal({ isOpen: true, busy: false });
    }
  };

  return (
    <div className="h-full" id="company-references-panel">
      <section className="flex flex-col gap-7 w-full max-w-[600px]">
        <header className="flex flex-col gap-1">
          <Heading1>Refer a Friend</Heading1>
          <p className="m-0 font-normal text-sm text-[#5c5c5c]">
            Refer a friend, so they can create their own account
          </p>
        </header>
        <div className="flex items-center gap-3">
          <div className="relative">
            {copied ? (
              <span
                aria-hidden="true"
                className="absolute text-[#338d33] text-center py-2 rounded-md bg-slate-100 w-full -top-3 left-0 -translate-y-full z-10 after:absolute after:top-full after:left-1/2 after:bg-slate-100 after:-mt-1 after:w-2 after:h-2 after:rotate-45"
              >
                Copied!
              </span>
            ) : null}
            <button
              type="button"
              name={COPY_LINK}
              onClick={handleClick}
              className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#011c39] text-white"
            >
              Copy Link
            </button>
          </div>
          <button
            type="button"
            name={SEND_EMAIL}
            onClick={handleClick}
            className="py-4 px-12 rounded-[10px] transition-transform hover:scale-105 bg-[#e9ebf8] text-[#5c5c5c]"
          >
            Email
          </button>
        </div>
        <Modal
          isOpen={modal.busy || modal.isOpen}
          parentSelector={() => document.querySelector('#company-references-panel')}
          onRequestClose={() => {
            if (!modal.busy) {
              setModal({ isOpen: false, busy: false });
            }
          }}
          style={{
            content: { height: '90vh', maxWidth: '90vw' },
          }}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          <div className="py-4 px-6 h-full">
            <EmailEditor
              busy={modal.busy}
              setBusy={(busy) => setModal((modal) => ({ ...modal, busy }))}
              onClose={() => setModal({ isOpen: false, busy: false })}
            />
          </div>
        </Modal>
      </section>
    </div>
  );
};

export default References;
