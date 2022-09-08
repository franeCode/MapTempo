const cityForm = document.querySelector("form");
const card = document.querySelector(".card");
const details = document.querySelector(".details");
const time = document.querySelector(".time");
const errorElement = document.getElementById('errorElement');
const forecast = new Forecast();

// Declare the currentUnit variable with a default value
let currentUnit = "celsius";
let originalTemperature;
let originalUnit;

// Weather icons mapping
const weatherIcons = {
  'Sunny': './img/sunny.svg',
  'Rain': './img/rainy.svg',
  'Cloudy': './img/cloudy.svg',
  'Mostly cloudy': './img/mostly-cloudy.svg',
  'Storm': './img/storm.svg'
};

// Function to update the UI based on weather data and unit
function updateUI(data, unit = "celsius") {
  const { cityDets, weather } = data;

  // Clear the error message
  errorElement.textContent = "";

  if (weather && cityDets) {
    const temperatureInSelectedUnit = convertTemperature(weather.Temperature.Metric.Value, unit);

    // Store the original temperature and unit
    originalTemperature = temperatureInSelectedUnit;
    originalUnit = unit;

    // Create the HTML content using template literals
    const htmlContent = `
      <h5 class="my-3">${cityDets.EnglishName}</h5>
      <span><img style="width: 3rem" src="${weatherIcons[weather.WeatherText] || './img/sunny.svg'}" alt="Weather Icon"></span>
      <div class="my-3">${weather.WeatherText}</div>
      <div class="my-4">
        <span class='temperature'>${temperatureInSelectedUnit.toFixed(2)}</span>
        <span class='unit-symbol'>${unit === "celsius" ? "C" : "F"}</span>
        <button id="unit-toggle">Switch Units</button>
      </div>
    `;

    // Update the details element
    details.innerHTML = htmlContent;
  } else {
    errorElement.textContent = "Error: " + data.message;
  }

  // Update the time element
  time.setAttribute("src", weather.IsDayTime ? "img/day.svg" : "img/night.svg");

  // Show the card
  card.classList.remove("d-none");

  // Add event listener for unit toggle
  const unitToggleBtn = document.getElementById("unit-toggle");
  unitToggleBtn.addEventListener("click", toggleUnit);
}

// Function to toggle between Celsius and Fahrenheit
function toggleUnit() {
  currentUnit = currentUnit === "celsius" ? "fahrenheit" : "celsius";
  updateTemperatureDisplay(currentUnit);
}

// Function to convert temperature units
function convertTemperature(temperature, unit) {
  if (unit === "celsius") {
    return temperature;
  } else if (unit === "fahrenheit") {
    return (temperature * 9/5) + 32;
  }
}

// Function to update the temperature display
function updateTemperatureDisplay(unit) {
  const temperatureElement = document.querySelector(".temperature");
  const unitSymbolElement = document.querySelector(".unit-symbol");

  if (temperatureElement && unitSymbolElement) {
    // Get the current temperature value
    const currentTemperature = originalUnit === "celsius" ? originalTemperature : convertTemperature(originalTemperature, "celsius");
  
    // Convert the temperature to the selected unit
    const temperatureInSelectedUnit = convertTemperature(currentTemperature, unit);

    // Update the temperature text and unit symbol
    temperatureElement.textContent = temperatureInSelectedUnit.toFixed(2);
    unitSymbolElement.textContent = `°${unit === "celsius" ? "C" : "F"}`;
  }
}

// Event listener for form submission
cityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityForm.city.value.trim();
  cityForm.reset();

  // Update the UI with the current unit
  forecast
    .updateCity(city)
    .then((data) => updateUI(data, currentUnit))
    .catch((err) => {
      errorElement.textContent = "Error: " + err.message;
      console.log(err);
    });

  localStorage.setItem("city", city);
});

// Check local storage for a saved city
if (localStorage.getItem("city")) {
  forecast
    .updateCity(localStorage.getItem("city"))
    .then((data) => updateUI(data, currentUnit))
    .catch((err) => console.log(err));
}
