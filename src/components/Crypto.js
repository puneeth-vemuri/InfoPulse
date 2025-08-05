import React, { useEffect, useState, useCallback } from "react";
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
  LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale, Filler
);

// SVG Icon Components
const FiSearch = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const FiStar = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const FiTrendingUp = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const DEFAULT_COINS = [ { id: "bitcoin", name: "Bitcoin", symbol: "btc" }, { id: "ethereum", name: "Ethereum", symbol: "eth" }, { id: "tether", name: "Tether", symbol: "usdt" }, { id: "bnb", name: "BNB", symbol: "bnb" }, { id: "solana", name: "Solana", symbol: "sol" }, { id: "xrp", name: "XRP", symbol: "xrp" }, { id: "polygon", name: "Polygon", symbol: "matic" } ];

function Crypto() {
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

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
        if (!response.ok) throw new Error("Failed to fetch coins");
        const data = await response.json();
        const defaultCoinIds = new Set(DEFAULT_COINS.map(c => c.id));
        const mergedCoins = [
          ...DEFAULT_COINS.map(defaultCoin => {
            const found = data.find(c => c.id === defaultCoin.id);
            return found ? found : { ...defaultCoin, current_price: 0, price_change_percentage_24h: 0, image: `https://placehold.co/30x30/2d3748/ffffff?text=${defaultCoin.symbol.toUpperCase()}` };
          }),
          ...data.filter(c => !defaultCoinIds.has(c.id))
        ];
        setCoins(mergedCoins);
      } catch (err) {
        console.error("Error fetching coins:", err);
        setCoins(DEFAULT_COINS.map(coin => ({ ...coin, current_price: 0, price_change_percentage_24h: 0, image: `https://placehold.co/30x30/2d3748/ffffff?text=${coin.symbol.toUpperCase()}`, market_cap: 0, total_volume: 0, circulating_supply: 0, market_cap_rank: 0 })));
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();
  }, []);

  useEffect(() => {
    if (!selectedCoin) return;
    setCoinAnalysis("");
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=${timeRange}`);
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [selectedCoin, timeRange]);
  
  const currentCoin = coins.find((coin) => coin.id === selectedCoin) || coins[0] || DEFAULT_COINS[0];

  const handleAnalysis = useCallback(async () => {
    if (!currentCoin || !currentCoin.name) return;
    setAnalysisLoading(true);
    setCoinAnalysis("");
    const prompt = `# ${currentCoin.name} (${currentCoin.symbol.toUpperCase()}) Investment Analysis: A Beginner's Overview\n\n## Potential\n- Bulleted list of potential upsides.\n\n## Key Risks\n- Bulleted list of key risks.\n\n## Conclusion\n- A concluding paragraph.`;
    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;  
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
            setCoinAnalysis(result.candidates[0].content.parts[0].text);
        } else {
            setCoinAnalysis("Could not get analysis. The model may have refused to answer.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        setCoinAnalysis("Failed to retrieve analysis. Please check the console for details.");
    } finally {
        setAnalysisLoading(false);
    }
  }, [currentCoin]);

  const toggleFavorite = (coinId) => {
    setFavorites(prev => {
      const newFaves = prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId];
      localStorage.setItem("cryptoFavorites", JSON.stringify(newFaves));
      return newFaves;
    });
  };

  const formatChartData = () => {
    if (!chartData || !chartData.prices) return { labels: [], datasets: [] };
    return {
      labels: chartData.prices.map(price => price[0]),
      datasets: [{
          data: chartData.prices.map(price => price[1]),
          borderColor: '#4f46e5',
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          pointRadius: 0,
          tension: 0.4,
          borderWidth: 2,
          fill: true,
      }],
    };
  };

  const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: value < 1 ? 4 : 2, maximumFractionDigits: value < 1 ? 6 : 2 }).format(value || 0);
  const formatPercentage = (value) => {
    const val = value || 0;
    const color = val >= 0 ? "#10b981" : "#ef4444";
    return <span style={{ color }}>{val >= 0 ? "↑" : "↓"} {Math.abs(val).toFixed(2)}%</span>;
  };

  const filteredCoins = coins.filter(coin => {
    const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return showFavorites ? matchesSearch && favorites.includes(coin.id) : matchesSearch;
  });
  
  // --- ⬇️ CHART OPTIONS NOW INSIDE COMPONENT FOR DYNAMIC UNIT ⬇️ ---
  const getChartUnit = () => {
    if (timeRange <= 2) return 'hour';
    if (timeRange <= 90) return 'day';
    return 'month';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        type: 'time',
        time: { unit: getChartUnit() },
        grid: { display: false },
        ticks: { autoSkip: true, maxTicksLimit: 7 }
      },
      y: { 
        grid: { color: "rgba(226, 232, 240, 0.1)" }, 
        ticks: { callback: (value) => formatCurrency(value), padding: 10, color: '#64748b' },
        grace: '5%' // Adds padding to prevent clumsy look for stablecoins
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
            <input type="text" className="search-input" placeholder="Search cryptocurrencies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setShowFavorites(!showFavorites)} className={`favorites-button ${showFavorites ? 'active' : ''}`}>
            <FiStar />
            <span>{showFavorites ? "Viewing Favorites" : "Show Favorites"}</span>
          </button>
        </div>

        <div className="crypto-content-grid">
          <div className="coin-list-panel">
            <div className="coin-list-header">Cryptocurrencies</div>
            <div className="coin-list-scroll">
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <div key={coin.id} onClick={() => setSelectedCoin(coin.id)} className={`coin-list-item ${selectedCoin === coin.id ? 'active' : ''}`}>
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
              ) : ( <div className="no-results-message">No cryptocurrencies found.</div> )}
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
                        <div className="ai-analysis-content">
                           <ReactMarkdown>{coinAnalysis}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )}

            <div className="chart-wrapper">
              {loading || !chartData ? <p className="loading-text">Loading Chart...</p> : <Line data={formatChartData()} options={chartOptions} />}
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
              <div className="loading-text">Select a coin to see details</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Crypto;