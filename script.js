// Weather Dashboard JavaScript

// Weather API configuration - Using free wttr.in service (no API key required)
const USE_FREE_API = true; // Set to false if you have an OpenWeather API key
const API_KEY = 'YOUR_API_KEY_HERE'; // Get free key at https://openweathermap.org/api
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const FREE_API_URL = 'https://wttr.in'; // Free weather service

// Check if API key is properly set
function isValidApiKey(key) {
    return key && key !== 'YOUR_API_KEY_HERE' && key.length > 10;
}

// DOM elements
const elements = {
    loading: document.getElementById('loading'),
    app: document.getElementById('app'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    getCurrentLocationBtn: document.getElementById('getCurrentLocation'),
    weatherDisplay: document.getElementById('weatherDisplay'),
    errorMessage: document.getElementById('errorMessage'),
    
    // Weather data elements
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weatherDescription'),
    visibility: document.getElementById('visibility'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    feelsLike: document.getElementById('feelsLike'),
    uvIndex: document.getElementById('uvIndex'),
    uvDescription: document.getElementById('uvDescription'),
    pressure: document.getElementById('pressure'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    forecast: document.getElementById('forecast')
};

// Global variables
let temperatureChart;
let currentWeatherData = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Hide loading screen after a brief delay
    setTimeout(() => {
        elements.loading.style.display = 'none';
        elements.app.classList.remove('hidden');
        elements.app.classList.add('fade-in-up');
    }, 1500);
    
    // Try to get user's location on startup
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            error => {
                // Load default city (London)
                fetchWeatherByCity('London');
            }
        );
    } else {
        // Load default city if geolocation is not supported
        fetchWeatherByCity('London');
    }
}

function setupEventListeners() {
    // Search functionality
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Current location button
    elements.getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    
    // Add animation classes to elements
    elements.searchInput.classList.add('search-input');
    elements.searchBtn.classList.add('btn-animate');
    elements.getCurrentLocationBtn.classList.add('btn-animate');
}

function handleSearch() {
    const city = elements.searchInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        elements.searchInput.value = '';
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser.');
        return;
    }
    
    elements.getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Getting Location...';
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
            elements.getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow mr-2"></i>Use Current Location';
        },
        error => {
            showError('Unable to retrieve your location. Please try searching for a city.');
            elements.getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow mr-2"></i>Use Current Location';
        }
    );
}

async function fetchWeatherByCity(city) {
    try {
        showLoading();
        
        // Use free weather API (no API key required)
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        
        if (!response.ok) {
            throw new Error(`City not found. Please check the spelling and try again.`);
        }
        
        const data = await response.json();
        const normalizedData = normalizeWttrData(data, city);
        
        displayCurrentWeather(normalizedData, null);
        displayForecast(generateMockForecast(normalizedData.temperature));
        createTemperatureChart(generateMockTemperatureData(normalizedData.temperature));
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.warn('Free API failed, using demo mode:', error);
        initializeDemoMode();
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();
        
        // Use reverse geocoding to get city name, then use free API
        const city = await reverseGeocode(lat, lon);
        
        // Use free weather API (no API key required)
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        
        if (!response.ok) {
            throw new Error(`Weather data not available for your location.`);
        }
        
        const data = await response.json();
        const normalizedData = normalizeWttrData(data, city);
        
        displayCurrentWeather(normalizedData, null);
        displayForecast(generateMockForecast(normalizedData.temperature));
        createTemperatureChart(generateMockTemperatureData(normalizedData.temperature));
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.warn('Location weather failed, using demo mode:', error);
        initializeDemoMode();
    }
}

async function fetchAdditionalWeatherData(lat, lon) {
    try {
        // Fetch current weather, forecast, and UV index
        const [currentWeather, forecast, uvData] = await Promise.all([
            fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${API_BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);
        
        if (!currentWeather.ok || !forecast.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const currentData = await currentWeather.json();
        const forecastData = await forecast.json();
        const uvIndexData = uvData.ok ? await uvData.json() : null;
        
        currentWeatherData = currentData;
        
        displayCurrentWeather(currentData, uvIndexData);
        displayForecast(forecastData);
        createTemperatureChart(forecastData);
        
    } catch (error) {
        throw error;
    }
}

function displayCurrentWeather(data, uvData) {
    // Update current weather display
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    elements.weatherIcon.classList.add('weather-icon');
    
    elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
    elements.weatherDescription.textContent = data.weather[0].description;
    
    // Update weather details
    elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.windSpeed.textContent = `${data.wind.speed} m/s`;
    elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // UV Index
    if (uvData) {
        elements.uvIndex.textContent = Math.round(uvData.value);
        elements.uvDescription.textContent = getUVDescription(uvData.value);
    } else {
        elements.uvIndex.textContent = 'N/A';
        elements.uvDescription.textContent = 'Data unavailable';
    }
    
    // Additional data
    elements.pressure.textContent = data.main.pressure;
    elements.sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    elements.sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Show weather display
    elements.weatherDisplay.classList.remove('hidden');
    elements.weatherDisplay.classList.add('fade-in-up');
    elements.errorMessage.classList.add('hidden');
}

function displayForecast(data) {
    const forecastContainer = elements.forecast;
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (every 8th item, as API returns 3-hour intervals)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    dailyForecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-300 forecast-card';
        
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;
        
        forecastCard.innerHTML = `
            <p class="text-white font-semibold mb-2">${day}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="w-12 h-12 mx-auto mb-2">
            <p class="text-white text-lg font-bold">${temp}°C</p>
            <p class="text-white/80 text-sm capitalize">${description}</p>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

function createTemperatureChart(data) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    // Prepare data for the chart (next 24 hours)
    const next24Hours = data.list.slice(0, 8);
    const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    
    const temperatures = next24Hours.map(item => Math.round(item.main.temp));
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(255, 255, 255, 1)',
                pointBorderColor: 'rgba(255, 255, 255, 1)',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        callback: function(value) {
                            return value + '°C';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    hoverBackgroundColor: 'rgba(255, 255, 255, 1)'
                }
            }
        }
    });
}

function getUVDescription(uvIndex) {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
}

function showLoading() {
    elements.loading.style.display = 'flex';
    elements.app.style.opacity = '0.7';
}

function hideLoading() {
    elements.loading.style.display = 'none';
    elements.app.style.opacity = '1';
}

function showError(message) {
    elements.errorMessage.querySelector('p').textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.errorMessage.classList.add('error-message');
    elements.weatherDisplay.classList.add('hidden');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}

// Demo mode with sample data (if API key is not set)
function initializeDemoMode() {
    const demoData = {
        name: 'London',
        sys: { 
            country: 'GB',
            sunrise: Date.now() / 1000 - 3600,
            sunset: Date.now() / 1000 + 3600
        },
        weather: [{ icon: '01d', description: 'clear sky' }],
        main: {
            temp: 22,
            feels_like: 24,
            humidity: 65,
            pressure: 1013
        },
        visibility: 10000,
        wind: { speed: 3.5 }
    };
    
    displayCurrentWeather(demoData, { value: 5 });
    
    // Demo forecast
    const demoForecast = {
        list: Array.from({ length: 40 }, (_, i) => ({
            dt: Date.now() / 1000 + i * 3600 * 3,
            main: { temp: 20 + Math.random() * 10 },
            weather: [{ icon: '01d', description: 'clear sky' }]
        }))
    };
    
    displayForecast(demoForecast);
    createTemperatureChart(demoForecast);
}

// Check if API key is set, otherwise use demo mode
if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('API key not set. Using demo mode.');
    setTimeout(() => {
        elements.loading.style.display = 'none';
        elements.app.classList.remove('hidden');
        initializeDemoMode();
    }, 1500);
}

// Additional utility functions
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

function kelvinToFahrenheit(kelvin) {
    return Math.round((kelvin - 273.15) * 9/5 + 32);
}

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        elements.searchInput.value = '';
        elements.searchInput.blur();
    }
});

// Add touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {

        } else {
   

        }
    }
}

// Helper functions for free weather API
async function reverseGeocode(lat, lon) {
    try {
        // Use a free reverse geocoding service
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        return data.city || data.locality || 'London';
    } catch (error) {
        return 'London'; // Default fallback
    }
}

function normalizeWttrData(data, city) {
    const current = data.current_condition[0];
    const today = data.weather[0];
    
    return {
        name: city,
        sys: { 
            country: 'N/A',
            sunrise: Date.parse(`${new Date().toDateString()} ${today.astronomy[0].sunrise}`) / 1000,
            sunset: Date.parse(`${new Date().toDateString()} ${today.astronomy[0].sunset}`) / 1000
        },
        weather: [{ 
            icon: getWeatherIcon(current.weatherCode), 
            description: current.weatherDesc[0].value.toLowerCase() 
        }],
        main: {
            temp: parseFloat(current.temp_C),
            feels_like: parseFloat(current.FeelsLikeC),
            humidity: parseInt(current.humidity),
            pressure: parseInt(current.pressure)
        },
        visibility: parseFloat(current.visibility) * 1000, // Convert km to m
        wind: { speed: parseFloat(current.windspeedKmph) / 3.6 }, // Convert kmh to m/s
        temperature: parseFloat(current.temp_C)
    };
}

function getWeatherIcon(weatherCode) {
    // Map weather codes to OpenWeather-style icons
    const iconMap = {
        '113': '01d', // Sunny
        '116': '02d', // Partly cloudy
        '119': '03d', // Cloudy
        '122': '04d', // Overcast
        '143': '50d', // Mist
        '176': '10d', // Possible rain
        '179': '13d', // Possible snow
        '200': '11d', // Thundery outbreaks
        '227': '13d', // Blowing snow
        '230': '13d', // Blizzard
        '248': '50d', // Fog
        '260': '50d', // Freezing fog
        '263': '09d', // Patchy light drizzle
        '266': '09d', // Light drizzle
        '281': '09d', // Freezing drizzle
        '284': '09d', // Heavy freezing drizzle
        '293': '10d', // Patchy light rain
        '296': '10d', // Light rain
        '299': '10d', // Moderate rain at times
        '302': '10d', // Moderate rain
        '305': '10d', // Heavy rain at times
        '308': '10d', // Heavy rain
        '311': '09d', // Light freezing rain
        '314': '09d', // Moderate or heavy freezing rain
        '317': '09d', // Light sleet
        '320': '09d', // Moderate or heavy sleet
        '323': '13d', // Patchy light snow
        '326': '13d', // Light snow
        '329': '13d', // Patchy moderate snow
        '332': '13d', // Moderate snow
        '335': '13d', // Patchy heavy snow
        '338': '13d', // Heavy snow
        '350': '09d', // Ice pellets
        '353': '09d', // Light rain shower
        '356': '09d', // Moderate or heavy rain shower
        '359': '09d', // Torrential rain shower
        '362': '09d', // Light sleet showers
        '365': '09d', // Moderate or heavy sleet showers
        '368': '13d', // Light snow showers
        '371': '13d', // Moderate or heavy snow showers
        '374': '09d', // Light showers of ice pellets
        '377': '09d', // Moderate or heavy showers of ice pellets
        '386': '11d', // Patchy light rain with thunder
        '389': '11d', // Moderate or heavy rain with thunder
        '392': '11d', // Patchy light snow with thunder
        '395': '11d'  // Moderate or heavy snow with thunder
    };
    
    return iconMap[weatherCode] || '01d';
}

function generateMockForecast(baseTemp) {
    const forecast = { list: [] };
    const baseDate = new Date();
    
    for (let i = 1; i <= 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        
        // Generate 8 entries per day (3-hour intervals)
        for (let j = 0; j < 8; j++) {
            forecast.list.push({
                dt: date.getTime() / 1000 + (j * 3 * 3600),
                main: {
                    temp: baseTemp + (Math.random() - 0.5) * 10
                },
                weather: [{
                    icon: getRandomWeatherIcon(),
                    description: getRandomWeatherDescription()
                }]
            });
        }
    }
    
    return forecast;
}

function generateMockTemperatureData(baseTemp) {
    const forecast = { list: [] };
    const now = new Date();
    
    for (let i = 0; i < 8; i++) {
        forecast.list.push({
            dt: (now.getTime() + i * 3 * 60 * 60 * 1000) / 1000, // 3-hour intervals
            main: {
                temp: baseTemp + (Math.random() - 0.5) * 8
            }
        });
    }
    
    return forecast;
}

function getRandomWeatherIcon() {
    const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'];
    return icons[Math.floor(Math.random() * icons.length)];
}

function getRandomWeatherDescription() {
    const descriptions = [
        'clear sky', 'few clouds', 'scattered clouds', 'broken clouds',
        'shower rain', 'rain', 'thunderstorm', 'snow', 'mist'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

