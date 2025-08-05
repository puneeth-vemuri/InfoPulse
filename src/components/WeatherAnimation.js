import React from 'react';
import Lottie from 'lottie-react';

// Import all the animation JSON files you downloaded
import sunAnimation from '../assets/animations/sun.json';
import moonAnimation from '../assets/animations/moon.json';
import cloudyAnimation from '../assets/animations/cloudy.json';
import rainAnimation from '../assets/animations/rain.json';
import snowAnimation from '../assets/animations/snow.json';
import thunderAnimation from '../assets/animations/thunder.json';
import mistAnimation from '../assets/animations/mist.json';

const WeatherAnimation = ({ weatherCondition, isDay }) => {
  const getAnimationData = () => {
    switch (weatherCondition) {
      case 'Clear':
        return isDay ? sunAnimation : moonAnimation;
      case 'Clouds':
        return cloudyAnimation;
      case 'Rain':
      case 'Drizzle':
        return rainAnimation;
      case 'Snow':
        return snowAnimation;
      case 'Thunderstorm':
        return thunderAnimation;
      case 'Mist':
      case 'Smoke':
      case 'Haze':
      case 'Dust':
      case 'Fog':
      case 'Sand':
      case 'Ash':
      case 'Squall':
      case 'Tornado':
        return mistAnimation;
      default:
        return cloudyAnimation; // A safe default
    }
  };

  return <Lottie animationData={getAnimationData()} loop={true} />;
};

export default WeatherAnimation;