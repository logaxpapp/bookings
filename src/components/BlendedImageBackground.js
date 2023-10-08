import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { imageColors } from '../utils';

/**
 * @param {Object} props
 * @param {import('../types').NamedStyle} props.imageStyle
 * @param {import('../types').NamedStyle} props.containerStyle
 */
const BlendedImageBackground = ({
  src,
  alt,
  imageStyle,
  containerStyle,
  imageClass,
  containerClass,
}) => {
  const [style, setStyle] = useState(containerStyle);

  useEffect(() => {
    imageColors.getColor(src)
      .then((backgroundColor) => setStyle(
        containerStyle ? { ...containerStyle, backgroundColor } : { backgroundColor },
      ));
  }, [src, containerStyle, setStyle]);

  return (
    <div style={style} className={containerClass}>
      <img src={src} alt={alt} style={imageStyle} className={imageClass} />
    </div>
  );
};

BlendedImageBackground.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  imageStyle: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  imageClass: PropTypes.string,
  containerClass: PropTypes.string,
};

BlendedImageBackground.defaultProps = {
  imageStyle: null,
  containerStyle: null,
  imageClass: null,
  containerClass: null,
};

export default BlendedImageBackground;
