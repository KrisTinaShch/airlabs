const accordionButton = document.querySelector('.accordion-button');
const accordionItem = document.querySelector('.accordion-item');
const accordionCollapse = document.querySelectorAll('.accordion-collapse');
const currentUTCTime1 = new Date();
const currentUTCTime = `${currentUTCTime1.getUTCHours()}:${currentUTCTime1.getUTCMinutes()}`
console.log(`${currentUTCTime1.getUTCHours()}:${currentUTCTime1.getUTCMinutes()}`);

// accordionButton.addEventListener("click", () => {
//   if (!accordionButton.classList.contains('collapsed')) {
//     accordionItem.classList.add('accordion-box-shadow');
//   } else {
//     accordionItem.classList.remove('accordion-box-shadow');
//   }
// });


// window.addEventListener('resize', check);


const { iata, api_key } = getQueryVariables();
const arrivalsLink = `https://airlabs.co/api/v9/schedules?arr_iata=${iata}&api_key=${api_key}`;
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
  await createAccordionItems(dataArrivals);
};


async function getAirportName(iata) {
  const response = await fetch(`https://airlabs.co/api/v9/airports?iata_code=${iata}&api_key=${api_key}`);
  const data = await response.json();

  if (data.response && data.response.length > 0) {
    const airportData = {
      iata: data.response[0].iata_code,
      city: data.response[0].city,
      airport_name: data.response[0].name,
    };
    localStorage.setItem(`airport_${iata}`, JSON.stringify(airportData));
    return airportData;
  } else {
    return null;
  }
}

async function createAccordionItems(data, counter = "0") {
  const accordion = document.querySelector('.accordion');
  const fragment = document.createDocumentFragment();
  for (const item of data.response) {
    counter++;
    const itemMarkup = await generateAccordionItemMarkup(item, counter);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = itemMarkup;
    fragment.appendChild(tempDiv.firstElementChild);

  }
  accordion.appendChild(fragment);

  const accordionItems = document.querySelectorAll('.accordion-collapse');
  accordionItems.forEach((item) => {
    if (window.innerWidth < 768) {
      item.classList.add('show');
    } else {
      item.classList.remove('show');
    }
  });


}



async function generateAccordionItemMarkup(item, counter) {
  const airportDataDep = await getAirportName(item.dep_iata);
  const airportArrivalsInfo = JSON.parse(localStorage.getItem(`airport_${iata}`)) || await getAirportName(item.arr_iata);
  const flightStatus = checkFlightStatus(item.status);
  const depUTCTimeNom = new Date(item.dep_estimated);
  const arrUTCTimeNom = new Date(item.arr_estimated);
  const depUTCTime = new Date(item.dep_estimated_utc);
  const arrUTCTime = new Date(item.arr_estimated_utc);
  if (item.dep_estimated_utc) {
    if (item.arr_estimated_utc) {
      

      console.log(`${depUTCTime.getUTCHours()}:${depUTCTime.getUTCMinutes()}(${depUTCTimeNom.getUTCHours()}:${depUTCTimeNom.getUTCMinutes()}) - ${item.airline_iata} ${item.flight_number} - ${arrUTCTime.getUTCHours()}:${arrUTCTime.getUTCMinutes()}(${arrUTCTimeNom.getUTCHours()}:${arrUTCTimeNom.getUTCMinutes()}) === ${currentUTCTime}`);

    }
  }

  
  return `
        <div class="accordion-item px-0 px-sm-3">
    <h2 class="accordion-header d-none d-md-block " id="panelsStayOpen-heading${counter}">
        <button class="accordion-button p-0 py-3 " type="button" data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapse${counter}" aria-expanded="true"
            aria-controls="panelsStayOpen-collapse${counter}">
            <span class="fw-normal">${checkArrivalTime(item.arr_estimated, item.arr_time)}</span>
            <span class="blue-font">${item.airline_iata} ${item.flight_number}</span>
            <span
                class="flight-status d-none d-md-block rounded fw-bold text-center ${flightStatus}">${item.status}</span>
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
                            <div class="airport-name d-none d-md-block fw-bold">
                                ${airportDataDep.airport_name}
                                <span class="airport-code">${item.dep_iata}</span>
                            </div>
                            <div class="city-name fw-bold">${airportDataDep.city}</div>
                            <div class="date text-muted">${formatDate(item.dep_time)}</div>
                            <div class="time fw-normal">${checkArrivalTime(item.dep_estimated, item.dep_time)}</div>
                            <div class="flight-delay fw-normal text-danger text-decoration-line-through">
                                ${formatTime(item.dep_time)}</div>
                            <div class="country-code d-block d-md-none blue-iata-mobile ">${item.dep_iata}</div>
                        </div>
                        <div class="col-md-8 col-6 mx-md-auto d-flex flex-column align-items-center gap-1 p-0 justify-content-center">
                            <div class="flight-flag mb-2">
                                <img src="https://airlabs.co/img/airline/m/${item.airline_iata}.png" alt="" class="rounded-circle">
                            </div>
                            <div class="flight-line position-relative">
                                <img src="../images/plane-trip.svg" alt="" class="plane-image ${flightStatus}" style="${flightStatus == "active" ? getActiveFlightPostion(item.dep_estimated_utc) : flightStatus}">
                            </div>
                            <div class="text-muted mt-2 flight-info">${toHoursAndMinutes(item.duration)}</div>
                            <div class="text-muted flight-info">${item.airline_iata} ${item.flight_number}</div>
                        </div>
                        <div class="col-md-2 col-2 p-0 text-end ">
                            <div class="airport-name d-none d-md-block fw-bold">${airportArrivalsInfo.airport_name}
                                <span class="airport-code">${item.arr_iata}</span></div>
                            <div class="city-name fw-bold">${airportArrivalsInfo.city}</div>
                            <div class="date text-muted">${formatDate(item.arr_time)}</div>
                            <div class="time fw-normal"> ${checkArrivalTime(item.arr_estimated, item.arr_time)}</div>
                            <div class="flight-delay fw-normal text-danger text-decoration-line-through">
                                ${formatTime(item.arr_time)}</div>
                            <div
                                class="flight-status rounded fw-bold text-center d-block d-md-none ${flightStatus}">
                                ${item.status}</div>
                            <div class="country-code d-block d-md-none blue-iata-mobile float-end">${item.arr_iata} </div>
                        </div>
                        <div class="col-md-12 mt-4 d-none d-md-block p-0 pb-3">
                            <div class="d-flex gap-5 justify-content-between">
                                <div class="d-flex gap-3 border rounded">
                                    <div class="p-2 pe-4 border-end">
                                        <p class="text-muted">Terminal</p>
                                        <p class="fw-bold">${item.dep_terminal}</p>
                                    </div>
                                    <div class="p-2 pe-4">
                                        <p class="text-muted">Gate</p>
                                        <p class="fw-bold">${item.dep_gate}</p>
                                    </div>
                                </div>

                                <div class="d-flex gap-3 border rounded">
                                    <div class="p-2 pe-4 border-end">
                                        <p class="text-muted">Terminal</p>
                                        <p class="fw-bold">${item.arr_terminal}</p>
                                    </div>
                                    <div class="p-2 pe-4 border-end">
                                        <p class="text-muted">Gate</p>
                                        <p class="fw-bold">${item.arr_gate}</p>
                                    </div>
                                    <div class="p-2 pe-4">
                                        <p class="text-muted">Baggage Claim</p>
                                        <p class="fw-bold">${item.arr_baggage}</p>
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

function getActiveFlightPostion(depUTCTime) {
  // console.log(depUTCTime);
}

function formatTime(date_string) {
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

function toHoursAndMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hr ${minutes > 0 ? ` ${minutes} min` : ''}`;
}



document.addEventListener('DOMContentLoaded', (event) => {
  fetchData();
});





