const apiKey = config.API_KEY;
const urlPrefix = 'https://api.openweathermap.org/data/2.5/weather'

let lastSearchedCity;
if (localStorage.getItem('lastSearchedCity') !== 'null') {
    lastSearchedCity = localStorage.getItem('lastSearchedCity');
    // Run the ajax API query for the current weather
    queryWeather(urlPrefix + 'weather?q=' + lastSearchedCity + '&units=imperial&appid=' + apiKey, 'Current Weather');
    // Run the ajax API query for the 5 day forecast
    queryWeather(urlPrefix + 'forecast?q=' + lastSearchedCity + '&units=imperial&appid=' + apiKey, '5 Day Forecast');
}
// $(".saveBtn").on("click", function() {
//     let input = $(this).siblings(".description").val();
//     let time = $(this).parent().attr("id");
//     localStorage.setItem(time, input)
// })

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(currentPosition) {
        let lat = currentPosition.coords.latitude;
        let lon = currentPosition.coords.longitude;
        // Run the ajax API query for the current weather
        queryWeather(urlPrefix + 'weather?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=' + apiKey, 'Current Weather');
        // Run the ajax API query for the 5 day forecast
        queryWeather(urlPrefix + 'forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=' + apiKey, '5 Day Forecast');
    });
}

let cityList = [];
// Retrieve data from localStorage.
if (localStorage.getItem('cityList') !== null) {
    cityList = JSON.parse(localStorage.getItem('cityList'));
}

// Populate the list of cities from local storage
for (let i = 0; i < cityList.length; i++) {
    populateCityList(cityList[i]);
}

function populateCityList(city) {
    let newCity = $('<li class="list-group-item">').text(city)
    $('#city-list').prepend(newCity);
}

// Search button event handler
$('#search-button').on('click', function(e) {
    e.preventDefault();

    // Check to see if a city has been entered
    if ($('#city-input').val() === '') {
        alert('Please enter a city in the search field on the left.');
        return;
    }

    // Run the ajax API query for the current weather
    queryWeather(urlPrefix + 'weather?q=' + $('#city-input').val() + '&units=imperial&appid=' + apiKey, 'Current Weather');
    // Run the ajax API query for the 5 day forecast
    queryWeather(urlPrefix + 'forecast?q=' + $('#city-input').val() + '&units=imperial&appid=' + apiKey, '5 Day Forecast');
});

// Event handler for clicking on the city list <li>s
$('#city-list').on('click', '.list-group-item', function() {
    // Run the ajax API query for the current weather
    queryWeather(urlPrefix + 'weather?q=' + $(this).text() + '&units=imperial&appid=' + apiKey, 'Current Weather');
    // Run the ajax API query for the 5 day forecast
    queryWeather(urlPrefix + 'forecast?q=' + $(this).text() + '&units=imperial&appid=' + apiKey, '5 Day Forecast');
});

$('#clear-cities').on('click', function() {
    cityList = [];
    localStorage.clear();
    $('#city-list').empty();
});

function queryWeather(queryURL, queryType) {
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function(response) {
        if (queryType === 'Current Weather') {
            populateCurrentWeather(response);
            // Run the ajax API query for the UV Index
            let lat = response.coord.lat;
            let lon = response.coord.lon;
            queryWeather(urlPrefix + 'uvi?&lat=' + lat + '&lon=' + lon + '&appid=' + apiKey, 'UV Index');
        } else if (queryType === 'UV Index') {
            $('#uv-p').removeClass('d-none');
            $('#uv-index').text(response.value);
        } else {
            console.log(response);
            populateForecast(response);
        }
    });
}

function populateCurrentWeather(response) {
    localStorage.lastSearchedCity = response.name;
    $('#city-name').text(response.name + ' ' + moment().format('l'));
    $('#weather-icon').attr({
        'src': 'https://openweathermap.org/img/wn/' + response.weather[0].icon + '.png',
        'alt': response.weather[0].description
    });

    $('#temp').text('Temperature: ' + response.main.temp + ' °F');
    $('#humidity').text('Humidity: ' + response.main.humidity + '%');
    $('#wind-speed').text('Wind Speed: ' + response.wind.speed + ' MPH');

    // Add the new city to the city list
    if (!cityList.includes(response.name)) {
        cityList.push(response.name);
        populateCityList(response.name);
        localStorage.cityList = JSON.stringify(cityList);
    }
}

function populateForecast(response) {
    $('#forecast').empty();

    let futureDays = 1;
    for (let i = 7; i < response.list.length; i += 8) {
        let newCard = $('<div class="card text-white bg-primary col">');
        let cardBody = $('<div class="card-body">');

        cardBody.append($('<h5 class="card-title">').text(moment().add(futureDays, 'days').format('l')));
        futureDays++;
        let img = $('<img>').attr({
            src: 'https://openweathermap.org/img/wn/' + response.list[i].weather[0].icon + '.png',
            alt: response.list[i].weather[0].description
        });
        cardBody.append(img);
        cardBody.append($('<p class="card-text">').text('Temp: ' + response.list[i].main.temp + ' °F'));
        cardBody.append($('<p class="card-text">').text('Humidity: ' + response.list[i].main.humidity + '%'));

        newCard.append(cardBody);
        $('#forecast').append(newCard);
    }
}