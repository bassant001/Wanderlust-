// =======================
//FOR TEST ONLY
// =======================
// localStorage.clear();

// =======================
// SELECTION
// =======================
let selectedCountry = {
  //defult values to be renderd at first
  country: "Egypt",
  countryCode: "EG",
  city: "Cairo",
  year: 2026,
};

// =======================
// ELEMENTS
// =======================
let countrySelect = document.getElementById("global-country");
let citySelect = document.getElementById("global-city");
let yearSelect = document.getElementById("global-year");
let exploreBtn = document.getElementById("global-search-btn");

// =======================
// VARIABLES
// =======================
let country;
//FAV HOLIDAYS
let planes = [];
//FAV EVENTS
let events = [];
//FAV EVENTS
let weekends = [];

// let planeIndex = null;
// let flag = 0;

//loaded data from api
let holidaysList = [];
let eventsList = [];
let weekendsList = [];

//key (holiday's localName) : value (bool isfav)
let holidays = new Map();
//key (event's name) : value (bool isfav)
let allEvents = new Map();
//key (event's index) : value (bool isfav)
let allweekends = new Map();

let rates = {};

// =======================
//LOAD FAVORITE LOCAL DATA
// =======================
if (localStorage.getItem("favorite-planes") !== null) {
  planes = JSON.parse(localStorage.getItem("favorite-planes"));
}
if (localStorage.getItem("favorite-events") !== null) {
  events = JSON.parse(localStorage.getItem("favorite-events"));
}
if (localStorage.getItem("favorite-weekends") !== null) {
  weekends = JSON.parse(localStorage.getItem("favorite-weekends"));
}

// =======================
// LW FY HGA 23RDH :)
//=======================
if (planes.length !== 0 || events.length !== 0 || weekends.length !== 0) {
  updateStats();
  displayFavoritesAll();
}

// =======================
// LOAD ALL COUNTRIES
// =======================
async function getAvailableCountries() {
  let response = await fetch("https://date.nager.at/api/v3/AvailableCountries");

  if (response.ok) {
    let data = await response.json();
    loadCountrySelect(data);
    getCountryByCode(selectedCountry.countryCode);
    console.log("AvailableCountries:", data);
  } else {
    console.log("error loading countries");
  }
}

// =======================
// FILL COUNTRIES DROPDOWN
// =======================
function loadCountrySelect(countries) {
  countrySelect.innerHTML = ``;
  for (let i = 0; i < countries.length; i++) {
    countrySelect.innerHTML += `
      <option value="${countries[i].countryCode}">
        ${countries[i].name}
      </option>`;
  }
}

// =======================
// FILL CITES DROPDOWN
// =======================
function loadCitiesSelect() {
  citySelect.innerHTML = `<option value="">Select City</option>`;

  if (!country.capital) return;

  for (let i = 0; i < country.capital.length; i++) {
    citySelect.innerHTML += `
      <option value="${country.capital[i]}">
        ${country.capital[i]}
      </option>
    `;
  }
}

// =======================
// EXPLORE BUTTON
// =======================
countrySelect.addEventListener("change", function () {
  selectedCountry.countryCode = countrySelect.value;
  selectedCountry.country =
    countrySelect.options[countrySelect.selectedIndex].text;
  selectedCountry.city = citySelect.value;
  selectedCountry.year = yearSelect.value;
  getCountryByCode(selectedCountry.countryCode);
  renderSelectedDestination();
});

exploreBtn.addEventListener("click", function () {
  if (!selectedCountry.countryCode) {
    alert("select a country :)");
    return;
  }

  console.log("selectedCountry:", selectedCountry);
  renderCountryInfo(country);
});

// =======================
// GET COUNTRY BY CODE
// =======================
async function getCountryByCode(countryCode) {
  let response = await fetch(
    `https://restcountries.com/v3.1/alpha/${countryCode}`,
  );

  if (response.ok) {
    let data = await response.json();
    country = data[0];
    console.log("laoded country", data);
    startLiveClock(country.timezones[0]);
    loadCitiesSelect();
    getPublicHolidays();
    getEvents();
    getLongWeekends();
    getWeather();
    getSunTimes();
    displayFavoritesAll();
  } else {
    console.log("error loading country info");
  }
}

// =======================
// RENDER SELECTION
// =======================
function renderSelectedDestination() {
  console.log("renderSelectedDestination");
  let cartona = `
      <div class="selected-flag">
        <img
          id="selected-country-flag"
          src="https://flagcdn.com/w80/${selectedCountry.countryCode.toLowerCase()}.png"
          alt="${selectedCountry.country}">
      </div>

      <div class="selected-info">
        <span class="selected-country-name" id="selected-country-name">
          ${selectedCountry.country}
        </span>
        ${
          selectedCountry.city
            ? `<span class="selected-city-name" id="selected-city-name"> ${selectedCountry.city}</span>`
            : ``
        }
      </div>

      <button class="clear-selection-btn"id="clear-selection-btn"onclick="clearSelection()">
        <i class="fa-solid fa-xmark"></i>
      </button>


  `;

  document.getElementById("selected-destination").innerHTML = cartona;
}

// =======================
// RENDER COUNTRY EXPLORE
// =======================
function renderCountryInfo(country) {
  //تظبيط الشغل اهم من الشغل :>
  ///////////////////////////////////////

  let borders = "";
  if (country.borders && country.borders.length > 0) {
    for (let i = 0; i < country.borders.length; i++) {
      borders +=
        "<span class='extra-tag border-tag'>" + country.borders[i] + "</span>";
    }
  } else {
    borders = "<span class='extra-tag'>None</span>";
  }

  ///////////////////////////////////////
  let currency = "";
  if (country.currencies) {
    let codes = Object.keys(country.currencies);
    for (let i = 0; i < codes.length; i++) {
      let code = codes[i];
      let name = country.currencies[code].name;

      currency +=
        "<span class='extra-tag'>" + name + " (" + code + ")" + "</span>";
    }
  }

  ///////////////////////////////////////
  let langHtml = "";

  if (country.languages) {
    let langs = Object.values(country.languages);

    for (let i = 0; i < langs.length; i++) {
      langHtml += "<span class='extra-tag'>" + langs[i] + "</span>";
    }
  } else {
    langHtml = "<span class='extra-tag'>N/A</span>";
  }

  ///////////////////////////////////////
  ///////////////////////////////////////

  let cartona = `
    <div class="dashboard-country-header">
      <img src="${country.flags.png}" alt="${country.name.common}" class="dashboard-country-flag">
      <div class="dashboard-country-title">
        <h3>${country.name.common}</h3>
        <p class="official-name">${country.name.official}</p>
        <span class="region">
          <i class="fa-solid fa-location-dot"></i>
          ${country.region} • ${country.subregion || ""}
        </span>
      </div>
    </div>

    <div class="dashboard-local-time">
  <div class="local-time-display">
    <i class="fa-solid fa-clock"></i>
    <span class="local-time-value" id="country-local-time">
      ${getLocalTime(country.timezones[0])}
    </span>
    <span class="local-time-zone">
      ${country.timezones[0]}
    </span>
  </div>
</div>


    <div class="dashboard-country-grid">
      <div class="dashboard-country-detail">
        <i class="fa-solid fa-building-columns"></i>
        <span class="label">Capital</span>
        <span class="value">${country.capital?.[0] || "N/A"}</span>
      </div>

      <div class="dashboard-country-detail">
        <i class="fa-solid fa-users"></i>
        <span class="label">Population</span>
        <span class="value">${country.population.toLocaleString()}</span>
      </div>

      <div class="dashboard-country-detail">
        <i class="fa-solid fa-ruler-combined"></i>
        <span class="label">Area</span>
        <span class="value">${country.area.toLocaleString()} km²</span>
      </div>

      <div class="dashboard-country-detail">
        <i class="fa-solid fa-globe"></i>
        <span class="label">Continent</span>
        <span class="value">${country.continents[0]}</span>
      </div>

      <div class="dashboard-country-detail">
        <i class="fa-solid fa-phone"></i>
        <span class="label">Calling Code</span>
        <span class="value">
          ${country.idd?.root || ""}${country.idd?.suffixes?.[0] || ""}
        </span>
      </div>

      <div class="dashboard-country-detail">
        <i class="fa-solid fa-car"></i>
        <span class="label">Driving Side</span>
        <span class="value">${country.car.side}</span>
      </div>

      <div class="dashboard-country-detail">
        <i class="fa-solid fa-calendar-week"></i>
        <span class="label">Week Starts</span>
        <span class="value">${country.startOfWeek}</span>
      </div>
    </div>

    <div class="dashboard-country-extras">
      <div class="dashboard-country-extra">
        <h4><i class="fa-solid fa-coins"></i> Currency</h4>
        <div class="extra-tags">
          ${currency}
        </div>
      </div>

      <div class="dashboard-country-extra">
        <h4><i class="fa-solid fa-language"></i> Languages</h4>
        <div class="extra-tags">
          ${langHtml}
        </div>
      </div>

      <div class="dashboard-country-extra">
        <h4><i class="fa-solid fa-map-location-dot"></i> Neighbors</h4>
        <div class="extra-tags">
          ${borders}
        </div>
      </div>
    </div>

    <div class="dashboard-country-actions">
      <a href="${country.maps.googleMaps}" target="_blank" class="btn-map-link">
        <i class="fa-solid fa-map"></i> View on Google Maps
      </a>
    </div>
  `;

  document.getElementById("dashboard-country-info").innerHTML = cartona;
}
// =======================
// TIMEZONE
// =======================
function getLocalTime(timezone) {

  let offset = timezone.replace("UTC", "");
  let now = new Date();

  let utc = now.getTime() + now.getTimezoneOffset() * 60000;
  let localTime = new Date(utc + parseInt(offset) * 3600000);

  return localTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// =======================
// LIVE TIME
// =======================
let clockInterval;
function startLiveClock(timezone) {
  clearInterval(clockInterval);
  clockInterval = setInterval(function () {
    let timeElement = document.getElementById("country-local-time");
    timeElement.innerText = getLocalTime(timezone);
  }, 1000);
}

// =======================
// CLEAR SELACTION
// =======================
function clearSelection() {
  alert("ARE SURE YOU CLEAR?)");
  selectedCountry = {
    country: null,
    countryCode: null,
    city: null,
    year: null,
  };
  document.getElementById("selected-destination").innerHTML = "";
  document
    .getElementById("selected-destination")
    .classList.remove("selected-destination");
  document.getElementById("dashboard-country-info").innerHTML = "";
  countrySelect.value = "";
}

// =======================
// VIEW CHANGE
// =======================
function showView(viewName) {
  // hide all views
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove("active");
  }

  // remove active class from all nav items
  var navItems = document.querySelectorAll(".nav-item");
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].classList.remove("active");
  }

  // show selected view
  document.getElementById(viewName + "-view").classList.add("active");

  // add active class to clicked item
  event.target.classList.add("active");

  //put txt thats inside clicked element
  document.getElementById("page-title").innerText =
    event.target.innerText.trim();
}

// =======================
// LOAD ALL Holiday BY YEAR & COUNTRYCODE
// =======================
async function getPublicHolidays() {
  let response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${selectedCountry.year}/${selectedCountry.countryCode}`,
  );

  if (response.ok) {
    let data = await response.json();
    displayHolidays(data);
    holidaysList = data;
    for (let i = 0; i < data.length; i++) {
      let found = 0;
      //is it saved in fav planes?
      found = searchPlane(data[i].localName);
      if (found) {
        holidays.set(data[i].localName, 1);
      } else {
        holidays.set(data[i].localName, 0);
      }
    }
  } else {
    console.log("error loading holidays");
  }
}

function displayHolidays(list) {
  let cartona = `
    <div class="view-header-card gradient-green">
      <div class="view-header-icon">
        <i class="fa-solid fa-calendar-days"></i>
      </div>
      <div class="view-header-content">
        <h2>Public Holidays Explorer</h2>
        <p>Browse public holidays for ${selectedCountry.country}</p>
      </div>
    </div>

    <div class="holidays-content">
  `;

  for (let i = 0; i < list.length; i++) {
    let holiday = list[i];

    let date = new Date(holiday.date);
    let day = date.getDate();
    let month = date.toLocaleString("en-US", { month: "short" });
    let weekDay = date.toLocaleString("en-US", { weekday: "long" });

    cartona += `
      <div class="holiday-card">
        <div class="holiday-card-header">
          <div class="holiday-date-box">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
          </div>
          <button class="holiday-action-btn" onclick='savePlane(${i})'>

            <i class="fa-regular fa-heart"></i>
          </button>
        </div>

        <h3>${holiday.localName}</h3>
        <p class="holiday-name">${holiday.name}</p>

        <div class="holiday-card-footer">
          <span class="holiday-day-badge">
            <i class="fa-regular fa-calendar"></i> ${weekDay}
          </span>
          <span class="holiday-type-badge">
            ${holiday.types[0]}
          </span>
        </div>
      </div>
    `;
  }

  cartona += `</div>`;
  document.getElementById("holidays-view").innerHTML = cartona;
}

// =======================
// SAVE TO FAV...
// Holiday IN PLANE ARR
// =======================
function savePlane(index) {
  if (index === null) {
    //for safety :)
    return;
  }
  let holiday = holidaysList[index];
  let localName = holidaysList[index].localName;
  console.log(" hello savePlane :)\n");
  //dont forget holidays has every thing mapped to isfav
  // maps are orderd in js :)
  let isfav = holidays.get(localName);
  if (isfav === 0) {
    planes.push(holiday);
  } else {
    alert("already saved!");
  }
  isfav = !isfav;
  holidays.set(holiday.localName, isfav);
  localStorage.setItem("favorite-planes", JSON.stringify(planes));
  console.log(planes);
  displayFavoritesPlane();
  updateStats();
}

// =======================
// SEARCH FAV PLANE
// =======================
function searchPlane(localName) {
  for (let i = 0; i < planes.length; i++) {
    if (planes[i].localName == localName) {
      return 1;
    } else return 0;
  }
}
// =======================
// DISPLAY FAV PLANE
// =======================
//use planes that is arr of holiday obj
function updateStats() {
  document.getElementById("plans-count").innerHTML =
    planes.length + events.length + weekends.length;
  document.getElementById("filter-all-count").innerHTML =
    planes.length + events.length + weekends.length;
  document.getElementById("filter-holiday-count").innerHTML = planes.length;
  document.getElementById("filter-event-count").innerHTML = events.length;
  document.getElementById("filter-lw-count").innerHTML = weekends.length;
}

// =======================
// GET EVENTS
// =======================
let size = 20;
async function getEvents() {
  let response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?apikey=VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y&city=${selectedCountry.city}&countryCode=${selectedCountry.countryCode}&size=${20}`,
  );

  if (response.ok) {
    let data = await response.json();
    let events = data._embedded?.events || [];
    console.log("EVENTS:", events);
    displayEvents(events);
    eventsList = events;
    //is it saved in fav events?
    for (let i = 0; i < data.length; i++) {
      found = searchEvent(data[i].name);
      if (found) {
        allEvents.set(data[i].name, 1);
      } else {
        allEvents.set(data[i].name, 0);
      }
    }
  } else {
    console.log("error loading events ");
  }
}

// =======================
// RENDER EVENTS DISPLAY
// =======================
function displayEvents(events) {

  document.getElementById("events-view").innerHTML = `
    <div class="view-header-card gradient-purple">
            <div class="view-header-icon"><i class="fa-solid fa-ticket"></i></div>
            <div class="view-header-content">
              <h2>Events Explorer</h2>
              <p>Discover concerts, sports, theatre and more in ${country.name.official}</p>
            </div>
            <div class="view-header-selection">
              <div class="current-selection-badge">
                <img src="${country.flags.png}" alt="${selectedCountry.country}" class="selection-flag">
                <span>Egypt</span>
                <span class="selection-city">• Cairo</span>
              </div>
            </div>
          </div>
    `;


    if (!events.length) {
    document.getElementById("events-content").innerHTML  = "<p>No events found for this city</p>";
    return;
  }

  let cartona = "";

  for (let i = 0; i < events.length; i++) {
    let event = events[i];

    //USE ? TO AVOID UNEXPECTED ERRORS OF UNDEFINDS
    let name = event.name || "";
    let image = event.images?.[0]?.url || "";
    let date = event.dates?.start?.localDate || "";
    let time = event.dates?.start?.localTime || "";
    let venue = event._embedded?.venues?.[0]?.name || "";
    let city = event._embedded?.venues?.[0]?.city?.name || "";
    let category = event.classifications?.[0]?.segment?.name || "";
    let url = event.url || "";

    cartona += `
      <div class="event-card">
        <div class="event-card-image">
          <img src="${image}" alt="${name}">
          <span class="event-card-category">${category}</span>
          <button class="event-card-save" onclick='saveEvent(${i})'>
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>

        <div class="event-card-body">
          <h3>${name}</h3>

          <div class="event-card-info">
            <div>
              <i class="fa-regular fa-calendar"></i>
              ${date} ${time}
            </div>
            <div>
              <i class="fa-solid fa-location-dot"></i>
              ${venue}, ${city}
            </div>
          </div>

          <div class="event-card-footer">
            <a href="${url}" target="_blank" class="btn-buy-ticket">
              <i class="fa-solid fa-ticket"></i> Buy Tickets
            </a>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("events-content").innerHTML = cartona;
}

// =======================
// SEARCH FAV EVENT
// =======================
function searchEvent(name) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].name == name) {
      return 1;
    } else return 0;
  }
}

// =======================
// SAVE EVENT
// =======================
function saveEvent(index) {
  if (index === null) {
    //for safety :)
    return;
  }
  let event = eventsList[index];
  let name = eventsList[index].name;
  console.log(" hello saveEvent :)\n");
  let isfav = allEvents.get(name);
  if (isfav === 0) {
    events.push(event);
  } else {
    alert("already saved!");
  }
  isfav = !isfav;
  allEvents.set(event.name, isfav);
  localStorage.setItem("favourite-events", JSON.stringify(events));
  console.log(events);
  displayFavoritesEvent();
  updateStats();
}

// =======================
// GET WEATHER
// =======================
async function getWeather() {
  //country.latlng  is [latitude, longitude]
  let latitude = country.latlng[0];
  let longitude = country.latlng[1];
  let response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
  );

  if (response.ok) {
    let data = await response.json();
    console.log("Weather :", data);
    displayWeather(data);
  } else {
    console.log("error loading weather");
  }
}

// =======================
// RENDER WEATHER DISPLAY
// =======================
function displayWeather(data) {
  let current = data.current;
  let cartona = `
<div class="weather-hero-card weather-sunny">
  <div class="weather-location">
    <i class="fa-solid fa-location-dot"></i>
    <span>${selectedCountry.city}</span>
    <span class="weather-time">${current.time}</span>
  </div>
  <div class="weather-hero-main">
    <div class="weather-hero-left">
      <div class="weather-hero-icon">
        <i class="fa-solid fa-sun"></i>
      </div>
      <div class="weather-hero-temp">
        <span class="temp-value">${current.temperature_2m}</span>
        <span class="temp-unit">°C</span>
      </div>
    </div>
    <div class="weather-hero-right">
      <div class="weather-condition">Code ${current.weather_code}</div>
      <div class="weather-feels">
        Humidity ${current.relative_humidity_2m}%
      </div>
      <div class="weather-high-low">
        <span>
          <i class="fa-solid fa-wind"></i>
          ${current.wind_speed_10m} km/h
        </span>
        <span>
          <i class="fa-solid fa-sun"></i>
          UV ${current.uv_index}
        </span>
      </div>
    </div>
  </div>
</div>
<div class="weather-details-grid">
  <div class="weather-detail-card">
    <div class="detail-icon humidity">
      <i class="fa-solid fa-droplet"></i>
    </div>
    <div class="detail-info">
      <span class="detail-label">Humidity</span>
      <span class="detail-value">
        ${current.relative_humidity_2m}%
      </span>
    </div>
  </div>
  <div class="weather-detail-card">
    <div class="detail-icon wind">
      <i class="fa-solid fa-wind"></i>
    </div>
    <div class="detail-info">
      <span class="detail-label">Wind</span>
      <span class="detail-value">
        ${current.wind_speed_10m} km/h
      </span>
    </div>
  </div>
  <div class="weather-detail-card">
    <div class="detail-icon uv">
      <i class="fa-solid fa-sun"></i>
    </div>
    <div class="detail-info">
      <span class="detail-label">UV Index</span>
      <span class="detail-value">
        ${current.uv_index}
      </span>
    </div>
  </div>
</div>
<div class="weather-section">
  <h3 class="weather-section-title">
    <i class="fa-solid fa-calendar-week"></i>
    3-Day Forecast
  </h3>
  <div class="forecast-list">
    <div class="forecast-day">
      <div class="forecast-day-name">
        <span class="day-label">
          ${data.daily.time[0]}
        </span>
      </div>
      <div class="forecast-icon">
        <i class="fa-solid fa-sun"></i>
      </div>
      <div class="forecast-temps">
        <span class="temp-max">
          ${data.daily.temperature_2m_max[0]}°
        </span>
        <span class="temp-min">
          ${data.daily.temperature_2m_min[0]}°
        </span>
      </div>
    </div>
    <div class="forecast-day">
      <div class="forecast-day-name">
        <span class="day-label">
          ${data.daily.time[1]}
        </span>
      </div>
      <div class="forecast-icon">
        <i class="fa-solid fa-cloud"></i>
      </div>
      <div class="forecast-temps">
        <span class="temp-max">
          ${data.daily.temperature_2m_max[1]}°
        </span>
        <span class="temp-min">
          ${data.daily.temperature_2m_min[1]}°
        </span>
      </div>
    </div>
    <div class="forecast-day">
      <div class="forecast-day-name">
        <span class="day-label">
          ${data.daily.time[2]}
        </span>
      </div>

      <div class="forecast-icon">
        <i class="fa-solid fa-cloud-sun"></i>
      </div>
      <div class="forecast-temps">
        <span class="temp-max">
          ${data.daily.temperature_2m_max[2]}°
        </span>
        <span class="temp-min">
          ${data.daily.temperature_2m_min[2]}°
        </span>
      </div>
    </div>
  </div>
</div>
`;

  document.getElementById("weather-content").innerHTML = cartona;
}

// =======================
// GET WEEKENDS
// =======================
async function getLongWeekends() {
  let response = await fetch(
    `https://date.nager.at/api/v3/LongWeekend/${selectedCountry.year}/${selectedCountry.countryCode}`,
  );

  if (response.ok) {
    let data = await response.json();
    console.log("LONG WEEKENDS:", data);
    displayLongWeekends(data);
    weekendsList = data;
    //is it saved in fav events?
    for (let i = 0; i < data.length; i++) {
      found = searchLongWeekends(data[i]);
      if (found) {
        allweekends.set(i, 1);
      } else {
        allweekends.set(i, 0);
      }
    }
  } else {
    console.log("error loading long weekends");
  }
}

// =======================
// DISPLAY WEEKENDS
// =======================
function displayLongWeekends(list) {
  let cartona = "";

  for (let i = 0; i < list.length; i++) {
    let lw = list[i];

    let start = new Date(lw.startDate);
    let end = new Date(lw.endDate);
    let from = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    let to = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let type, note;
    if (lw.needBridgeDay === true) {
      type = "warning";
      note = "Requires taking a bridge day off";
    } else {
      type = "success";
      note = "No extra days off needed!";
    }

    cartona += `
      <div class="lw-card">
        <div class="lw-card-header">
          <span class="lw-badge">
            <i class="fa-solid fa-calendar-days"></i> ${lw.dayCount} Days
          </span>
          <button class="holiday-action-btn" onclick='saveLongWeekends(${i})'>
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>

        <h3>Long Weekend</h3>
        <div class="lw-dates">
          <i class="fa-regular fa-calendar"></i>
          ${from} - ${to}
        </div>
        <div class="lw-info-box ${type}">
          <i class="fa-solid fa-circle-info"></i>
          ${note}
        </div>
        <div class="lw-days-visual">
          <div class="lw-day weekend"><span class="name">Start</span><span class="num">${start.getDate()}</span></div>
          <div class="lw-day weekend"><span class="name">End</span><span class="num">${end.getDate()}</span></div>
        </div>
      </div>
    `;
  }

  document.getElementById("lw-content").innerHTML = cartona;
}

// =======================
// SEARCH FAV EVENT
// =======================
function searchLongWeekends(obj) {
  for (let i = 0; i < weekends.length; i++) {
    if (
      obj.startDate === weekends[i].startDate &&
      obj.endDate === weekends[i].endDate &&
      obj.dayCount === weekends[i].dayCount &&
      obj.needBridgeDay === weekends[i].needBridgeDay
    ) {
      return 1;
    } else return 0;
  }
}

// =======================
// SAVE EVENT
// =======================
function saveLongWeekends(index) {
  if (index === null) {
    //for safety :)
    return;
  }
  //thx god map is orderd in js :)
  let weekend = weekendsList[index];
  console.log(" hello saveLongWeekends :)\n");
  let isfav = allweekends.get(index);
  if (isfav === 0) {
    weekends.push(weekend);
  } else {
    alert("already saved!");
  }
  isfav = !isfav;
  allweekends.set(index, isfav);
  localStorage.setItem("favorite-weekends", JSON.stringify(weekends));
  console.log(weekends);
  displayFavoritesEvent();
  updateStats();
}

// =======================
// GET SUN TIMES
// =======================
async function getSunTimes() {
  let latitude = country.latlng[0];
  let longitude = country.latlng[1];

  let response = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`,
  );

  if (response.ok) {
    let data = await response.json();
    console.log("SUN TIMES:", data);
    displaySunTimes(data.results);
  } else {
    console.log("error loading sun times");
  }
}

// =======================
// DISPLAY SUN TIMES
// =======================
function displaySunTimes(data) {
  let s = data;

  let cartona = `
<div class="sun-main-card">
  <div class="sun-main-header">
    <div class="sun-location">
      <h2><i class="fa-solid fa-location-dot"></i> ${selectedCountry.city}</h2>
      <p>Sun times for your selected location</p>
    </div>
    <div class="sun-date-display">
      <div class="date">${new Date().toDateString()}</div>
      <div class="day"></div>
    </div>
  </div>

  <div class="sun-times-grid">

    <div class="sun-time-card dawn">
      <div class="icon"><i class="fa-solid fa-moon"></i></div>
      <div class="label">Dawn</div>
      <div class="time">${s.civil_twilight_begin}</div>
      <div class="sub-label">Civil Twilight</div>
    </div>

    <div class="sun-time-card sunrise">
      <div class="icon"><i class="fa-solid fa-sun"></i></div>
      <div class="label">Sunrise</div>
      <div class="time">${s.sunrise}</div>
      <div class="sub-label">Golden Hour Start</div>
    </div>

    <div class="sun-time-card noon">
      <div class="icon"><i class="fa-solid fa-sun"></i></div>
      <div class="label">Solar Noon</div>
      <div class="time">${s.solar_noon}</div>
      <div class="sub-label">Sun at Highest</div>
    </div>

    <div class="sun-time-card sunset">
      <div class="icon"><i class="fa-solid fa-sun"></i></div>
      <div class="label">Sunset</div>
      <div class="time">${s.sunset}</div>
      <div class="sub-label">Golden Hour End</div>
    </div>

    <div class="sun-time-card dusk">
      <div class="icon"><i class="fa-solid fa-moon"></i></div>
      <div class="label">Dusk</div>
      <div class="time">${s.civil_twilight_end}</div>
      <div class="sub-label">Civil Twilight</div>
    </div>

    <div class="sun-time-card daylight">
      <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
      <div class="label">Day Length</div>
      <div class="time">${s.day_length}</div>
      <div class="sub-label">all Daylight</div>
    </div>

  </div>
</div>

<div class="day-length-card">
  <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
  <div class="day-progress">
    <div class="day-progress-bar">
      <div class="day-progress-fill" style="width: 50%"></div>
    </div>
  </div>

  <div class="day-length-stats">
    <div class="day-stat">
      <div class="value">${s.day_length}</div>
      <div class="label">Daylight</div>
    </div>

    <div class="day-stat">
      <div class="value">—</div>
      <div class="label">of 24 Hours</div>
    </div>

    <div class="day-stat">
      <div class="value">—</div>
      <div class="label">Darkness</div>
    </div>
  </div>
</div>
`;

  document.getElementById("sun-times-content").innerHTML = cartona;
}

// =======================
// GET RATES
// =======================
async function getRates() {
  let res = await fetch(
    "https://v6.exchangerate-api.com/v6/805842951e5953ad31497176/latest/USD",
  );

  let data = await res.json();
  rates = data.conversion_rates;
}

// =======================
// CALC CURRUNCY
// =======================
function convertCurrency() {
  //EUR -> EGP
  let amount = Number(document.getElementById("currency-amount").value);
  let from_code = document.getElementById("currency-from").value;
  let to_code = document.getElementById("currency-to").value;

  if (!rates || !rates[from_code] || !rates[to_code]) {
    alert("Rates not loaded yet");
    return;
  }

  // rates table is based on USD
  let from_rate = rates[from_code]; // USD -> EUR
  let to_rate = rates[to_code]; // USD -> EGP

  // convert to USD first
  //1 EUR = 1 / 0.92 USD
  let usd_value = amount / from_rate;

  // USD -> EGP
  let result = usd_value * to_rate;

  document.getElementById("currency-result").innerHTML = `
    <div class="conversion-display">
      <div class="conversion-from">
        <span class="amount">${amount.toFixed(2)}</span>
        <span class="currency-code">${from_code}</span>
      </div>

      <div class="conversion-equals">
        <i class="fa-solid fa-equals"></i>
      </div>

      <div class="conversion-to">
        <span class="amount">${result.toFixed(2)}</span>
        <span class="currency-code">${to_code}</span>
      </div>
    </div>

    <div class="exchange-rate-info">
      <p>1 ${from_code} = ${(to_rate / from_rate).toFixed(2)} ${to_code}</p>
      <small>Live rate</small>
    </div>
  `;
}

// =======================
// CLEAR ALL FAVS
// =======================
function clearAllPlanes() {
  alert("ARE YOU SURE CLEARE ALL?");
  document.getElementById("plans-content").innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fa-solid fa-heart-crack"></i>
      </div>
      <h3>No Saved Plans Yet</h3>
      <p>Start exploring and save holidays, events, or long weekends you like!</p>
    </div>
  `;
  localStorage.clear();
  updateStats();
}

// =======================
// DISPLAY FAV
// =======================
function emptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fa-solid fa-heart-crack"></i>
      </div>
      <h3>No Saved Plans Yet</h3>
      <p>Start exploring and save holidays, events, or long weekends you like!</p>
    </div>
  `;
}

function displayFavoritesWeekends() {
  let container = document.getElementById("plans-content");

  if (weekends.length === 0) {
    container.innerHTML = emptyState();
    return;
  }

  let cartona = "";

  for (let i = 0; i < weekends.length; i++) {
    let w = weekends[i];

    cartona += `
      <div class="holiday-card">

        <span class="plan-type-badge weekend">
          LONG WEEKEND
        </span>

        <h3>${w.dayCount} Day Long Weekend</h3>

        <p>
          <i class="fa-regular fa-calendar"></i>
          ${w.startDate} — ${w.endDate}
        </p>

        <p>
          <i class="fa-solid fa-circle-info"></i>
          ${w.needBridgeDay ? "Requires bridge day" : "No extra days needed"}
        </p>

        <button class="btn-remove" onclick="removeWeekend(${i})">
          <i class="fa-solid fa-trash"></i>
          Remove
        </button>

      </div>
    `;
  }

  container.innerHTML = cartona;
}

function displayFavoritesEvent() {
  let container = document.getElementById("plans-content");

  if (events.length === 0) {
    container.innerHTML = emptyState();
    return;
  }

  let cartona = "";

  for (let i = 0; i < events.length; i++) {
    let e = events[i];

    cartona += `
      <div class="holiday-card">

        <span class="plan-type-badge event">EVENT</span>

        <h3>${e.name}</h3>

        <p>
          <i class="fa-regular fa-calendar"></i>
          ${e.dates?.start?.localDate || ""}
        </p>

        <p>
          <i class="fa-solid fa-location-dot"></i>
          ${e._embedded?.venues?.[0]?.name || ""}
        </p>

        <button class="btn-remove" onclick="removeEvent(${i})">
          <i class="fa-solid fa-trash"></i>
          Remove
        </button>

      </div>
    `;
  }

  container.innerHTML = cartona;
}

function displayFavoritesPlane() {
  let container = document.getElementById("plans-content");

  if (planes.length === 0) {
    container.innerHTML = emptyState();
    return;
  }

  let cartona = "";

  for (let i = 0; i < planes.length; i++) {
    let h = planes[i];
    let d = new Date(h.date);

    cartona += `
      <div class="holiday-card">
        <span class="plan-type-badge holiday">HOLIDAY</span>

        <h3>${h.localName}</h3>

        <p>
          <i class="fa-regular fa-calendar"></i>
          ${d.toLocaleDateString("en-US")}
        </p>

        <p>
          <i class="fa-solid fa-circle-info"></i>
          ${h.name}
        </p>

        <button class="btn-remove" onclick="removePlane(${i})">
          <i class="fa-solid fa-trash"></i>
          Remove
        </button>
      </div>
    `;
  }

  container.innerHTML = cartona;
}

function displayFavoritesAll() {
  let container = document.getElementById("plans-content");
  let cartona = "";

  let total = planes.length + events.length + weekends.length;

  if (total === 0) {
    container.innerHTML = emptyState();
    return;
  }

  for (let i = 0; i < planes.length; i++) {
    let h = planes[i];
    let d = new Date(h.date);

    cartona += `
      <div class="holiday-card">
        <span class="plan-type-badge holiday">HOLIDAY</span>
        <h3>${h.localName}</h3>
        <p><i class="fa-regular fa-calendar"></i> ${d.toLocaleDateString("en-US")}</p>
        <p><i class="fa-solid fa-circle-info"></i> ${h.name}</p>
        <button class="btn-remove" onclick="removePlane(${i})">
          <i class="fa-solid fa-trash"></i> Remove
        </button>
      </div>
    `;
  }

  for (let i = 0; i < events.length; i++) {
    let e = events[i];

    cartona += `
      <div class="holiday-card">
        <span class="plan-type-badge event">EVENT</span>
        <h3>${e.name}</h3>
        <p><i class="fa-regular fa-calendar"></i> ${e.dates?.start?.localDate || ""}</p>
        <p><i class="fa-solid fa-location-dot"></i> ${e._embedded?.venues?.[0]?.name || ""}</p>
        <button class="btn-remove" onclick="removeEvent(${i})">
          <i class="fa-solid fa-trash"></i> Remove
        </button>
      </div>
    `;
  }

  for (let i = 0; i < weekends.length; i++) {
    let w = weekends[i];

    cartona += `
      <div class="holiday-card">
        <span class="plan-type-badge weekend">LONG WEEKEND</span>
        <h3>${w.dayCount} Day Long Weekend</h3>
        <p><i class="fa-regular fa-calendar"></i> ${w.startDate} — ${w.endDate}</p>
        <p><i class="fa-solid fa-circle-info"></i>
          ${w.needBridgeDay ? "Requires bridge day" : "No extra days needed"}
        </p>
        <button class="btn-remove" onclick="removeWeekend(${i})">
          <i class="fa-solid fa-trash"></i> Remove
        </button>
      </div>
    `;
  }

  container.innerHTML = cartona;
}

// =======================
// INITIALIZATIONS
// =======================
getAvailableCountries();
getRates();
