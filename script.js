// Weather API configuration
const API_KEY = 'e23673413a242dbbe4b8eb7832aaa30c'; // Updated with your OpenWeatherMap API key
const API_URL = 'https://api.openweathermap.org/data/2.5';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMsg = document.getElementById('errorMsg');
const weatherInfo = document.getElementById('weatherInfo');
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecastContainer');

// Event listeners
searchBtn.addEventListener('click', () => getWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(cityInput.value);
    }
});
locationBtn.addEventListener('click', getCurrentLocation);

// Get weather by city name
async function getWeather(city) {
    if (!city.trim()) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    hideError();
    hideWeatherInfo();

    try {
        const response = await fetch(`${API_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (data.cod === 200) {
            displayWeather(data);
            getForecast(city);
        } else {
            showError(data.message || 'City not found');
        }
    } catch (err) {
        showError('Failed to fetch weather data');
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    showLoading();
    hideError();
    hideWeatherInfo();

    try {
        const response = await fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (data.cod === 200) {
            displayWeather(data);
            getForecastByCoords(lat, lon);
        } else {
            showError('Failed to get weather for your location');
        }
    } catch (err) {
        showError('Failed to fetch weather data');
    }
}

// Get forecast by city name
async function getForecast(city) {
    try {
        const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (data.cod === '200') {
            displayForecast(data);
        }
    } catch (err) {
        console.error('Failed to fetch forecast data');
    }
}

// Get forecast by coordinates
async function getForecastByCoords(lat, lon) {
    try {
        const response = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (data.cod === '200') {
            displayForecast(data);
        }
    } catch (err) {
        console.error('Failed to fetch forecast data');
    }
}

// Display current weather
function displayWeather(data) {
    hideLoading();
    showWeatherInfo();

    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateTime.textContent = new Date().toLocaleString();
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    visibility.textContent = `${data.visibility / 1000} km`;
}

// Display 5-day forecast
function displayForecast(data) {
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    forecastContainer.innerHTML = '';
    
    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather">
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${day.weather[0].description}</p>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon);
        },
        () => {
            showError('Unable to retrieve your location');
        }
    );
}

// Utility functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    errorMsg.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showWeatherInfo() {
    weatherInfo.classList.remove('hidden');
}

function hideWeatherInfo() {
    weatherInfo.classList.add('hidden');
}

// Initialize with default city
window.addEventListener('load', () => {
    getWeather('London'); // Default city
});
