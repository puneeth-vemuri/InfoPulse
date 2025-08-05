import React, { useState, useEffect } from 'react';
import News from './components/News';
import Crypto from './components/Crypto';
import Weather from './components/Weather';
import VantaBackground from './components/VantaBackground';
import Footer from './components/Footer';
import RotatingText from './components/RotatingText'; // Import RotatingText
import ShinyText from './components/ShinyText';     // Import ShinyText
import './App.css'; 

function App() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 300000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-root">
      <div className="background-layer">
        <VantaBackground />
      </div>

      {/* --- ⬇️ THIS IS THE UPDATED HEADER SECTION ⬇️ --- */}
      <header className="app-header">
        <div className="title-container">
          <h1>InfoPulse: </h1>
          <RotatingText
            texts={['News', 'Crypto', 'Weather']}
            staggerDuration={0.05} // Controls the character animation speed
            rotationInterval={2500} // Time between word changes
          />
        </div>
        <ShinyText text="Your Daily Pulse of Global News, Weather & Crypto." />
      </header>
      {/* --- ⬆️ END OF UPDATED HEADER SECTION ⬆️ --- */}


      <main className="content-layer">
        <div className="component-wrapper">
          <News />
        </div>
        <div className="component-wrapper">
          <Crypto />
        </div>
        <div className="component-wrapper">
          <Weather />
        </div>
      </main>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}

export default App;