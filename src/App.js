import React from 'react';
import News from './components/News';
import Crypto from './components/Crypto';
import Weather from './components/Weather';
import VantaBackground from './components/VantaBackground';
import './App.css'; 

function App() {
  return (
    <div className="app-root">
      {/* Background Layer: Stays in the back */}
      <div className="background-layer">
        <VantaBackground />
      </div>

      {/* ⬇️ ADD THIS HEADER SECTION ⬇️ */}
      {/* <header className="app-header">
        <h1>InfoPulse</h1>
        <p>Your Daily Pulse of Global News, Weather & Crypto.</p>
      </header> */}

      {/* Foreground Content: Stays on top */}
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
    </div>
  );
}

export default App;