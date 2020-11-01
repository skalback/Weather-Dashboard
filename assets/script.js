$(document).ready(function(){
  
  // Save value of city from search bar
  let city = $("#citySearch").val();
  // Save api key
  let apiKey = "&appid=6ba589b21bbb52f13e281c56852c059d";
  // Create date variable 
  let date = new Date();


  $("#citySearch").keypress(function(event) { 
    // Recognizes enter key 
    if (event.keyCode === 13) { 
      console.log("search with enter key");
      event.preventDefault();
      $("#searchBtn").click(); 
        
    } 
  });


  $("#searchBtn").on("click", function() {
    
    // When search button is clicked, display 5 day forecast
    $("#forecastH5").addClass("show");

    // Grab city from search bar
    city = $("#citySearch").val();
    
    // Empty search bar
    $("#citySearch").val("");  

    //Create variable to call API dynamically based on the current searched city and API key
    const queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + apiKey;

    // Get current city data via API
    $.ajax({
      url: queryUrl,
      method: "GET"
    })
    .then(function (response){

      //console.log(response);

      displayCurrentWeather(response);
      displayForecast(response);
      addToHistory();

    })
  });

  function addToHistory() {
    
    // Search history
    let listItem = $("<li>").addClass("list-group-item").text(city);
    $(".list").append(listItem);

  }

  function displayCurrentWeather(response) {

      // Get temperature and convert to Farenheit
      let tempF = tempToFarenheit(response.main.temp);
      //console.log("tempF: " + tempF + " temp: " + tempToFarenheit(response.main.temp));

      $('#currentCity').empty();

      // Add HTML to city's weather results
      const card = $("<div>").addClass("card");
      const cardBody = $("<div>").addClass("card-body");
      const city = $("<h4>").addClass("card-title").text(response.name);
      const cityDate = $("<h4>").addClass("card-title").text(date.toLocaleDateString("en-US"));
      const weatherIcon = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
      const temperature = $("<p>").addClass("card-text current-temp").text("Temperature: " + tempF + " °F");
      const humidity = $("<p>").addClass("card-text current-humidity").text("Humidity: " + response.main.humidity + "%");
      const wind = $("<p>").addClass("card-text current-wind").text("Wind Speed: " + response.wind.speed + " MPH");
      
      const lat = response.coord.lat;
      const lon = response.coord.lon;

      displayUVindex (lat, lon);

      //Add to page
      city.append(cityDate, weatherIcon)
      cardBody.append(city, temperature, humidity, wind);
      card.append(cardBody);
      $("#currentCity").append(card)
    
  }

  function tempToFarenheit (temp) {
      let tempF = ((temp - 273.15) * 1.80 + 32);
      tempF = Math.floor(tempF);
      return tempF;
  }

  function displayForecast () {
    
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + apiKey,
      method: "GET"
    }).then(function (response){

      $('#forecast').empty();

      let results = response.list;
      console.log(results);
    
      for (let i = 0; i < results.length; i++) {
  
        // Results are given in 3 hr increments; using the 12pm result for the day
        if(results[i].dt_txt.indexOf("12:00:00") !== -1){

          // get the temperature and convert to fahrenheit 
          let tempF = tempToFarenheit(results[i].main.temp);

          const card = $("<div>").addClass("card col-md-2 ml-4 bg-primary text-white");
          const cardBody = $("<div>").addClass("card-body p-3 forecastBody");
          const cityDate = $("<h4>").addClass("card-title").text(new Date(results[i].dt_txt).toLocaleDateString('en-US'));
          const temperature = $("<p>").addClass("card-text forecastTemp").text("Temperature: " + tempF + " °F");
          const humidity = $("<p>").addClass("card-text forecastHumidity").text("Humidity: " + results[i].main.humidity + "%");

          const weatherIcon = $("<img>").attr("src", "https://openweathermap.org/img/w/" + results[i].weather[0].icon + ".png")

          cardBody.append(cityDate, weatherIcon, temperature, humidity);
          card.append(cardBody);
          $("#forecast").append(card);

        }
      }
    });

  }

  function displayUVindex (lat, lon) {
    
    // API call to obtain UV data
    $.ajax({
      url: "http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + apiKey,
      method: "GET"
    }).then(function (response){
      let uv = $("<p>").text("UV Index: ");
      let btn = $("<span>").addClass("btn btn-primary btn-sm").text(response.value);

      // UV index scale found via this link:
      // https://19january2017snapshot.epa.gov/sunsafety/uv-index-scale-1_.html#:~:text=11%20or%20more%3A%20Extreme,eyes%20can%20burn%20in%20minutes.&text=and%204%20p.m.-,If%20outdoors%2C%20seek%20shade%20and%20wear%20protective%20clothing%2C%20a%20wide,%2C%20and%20UV%2Dblocking%20sunglasses.
      
      // Change colors according to different UV values
      if (response.value < 3) {
        btn.addClass("btn-success");
      }
      else if (response.value < 7) {
        btn.addClass("btn-warning");
      }
      else {
        btn.addClass("btn-danger");
      }
      
      $("#currentCity .card-body").append(uv.append(btn));
    });
  }

});
