# 🌤️ Weather Dashboard

A beautiful, interactive weather application with real-time data, stunning UI/UX, and location-based forecasts using the OpenWeather API.

![Weather Dashboard](https://img.shields.io/badge/Status-Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![CSS](https://img.shields.io/badge/CSS-Tailwind-38B2AC)

## ✨ Features

- **Real-time Weather Data**: Current conditions, 5-day forecast, and hourly trends
- **Beautiful UI/UX**: Modern glassmorphism design with smooth animations
- **Location-based**: Automatic location detection or manual city search
- **Interactive Charts**: Temperature trends using Chart.js
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Rich Weather Info**: UV index, humidity, wind speed, visibility, pressure
- **Sunrise/Sunset Times**: Daily solar information
- **Keyboard Shortcuts**: Quick navigation and search
- **Offline Support**: Basic caching for better performance

## 🚀 Live Demo

[**View Live Demo**](https://weather-dashboard-o7yn.vercel.app/)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS, Custom CSS animations
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **API**: OpenWeatherMap API
- **Deployment**: Vercel

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/weather-dashboard.git
cd weather-dashboard
```

### 2. Get Your API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate your API key
4. Copy the API key

### 3. Configure API Key

Open `script.js` and replace the placeholder:

```javascript
const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

**⚠️ Important**: Replace `YOUR_API_KEY_HERE` with your actual OpenWeatherMap API key.

### 4. Run Locally

#### Option 1: Simple HTTP Server
```bash
# Using Python 3
python -m http.server 3000

# Using Node.js live-server
npx live-server --port=3000
```

#### Option 2: Using the package.json script
```bash
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

## 🌐 Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add your API key as an environment variable:
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_KEY` with your OpenWeather API key
5. Deploy!

### Option 3: Drag & Drop

1. Build your project (if needed)
2. Visit [Vercel](https://vercel.com)
3. Drag and drop your project folder
4. Add environment variables in settings

## 🔧 Configuration

### Environment Variables

For production deployment, set these environment variables:

```env
VITE_API_KEY=your_openweather_api_key_here
```

### API Endpoints Used

- Current Weather: `https://api.openweathermap.org/data/2.5/weather`
- 5-Day Forecast: `https://api.openweathermap.org/data/2.5/forecast`
- UV Index: `https://api.openweathermap.org/data/2.5/uvi`

## 📱 Features Overview

### 🎨 UI/UX Highlights

- **Glassmorphism Design**: Modern frosted glass effect
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: CSS keyframes and transitions
- **Responsive Layout**: Mobile-first design approach
- **Interactive Elements**: Hover effects and loading states

### 🌍 Weather Features

- **Current Conditions**: Temperature, description, icon
- **Detailed Metrics**: Feels like, humidity, wind, pressure
- **Air Quality**: UV index with safety descriptions
- **Solar Information**: Sunrise and sunset times
- **5-Day Forecast**: Daily weather predictions
- **Temperature Chart**: 24-hour temperature trends

### 🔍 Search & Location

- **City Search**: Search any city worldwide
- **Geolocation**: Automatic location detection
- **Error Handling**: User-friendly error messages
- **Demo Mode**: Works without API key for testing

## 🎯 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 📚 API Documentation

This project uses the [OpenWeatherMap API](https://openweathermap.org/api). Key endpoints:

### Current Weather
```
GET https://api.openweathermap.org/data/2.5/weather
Parameters: q (city), lat/lon (coordinates), appid (API key), units (metric)
```

### 5-Day Forecast
```
GET https://api.openweathermap.org/data/2.5/forecast
Parameters: lat/lon (coordinates), appid (API key), units (metric)
```

### UV Index
```
GET https://api.openweathermap.org/data/2.5/uvi
Parameters: lat/lon (coordinates), appid (API key)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Prem Thakur**
- GitHub: [Prem Thakur](https://github.com/Prem-Thakur786)
- LinkedIn: [Prem Chand](https://www.linkedin.com/in/prem-chand-411aab211/)

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for the weather API
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Font Awesome](https://fontawesome.com/) for the icons

## 📊 Project Structure

```
weather-dashboard/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
├── package.json        # Project configuration
├── README.md           # Project documentation
└── vercel.json         # Vercel deployment config
```

---

⭐ **Star this repository if you found it helpful!** ⭐
