import profile from '../assets/images/defaultProfilePicture.jpeg';
import cover from '../assets/images/defaultCover.jpg';
import service1 from '../assets/images/service_image_1.jpg';
import service2 from '../assets/images/service_image_2.jpg';
import service3 from '../assets/images/service_image_3.jpg';
import userWallpaper from '../assets/images/waves.jpg';

const serviceImages = [
  service1, service2, service3,
];

const defaultImages = {
  profile,
  cover,
  userWallpaper,
  randomServiceImage: () => serviceImages[Math.floor(serviceImages.length * Math.random())],
};

export default defaultImages;
