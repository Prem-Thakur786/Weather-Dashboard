# 🔑 API Setup Guide

## Step 1: Get Your FREE OpenWeather API Key

1. **Visit OpenWeatherMap**: Go to https://openweathermap.org/api
2. **Sign Up**: Click "Sign Up" and create a free account
3. **Verify Email**: Check your email and verify your account
4. **Get API Key**: 
   - Log into your account
   - Go to "API Keys" section
   - Copy your default API key (it looks like: `abcd1234efgh5678ijkl9012mnop3456`)

## Step 2: Add Your API Key

1. Open `script.js` in your code editor
2. Find line 4: `const API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Save the file

Example:
```javascript
const API_KEY = 'abcd1234efgh5678ijkl9012mnop3456'; // Your actual key here
```

## Alternative: Use Environment Variables (Recommended for Production)

Create a `.env` file:
```
OPENWEATHER_API_KEY=your_actual_api_key_here
```

## Free Tier Limits

- 1,000 API calls per day
- 60 calls per minute
- All current weather data
- 5-day forecast
- UV index data

## Troubleshooting

- **401 Unauthorized**: API key is invalid or not set
- **API key not active**: Wait 10-15 minutes after creating account
- **Rate limit exceeded**: You've made too many requests

## Test Your API Key

You can test your API key by visiting:
```
https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY&units=metric
```

Replace `YOUR_API_KEY` with your actual key.
