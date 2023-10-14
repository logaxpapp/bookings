import { useCallback, useState } from 'react';
import css from './style.module.css';
import { postForm } from '../../api';
import TextBox, { matchesEmail } from '../../components/TextBox';
import { useNotification } from '../../lib/Notification';
import Header from '../Header';
import LoadingButton from '../../components/LoadingButton';

const NAME = 'name';
const EMAIL = 'email';
const SUBJECT = 'subject';
const CONTENT = 'message';

const Contact = () => {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    subject: false,
    content: false,
  });
  const notification = useNotification();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleTextChange = useCallback(({ target: { name, value } }) => {
    if (name === NAME) {
      setName(value);
    } else if (name === EMAIL) {
      setEmail(value);
    } else if (name === SUBJECT) {
      setSubject(value);
    } else if (name === CONTENT) {
      setContent(value);
    }
  }, [
    setName,
    setEmail,
    setSubject,
    setContent,
  ]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const errors = {
      name: !name,
      email: !matchesEmail(email),
      subject: !subject,
      content: !content,
    };

    if (errors.name || errors.email || errors.subject || errors.content) {
      setErrors(errors);
      return false;
    }

    setBusy(true);

    postForm('api/v1/contact_messages', {
      name,
      email,
      subject,
      content,
    })
      .then(() => {
        setBusy(false);
        setName('');
        setEmail('');
        setSubject('');
        setContent('');
        notification.showSuccess('Your message was successfully sent!');
      })
      .catch(() => {
        setBusy(false);
        notification.showError('An error occurred while sending your message. Please try again.');
      });
    return false;
  }, [name, email, subject, content, setErrors, setBusy]);

  return (
    <div className={css.container}>
      <div className={css.header}>
        <Header />
      </div>
      <div className={css.body_wrap}>
        <div className={`${css.row} ${css.body}`}>
          <div className={`${css.formWrap} ${css.flexColumn}`}>
            <h3 className={css.main_heading}>Get in touch</h3>
            <form method="POST" name="contactForm" className={css.contactForm} noValidate="novalidate" onSubmit={handleSubmit}>
              <div className={css.formRow}>
                <div className={css.formGroup}>
                  <TextBox
                    type="text"
                    name={NAME}
                    id={NAME}
                    label="Name"
                    value={name}
                    error={errors.name ? 'Please enter your name!' : null}
                    style={{ border: '1px solid #efefef' }}
                    containerStyle={{ marginBottom: 0 }}
                    onChange={handleTextChange}
                    hideOnNull
                  />
                </div>
                <div className={`${css.formGroup} ${css.ml10px}`}>
                  <TextBox
                    type="email"
                    name={EMAIL}
                    id={EMAIL}
                    label="Email"
                    value={email}
                    error={errors.email ? 'Invalid Email Address!' : null}
                    style={{ border: '1px solid #efefef' }}
                    containerStyle={{ marginBottom: 0 }}
                    onChange={handleTextChange}
                    hideOnNull
                  />
                </div>
              </div>
              <div className={css.formGroup}>
                <TextBox
                  type="text"
                  name={SUBJECT}
                  id={SUBJECT}
                  label="Subject"
                  value={subject}
                  error={errors.name ? 'Please enter a subject!' : null}
                  style={{ border: '1px solid #efefef' }}
                  containerStyle={{ marginBottom: 0 }}
                  onChange={handleTextChange}
                  hideOnNull
                />
              </div>
              <div className={`${css.formGroup} ${css.contentGroup}`}>
                <span className={css.label}>Message</span>
                <textarea name={CONTENT} className={css.content} value={content} placeholder="Message" onChange={handleTextChange} />
                {errors.content && (
                  <span className={`${css.label} ${css.error}`}>
                    Please enter message
                  </span>
                )}
              </div>
              <div className={`${css.formGroup} ${css.controls}`}>
                <LoadingButton
                  type="submit"
                  label="Send Message"
                  loading={busy}
                  styles={{
                    fontSize: 14,
                    marginTop: 16,
                    width: 128,
                  }}
                />
              </div>
            </form>
          </div>
          <div className={css.aside}>
            <div>
              <h3 className={css.aside_heading}>Let&apos;s Connect</h3>
              <div className={css.dBox}>
                <div className={css.icon}>
                  <i className="fas fa-phone" aria-hidden="true" />
                </div>
                <div className={css.text}>
                  <p>
                    <span className={css.boxLabel}>Phone:</span>
                    <span>Available On Request</span>
                  </p>
                </div>
              </div>
              <a
                href="mailto:enquiries@logaxp.com"
                className={css.dBox}
                target="_blank"
                rel="noreferrer"
              >
                <div className={css.icon}>
                  <i className="fas fa-envelope" aria-hidden="true" />
                </div>
                <div className={css.text}>
                  <p>
                    <span className={css.boxLabel}>Email:</span>
                    <span>enquiries@logaxp.com</span>
                  </p>
                </div>
              </a>
              <a href="https://logaxp.com" target="_blank" rel="noreferrer" className={css.dBox}>
                <div className={css.icon}>
                  <i className="fa fa-globe" aria-hidden="true" />
                </div>
                <div className={css.text}>
                  <p>
                    <span className={css.boxLabel}>Website:</span>
                    <span>logaxp.com</span>
                  </p>
                </div>
              </a>
            </div>
            <ul className={`list horizontal ${css.social_media}`}>
              <li>
                <a className={css.contact_link} href="#id" target="_blank">
                  <i className="fab fa-facebook" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a className={css.contact_link} href="#id" target="_blank">
                  <i className="fab fa-twitter" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a className={css.contact_link} href="#id" target="_blank">
                  <i className="fab fa-instagram" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
