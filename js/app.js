// model
var map;
var markers = [];
var largeInfoWindow;
var viewModel;
var bounds;
var attractionsList = [];

// populate attractions array with name and lat longs 
var attractions = [
{
  name: "Golden Gate Park",
  location: {lat: 37.76904, lng: -122.483519}
},
{
  name: "Fisherman's Wharf",
  location: {lat: 37.8102062, lng: -122.4180268}
},
{
  name: "Alcatraz Island",
  location: {lat: 37.826039, lng: -122.4219159}
},
{
  name: "Transamerica Pyramid",
  location: {lat: 37.794651, lng: -122.4030265}
},
{
  name: "Palace of Fine Arts",
  location: {lat: 37.801663, lng: -122.447909}
}
];


// create a new map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.733795, lng: -122.446747},
    zoom: 11
  });

  largeInfoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  view_model = new view_model();
  ko.applyBindings(view_model);

}


// view model
var view_model = function() {
  var self = this;
  this.attractionsList = ko.observableArray(attractions);

  // use attractions array to create an array of markers on initialize
  for (var i = 0; i < attractions.length; i++) {
    var position = attractions[i].location;
    var title = attractions[i].name;

    // create a marker per attraction and put in markers array
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      name: attractions[i].name,
      animation: google.maps.Animation.DROP,
      id: attractions[i]
    });

    this.attractionsList()[i].marker = marker;
    // push marker to empty markers array
    markers.push(marker);
    // extend boundaries for each marker
    bounds.extend(marker.position);
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfoWindow);
    });
  }
  // add event listeners to show/hide attractions buttons
  document.getElementById('show-attraction').addEventListener('click', showAttractions);
  document.getElementById('hide-attraction').addEventListener('click', hideAttractions);

// populate info window with attraction name
function populateInfoWindow(marker, InfoWindow) {
  if (InfoWindow.marker != marker) {
    InfoWindow.marker = marker;
    InfoWindow.setContent('<div>' + marker.name + '</div>');
    InfoWindow.open(map,marker);

    InfoWindow.addListener('closeclick', function() {
      InfoWindow.marker = null;
    });
  }
}

// show attractions function
function showAttractions() {
  var bounds = bounds;
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
  map.fitBounds(bounds);
}

// hide attractions function
function hideAttractions() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
}
