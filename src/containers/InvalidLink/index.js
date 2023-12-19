import { Link } from 'react-router-dom';
import Header from '../Header';
import css from './style.module.css';
import routes from '../../routing/routes';
import Footer from '../Footer';

const InvalidLink = () => (
  <>
    <div className={css.page}>
      <Header />
      <div className={css.body}>
        <section className={css.content}>
          <h1 className={css.heading}>
            The link you clicked no longer exist.
          </h1>
          <br />
          <p className={css.sub_heading}>
            Why am I seeing this message?
          </p>
          <ol>
            <li>The link may have expired.</li>
            <li>It is a one time link and you have already clicked it before.</li>
          </ol>
          <p>
            <span>Please contact our&nbsp;</span>
            <Link to={routes.contact} className="link">support</Link>
            <span>&nbsp;if you need further assistance.</span>
          </p>
        </section>
      </div>
    </div>
    <Footer />
  </>
);

export default InvalidLink;
