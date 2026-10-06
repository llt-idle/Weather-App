const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const feelsLikeTxt = document.querySelector(".feels-like-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const mainContainer = document.querySelector(".main-container");
const forecastItemsContainer = document.querySelector(".forecast-items-container");

const apiKey = "2a0c66ae1c3235fa49bef5d2c2662022";

window.addEventListener('DOMContentLoaded', () => {
    mainContainer.style.display = "none";
    fetchWeatherByLocation();
});

function fetchWeatherByLocation() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                try{
                    const response = await fetch(url);
                    const data = await response.json();
                    mainContainer.style.display = "block";
                    updateWeatherInfo(data);
                } catch (error){
                    console.error("Error fetching weather: ", error);
                }
            },
            (error) => {
                console.warn("Geolocation denied or unavailable.");
                mainContainer.style.display = "block";
                searchCitySection.style.display = "flex";
            });     
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

searchBtn.addEventListener("click", () => {
    if(cityInput.value.trim() != ""){
        getWeatherInfo(cityInput.value.toLowerCase());
        cityInput.value = "";
        cityInput.blur();
    }
});
cityInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter' && cityInput.value.trim() != ""){
        getWeatherInfo(cityInput.value.toLowerCase());
        cityInput.value = "";
        cityInput.blur();
    }
})

async function getFetchData(endPoint, city) {
    const  apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIcon(id){
    if(id <= 232) return "thunderstrom.svg";
    if(id <= 321) return "drizzle.svg";
    if(id <= 531) return "rain.svg";
    if(id <= 622) return "snow.svg";
    if(id <= 781) return "atmosphere.svg";
    if(id <= 800) return "clear.svg"
    else return 'clouds.svg';

}

function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    const dateParts = currentDate.toLocaleDateString("en-GB", options).split(" ");
    return `${dateParts[0]}, ${dateParts[1]} ${dateParts[2]}`;
}

async function getWeatherInfo(city){
    const weatherData = await getFetchData('weather', city);
    updateWeatherInfo(weatherData);
}

async function updateWeatherInfo(weatherData) {
    if(weatherData.cod != 200){
        showDisplaySection(notFoundSection);
        return;
    }
    const {
        name: country,
        main: { feels_like, temp, humidity },
        weather: [{id, main}],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + " °";
    feelsLikeTxt.textContent = `Feels like ${Math.round(feels_like)} °`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + "%";
    windValueTxt.textContent = speed + " M/s";

    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    currentDateTxt.textContent = getCurrentDate();
    //forecast
    await updateForecastInfo(country.toLowerCase());
    showDisplaySection(weatherInfoSection);

}
async function updateForecastInfo(city){
    const forecastData = await getFetchData('forecast', city)
    const timeTaken = '12:00:00';
    // const todayDate = new Date().toISOString().split('T')[0];
     const todayDate = new Date().toLocaleDateString('en-CA');
    forecastItemsContainer.innerHTML = '';

    forecastData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) &&
        !forecastWeather.dt_txt.includes(todayDate)
    ){
        updateForecastItems(forecastWeather);
    }})

}
function updateForecastItems(forecastWeather){
    const {
        dt_txt: date,
        weather: [{id, main}],
        main: {temp}
    } = forecastWeather;
    
    const dateTaken = new Date(date);
    const dateOption = {
        //weekday: 'shor',
        day: '2-digit',
        month: 'short'
    };
    let dateResult = dateTaken.toLocaleDateString('en-US', dateOption);
    // with weekday
    // const dateParts = dateTaken.toLocaleDateString("en-GB", dateOption).split(" ");
    // let dateResult = `${dateParts[0]}, ${dateParts[1]} ${dateParts[2]}`;
    let day = dateResult.split(" ");

    dateResult = parseInt(getCurrentDate().split(" ")[1]) + 1 == parseInt(day[1])? "Tomorrow" : dateResult;
    const forecastItem = `
                <div class="forecast-item">
                    <h5 class="forecast-item-date">${dateResult}</h5>
                    <div class="forecast-body">
                        <h5 class="forecast-item-temp">${Math.round(temp)} °</h5>
                        <img src="assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
                    </div>                    
                    <h5 class="forecast-condition">${main}</h5>
                </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
    .forEach(section => section.style.display = "none");
    section.style.display = "flex";
}
