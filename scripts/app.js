const cityForm = document.querySelector("form");
const card = document.querySelector(".card");
const details = document.querySelector(".details");
const time = document.querySelector(".time");
const errorElement = document.getElementById("errorElement");
const forecast = new Forecast();

let currentUnit = "celsius";
let originalTemperature;
let originalUnit;

// Weather icons mapping
const weatherIcons = {
  Sunny: "./img/sunny.svg",
  Rain: "./img/rainy.svg",
  Cloudy: "./img/cloudy.svg",
  "Mostly cloudy": "./img/mostly-cloudy.svg",
  Storm: "./img/storm.svg",
};

// Function to update the UI based on weather data and unit
function updateUI(data, unit = "celsius") {
  const { cityDets, weather } = data;
  console.log(data);

  errorElement.textContent = "";

  if (weather && cityDets) {
    const temperatureInSelectedUnit = convertTemperature(
      weather.Temperature.Metric.Value,
      unit
    );

    // Store the original temperature and unit
    originalTemperature = temperatureInSelectedUnit;
    originalUnit = unit;

    // Create the HTML content using template literals
    const htmlContent = `
      <h5 class="my-3">${cityDets.EnglishName}</h5>
      <span><img style="width: 3rem" src="${
        weatherIcons[weather.WeatherText] || "./img/sunny.svg"
      }" alt="Weather Icon"></span>
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
    return (temperature * 9) / 5 + 32;
  }
}

// Function to update the temperature display
function updateTemperatureDisplay(unit) {
  const temperatureElement = document.querySelector(".temperature");
  const unitSymbolElement = document.querySelector(".unit-symbol");

  if (temperatureElement && unitSymbolElement) {
    // Get the current temperature value
    const currentTemperature =
      originalUnit === "celsius"
        ? originalTemperature
        : convertTemperature(originalTemperature, "celsius");

    // Convert the temperature to the selected unit
    const temperatureInSelectedUnit = convertTemperature(
      currentTemperature,
      unit
    );

    // Update the temperature text and unit symbol
    temperatureElement.textContent = temperatureInSelectedUnit.toFixed(2);
    unitSymbolElement.textContent = `°${unit === "celsius" ? "C" : "F"}`;
  }
}

// Leaflet map
const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  // maxZoom: 5,
  noWrap: true,
    bounds: [
      [-90, -180],
      [90, 180],
    ],
  attribution: '© <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri</a>'
}).addTo(map);

const resizeObserver = new ResizeObserver(() => {
  map.invalidateSize();
});

const mapDiv = document.getElementById("map");
resizeObserver.observe(mapDiv);

// Event listener for form submission
cityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityForm.city.value.trim();
  cityForm.reset();

  // Update the UI with the current unit
  forecast
    .updateCity(city)
    .then((data) => {
      updateUI(data, currentUnit);
      updateMapMarkers(map, data);
    })
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

// Function to update the map markers or layers based on weather data
function updateMapMarkers(map, data) {
  // Clear existing weather icons on the map
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker && layer.options.isWeatherIcon) {
      map.removeLayer(layer);
    }
  });

  // Create new weather icons based on the weather data and add them to the map
  const { cityDets, weather } = data;

  // Check if cityDets and weather data are available
  if (cityDets && weather) {
    const { Latitude, Longitude } = cityDets.GeoPosition; // Replace with the correct property names from your data

    // Create a weather icon based on the weather condition
    const weatherIcon = L.divIcon({
      className: "weather-icon", // Add a custom CSS class for styling
      html: `<img src="${
        weatherIcons[weather.WeatherText] || "./img/sunny.svg"
      }" alt="${weather.WeatherText}" />`,
      iconSize: [32, 32], // Adjust the size as needed
    });

    // Create a marker with the weather icon
    const weatherMarker = L.marker([Latitude, Longitude], {
      icon: weatherIcon,
    }).addTo(map);
    weatherMarker.options.isWeatherIcon = true; // Custom property to identify it as a weather icon
  }
}
