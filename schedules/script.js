

// разбивает URL и ищет IATA и API-KEY
function getQueryVariables() {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var result = {
    iata: 'SIN',
    api_key: 'SERGEY-STAM-KEY'
  };

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    var decodedName = decodeURIComponent(pair[0]);
    var decodedValue = decodeURIComponent(pair[1]);

    if (decodedName === 'iata') {
      result.iata = decodedValue;
    } else if (decodedName === 'api_key') {
      result.api_key = decodedValue;
    }
  }

  return result;
}


// Форматирование даты 
function formatTime(date_string) {
  const date_string_date = new Date(date_string);
  const date_string_hours = date_string_date.getHours();
  const date_string_minutes = date_string_date.getMinutes();
  console.log();
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
  return typeof estimated_time === "undefined" ? exact_time : `${formatTime(estimated_time)}`;
}

function fetchAirportData(iata_code, callback) {
  let linkParameters = getQueryVariables("iata", "api_key");

  const cachedAirportData = localStorage.getItem(`airport_${iata_code}`);
  if (cachedAirportData) {
    callback(JSON.parse(cachedAirportData));
    return;
  }

  fetch(`https://airlabs.co/api/v9/airports?iata_code=${iata_code}&api_key=${linkParameters.api_key}`)
    .then(response => response.json())
    .then(data => {
      if (data && Array.isArray(data.response) && data.response.length > 0) {
        const airportData = {
          iata: data.response[0].iata_code,
          city: data.response[0].city,
          airport_name: data.response[0].name
        };

        localStorage.setItem(`airport_${iata_code}`, JSON.stringify(airportData));

        callback(airportData);
      } else {
        console.error('Error');
        throw new Error('Airport data not found');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

function fetchAndDisplayFlights() {
  let linkParameters = getQueryVariables("iata", "api_key");

  fetch(`https://airlabs.co/api/v9/schedules?arr_iata=${linkParameters.iata}&api_key=${linkParameters.api_key}`)
    .then(response => response.json())
    .then(data => {
      if (data && Array.isArray(data.response)) {
        const flightList = document.querySelector('.schedules-list');
        let accordionIdCounter = 0;

        flightList.innerHTML = '';
        data.response.forEach((flight) => {
          fetchAirportData(flight.dep_iata, (depAirportData) => {
            accordionIdCounter++;
            const flightListItem = document.createElement('div');
            flightListItem.className = 'accordion-item';
            flightListItem.innerHTML = `
              <h2 class="accordion-header" id="panelsStayOpen-heading${accordionIdCounter}">
                <button class="accordion-button" type="button" data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapse${accordionIdCounter}" aria-expanded="true" aria-controls="panelsStayOpen-collapse${accordionIdCounter}">
  
                  <span class="flight-time">
                    ${checkArrivalTime(flight.arr_estimated, flight.arr_time)}
                  </span>
  
                  <span class="flight-number">${flight.airline_iata}  ${flight.flight_number}</span>
                  <span class="flight-status">${flight.status}</span>
                  <span class="flight-iata">${depAirportData.city}
                    <span class="flight-dep-iata">${flight.dep_iata}</span>
                  </span>
                </button>
              </h2>
              <div id="panelsStayOpen-collapse${accordionIdCounter}" class="accordion-collapse collapse "
                aria-labelledby="panelsStayOpen-heading${accordionIdCounter}">
                <div class="accordion-body">
                  <div class="accordion-body-header">
                    <div class="row">
                      <div class="col-md-3">
                        <p class="flight-airport-name fw-bold">${depAirportData.airport_name}</p>
                        <p class="flight-start-town fw-bold">${depAirportData.city}</p>
                        <p class="flight-date text-secondary">${formatDate(flight.arr_time)}</p>
                        <p class="flight-time mt-1">${formatTimePMandAM(flight.arr_time)}</p>
                        <p class="flight-status small ">5:10 AM</p>
                      </div>
                      <div class="col-md-6">
  
                      </div>
                      <div class="col-md-3 text-end">
                        <p class="flight-airport-name fw-bold">DXB Istanbul New Airport</p>
                        <p class="flight-start-town fw-bold">Istanbul</p>
                        <p class="flight-date text-secondary">16 oct</p>
                        <p class="flight-time mt-1">5:10 AM</p>
                        <p class="flight-status small ">5:10 AM</p>
                      </div>
                    </div>
                  </div>
                  <div class="accordion-body-footer">
  
                  </div>
                </div>
              </div>
            `;
            flightList.appendChild(flightListItem);
          });
        });
      } else {
        console.error('Error');
      }
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function () {
  fetchAndDisplayFlights();

  document.querySelector('.schedules-list').addEventListener('click', function (event) {
    if (event.target && event.target.matches('.accordion-button')) {
      const accordionItem = event.target.closest('.accordion-item');

      if (accordionItem) {
        if (!event.target.classList.contains('collapsed')) {
          accordionItem.classList.add('accordion-box-shadow');
        } else {
          accordionItem.classList.remove('accordion-box-shadow');
        }
      }
    }
  });
});





