import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import ReactMarkdown from 'react-markdown';
import './Crypto.css';

// Register Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler // This was missing from your registration
);

// SVG Icon Components to replace react-icons
const FiSearch = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FiStar = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const FiTrendingUp = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);


// Default cryptocurrencies to display
const DEFAULT_COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc" },
  { id: "ethereum", name: "Ethereum", symbol: "eth" },
  { id: "celestia", name: "Celestia", symbol: "tia" },
  { id: "first-digital-usd", name: "First Digital USD", symbol: "fdusd" },
  { id: "renzo-restaked-eth", name: "Renzo Restaked ETH", symbol: "ezeth" },
  { id: "optimism", name: "Optimism", symbol: "op" },
  { id: "polygon", name: "Polygon", symbol: "matic" },
];

function Crypto() {
  // State management
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("cryptoFavorites");
    return saved ? JSON.parse(saved) : ["bitcoin", "ethereum"];
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [coinAnalysis, setCoinAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Theme colors inspired by the screenshot
  const themeColors = {
    primary: "#1a2a6c",
    secondary: "#b21f1f",
    gradient: "linear-gradient(80deg,rgb(51, 83, 226) 61%,#42f4d4 90%)",
    cardBg: "#ffffff",
    textDark: "#1e293b",
    textLight: "#64748b",
    accent: "#4f46e5",
    border: "#e2e8f0",
    hover: "#f1f5f9", // Lighter hover for better contrast
    background: "#0f172a", // Dark slate background
  };

  // Fetch cryptocurrency data
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        );
        if (!response.ok) throw new Error("Failed to fetch coins");
        const data = await response.json();
        const mergedCoins = [
          ...DEFAULT_COINS.map(defaultCoin => {
            const found = data.find(c => c.id === defaultCoin.id);
            return found ? found : { ...defaultCoin, current_price: 0, price_change_percentage_24h: 0, image: `https://placehold.co/30x30/2d3748/ffffff?text=${defaultCoin.symbol.toUpperCase()}` };
          }),
          ...data.filter(c => !DEFAULT_COINS.some(dc => dc.id === c.id))
        ];
        setCoins(mergedCoins);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching coins:", err);
        setCoins(DEFAULT_COINS.map(coin => ({
          ...coin,
          current_price: 0,
          price_change_percentage_24h: 0,
          image: `https://placehold.co/30x30/2d3748/ffffff?text=${coin.symbol.toUpperCase()}`,
          market_cap: 0,
          total_volume: 0,
          circulating_supply: 0,
          market_cap_rank: 0
        })));
        setLoading(false);
      }
    };
    fetchCoins();
  }, []);

  // Fetch chart data for selected coin
  useEffect(() => {
    if (!selectedCoin) return;
    setCoinAnalysis(""); // Clear analysis when coin changes
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=${timeRange}`
        );
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const data = await response.json();
        setChartData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setChartData(null);
        setLoading(false);
      }
    };
    fetchChartData();
  }, [selectedCoin, timeRange]);
  
  const currentCoin = coins.find((coin) => coin.id === selectedCoin) || coins[0] || DEFAULT_COINS[0];

  // Gemini API call for coin analysis
  const handleAnalysis = async () => {
    if (!currentCoin) return;
    setAnalysisLoading(true);
    setCoinAnalysis("");

    // --- CHANGE 1: THE PROMPT IS UPDATED ---
    const prompt = `
Generate an investment analysis for ${currentCoin.name} (${currentCoin.symbol.toUpperCase()}) suitable for a beginner.

The response should be in Markdown and structured with the following H1 and H2 headings:

# ${currentCoin.name} (${currentCoin.symbol.toUpperCase()}) Investment Analysis: A Beginner's Overview

## Potential
- Use a bulleted list for the potential upsides.

## Key Risks
- Use a bulleted list for the key risks.

## Conclusion
- A concluding paragraph.

Please provide detailed points for each section.
`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;  
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setCoinAnalysis(text);
        } else {
            setCoinAnalysis("Could not get analysis. The model may have refused to answer.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        setCoinAnalysis("Failed to retrieve analysis. Please check the console for details.");
    } finally {
        setAnalysisLoading(false);
    }
  };


  // Toggle favorite
  const toggleFavorite = (coinId) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(coinId)
        ? prevFavorites.filter(id => id !== coinId)
        : [...prevFavorites, coinId];
      localStorage.setItem("cryptoFavorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Format price data for chart
  const formatChartData = () => {
    if (!chartData || !chartData.prices) return { labels: [], datasets: [] };
    
    // Use raw timestamps for the time scale
    const labels = chartData.prices.map(price => price[0]);
    const data = chartData.prices.map(price => price[1]);

    return {
        labels,
        datasets: [{
            label: "Price (USD)",
            data,
            borderColor: themeColors.accent,
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2,
            fill: true,
        }],
    };
  };

  // Format currency
  const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value || 0);

  // Format percentage
  const formatPercentage = (value) => {
    const val = value || 0;
    const color = val >= 0 ? "#10b981" : "#ef4444";
    return <span style={{ color }}>{val >= 0 ? "↑" : "↓"} {Math.abs(val).toFixed(2)}%</span>;
  };

  // Filter coins based on search and favorites
  const filteredCoins = coins.filter(coin => {
    const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return showFavorites ? matchesSearch && favorites.includes(coin.id) : matchesSearch;
  });

  // Chart options (Updated to use 'time' scale)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        type: 'time',
        time: {
          unit: timeRange === '1' ? 'hour' : 'day',
        },
        grid: { display: false },
        ticks: {
            autoSkip: true,
            maxTicksLimit: 7 
        }
      },
      y: { 
        grid: { color: "rgba(226, 232, 240, 0.5)" }, 
        ticks: { callback: (value) => formatCurrency(value) } 
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        callbacks: { 
            title: (tooltipItems) => new Date(tooltipItems[0].parsed.x).toLocaleString(),
            label: (context) => formatCurrency(context.parsed.y) 
        } 
      },
    },
    interaction: { mode: "index", intersect: false },
  };

 return (
    <div className="crypto-container">
      <header className="crypto-header">
        <h1>Cryptocurrency Tracker</h1>
        <p>Dynamic Price Monitoring with Market Movement Insights</p>
      </header>

      <main className="crypto-main">
        <div className="controls-container">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`favorites-button ${showFavorites ? 'active' : ''}`}
          >
            <FiStar />
            <span>{showFavorites ? "Favorites" : "Show Favorites"}</span>
          </button>
        </div>

        <div className="crypto-content-grid">
          <div className="coin-list-panel">
            <div className="coin-list-header">Cryptocurrencies</div>
            <div className="coin-list-scroll">
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <div
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin.id)}
                    className={`coin-list-item ${selectedCoin === coin.id ? 'active' : ''}`}
                  >
                    <img src={coin.image} alt={coin.name} className="coin-icon" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/32x32/1e293b/ffffff?text=${coin.symbol.slice(0,2).toUpperCase()}`}} />
                    <div className="coin-info">
                      <div className="coin-name-price">
                        <span>{coin.name}</span>
                        <span>{formatCurrency(coin.current_price)}</span>
                      </div>
                      <div className="coin-symbol-change">
                        <span>{coin.symbol.toUpperCase()}</span>
                        <span>{formatPercentage(coin.price_change_percentage_24h)}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.id); }} className={`favorite-star-button ${favorites.includes(coin.id) ? 'favorited' : ''}`}>
                      <FiStar />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: '#94a3b8' }}>
                  No cryptocurrencies found.
                </div>
              )}
            </div>
          </div>
          
          <div className="chart-panel">
            {currentCoin ? (
            <>
            <div className="chart-header">
              <div className="chart-coin-info">
                <img src={currentCoin.image} alt={currentCoin.name} className="chart-coin-icon" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/48x48/1e293b/ffffff?text=${currentCoin.symbol.slice(0,2).toUpperCase()}`}}/>
                <div>
                  <h2 className="chart-coin-name">
                    {currentCoin.name} ({currentCoin.symbol.toUpperCase()})
                    {currentCoin.market_cap_rank && <span className="coin-rank"><FiTrendingUp />Rank #{currentCoin.market_cap_rank}</span>}
                  </h2>
                  <div className="chart-coin-price">
                    {formatCurrency(currentCoin.current_price)}
                    <span>{formatPercentage(currentCoin.price_change_percentage_24h)}</span>
                  </div>
                </div>
              </div>
              <div className="chart-controls">
                {["1", "7", "30", "90", "365"].map(range => (
                  <button key={range} onClick={() => setTimeRange(range)} className={`time-range-button ${timeRange === range ? 'active' : ''}`}>
                    {range === "1" ? "24h" : range === "365" ? "1y" : `${range}d`}
                  </button>
                ))}
                 <button onClick={handleAnalysis} disabled={analysisLoading} className="ai-button">
                    ✨ {analysisLoading ? 'Analyzing...' : 'AI Coin Analysis'}
                  </button>
              </div>
            </div>
            
            {(analysisLoading || coinAnalysis) && (
                <div className="ai-analysis-section">
                    <h3>Gemini AI Analysis</h3>
                    {analysisLoading ? (<p>Loading analysis...</p>) : (
                        // --- CHANGE 2: THE JSX IS UPDATED TO USE REACTMARKDOWN ---
                        <div className="ai-analysis-content">
                           <ReactMarkdown>{coinAnalysis}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )}

            <div className="chart-wrapper">
              {loading || !chartData ? <p>Loading Chart...</p> : <Line data={formatChartData()} options={chartOptions} />}
            </div>
            
            <div className="metric-grid">
              <div className="metric-card">
                <div className="metric-label">Market Cap</div>
                <div className="metric-value">{formatCurrency(currentCoin.market_cap)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Volume (24h)</div>
                <div className="metric-value">{formatCurrency(currentCoin.total_volume)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Circulating Supply</div>
                <div className="metric-value">{currentCoin.circulating_supply > 0 ? currentCoin.circulating_supply.toLocaleString() : "N/A"} {currentCoin.symbol.toUpperCase()}</div>
              </div>
            </div>
            </>
            ) : (
              <div style={{textAlign: 'center', padding: '40px'}}>Select a coin to see details</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Crypto;