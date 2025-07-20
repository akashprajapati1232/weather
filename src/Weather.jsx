import React, { useState, useEffect } from "react";
import "./weather.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [background, setBackground] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiKey = "ba9cb8513edb5bb0a036d05ba35ba728";

  // Popular cities for quick selection
  const popularCities = ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai"];

  // Auto-locate user based on geolocation
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
       
      );
    } else {
      setError("Geolocation not supported by your browser");
      setLoading(false);
    }
  };

  // Fetch weather using coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res1 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data1 = await res1.json();

      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data2 = await res2.json();

      if (data1.cod === 200 && data2.cod === "200") {
        setWeather(data1);
        setCity(data1.name);
        const filtered = data2.list.filter((_, i) => i % 8 === 0); // every 24h
        setForecast(filtered);
        setBackground(data1.weather[0].main.toLowerCase());
        setError("");
      }
    } catch (err) {
      setError("Error fetching weather data");
    } finally {
      setLoading(false);
    }
  };

  // Handle city search
  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res1 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const data1 = await res1.json();

      if (data1.cod !== 200) {
        setError("City not found. Please check spelling and try again.");
        setLoading(false);
        return;
      }

      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      const data2 = await res2.json();

      if (data2.cod === "200") {
        setWeather(data1);
        const filtered = data2.list.filter((_, i) => i % 8 === 0); // every 24h
        setForecast(filtered);
        setBackground(data1.weather[0].main.toLowerCase());
      }
    } catch (err) {
      setError("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get proper weather icon based on weather type
  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case "clouds":
        return "☁️";
      case "rain":
        return "🌧️";
      case "clear":
        return "☀️";
      case "haze":
      case "mist":
      case "fog":
        return "🌫️";
      case "snow":
        return "❄️";
      case "thunderstorm":
        return "⛈️";
      case "drizzle":
        return "🌦️";
      case "dust":
      case "sand":
        return "💨";
      default:
        return "🌡️";
    }
  };

  // Format date for forecast display
  const formatDate = (dt_txt) => {
    const date = new Date(dt_txt);
    return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
  };

  // Use effect to auto-locate user on first load (optional)
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className={`weather-container ${background}`}>
      <div className="weather-content">
        <h1 className="weather-title">Weather App</h1>
        
        <div className="weather-search">
          <input
            type="text"
            placeholder="Enter Location"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          <button 
            className="location-btn" 
            onClick={getCurrentLocation}
            disabled={loading}
          >
            📍 Current Location
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="popular-cities">
          {popularCities.map((city) => (
            <button
              key={city}
              className="city-chip"
              onClick={() => {
                setCity(city);
                setTimeout(() => handleSearch(), 100);
              }}
            >
              {city}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {weather && (
              <div className="weather-card">
                <h2>
                  {weather.name}, {weather.sys.country}
                </h2>
                <p className="datetime">{new Date().toLocaleString()}</p>
                <div className="current-weather">
                  <div className="weather-icon-large">{getIcon(weather.weather[0].main)}</div>
                  <div className="temp-container">
                    <h3 className="temperature">{Math.round(weather.main.temp)}°C</h3>
                    <p className="description">{weather.weather[0].description}</p>
                  </div>
                </div>
                <div className="extra-info">
                  <div className="info-item">
                    <span className="info-label">Feels Like</span>
                    <span className="info-value">{Math.round(weather.main.feels_like)}°C</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Humidity</span>
                    <span className="info-value">{weather.main.humidity}%</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Wind</span>
                    <span className="info-value">{weather.wind.speed} m/s</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Pressure</span>
                    <span className="info-value">{weather.main.pressure} hPa</span>
                  </div>
                </div>
              </div>
            )}

            {forecast.length > 0 && (
              <div className="forecast-section">
                <h3>5-Days forecast</h3>
                <div className="forecast-container">
                  {forecast.map((item, idx) => (
                    <div key={idx} className="forecast-card">
                      <p className="forecast-day">{formatDate(item.dt_txt)}</p>
                      <span className="forecast-icon">{getIcon(item.weather[0].main)}</span>
                      <p className="forecast-temp">{Math.round(item.main.temp)}°C</p>
                      <p className="forecast-desc">{item.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="weather-footer">
          <p>
            copyright &copy; 2025 by<a href="https://github.com/Mursaleen03"> Mursaleen</a>
           
          </p>
        </div>
      </div>
    </div>
  );
};

export default Weather;
