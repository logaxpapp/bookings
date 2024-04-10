import css from './style.module.css';
import Header from '../Header';
import Subscriptions, {
  premiumFeatures,
  standardFeatures,
  starterFeatures,
} from './Subscription';
import PublicRouteContainer from '../PublicRouteContainer';

const Pricing = () => (
  <PublicRouteContainer>
    <div className={`container ${css.container}`}>
      <Header />
      <main role="main" className={css.main}>
        <header className={css.header}>
          <h1 className={css.heading}>
            <span>Loga</span>
            <span className={css.accented}>XP</span>
            <span>&nbsp;Appointments</span>
          </h1>
          <p className={css.header_text}>Let 10+ million of our users discover your business.</p>
        </header>
        <Subscriptions />
        <section className={css.table_section}>
          <table className={css.table}>
            <thead>
              <tr>
                <th className={css.features_heading}>
                  <span>Features</span>
                </th>
                <th>
                  <span>Starter</span>
                </th>
                <th>
                  <span>Standard</span>
                </th>
                <th>
                  <span>Premium</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {starterFeatures.map((feature) => (
                <tr key={feature}>
                  <td className={css.feature}>
                    <span>{feature}</span>
                  </td>
                  <td aria-label="included">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>check-circle</title>
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </td>
                  <td aria-label="included">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>check-circle</title>
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </td>
                  <td aria-label="included">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>check-circle</title>
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
              {standardFeatures.filter((f, idx) => idx > 0).map((feature) => (
                <tr key={feature}>
                  <td className={css.feature}>
                    <span>{feature}</span>
                  </td>
                  <td aria-label="not included" />
                  <td aria-label="included">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>check-circle</title>
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </td>
                  <td aria-label="included">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>check-circle</title>
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
              {premiumFeatures.filter((f, idx) => idx > 0).map((feature) => (
                <tr key={feature}>
                  <td className={css.feature}>
                    <span>{feature}</span>
                  </td>
                  <td aria-label="not included" />
                  <td aria-label="not included" />
                  <td aria-label="included">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>check-circle</title>
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </PublicRouteContainer>
);

export default Pricing;
