import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import css from '../Pricing/Subscription/style.module.css';
import {
  loadSubscriptionPlansAsync,
  selectLoadingSubscriptions,
  selectSubscriptions,
  selectSubscriptionsError,
} from '../../redux/subscriptionsSlice';
import { Loader } from '../../components/LoadingSpinner';
import ResourceLoader from '../../components/ResourceLoader';
import { currencyHelper } from '../../utils';
import routes from '../../routing/routes';
import { planProps } from '../../utils/propTypes';

const Plan = ({
  plan,
  left,
}) => {
  const {
    features,
    price,
  } = useMemo(() => {
    let price = '';
    const features = [];

    if (plan?.prices?.length) {
      const planPrice = plan.prices[0];
      price = currencyHelper.toString(planPrice.amount, planPrice.country.currencySymbol);
    }

    if (plan?.featureTexts?.length) {
      plan.featureTexts.forEach(({ text }) => {
        if (text.endsWith('+')) {
          features.unshift(text);
        } else {
          features.push(text);
        }
      });
    }

    return { features, price };
  });

  if (!plan) {
    return null;
  }

  if (plan.prominent) {
    return (
      <article className={css.standard_article}>
        <span className={css.most_popular}>Most popular</span>
        <div className={css.standard_body}>
          <div>
            <h1 className={css.plan_heading}>{plan.name}</h1>
            <div className={css.price_row}>
              <span className={css.price}>{price}</span>
              <span className={css.periodicity}>/ m</span>
            </div>
            <div className={css.features_panel}>
              {features.map((feature) => (
                <span key={feature} className={css.feature}>{feature}</span>
              ))}
            </div>
          </div>
          <div className={css.plan_footer}>
            <div className={css.free_period_wrap}>
              <span className={css.free_period}>
                {`${plan.freePeriod} month${plan.freePeriod === 1 ? '' : 's'} free trial`}
              </span>
            </div>
            <Link
              to={routes.company.absolute.registration}
              state={{ priceId: plan.priceId, countryId: plan.countryId }}
              className={css.register_link}
            >
              Get Started
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className={`${css.article_wrap} ${left ? css.left : css.right}`}>
      <article className={`${css.plan_article} ${left ? css.left : css.right}`}>
        <div>
          <h1 className={css.plan_heading}>{plan.name}</h1>
          <div className={css.price_row}>
            <span className={css.price}>{price}</span>
            <span className={css.periodicity}>/ m</span>
          </div>
          <div className={css.features_panel}>
            {features.map((feature) => (
              <span key={feature} className={css.feature}>{feature}</span>
            ))}
          </div>
        </div>
        <div className={css.plan_footer}>
          <div className={css.free_period_wrap}>
            <span className={css.free_period}>
              {`${plan.freePeriod} month${plan.freePeriod === 1 ? '' : 's'} free trial`}
            </span>
          </div>
          <Link
            to={routes.company.absolute.registration}
            state={{ priceId: plan.priceId, countryId: plan.countryId }}
            className={css.register_link}
          >
            Get Started
          </Link>
        </div>
      </article>
    </div>
  );
};

Plan.propTypes = {
  plan: planProps.isRequired,
  left: PropTypes.bool,
};

Plan.defaultProps = {
  left: false,
};

const SubscriptionPlans = () => {
  const plans = useSelector(selectSubscriptions);
  const loading = useSelector(selectLoadingSubscriptions);
  const error = useSelector(selectSubscriptionsError);
  const { featuredPlan1, featuredPlan2, popularPlan } = useMemo(() => {
    if (!plans) {
      return { featuredPlan1: null, featuredPlan2: null, popularPlan: null };
    }

    const featuredPlans = plans.filter(
      (plan) => (plan.featured && !plan.prominent),
    ).sort((p1, p2) => p1.prices[0].amount - p2.prices[0].amount);
    const popularPlan = plans.find((plan) => plan.prominent);

    return {
      featuredPlan1: featuredPlans[0],
      featuredPlan2: featuredPlans[1],
      popularPlan,
    };
  }, [plans]);
  const dispatch = useDispatch();

  const reload = useCallback(() => {
    dispatch(loadSubscriptionPlansAsync());
  }, []);

  useEffect(() => {
    if (!plans && !loading && !error) {
      reload();
    }
  }, [plans, loading, error]);

  if (loading) {
    return (
      <div className="relative w-full h-15">
        <Loader type="double_ring" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-15">
        <ResourceLoader resourceName="Subscription Plans" onReload={reload} />
      </div>
    );
  }

  if (!plans) {
    return null;
  }

  return (
    <section className={css.container}>
      <Plan plan={featuredPlan1} left />
      <Plan plan={popularPlan} />
      <Plan plan={featuredPlan2} />
    </section>
  );
};

export default SubscriptionPlans;
