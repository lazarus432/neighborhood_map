// model

var map;
var markers = [];
var largeInfoWindow;
var viewModel;
var bounds;
var attractionsList = [];


var attractions = [
{
  name: "",
  location: {}
},
{
  name: "",
  location: {}
},
{
  name: "",
  location: {}
},
{
  name: "",
  location: {}
},
{
  name: "",
  location: {}
}
];


// octopus


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.733795, lng: -122.446747},
    zoom: 13
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
}
