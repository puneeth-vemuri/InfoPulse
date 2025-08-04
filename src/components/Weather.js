import React, { useState, useEffect, useRef, useCallback } from "react";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { WiHumidity, WiStrongWind, WiBarometer, WiSunrise, WiSunset, WiRaindrop } from "react-icons/wi";
import { FaTemperatureHigh, FaEye } from "react-icons/fa";
import { BiDroplet } from "react-icons/bi";
import { BsSun, BsMoonStars, BsCloudRain, BsSnow, BsCloud, BsLightning } from "react-icons/bs";
import './Weather.css'; // Import the new CSS

// Register Chart.js components
ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const WEATHER_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const WeatherDashboard = () => {
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isDaytime, setIsDaytime] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  const weatherAnimations = {
    Clear: "sun", Clouds: "clouds", Rain: "rain", Snow: "snow", Thunderstorm: "thunder", Drizzle: "drizzle", Mist: "mist", Smoke: "mist", Haze: "mist", Dust: "mist", Fog: "mist", Sand: "mist", Ash: "mist", Squall: "wind", Tornado: "tornado",
  };

  useEffect(() => {
    setSelectedState(""); setSelectedCity(""); setCities([]); setWeather(null); setError(null);
    if (selectedCountry) { setStates(State.getStatesOfCountry(selectedCountry)); } else { setStates([]); }
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedCity(""); setWeather(null); setError(null);
    if (selectedCountry && selectedState) { setCities(City.getCitiesOfState(selectedCountry, selectedState)); } else { setCities([]); }
  }, [selectedState, selectedCountry]);

  const fetchWeatherData = useCallback(async () => {
    if (!selectedCity) return;
    setLoading(true); setError(null); setWeather(null); setForecast(null);
    try {
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(selectedCity)},${selectedCountry}&appid=${WEATHER_KEY}&units=metric`);
      setWeather(weatherRes.data);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(selectedCity)},${selectedCountry}&appid=${WEATHER_KEY}&units=metric`);
      setForecast(forecastRes.data);
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to fetch weather data."); } finally { setLoading(false); }
  }, [selectedCity, selectedCountry]);

  useEffect(() => { fetchWeatherData(); }, [fetchWeatherData]);

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    setLoading(true); setError(null); setWeather(null); setForecast(null);
    try {
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`);
      setWeather(weatherRes.data);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`);
      setForecast(forecastRes.data);
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to fetch weather data."); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (userLocation) { fetchWeatherByCoords(userLocation.lat, userLocation.lon); } }, [userLocation, fetchWeatherByCoords]);

  const animate = useCallback((ctx, canvas, type, frameCount) => {
    const now = Date.now();
    const deltaTime = now - lastFrameTimeRef.current;
    if (deltaTime < 33) { animationRef.current = requestAnimationFrame(() => animate(ctx, canvas, type, frameCount)); return; }
    lastFrameTimeRef.current = now;
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawSun = () => { ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2); ctx.fillStyle = isDaytime ? "#FFD700" : "#f0f0f0"; ctx.fill(); ctx.strokeStyle = isDaytime ? "#FFA500" : "#d0d0d0"; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const angle = (i / 12) * Math.PI * 2 + (frameCount * 0.01); const x1 = canvas.width / 2 + Math.cos(angle) * 45; const y1 = canvas.height / 2 + Math.sin(angle) * 45; const x2 = canvas.width / 2 + Math.cos(angle) * 65; const y2 = canvas.height / 2 + Math.sin(angle) * 65; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); } };
    const drawClouds = () => { ctx.fillStyle = "#f0f0f0"; ctx.beginPath(); ctx.arc(80 + (frameCount % canvas.width), 60, 20, 0, Math.PI * 2); ctx.arc(100 + (frameCount % canvas.width), 50, 25, 0, Math.PI * 2); ctx.arc(120 + (frameCount % canvas.width), 60, 20, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(180 - (frameCount * 0.5 % canvas.width), 80, 15, 0, Math.PI * 2); ctx.arc(200 - (frameCount * 0.5 % canvas.width), 70, 20, 0, Math.PI * 2); ctx.arc(220 - (frameCount * 0.5 % canvas.width), 80, 15, 0, Math.PI * 2); ctx.fill(); };
    switch (type) {
      case "sun": drawSun(); break;
      case "clouds": drawClouds(); break;
      case "rain": drawClouds(); ctx.strokeStyle = "#a0d0ff"; ctx.lineWidth = 2; for (let i = 0; i < 50; i++) { const x = (i * 10 + frameCount * 2) % canvas.width; const y = (frameCount * 5 + i * 5) % canvas.height; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 10); ctx.stroke(); } break;
      case "snow": drawClouds(); ctx.fillStyle = "#ffffff"; for (let i = 0; i < 50; i++) { const x = (i * 10 + frameCount) % canvas.width; const y = (frameCount * 2 + i * 5) % canvas.height; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); } break;
      case "thunder": ctx.fillStyle = "#505070"; ctx.beginPath(); ctx.arc(100, 60, 30, 0, Math.PI * 2); ctx.arc(130, 50, 35, 0, Math.PI * 2); ctx.arc(160, 60, 30, 0, Math.PI * 2); ctx.fill(); if (frameCount % 60 < 15) { ctx.strokeStyle = "#ffff00"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(130, 70); ctx.lineTo(120, 90); ctx.lineTo(130, 85); ctx.lineTo(110, 120); ctx.stroke(); } break;
      default: drawSun();
    }
    animationRef.current = requestAnimationFrame(() => animate(ctx, canvas, type, frameCount));
  }, [isDaytime]);

  const startAnimation = useCallback(() => {
    if (!weather || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 300; canvas.height = 150;
    const animationType = weatherAnimations[weather.weather[0].main] || "sun";
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    lastFrameTimeRef.current = 0;
    animate(ctx, canvas, animationType, 0);
  }, [weather, weatherAnimations, animate]);

  useEffect(() => { startAnimation(); return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }; }, [startAnimation]);

  useEffect(() => {
    if (weather) {
      const now = Date.now() / 1000;
      setIsDaytime(now > weather.sys.sunrise && now < weather.sys.sunset);
    }
  }, [weather]);

  const getForecastChartData = () => {
    if (!forecast) return { labels: [], datasets: [] };
    const labels = []; const temperatures = []; const precipitation = [];
    for (let i = 0; i < forecast.list.length; i += 8) {
      const item = forecast.list[i];
      labels.push(new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' }));
      temperatures.push(item.main.temp);
      precipitation.push((item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0));
    }
    return {
      labels,
      datasets: [
        { label: "Temperature (°C)", data: temperatures, borderColor: "#ff6384", backgroundColor: "rgba(255, 99, 132, 0.2)", tension: 0.4, yAxisID: "y" },
        { label: "Precipitation (mm)", data: precipitation, backgroundColor: "rgba(54, 162, 235, 0.5)", type: "bar", yAxisID: "y1" }
      ],
    };
  };
  
  const getHourlyForecast = () => {
    if (!forecast) return [];
    return forecast.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).getHours() + ":00",
      temp: Math.round(item.main.temp),
      icon: item.weather[0].main,
      precipitation: (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0)
    }));
  };

  const getUvDescription = (uv) => {
    if (uv <= 2) return "Low"; if (uv <= 5) return "Moderate"; if (uv <= 7) return "High"; if (uv <= 10) return "Very High"; return "Extreme";
  };

  const WeatherIcon = ({ condition, size = 24 }) => {
    const iconMap = {
      Clear: isDaytime ? <BsSun size={size} color="#FFD700" /> : <BsMoonStars size={size} color="#f0f0f0" />,
      Clouds: <BsCloud size={size} color="#f0f0f0" />, // Changed from WiHumidity
      Rain: <BsCloudRain size={size} color="#a0d0ff" />,
      Snow: <BsSnow size={size} color="#ffffff" />,
      Thunderstorm: <BsLightning size={size} color="#ffff00" />, // Changed from WiStrongWind
      Drizzle: <WiRaindrop size={size} color="#a0d0ff" />,
      Mist: <WiHumidity size={size} color="#f0f0f0" />,
    };
    return iconMap[condition] || <WiHumidity size={size} color="#f0f0f0" />;
  };

  const forecastChartOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    scales: {
      y: { type: "linear", display: true, position: "left", title: { display: true, text: "Temperature (°C)", color: "#bbdefb" }, grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "#bbdefb" } },
      y1: { type: "linear", display: true, position: "right", title: { display: true, text: "Precipitation (mm)", color: "#bbdefb" }, grid: { drawOnChartArea: false }, ticks: { color: "#bbdefb" } },
      x: { grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "#bbdefb" } },
    },
    plugins: { legend: { labels: { color: "#e0f7fa" } } },
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation is not supported by your browser"); return; }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => { setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude }); setIsGeolocating(false); },
      (error) => { setError("Unable to retrieve your location: " + error.message); setIsGeolocating(false); }
    );
  };

  return (
    <div className="weather-container">
      <header className="weather-header">
        <h1 className="weather-title">WEATHER DASHBOARD</h1>
        <button className="location-button" onClick={getLocation} disabled={isGeolocating}>
          {isGeolocating ? "Detecting..." : "Use My Location"}
        </button>
      </header>

      <div className="weather-card location-selector-card">
        <h2 className="card-title">SELECT LOCATION</h2>
        <div className="location-grid">
          <div>
            <label>Country:</label>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
              <option value="">-- Select Country --</option>
              {countries.map((country) => (<option key={country.isoCode} value={country.isoCode}>{country.name}</option>))}
            </select>
          </div>
          <div>
            <label>State / Province:</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
              <option value="">-- Select State --</option>
              {states.map((state) => (<option key={state.isoCode} value={state.isoCode}>{state.name}</option>))}
            </select>
          </div>
          <div>
            <label>City:</label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
              <option value="">-- Select City --</option>
              {cities.map((city, idx) => (<option key={`${city.name}-${idx}`} value={city.name}>{city.name}</option>))}
            </select>
          </div>
        </div>
      </div>

      {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading weather data...</p></div>)}
      {error && (<div className="error-container"><p>{error}</p></div>)}

      {weather && (
        <>
          <div className="weather-card">
            <div className="current-weather-top">
              <div className="current-weather-location">
                <h2>{weather.name}, {weather.sys.country}</h2>
                <p>{new Date(weather.dt * 1000).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <div className="current-weather-temp">
                <p className="temp">{Math.round(weather.main.temp)}°C</p>
                <div className="description"><span>{weather.weather[0].main}</span><WeatherIcon condition={weather.weather[0].main} size={28} /></div>
              </div>
            </div>

            <div className="current-weather-details">
              <div className="weather-animation"><canvas ref={canvasRef}/></div>
              <div className="details-grid">
                <div className="detail-item"><FaTemperatureHigh color="#00ffcc" /><p>Feels Like</p><p className="value">{Math.round(weather.main.feels_like)}°C</p></div>
                <div className="detail-item"><WiHumidity size={24} color="#00ffcc" /><p>Humidity</p><p className="value">{weather.main.humidity}%</p></div>
                <div className="detail-item"><WiStrongWind size={24} color="#00ffcc" /><p>Wind</p><p className="value">{weather.wind.speed} m/s</p></div>
                <div className="detail-item"><WiBarometer size={24} color="#00ffcc" /><p>Pressure</p><p className="value">{weather.main.pressure} hPa</p></div>
              </div>
            </div>

            <div className="details-grid" style={{ marginTop: '1.5rem' }}>
              <div className="detail-item"><WiSunrise size={24} color="#00ffcc" /><p>Sunrise</p><p className="value">{new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
              <div className="detail-item"><WiSunset size={24} color="#00ffcc" /><p>Sunset</p><p className="value">{new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
              <div className="detail-item"><FaEye color="#00ffcc" /><p>Visibility</p><p className="value">{(weather.visibility / 1000).toFixed(1)} km</p></div>
              <div className="detail-item"><BiDroplet color="#00ffcc" /><p>Dew Point</p><p className="value">{Math.round(weather.main.feels_like - 2)}°C</p></div>
            </div>
          </div>

          <div className="weather-card">
            <h2 className="card-title">HOURLY FORECAST</h2>
            <div className="hourly-forecast-scroll">
              {getHourlyForecast().map((hour, index) => (
                <div key={index} className="hourly-item">
                  <p>{hour.time}</p>
                  <div><WeatherIcon condition={hour.icon} size={28} /></div>
                  <p className="temp">{hour.temp}°C</p>
                  {hour.precipitation > 0 && (<div className="precipitation"><WiRaindrop size={16} /><span >{hour.precipitation}mm</span></div>)}
                </div>
              ))}
            </div>
          </div>

          <div className="weather-card">
            <h2 className="card-title">5-DAY FORECAST</h2>
            {forecast && (<div className="forecast-chart-container"><Bar data={getForecastChartData()} options={forecastChartOptions} /></div>)}
          </div>

          <div className="index-grid">
            <div className="weather-card">
              <h2 className="card-title">AIR QUALITY</h2>
              <div className="index-item">
                <div className="index-icon aqi">42</div>
                <div className="index-details">
                  <p className="label">Air Quality Index</p>
                  <p className="value">Good</p>
                  <p className="description">Air quality is satisfactory</p>
                </div>
              </div>
            </div>
            <div className="weather-card">
              <h2 className="card-title">UV INDEX</h2>
              <div className="index-item">
                <div className="index-icon uv">4.2</div>
                <div className="index-details">
                  <p className="label">UV Exposure</p>
                  <p className="value">{getUvDescription(4.2)}</p>
                  <p className="description">Moderate risk from UV rays</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;