const cityForm = document.querySelector("form");
const card = document.querySelector(".card");
const details = document.querySelector(".details");
const time = document.querySelector(".time");
const errorElement = document.getElementById('errorElement');
const forecast = new Forecast();


const updateUI = (data) => {
  const { cityDets, weather } = data;
  console.log(data);

  const weatherIcons = {
    'Sunny': './img/sunny.svg',
    'Rain': './img/rainy.svg',
    'Cloudy': './img/cloudy.svg',
    'Mostly cloudy': './img/mostly-cloudy.svg',
    'Storm': './img/storm.svg'
  };
  const weatherIconPath = weatherIcons[weather.WeatherText] || './img/sunny.svg';

  // Clear the error message
  errorElement.textContent = "";

  // Check for errors and update UI
  if (weather && cityDets) {
  details.innerHTML = `
    <h5 class="my-3">${cityDets.EnglishName}</h5>
    <span><img style="width: 3rem" src="${weatherIconPath}" alt="Weather Icon"></span>
    <div class="my-3">${weather.WeatherText}</div>
    <div class="display-4 my-4">
    <span>${weather.Temperature.Metric.Value}</span>
    <span>&deg;C</span>
    </div>
  `;
  } else {
    errorElement.textContent = "Error: " + data.message;
  }

  const timeSrc = weather.IsDayTime ? "img/day.svg" : "img/night.svg";
  time.setAttribute("src", timeSrc);

  if (card.classList.contains("d-none")) {
    card.classList.remove("d-none");
  }
};

cityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityForm.city.value.trim();
  cityForm.reset();

  forecast
    .updateCity(city)
    .then((data) => updateUI(data))
    .catch((err) => {
      errorElement.textContent = "Error: " + err.message;
      console.log(err); // Log the error for debugging
    });

  localStorage.setItem("city", city);
});

if (localStorage.getItem("city")) {
  forecast
    .updateCity(localStorage.getItem("city"))
    .then((data) => updateUI(data))
    .catch((err) => console.log(err));
}
