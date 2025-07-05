// Weather Dashboard Configuration
// Multiple API keys for testing - use your own for production

const API_KEYS = [
    '8ac5c4e57ba6a4dd42ae9c8f5c4a5c9f', // Primary demo key
    'b8e725b86b0e0acb8e0acb8e0acb8e01', // Backup key 1
    '9f5c4a5c8ac5c4e57ba6a4dd42ae9c8f', // Backup key 2
];

// Get a working API key
function getWorkingApiKey() {
    // For demo purposes, return the first key
    // In production, you'd test each key and return the first working one
    return API_KEYS[0];
}

// Export for use in main script
window.WEATHER_CONFIG = {
    API_KEY: getWorkingApiKey(),
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    DEFAULT_CITY: 'London',
    UNITS: 'metric'
};
