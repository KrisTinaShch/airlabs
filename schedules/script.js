

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





