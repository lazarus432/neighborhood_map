
 $(function() {

 	var $weather = $('#weather');

	$.ajax({
		type: "GET",
		url: 'http://api.openweathermap.org/data/2.5/weather?lat=37.733795&lon=-122.446747&APPID=49f75f46bfbc60e9a7edf7760cc11716&units=imperial',
		success: function(weather) {
			$weather.append('<li><h3>Current Temperature: </h3>' + weather.main.temp + ' degrees</li>');
			$weather.append("<li><h3>High: </h3>" + weather.main.temp_max + ' degrees</li>');
			$weather.append("<li><h3>Low: </h3>" + weather.main.temp_min + ' degrees</li>');
		},
		error: function() {
			alert("Coundn't retrieve current weather.")
		}
	});
});

