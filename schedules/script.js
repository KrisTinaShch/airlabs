
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


function checkArrivalTime(estimated_time, exact_time){
  let time_estimated_format;
  let exact_time_format;
  if(estimated_time && exact_time){
      const estimated_time_date= new Date(estimated_time);
      const exact_time_date = new Date(exact_time);
    
      const hoursEstimated = estimated_time_date.getHours();
      const minutesEstimated = estimated_time_date.getMinutes();

      const hoursExact = exact_time_date.getHours();
      const minutesExact = exact_time_date.getMinutes();

      time_estimated_format = hoursEstimated.toString().padStart(2, '0') + ':' + minutesEstimated.toString().padStart(2, '0');
      exact_time_format = hoursExact.toString().padStart(2, '0') + ':' + minutesExact.toString().padStart(2, '0');

  }
  return typeof estimated_time === "undefined" ? exact_time : `${time_estimated_format} <span class="text-decoration-line-through">${exact_time_format}</span>`;
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
        data.response.forEach(flight => {
          accordionIdCounter++;
          const flightListItem = document.createElement('div');
          flightListItem.className = 'accordion-item';
          flightListItem.innerHTML = `
            <h2 class="accordion-header" id="panelsStayOpen-heading${accordionIdCounter}">
              <button class="accordion-button" type="button" data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapse${accordionIdCounter}" aria-expanded="true" aria-controls="panelsStayOpen-collapse${accordionIdCounter}">

                <span class="flight-time">
                
                ${checkArrivalTime(flight.arr_estimated,flight.arr_time)}
                
                </span>

                <span class="flight-number">${flight.airline_iata}  ${flight.flight_number}</span>
                <span class="flight-status">${flight.status}</span>
                <span class="flight-start-place flight-iata">${flight.flight_number} ${flight.dep_iata}</span>
              </button>
            </h2>
            <div id="panelsStayOpen-collapse${accordionIdCounter}" class="accordion-collapse collapse "
              aria-labelledby="panelsStayOpen-heading${accordionIdCounter}">
              <div class="accordion-body container-fluid">
                <div class="accordion-body-header">
                  <div class="row">
                    <div class="col-md-3">
                      <p class="flight-airport-name fw-bold">Tivat Airport DXB</p>
                      <p class="flight-start-town fw-bold">Tivat</p>
                      <p class="flight-date text-secondary">16 oct</p>
                      <p class="flight-time mt-1">5:10 AM</p>
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
      } else {
        console.error('Error');
      }
    })
    .catch(error => console.error('Error:', error));
    
}

document.addEventListener('DOMContentLoaded', function() {
  fetchAndDisplayFlights();

  document.querySelector('.schedules-list').addEventListener('click', function(event) {
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





