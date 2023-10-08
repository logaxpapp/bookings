import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.module.css';
import opay from '../../assets/images/opay.jpg';
import kobo from '../../assets/images/kobo.jpg';
import tradeDepot from '../../assets/images/trade-depot.jpg';
import northwest from '../../assets/images/northwest.jpg';
import ramco from '../../assets/images/ramco.jpg';
import sterling from '../../assets/images/sterling.jpg';
import kuda from '../../assets/images/kuda.jpg';
import wema from '../../assets/images/wema.jpg';
import testimonial1 from '../../assets/images/testimonial-1.jpg';
import testimonial2 from '../../assets/images/testimonial-2.jpg';
import testimonial3 from '../../assets/images/testimonial-3.jpg';
import StarRating from '../../lib/StarRating';
import Slider from '../../lib/Slider';

const trustedByImages = [
  { id: 1, title: 'opay', src: opay },
  { id: 2, title: 'kobo', src: kobo },
  { id: 3, title: 'tragde depot', src: tradeDepot },
  { id: 4, title: 'north west', src: northwest },
  { id: 5, title: 'ramco', src: ramco },
  { id: 6, title: 'sterling', src: sterling },
  { id: 7, title: 'kuda', src: kuda },
  { id: 8, title: 'wema', src: wema },
];

const testimonials = [
  {
    picture: testimonial1,
    name: 'Jacintha Michaels',
    text: '"LogaXP has streamlined our appointment booking process and made it easier for our customers to schedule appointments."',
    designation: 'CEO, Jacintha Fashions and Clothing',
    rating: 90,
  },
  {
    picture: testimonial2,
    name: 'Edger Boris',
    text: '"LogaXP has given me more exposure and visibility to potential customers. The software is easy to use, making it much more efficient. I highly recommend LogaXP for anyone looking for an easy and automated way to manage their appointments."',
    designation: 'Manager, Hairstyles Chain',
    rating: 95,
  },
  {
    picture: testimonial3,
    name: 'Sean Knowles',
    text: '"I have been using LogaXP for the past few months and I am very impressed with the results. It has made managing my appointments effortless and automated, saving me a lot of time and energy."',
    designation: 'CEO, Knibbles Style Home',
    rating: 85,
  },
];

const TestimonialSlide = ({ slide }) => {
  const [rating, setRating] = useState('');

  useEffect(() => {
    if (slide) {
      const rating = (5 * slide.rating) / 100;
      setRating(rating.toFixed(1));
    }
  }, [slide, setRating]);

  if (!slide) {
    return null;
  }

  return (
    <article className={css.testimonial_article}>
      <img src={slide.picture} alt={slide.name} className={css.testimonial_picture} />
      <div className={css.testimonial_right}>
        <p className={css.testimonial_text}>
          {slide.text}
        </p>
        <h1 className={css.testimonial_name}>
          {slide.name}
        </h1>
        <span className={css.testimonial_designation}>{slide.designation}</span>
        <div className={css.testimonial_rating_wrap}>
          <StarRating width={80} rating={slide.rating} />
          <span>
            {`${rating}/5.0 Rating`}
          </span>
        </div>
      </div>
    </article>
  );
};

TestimonialSlide.propTypes = {
  slide: PropTypes.shape({
    picture: PropTypes.string,
    text: PropTypes.string,
    name: PropTypes.string,
    designation: PropTypes.string,
    rating: PropTypes.number,
  }).isRequired,
};

export const TrustedBy = () => (
  <section className={`${css.section_row} ${css.trusted_by_outer_panel}`}>
    <span className={css.trusted_by_text}>Trusted By</span>
    <div className={css.trusted_by_inner_panel}>
      {trustedByImages.map((c) => (
        <img
          key={c.id}
          src={c.src}
          alt={c.title}
          className={css.trusted_by_img}
        />
      ))}
    </div>
  </section>
);

export const Testimonial = () => (
  <section className={css.section_row}>
    <span className={css.section_intro}>Testimonials</span>
    <h1 className={`${css.section_heading} ${css.testimonial_heading}`}>
      Hear directly from our Users
    </h1>
    <div className={css.testimonial_slide_panel}>
      <div className={css.testimonial_slide_clip}>
        <Slider slides={testimonials} Slide={TestimonialSlide} hideNav showBullets />
      </div>
    </div>
  </section>
);
