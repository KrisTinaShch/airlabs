const { iata, api_key } = getQueryVariables();
const arrivalsLink = `https://airlabs.co/api/v9/schedules?arr_iata=${iata}&api_key=${api_key}`;
const departuresLink = `https://airlabs.co/api/v9/schedules?dep_iata=${iata}&api_key=${api_key}`;
const currentTime = new Date();
const currentTimeUTC = new Date(currentTime.getTime() + currentTime.getTimezoneOffset() * 60000)

function getQueryVariables() {
  let query = window.location.search.substring(1);
  let vars = query.split('&');
  let result = {
    iata: 'VAR',
    api_key: 'SERGEY-STAM-KEY'
  };

  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    let decodedName = decodeURIComponent(pair[0]);
    let decodedValue = decodeURIComponent(pair[1]);
    decodedValue = decodedValue.replace(/["']/g, "");

    if (decodedName === 'iata') {
      result.iata = decodedValue;
    } else if (decodedName === 'api_key') {
      result.api_key = decodedValue;
    }
  }
  return result;
}

let currentArrivalsIndex = 0;
let currentDeparturesIndex = 0;

const fetchDataArrivals = async () => {
  const resultArrivals = await fetch(`${arrivalsLink}&limit=50&offset=${currentArrivalsIndex}`);
  const dataArrivals = await resultArrivals.json();
  currentArrivalsIndex += 50; 
  await createAccordionItems(dataArrivals, 0, "Arrivals");

};

const fetchDataDepartures = async () => {
  const resultdDepartures = await fetch(departuresLink);
  const dataDepartures = await resultdDepartures.json();
  await createAccordionItems(dataDepartures, 0, "Departures");
}


async function createAccordionItems(data, counter = "0", accordionType) {
  // Сreate accordion items
  const accordion = document.querySelector(`.accordion${accordionType}`);
  const fragment = document.createDocumentFragment();
  for (const item of data.response) {
    counter++;
    const itemMarkup = await generateAccordionItemMarkup(item, counter, accordionType);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = itemMarkup;
    fragment.appendChild(tempDiv.firstElementChild);

  }
  accordion.appendChild(fragment);

  // Сhanging the appearance of accordion on the mobile
  const accordionItems = document.querySelectorAll('.accordion-collapse');
  accordionItems.forEach((item) => {
    if (window.innerWidth < 768) {
      item.classList.add('show');
    } else {
      item.classList.remove('show');
    }
  });

  // Adding a Shadow to Accordion Elements
  const accordionButtons = document.querySelectorAll('.accordion-button');
  const accordionItem = document.querySelectorAll('.accordion-item');
  accordionButtons.forEach((button, index) => {
    accordionButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        setTimeout(() => {
          if (!button.classList.contains('collapsed')) {
            accordionItem[index].classList.add('accordion-box-shadow');
          } else {
            accordionItem[index].classList.remove('accordion-box-shadow');
          }
        }, 0);
      });
    });
  });
}


function getActualFlightTime(time, estimatedTime) {
  const flightTime = estimatedTime && estimatedTime !== '-' ? estimatedTime : time;
  return flightTime;
}

//Функция для получения данных о аэропортах и сохранения их в localStorage
async function fetchAndSaveAirports() {
  try {
    const response = await fetch(`https://airlabs.co/api/v9/airports?api_key=${api_key}&_fields=iata_code,city,name`);
    const data = await response.json();
    const airports = {};
    data.response.forEach((airport) => {
      airports[airport.iata_code] = {
        name: airport.name,
        city: airport.city
      };
    });
    localStorage.setItem('airports', JSON.stringify(airports));
  } catch (error) {
    console.error('Error:', error);
  }
}
function getAirportsFromLocalStorage() {
  const airports = localStorage.getItem('airports');
  return airports ? JSON.parse(airports) : {};
}
fetchAndSaveAirports();

const airportsMapping = getAirportsFromLocalStorage();
console.log(airportsMapping);

async function generateAccordionItemMarkup(item, counter, accordionType) {
  const dep_iata = item.dep_iata;
  const arr_iata = item.arr_iata;
  const flightInfo = {
    status: item.status,
    flightNumber: `${item.airline_iata || ' '} ${item.flight_number || ' '}`,
    flightDuration: item.duration || '-',
    airlineIata: item.airline_iata || '',
    // departures
    departureIata: item.dep_iata || '-',
    departureTime: item.dep_time,
    departureEstimated: item.dep_estimated,
    departureUTCTime: item.dep_time_utc,
    departureEstimatedUTCTime: item.dep_estimated_utc,
    departureTerminal: item.dep_terminal || ' - ',
    departureGate: item.dep_gate || ' - ',
    // arrivals
    arrivalsIata: item.arr_iata || '-',
    arrivalsTime: item.arr_time,
    arrivalsEstimated: item.arr_estimated,
    arrivalsUTCTime: item.arr_time_utc,
    arrivalsEstimatedUTCTime: item.arr_estimated_utc,
    arrivalsTerminal: item.arr_terminal || '-',
    arrivalsGate: item.gate || '-',
    arrivalsBaggage: item.arr_baggage || '-',
    // methods
    getCurrentFlightTime() {
      const actualFlightUTCDeparture = getActualFlightTime(flightInfo.departureUTCTime, flightInfo.departureEstimatedUTCTime);
      const actualFlightUTCArrivial = getActualFlightTime(flightInfo.arrivalsUTCTime, flightInfo.arrivalsEstimatedUTCTime);
      const depTest = new Date(actualFlightUTCDeparture);
      const arrTest = new Date(actualFlightUTCArrivial);
      const totalDifference = (arrTest - depTest) / (1000 * 60); // in minutes
      const restTimeFlight = Math.round((arrTest - currentTimeUTC) / (1000 * 60)); // in minutes
      const restTimeFlightInPercent = Math.round((restTimeFlight * 100) / (totalDifference));
      return `left:${83 - restTimeFlightInPercent}%`;
    },
  }
  // console.log(airportsMapping[dep_iata]);
  return `
        <div class="accordion-item px-0 px-sm-3 py-3">
    <h2 class="accordion-header d-none d-md-block " id="panelsStayOpen${accordionType}-heading${counter}">
        <button class="accordion-button p-0 py-3 " type="button" data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen${accordionType}-collapse${counter}" aria-expanded="true"
            aria-controls="panelsStayOpen${accordionType}-collapse${counter}">
            <span class="fw-normal">${formatTime(flightInfo.departureTime)}</span>
            <span class="blue-font">${flightInfo.flightNumber}</span>
            <span class="flight-status d-none d-md-block rounded fw-bold text-center ${flightInfo.status}">${flightInfo.status}</span>
            <span>${airportsMapping[arr_iata].city} <span class="airport-code">${flightInfo.departureIata}</span> </span>
        </button>
    </h2>
    <div id="panelsStayOpen${accordionType}-collapse${counter}" class="accordion-collapse collapse"
        aria-labelledby="panelsStayOpen${accordionType}-heading${counter}">
        <div class="accordion-body p-sm-0 p-2">
            <div class="body-innerline">
                <div class="container-fluid">
                    <div class="row justify-content-between py-3 px-2 border rounded mb-0 position-relative align-items-center row-gap-0">
                        <div class="col-md-2 col-3 p-0">
                            <div class="airport-name d-none d-md-block fw-bold">
                                ${airportsMapping[dep_iata].name}
                                <span class="airport-code">${flightInfo.departureIata}</span>
                            </div>
                            <div class="city-name fw-bold">${airportsMapping[dep_iata].city}</div>
                            <div class="date text-muted">${formatDate(flightInfo.departureTime)}</div>
                            <div class="time fw-bold">${checkEstimatedTime(item.dep_estimated, item.dep_time)}</div>
                            <div class="country-code d-block d-md-none blue-iata-mobile ">${flightInfo.departureIata}</div>
                        </div>
                        <div class="col-md-8 col-6 mx-md-auto d-flex flex-column align-items-center gap-1 p-0 justify-content-center">
                            <div class="flight-flag mb-2">
                                <img src="${flightInfo.airlineIata ? `https://airlabs.co/img/airline/m/${flightInfo.airlineIata}.png` : "../images/placeholder.png"}" alt="" class="rounded-circle">
                            </div>
                            <div class="flight-line position-relative">
                                <img src="../images/plane-trip.svg" alt="" class="plane-image ${flightInfo.status}" style="${flightInfo.status == 'active' ? flightInfo.getCurrentFlightTime() : ''}">
                            </div>
                            <div class="text-muted mt-2 flight-info">${toHoursAndMinutes(flightInfo.flightDuration)}</div>
                            <div class="text-muted flight-info">${flightInfo.flightNumber}</div>
                        </div>
                        <div class="col-md-2 col-3 p-0 text-end ">
                            <div class="airport-name d-none d-md-block fw-bold">${airportsMapping[arr_iata].name}
                                <span class="airport-code">${flightInfo.arrivalsIata}</span></div>
                            <div class="city-name fw-bold">${airportsMapping[arr_iata].city}</div>
                            <div class="date text-muted">${formatDate(flightInfo.arrivalsTime)}</div>
                            <div class="time fw-bold"> ${checkEstimatedTime(item.arr_estimated, item.arr_time)}</div>
                            <div class="flight-status rounded fw-bold text-center d-block d-md-none ${flightInfo.status}">
                                ${flightInfo.status}</div>
                            <div class="country-code d-block d-md-none blue-iata-mobile float-end">${flightInfo.arrivalsIata} </div>
                        </div>
                        <div class="col-md-12 mt-4 d-none d-md-block p-0 pb-3">
                            <div class="d-flex gap-5 justify-content-between">
                                <div class="d-flex gap-3 border rounded">
                                    <div class="p-2 pe-4 border-end">
                                        <p class="text-muted">Terminal</p>
                                        <p class="fw-bold">${flightInfo.departureTerminal}</p>
                                    </div>
                                    <div class="p-2 pe-4">
                                        <p class="text-muted">Gate</p>
                                        <p class="fw-bold">${flightInfo.departureGate}</p>
                                    </div>
                                </div>

                                <div class="d-flex gap-3 border rounded">
                                    <div class="p-2 pe-4 border-end">
                                        <p class="text-muted">Terminal</p>
                                        <p class="fw-bold">${flightInfo.arrivalsTerminal}</p>
                                    </div>
                                    <div class="p-2 pe-4 border-end">
                                        <p class="text-muted">Gate</p>
                                        <p class="fw-bold">${flightInfo.arrivalsGate}</p>
                                    </div>
                                    <div class="p-2 pe-4">
                                        <p class="text-muted">Baggage Claim</p>
                                        <p class="fw-bold">${flightInfo.arrivalsBaggage}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  `
}


// Change time format to AM/PM
function formatTime(time_string) {
  const time_string_format = new Date(time_string);
  return `${time_string_format.toLocaleString('en-US', { timeStyle: "short" })}`
}

// Adding a month to a date
function formatDate(date_string) {
  const date_string_format = new Date(date_string);
  return `${date_string_format.toLocaleString('en-US', { day: "numeric", month: "short" })}`;
}

function checkEstimatedTime(estimated_time, exact_time) {
  return typeof estimated_time === "undefined" ? formatTime(exact_time) : `${formatTime(estimated_time)}<br><span class="flight-delay fw-normal text-danger text-decoration-line-through">${formatTime(exact_time)} </span>`;
}

function toHoursAndMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hr ${minutes > 0 ? ` ${minutes} min` : ''}`;
}

const loadMoreArrivalsButton = document.querySelector("#loadMoreArrivals");
// const loadMoreDeparturesButton = document.querySelector("#loadMoreDepartures");

loadMoreArrivalsButton.addEventListener("click", () => {
  fetchDataArrivals();
});

// loadMoreDeparturesButton.addEventListener("click", () => {
//   fetchDataDepartures();
// });
document.addEventListener('DOMContentLoaded', (event) => {
  fetchDataArrivals();
  fetchDataDepartures();
});





