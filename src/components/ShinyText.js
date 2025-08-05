import React from 'react';
import './ShinyText.css';

const ShinyText = ({ text }) => {
  return (
    <p className="shiny-text">
      {text}
    </p>
  );
};

export default ShinyText;