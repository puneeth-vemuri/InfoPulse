// // src/components/News.js
// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import './News.css'; // Make sure you have this CSS file

// // Moved outside the component because it's a constant and never changes.
// // This fixes the useCallback dependency warning.
// const defaultCategories = [
//   { id: 'general', name: 'Top Stories' },
//   { id: 'technology', name: 'Technology' },
//   { id: 'business', name: 'Business' },
//   { id: 'entertainment', name: 'Entertainment' },
//   { id: 'sports', name: 'Sports' },
//   { id: 'science', name: 'Science' },
//   { id: 'health', name: 'Health' }
// ];

// const News = () => {
//   // Removed the unused 'allArticles' state.
//   const [displayedArticles, setDisplayedArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeCategory, setActiveCategory] = useState('general');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [categories, setCategories] = useState(defaultCategories);

//   const API_KEY = "a9efe6ec8ec14d3aa84729ef6642a8c7";
  
//   // Fetch news from API
//   const fetchNews = useCallback(async () => {
//     // We need to check the 'activeCategory' and 'searchQuery' from inside the function
//     // so we pass them as arguments instead of relying on stale state from the closure.
//     const currentCategory = activeCategory;
//     const currentSearch = searchQuery;

//     try {
//       setLoading(true);
//       setError(null);
      
//       let url;
//       if (currentSearch) {
//         url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(currentSearch)}&sortBy=relevancy&pageSize=30&apiKey=${API_KEY}`;
//       } else {
//         url = `https://newsapi.org/v2/top-headlines?country=us&category=${currentCategory}&pageSize=30&apiKey=${API_KEY}`;
//       }
      
//       const res = await axios.get(url);
      
//       if (currentSearch) {
//         setCategories([
//           { id: 'search', name: `Search: ${currentSearch}` },
//           ...defaultCategories
//         ]);
//         setActiveCategory('search');
//       }
      
//       setDisplayedArticles(res.data.articles);
//     } catch (err) {
//       console.error(err);
//       if (err.response && err.response.status === 426) {
//         setError('API limit reached. Please try again later or use a different API key.');
//       } else if (err.response && err.response.status === 429) {
//         setError('Too many requests. Please wait a moment and try again.');
//       } else {
//         setError('Failed to fetch news. Please try again later.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   // Updated dependency array
//   }, [searchQuery, activeCategory, API_KEY]);

//   // Handle search
//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       fetchNews();
//     }
//   };

//   // Handle category change
//   const handleCategoryChange = (category) => {
//     setActiveCategory(category);
//     setSearchQuery('');
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   // Shorten text
//   const shortenText = (text, maxLength) => {
//     if (!text) return '';
//     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
//   };
  
//   // This useEffect now fetches news whenever the category changes.
//   useEffect(() => {
//     fetchNews();
//   }, [activeCategory, fetchNews]);


//   // Render loading skeleton
//   const renderSkeleton = () => (
//     <div className="news-grid loading">
//       {[...Array(9)].map((_, i) => (
//         <div key={i} className="news-card skeleton">
//           <div className="skeleton-image"></div>
//           <div className="skeleton-content">
//             <div className="skeleton-line"></div>
//             <div className="skeleton-line"></div>
//             <div className="skeleton-line"></div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   // Render error message
//   const renderError = () => (
//     <div className="error-container">
//       <h3>⚠</h3>
//       <p>{error}</p>
//       <button className="retry-button" onClick={fetchNews}>
//         Try Again
//       </button>
//     </div>
//   );

//   // Render no results
//   const renderNoResults = () => (
//     <div className="no-results">
//       <h3>No articles found for "{searchQuery}"</h3>
//       <p>Try a different search term or select a category.</p>
//     </div>
//   );

//   return (
//     <div className="news-container">
//       <div className="news-header">
//         <h1>Daily Digest</h1>
//         <p>Your curated source of the latest headlines</p>
        
//         <div className="controls">
//           <div className="category-tabs">
//             {categories.map(category => (
//               <button
//                 key={category.id}
//                 className={`tab ${activeCategory === category.id ? 'active' : ''}`}
//                 onClick={() => handleCategoryChange(category.id)}
//               >
//                 {category.name}
//               </button>
//             ))}
//           </div>
          
//           <form className="search-container" onSubmit={handleSearch}>
//             <input
//               type="text"
//               placeholder="Search news, sports, tech..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <button type="submit" className="search-button">
//               <svg className="search-icon" viewBox="0 0 24 24">
//                 <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
//               </svg>
//             </button>
//           </form>
//         </div>
//       </div>

//       {error ? renderError() : 
//        loading ? renderSkeleton() : 
//        displayedArticles.length === 0 ? renderNoResults() : (
//         <div className="news-grid">
//           {displayedArticles.slice(0, 9).map((article, idx) => (
//             <div key={idx} className="news-card">
//               {article.urlToImage ? (
//                 <div 
//                   className="news-image" 
//                   style={{ backgroundImage: `url(${article.urlToImage})` }}
//                 ></div>
//               ) : (
//                 <div className="news-image placeholder">
//                   <div className="image-placeholder-icon">📰</div>
//                 </div>
//               )}
//               <div className="news-content">
//                 <div className="news-category">
//                   {article.category || activeCategory}
//                 </div>
//                 <h3 className="news-title">
//                   <a 
//                     href={article.url} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                   >
//                     {article.title}
//                   </a>
//                 </h3>
//                 <p className="news-description">
//                   {shortenText(article.description, 120)}
//                 </p>
//                 <div className="news-footer">
//                   <span className="news-source">{article.source.name}</span>
//                   <span className="news-date">
//                     {formatDate(article.publishedAt)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default News;
// src/components/News.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './News.css';

// These categories match the available ones from the new API
const defaultCategories = [
  { id: 'general', name: 'Top Stories' },
  { id: 'technology', name: 'Technology' },
  { id: 'business', name: 'Business' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'sports', name: 'Sports' },
  { id: 'science', name: 'Science' },
  { id: 'health', name: 'Health' }
];

const News = () => {
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');

  // --- NO API KEY NEEDED ANYMORE ---

  const fetchNews = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    
    // --- SAURAV.TECH API URL ---
    // We will use 'us' as the default country code for top headlines
    const url = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/us.json`;
    
    try {
      const res = await axios.get(url);
      
      // The data structure is the same as the original NewsAPI
      if (res.data && res.data.articles) {
        setDisplayedArticles(res.data.articles);
      } else {
        setDisplayedArticles([]);
      }

    } catch (err) {
      console.error("Error fetching from proxied API:", err);
      setError('Failed to fetch news. The proxy service may be down.');
    } finally {
      setLoading(false);
    }
  }, []); // The function no longer depends on anything that changes

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    fetchNews(category);
  };
  
  useEffect(() => {
    // Initial fetch on component mount
    fetchNews(activeCategory);
  }, [fetchNews, activeCategory]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const shortenText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const renderSkeleton = () => (
    <div className="news-grid loading">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="news-card skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content"><div className="skeleton-line"></div><div className="skeleton-line"></div><div className="skeleton-line"></div></div>
        </div>
      ))}
    </div>
  );

  const renderError = () => (
    <div className="error-container">
      <h3>⚠</h3><p>{error}</p>
      <button className="retry-button" onClick={() => fetchNews(activeCategory)}>
        Try Again
      </button>
    </div>
  );

  const renderNoResults = () => (
    <div className="no-results">
      <h3>No articles found for this category.</h3>
      <p>Please select another category.</p>
    </div>
  );

  return (
    <div className="news-container">
      <div className="news-header">
        <h1>Daily Digest</h1>
        <p>Your curated source of the latest headlines</p>
        <div className="controls">
          <div className="category-tabs">
            {defaultCategories.map(category => (
              <button key={category.id} className={`tab ${activeCategory === category.id ? 'active' : ''}`} onClick={() => handleCategoryChange(category.id)}>
                {category.name}
              </button>
            ))}
          </div>
          
          {/* --- SEARCH BAR IS NOW REMOVED --- */}
          {/* Since the API doesn't support search, we remove the form to avoid confusion */}
          
        </div>
      </div>

      {error ? renderError() : 
       loading ? renderSkeleton() : 
       !displayedArticles || displayedArticles.length === 0 ? renderNoResults() : (
        <div className="news-grid">
          {displayedArticles.slice(0, 9).map((article, idx) => (
            <div key={article.url || idx} className="news-card">
              {article.urlToImage ? (
                <div className="news-image" style={{ backgroundImage: `url(${article.urlToImage})` }}></div>
              ) : (
                <div className="news-image placeholder"><div className="image-placeholder-icon">📰</div></div>
              )}
              <div className="news-content">
                <div className="news-category">{activeCategory}</div>
                <h3 className="news-title">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                </h3>
                <p className="news-description">{shortenText(article.description, 120)}</p>
                <div className="news-footer">
                  <span className="news-source">{article.source.name}</span>
                  <span className="news-date">{formatDate(article.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;