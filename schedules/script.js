// const accordionButton = document.querySelector('.accordion-button');
// const accordionItem = document.querySelector('.accordion-item');
// const accordionCollapse = document.querySelector('.accordion-collapse');

// accordionButton.addEventListener("click", () => {
//   if (!accordionButton.classList.contains('collapsed')) {
//     accordionItem.classList.add('accordion-box-shadow');
//   } else {
//     accordionItem.classList.remove('accordion-box-shadow');
//   }
// });

// function check() {
//   if (window.matchMedia("(max-width: 769px)").matches) {
//     accordionCollapse.classList.add('show');
//     accordionItem.classList.remove('accordion-box-shadow');
//   } else {
//     accordionCollapse.classList.remove('show');
//   }
// }

// check();

// window.addEventListener('resize', check);


const { iata, api_key } = getQueryVariables();
const arrivalsLink = `https://airlabs.co/api/v9/schedules?arr_iata=${iata}&api_key=${api_key}`;
const airports = `https://airlabs.co/api/v9/airports?iata_code=${iata}&api_key=${api_key}`
const departuresLink = `https://airlabs.co/api/v9/schedules?dep_iata=${iata}&api_key=${api_key}`;

function getQueryVariables() {
  let query = window.location.search.substring(1);
  let vars = query.split('&');
  let result = {
    iata: 'SIN',
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

const fetchData = async () => {

  const resultArrivals = await fetch(arrivalsLink);
  const dataArrivals = await resultArrivals.json();

  const resultAirports = await fetch(airports);
  const dataAirports = await resultAirports.json();

  getAirportName(dataAirports);
  createAccordionItems(dataArrivals);
};

function getAirportName(data) {

  const airportData = {
    iata: data.response[0].iata_code,
    city: data.response[0].city,
    airport_name: data.response[0].name,
  };
  localStorage.setItem(`airport_${iata}`, JSON.stringify(airportData));
  return airportData;
}



function createAccordionItems(data) {
  const accordion = document.querySelector('.accordion');
  const fragment = document.createDocumentFragment();
  let counter = 0;

  data.response.forEach((item) => {
    counter++;
    const itemMarkup = generateAccordionItemMarkup(item, counter);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = itemMarkup;

    fragment.appendChild(tempDiv.firstElementChild);
  });

  accordion.appendChild(fragment);
}

function generateAccordionItemMarkup(item, counter) {
  const airportArrivalsInfo = JSON.parse(localStorage.getItem(`airport_${iata}`));

  return `
  <div class="accordion-item px-0 px-sm-3">
                <h2 class="accordion-header d-none d-md-block " id="panelsStayOpen-heading${counter}">
                  <button class="accordion-button p-0 py-3 " type="button" data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapse${counter}" aria-expanded="true"
                    aria-controls="panelsStayOpen-collapse${counter}">
                    <span class="fw-normal">${checkArrivalTime(item.arr_estimated, item.arr_time)}</span>
                    <span class="blue-font">${item.airline_iata} ${item.flight_number}</span>
                    <span class="flight-status d-none d-md-block rounded fw-bold text-center ${checkFlightStatus(item.status)}">${item.status}</span>
                    <span>${airportArrivalsInfo.city} <span class="airport-code">${item.dep_iata}</span> </span>
                  </button>
                </h2>
                <div id="panelsStayOpen-collapse${counter}" class="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-heading${counter}">
                  <div class="accordion-body p-sm-0 p-2">
                    <div class="body-innerline">
                      <div class="container-fluid">
                        <div class="row justify-content-between p-3 border rounded mb-3 position-relative">
                          <div class="col-md-2 col-2 p-0">
                            <div class="airport-name d-none d-md-block fw-bold">${airportArrivalsInfo.airport_name} <span
                                class="airport-code">${item.arr_iata}</span></div>
                            <div class="city-name fw-bold">${airportArrivalsInfo.city}</div>
                            <div class="date text-muted">${formatDate(item.arr_time)}</div>
                            <div class="time fw-normal"> ${checkArrivalTime(item.arr_estimated, item.arr_time)}</div>
                            <div class="flight-delay fw-normal text-danger text-decoration-line-through">${formatTime(item.arr_time)}</div>
                            <div class="flight-status rounded fw-bold text-center d-block d-md-none ${checkFlightStatus(item.status)}">${item.status}</div>
                            <div class="country-code d-block d-md-none fw-bold blue-font">TIV </div>
                          </div>
                          <div
                            class="col-md-8 col-6 mx-md-auto d-flex flex-column align-items-center gap-1 p-0 justify-content-center">
                            <div class="flight-flag mb-2">
                              <img src="../images/flag.png" alt="">
                            </div>
                            <div class="flight-line">
                              <img src="../images/plane-trip.svg" alt="">
                            </div>
                            <div class="text-muted mt-2">15 h 35 min</div>
                            <div class="text-muted">DL TXTFB</div>
                          </div>
                          <div class="col-md-2 col-2 text-end p-0">
                            <div class="airport-name d-none d-md-block fw-bold"><span class="airport-code">${item.dep_iata}</span>
                             
                            </div>
                            <div class="city-name fw-bold">Istanbul</div>
                            <div class="date text-muted">16 oct</div>
                            <div class="time fw-normal">5:10 AM</div>
                            <div class="flight-delay fw-normal text-danger text-decoration-line-through">5:10 AM</div>
                            <div class="country-code d-block d-md-none">IST</div>
                          </div>
                          <div class="col-md-12 mt-4 d-none d-md-block p-0 pb-3">
                            <div class="d-flex gap-5 justify-content-between">
                              <div class="d-flex gap-3 border rounded">
                                <div class="p-2 pe-4 border-end">
                                  <p class="text-muted">Terminal</p>
                                  <p class="fw-bold">2</p>
                                </div>
                                <div class="p-2 pe-4">
                                  <p class="text-muted">Gate</p>
                                  <p class="fw-bold">B13</p>
                                </div>
                              </div>

                              <div class="d-flex gap-3 border rounded">
                                <div class="p-2 pe-4 border-end">
                                  <p class="text-muted">Terminal</p>
                                  <p class="fw-bold">1</p>
                                </div>
                                <div class="p-2 pe-4 border-end">
                                  <p class="text-muted">Gate</p>
                                  <p class="fw-bold">B13</p>
                                </div>
                                <div class="p-2 pe-4">
                                  <p class="text-muted">Baggage Claim</p>
                                  <p class="fw-bold">20</p>
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


// Форматирование даты 
function formatTime(date_string) {
  const date_string_date = new Date(date_string);
  const date_string_hours = date_string_date.getHours();
  const date_string_minutes = date_string_date.getMinutes();
  return date_string_hours.toString().padStart(2, '0') + ':' + date_string_minutes.toString().padStart(2, '0');
}

function formatTimePMandAM(date_string) {
  const date_string_date = new Date(date_string);
  return `${date_string_date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
}
// Форматирование даты 
function formatDate(date_string) {
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const arr_date = new Date(date_string);
  const arr_date_day = arr_date.getDate();
  const arr_date_month = monthsShort[arr_date.getMonth()];
  return `${arr_date_day} ${arr_date_month}`;
}

// Проверка даты 
function checkArrivalTime(estimated_time, exact_time) {
  return typeof estimated_time === "undefined" ? formatTime(exact_time) : `${formatTime(estimated_time)}`;
}

function checkFlightStatus(status) {
  switch (status) {
    case "landed":
      status = 'landed';
      break;
    case "cancelled":
      status = 'cancelled';
      break;
    case "active":
      status = 'active';
      break;
    case "scheduled":
      status = 'scheduled';
      break;
    default:
      status = 'landed';
      break;
  }
  return status;
}

document.addEventListener('DOMContentLoaded', (event) => {
  fetchData();
});



