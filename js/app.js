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
  name: "Golden Gate Bridge",
  location: {lat: 37.8197222, lng: -122.4788889}
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
},
{
  name: "AT&T Park",
  location: {lat: 37.778644, lng: -122.38938}
},
{
  name: "San Fransisco Zoo",
  location: {lat: 37.732956, lng: -122.502953}
},
{
  name: "California Academy of Sciences",
  location: {lat: 37.7699, lng: -122.4661}
}
];


// create a new map view 
function initMap() {
  // create styles array to use with the map
  var styles = [
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#C6E2FF"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#C5E3BF"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#D1D1B8"
            }
        ]
    }
]
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.8102062, lng: -122.4180268},
    styles: styles,
    mapTypeControl: false,
    zoom: 12
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

// listing marker icon
var icon_default = markerIcon('5C5CAF');
// highlighted icon when hovered over
var icon_highlighted = markerIcon('FFFF33');

  // use attractions array to create an array of markers on initialize
  for (var i = 0; i < attractions.length; i++) {
    var position = attractions[i].location;
    var title = attractions[i].name;

    // create a marker per attraction and put in markers array
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      name: attractions[i].name,
      icon: icon_default,
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
    marker.addListener('mouseover', function() {
      this.setIcon(icon_highlighted);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(icon_default);
    });
  }

  // add event listeners to show/hide attractions buttons
  document.getElementById('show-attraction').addEventListener('click', showAttractions);
  document.getElementById('hide-attraction').addEventListener('click', hideAttractions);


// populate info window with attraction name
function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.name + '</div>');
    infowindow.open(map,marker);

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;

      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div>' + marker.name + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: 150,
                pitch: 20
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div>' + marker.name + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
      // use streetview service to get the closest streetview image within
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
  }
}

// show attractions function
function showAttractions() {
  var bounds = bounds;
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
  //map.fitBounds(bounds);
}

// hide attractions function
function hideAttractions() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// takes in a color and creates a new marker icon of that color.
function markerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}
