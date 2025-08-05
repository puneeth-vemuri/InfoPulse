import React, { useState, useEffect, useCallback } from "react";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import WeatherAnimation from './WeatherAnimation';
import './Weather.css'; 

// We only need WiHumidity and WiRaindrop from this library now
import { WiHumidity, WiRaindrop } from "react-icons/wi";


// We still need these icons for the hourly forecast and description
import { BsSun, BsMoonStars, BsCloudRain, BsSnow, BsCloud, BsLightning } from "react-icons/bs";

// Register Chart.js components
ChartJS.register( BarElement, CategoryScale, LinearScale, Tooltip, Legend );

// SVG Icons
const IconFeelsLike = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M12 16.2c-1.9 0-3.5-1.6-3.5-3.5 0-.6.1-1.1.4-1.6l-2.2-2.2c-.5.9-.7 1.9-.7 3.1 0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.1-.3-2.1-.8-3l-2.1 2.1c.3.5.4 1 .4 1.5 0 1.9-1.6 3.5-3.5 3.5zM12 4c-1.9 0-3.5 1.6-3.5 3.5 0 .6.1 1.1.4 1.6L6.7 11.3c-.5-.9-.7-1.9-.7-3.1 0-3.3 2.7-6 6-6s6 2.7 6 6c0 1.1-.3 2.1-.8 3L15.1 9c.3-.5.4-1 .4-1.5 0-1.9-1.6-3.5-3.5-3.5z"/></svg>;
const IconHumidity = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M12 2c-5.5 0-10 4.5-10 10 0 4.8 3.4 8.8 8 9.8v-4.1c-2.4-1-4-3.4-4-6.1 0-3.9 3.1-7 7-7s7 3.1 7 7c0 2.7-1.6 5.1-4 6.1v4.1c4.6-1 8-5 8-9.8C22 6.5 17.5 2 12 2z"/></svg>;
const IconWind = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M15.7 17.3H3.8c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8h11.9c1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8zm-3.5-7H3.8c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8h8.4c1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8zm7-7H3.8C2.8 3.3 2 4.1 2 5.1s.8 1.8 1.8 1.8h15.4c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8z"/></svg>;
const IconPressure = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"/></svg>;
const IconSunrise = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M4.8 12.3h14.4M12 5.1v2.7m6.3 1.6l-1.9 1.9M5.7 9.7L3.8 7.8M21 19.3H3"/></svg>;
const IconSunset = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M4.8 12.3h14.4M12 19.3v-2.7m6.3-1.6l-1.9-1.9M5.7 14.7L3.8 16.6M21 19.3H3"/></svg>;
const IconVisibility = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/></svg>;
const IconDewPoint = (props) => <svg viewBox="0 0 24 24" {...props}><path d="M12 20.9c-3.1 0-5.6-2.5-5.6-5.6 0-2.8 2-5.1 4.6-5.5.5-2.5 2.7-4.4 5.4-4.4 3.1 0 5.6 2.5 5.6 5.6 0 .2 0 .4-.1.6h.1c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5h-12c-.2 0-.4-.1-.6-.1z"/></svg>;

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
  
  useEffect(() => {
    setSelectedState(""); setSelectedCity(""); setCities([]); setWeather(null); setError(null);
    if (selectedCountry) { setStates(State.getStatesOfCountry(selectedCountry)); } else { setStates([]); }
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedCity(""); setWeather(null); setError(null);
    if (selectedCountry && selectedState) { setCities(City.getCitiesOfState(selectedCountry, selectedState)); } else { setCities([]); }
  }, [selectedState, selectedCountry]);

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    setLoading(true); setError(null); setWeather(null); setForecast(null);
    try {
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`);
      setWeather(weatherRes.data);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&appid=${WEATHER_KEY}&units=metric`);
      setForecast(forecastRes.data);
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to fetch weather data."); } finally { setLoading(false); }
  }, []);

  const fetchWeatherData = useCallback(async () => {
    if (!selectedCity || !selectedCountry) return;
    setLoading(true); setError(null); setWeather(null); setForecast(null);
    try {
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(selectedCity)},${selectedCountry}&appid=${WEATHER_KEY}&units=metric`);
      setWeather(weatherRes.data);
      const { lat, lon } = weatherRes.data.coord;
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&appid=${WEATHER_KEY}&units=metric`);
      setForecast(forecastRes.data);
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to fetch weather data."); } finally { setLoading(false); }
  }, [selectedCity, selectedCountry]);

  useEffect(() => { fetchWeatherData(); }, [fetchWeatherData]);
  useEffect(() => { if (userLocation) { fetchWeatherByCoords(userLocation.lat, userLocation.lon); } }, [userLocation, fetchWeatherByCoords]);

  useEffect(() => {
    if (weather) {
      const now = Date.now() / 1000;
      setIsDaytime(now > weather.sys.sunrise && now < weather.sys.sunset);
    }
  }, [weather]);

  const getForecastChartData = () => {
    if (!forecast || !forecast.daily) return { labels: [], datasets: [] };
    const dailyData = forecast.daily.slice(0, 8);
    const labels = dailyData.map(day => new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' }));
    const temperatures = dailyData.map(day => Math.round(day.temp.max));
    const precipitation = dailyData.map(day => (day.rain || 0).toFixed(2));
    return {
        labels,
        datasets: [
            { label: "Temperature (°C)", data: temperatures, backgroundColor: 'rgba(88, 88, 114, 0.6)', borderColor: 'rgba(110, 110, 140, 1)', borderWidth: 1, type: 'bar', yAxisID: "y", order: 2 },
            { label: "Precipitation (mm)", data: precipitation, backgroundColor: 'rgba(54, 112, 165, 0.8)', borderColor: 'rgba(75, 137, 199, 1)', borderWidth: 1, type: 'bar', yAxisID: "y1", order: 1 }
        ],
    };
  };
  
  const getHourlyForecast = () => {
    if (!forecast || !forecast.hourly) return [];
    return forecast.hourly.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      temp: Math.round(item.temp),
      icon: item.weather[0].main,
      precipitation: (item.rain?.['1h'] || 0).toFixed(2)
    }));
  };

  const WeatherIcon = ({ condition, size = 24 }) => {
    const iconStyle = { fill: 'none', stroke: '#a0d0ff', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const iconMap = {
      Clear: isDaytime ? <BsSun size={size} color="#FFD700" /> : <BsMoonStars size={size} color="#f0f0f0" />,
      Clouds: <BsCloud size={size} style={iconStyle} />, Rain: <BsCloudRain size={size} style={iconStyle} />, Snow: <BsSnow size={size} style={iconStyle} />,
      Thunderstorm: <BsLightning size={size} style={iconStyle} />, Drizzle: <WiRaindrop size={size} style={{color: "#a0d0ff"}} />, Mist: <WiHumidity size={size} style={{color: "#a0d0ff"}} />,
    };
    return iconMap[condition] || <BsCloud size={size} style={iconStyle} />;
  };

  const forecastChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { color: '#e0f7fa', boxWidth: 20, padding: 20, font: { size: 14, family: "'Courier New', monospace" } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 4, }
    },
    scales: {
      x: { grid: { color: 'rgba(0, 191, 255, 0.15)', borderColor: 'rgba(0, 191, 255, 0.2)' }, ticks: { color: '#bbdefb', font: { size: 12, family: "'Courier New', monospace" } } },
      y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperature (°C)', color: '#bbdefb' }, grid: { color: 'rgba(0, 191, 255, 0.15)', borderColor: 'rgba(0, 191, 255, 0.2)' }, ticks: { color: '#bbdefb' }, suggestedMax: 35 },
      y1: { type: 'linear', position: 'right', title: { display: true, text: 'Precipitation (mm)', color: '#bbdefb' }, grid: { drawOnChartArea: false }, ticks: { color: '#bbdefb' }, suggestedMax: 4.5 },
    },
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation is not supported by your browser"); return; }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => { setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude }); setIsGeolocating(false); },
      (error) => { setError("Unable to retrieve your location: " + error.message); setIsGeolocating(false); }
    );
  };

  // Main render logic
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
          <div><label>Country:</label><select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}><option value="">— Select Country —</option>{countries.map((country) => (<option key={country.isoCode} value={country.isoCode}>{country.name}</option>))}</select></div>
          <div><label>State / Province:</label><select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}><option value="">— Select State —</option>{states.map((state) => (<option key={state.isoCode} value={state.isoCode}>{state.name}</option>))}</select></div>
          <div><label>City:</label><select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}><option value="">— Select City —</option>{cities.map((city, idx) => (<option key={`${city.name}-${idx}`} value={city.name}>{city.name}</option>))}</select></div>
        </div>
      </div>
      
      {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading weather data...</p></div>)}
      {error && (<div className="error-container"><p>{error}</p></div>)}

      {weather && forecast && (
        <>
          <div className="weather-card current-weather-card">
            <div className="current-weather-top">
              <div className="current-weather-location">
                <h2>{weather.name}, {weather.sys.country}</h2>
                <p>{new Date(weather.dt * 1000).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <div className="current-weather-temp">
                <p className="temp">{Math.round(weather.main.temp)}°C</p>
                <div className="description">
                  <span>{weather.weather[0].description}</span>
                  <WeatherIcon condition={weather.weather[0].main} size={28} />
                </div>
              </div>
            </div>
            
            <div className="current-weather-main-grid">
              <div className="weather-animation-container">
                  <WeatherAnimation weatherCondition={weather.weather[0].main} isDay={isDaytime} />
              </div>
              <div className="details-grid">
                  <div className="detail-item"><IconFeelsLike /><span>Feels Like</span><span className="value">{Math.round(weather.main.feels_like)}°C</span></div>
                  <div className="detail-item"><IconHumidity /><span>Humidity</span><span className="value">{weather.main.humidity}%</span></div>
                  <div className="detail-item"><IconWind /><span>Wind</span><span className="value">{weather.wind.speed.toFixed(2)} m/s</span></div>
                  <div className="detail-item"><IconPressure /><span>Pressure</span><span className="value">{weather.main.pressure} hPa</span></div>
              </div>
              <div className="details-grid-secondary">
                <div className="detail-item-small"><IconSunrise /><span>Sunrise</span><span className="value">{new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="detail-item-small"><IconSunset /><span>Sunset</span><span className="value">{new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="detail-item-small"><IconVisibility /><span>Visibility</span><span className="value">{(weather.visibility / 1000).toFixed(1)} km</span></div>
                <div className="detail-item-small"><IconDewPoint /><span>Dew Point</span><span className="value">{Math.round(forecast.hourly[0].dew_point)}°C</span></div>
              </div>
            </div>
          </div>
          
          <div className="weather-card hourly-forecast-card">
            <h2 className="card-title">HOURLY FORECAST</h2>
            <div className="hourly-forecast-scroll">
              {getHourlyForecast().map((hour, index) => (
                <div key={index} className="hourly-item">
                  <p className="hourly-time">{hour.time}</p>
                  <div className="hourly-icon"><WeatherIcon condition={hour.icon} size={32} /></div>
                  <p className="hourly-temp">{hour.temp}°C</p>
                  {hour.precipitation > 0 && (
                    <div className="hourly-precipitation">
                      <WiRaindrop size={16} />
                      <span>{hour.precipitation}mm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="weather-card full-width-chart-card">
            <h2 className="card-title">8-DAY FORECAST</h2>
            {forecast && (
              <div className="forecast-chart-container">
                <Bar data={getForecastChartData()} options={forecastChartOptions} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;