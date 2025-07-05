// Alternative Weather API Service
// Uses multiple free weather APIs as fallbacks

const WEATHER_SERVICES = {
    // OpenWeatherMap (requires API key)
    openweather: {
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        apiKey: '7c9be3f1b0e4d2c8a5f6b9e8d7c4a1b3',
        endpoints: {
            current: (city, key) => `${WEATHER_SERVICES.openweather.baseUrl}/weather?q=${city}&appid=${key}&units=metric`,
            forecast: (lat, lon, key) => `${WEATHER_SERVICES.openweather.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
            coords: (lat, lon, key) => `${WEATHER_SERVICES.openweather.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
        }
    },
    
    // wttr.in (free, no API key required)
    wttr: {
        baseUrl: 'https://wttr.in',
        endpoints: {
            current: (city) => `${WEATHER_SERVICES.wttr.baseUrl}/${city}?format=j1`,
            simple: (city) => `${WEATHER_SERVICES.wttr.baseUrl}/${city}?format=%C+%t+%h+%w+%p+%P`
        }
    },
    
    // WeatherAPI (free tier available)
    weatherapi: {
        baseUrl: 'https://api.weatherapi.com/v1',
        apiKey: 'demo', // Demo key for testing
        endpoints: {
            current: (city, key) => `${WEATHER_SERVICES.weatherapi.baseUrl}/current.json?key=${key}&q=${city}&aqi=no`,
            forecast: (city, key) => `${WEATHER_SERVICES.weatherapi.baseUrl}/forecast.json?key=${key}&q=${city}&days=5&aqi=no&alerts=no`
        }
    }
};

// Weather service class
class WeatherService {
    constructor() {
        this.currentService = 'openweather';
        this.fallbackServices = ['wttr', 'weatherapi'];
    }

    async getCurrentWeather(city) {
        try {
            // Try OpenWeather first
            if (this.currentService === 'openweather') {
                return await this.getOpenWeatherData(city);
            }
            
            // Fallback to wttr.in
            return await this.getWttrData(city);
        } catch (error) {
            console.warn('Primary service failed, trying fallback...');
            return await this.getWttrData(city);
        }
    }

    async getOpenWeatherData(city) {
        const apiKey = WEATHER_SERVICES.openweather.apiKey;
        const url = WEATHER_SERVICES.openweather.endpoints.current(city, apiKey);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenWeather API error: ${response.status}`);
        }
        
        const data = await response.json();
        return this.normalizeOpenWeatherData(data);
    }

    async getWttrData(city) {
        const url = WEATHER_SERVICES.wttr.endpoints.current(city);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`wttr.in API error: ${response.status}`);
        }
        
        const data = await response.json();
        return this.normalizeWttrData(data, city);
    }

    async getCoordinatesWeather(lat, lon) {
        try {
            const apiKey = WEATHER_SERVICES.openweather.apiKey;
            const url = WEATHER_SERVICES.openweather.endpoints.coords(lat, lon, apiKey);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OpenWeather API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.normalizeOpenWeatherData(data);
        } catch (error) {
            // Fallback to reverse geocoding + city search
            const city = await this.reverseGeocode(lat, lon);
            return await this.getWttrData(city);
        }
    }

    async reverseGeocode(lat, lon) {
        try {
            // Use a free reverse geocoding service
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const data = await response.json();
            return data.city || data.locality || 'London';
        } catch (error) {
            return 'London'; // Default fallback
        }
    }

    normalizeOpenWeatherData(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: (data.visibility / 1000).toFixed(1),
            windSpeed: data.wind.speed,
            weatherDescription: data.weather[0].description,
            weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            sunrise: this.formatTime(data.sys.sunrise),
            sunset: this.formatTime(data.sys.sunset),
            uvIndex: 'N/A',
            uvDescription: 'Data unavailable',
            coords: {
                lat: data.coord.lat,
                lon: data.coord.lon
            }
        };
    }

    normalizeWttrData(data, city) {
        const current = data.current_condition[0];
        const today = data.weather[0];
        
        return {
            city: city,
            country: 'Unknown',
            temperature: Math.round(parseFloat(current.temp_C)),
            feelsLike: Math.round(parseFloat(current.FeelsLikeC)),
            humidity: parseInt(current.humidity),
            pressure: parseInt(current.pressure),
            visibility: (parseFloat(current.visibility) / 1000).toFixed(1),
            windSpeed: (parseFloat(current.windspeedKmph) / 3.6).toFixed(1), // Convert to m/s
            weatherDescription: current.weatherDesc[0].value.toLowerCase(),
            weatherIcon: this.getWeatherIcon(current.weatherCode),
            sunrise: today.astronomy[0].sunrise,
            sunset: today.astronomy[0].sunset,
            uvIndex: current.uvIndex || 'N/A',
            uvDescription: this.getUVDescription(current.uvIndex || 0),
            coords: {
                lat: 0,
                lon: 0
            }
        };
    }

    getWeatherIcon(weatherCode) {
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
        
        const iconCode = iconMap[weatherCode] || '01d';
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    getUVDescription(uvIndex) {
        if (uvIndex <= 2) return 'Low';
        if (uvIndex <= 5) return 'Moderate';
        if (uvIndex <= 7) return 'High';
        if (uvIndex <= 10) return 'Very High';
        return 'Extreme';
    }

    formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Generate mock forecast data
    generateForecast(baseTemp) {
        const forecast = [];
        const baseDate = new Date();
        
        for (let i = 1; i <= 5; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + i);
            
            forecast.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                temperature: Math.round(baseTemp + (Math.random() - 0.5) * 10),
                icon: this.getRandomWeatherIcon(),
                description: this.getRandomWeatherDescription()
            });
        }
        
        return forecast;
    }

    getRandomWeatherIcon() {
        const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'];
        return `https://openweathermap.org/img/wn/${icons[Math.floor(Math.random() * icons.length)]}@2x.png`;
    }

    getRandomWeatherDescription() {
        const descriptions = [
            'clear sky', 'few clouds', 'scattered clouds', 'broken clouds',
            'shower rain', 'rain', 'thunderstorm', 'snow', 'mist'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    // Generate mock temperature chart data
    generateTemperatureChart(baseTemp) {
        const chartData = [];
        const now = new Date();
        
        for (let i = 0; i < 8; i++) {
            const time = new Date(now.getTime() + i * 3 * 60 * 60 * 1000); // 3-hour intervals
            chartData.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                temperature: Math.round(baseTemp + (Math.random() - 0.5) * 8)
            });
        }
        
        return chartData;
    }
}

// Export the weather service
window.WeatherService = WeatherService;
