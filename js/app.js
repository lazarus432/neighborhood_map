// model
var map;
var markers = [];
var largeInfoWindow;
var viewModel;
var bounds;
var attractionsList = [];
var placeMarkers  = [];



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
  name: "Pier 39",
  location: {lat: 37.8096506, lng: -122.410249}
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
  name: "Lombard Street",
  location: {lat: 37.800129, lng: -122.434215}
},
{
  name: "DeYoung Museum",
  location: {lat: 37.7713188, lng: -122.4691383}
},
{
  name: "Exploratorium",
  location: {lat: 37.8008, lng: -122.3986}
},
{
  name: "SFMOMA",
  location: {lat: 37.7857, lng: -122.4011}
},
{
  name: "Angel Island State Park",
  location: {lat: 37.8636, lng: -122.4319}
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
  name: "Golden Gate Park",
  location: {lat: 37.76904, lng: -122.483519}
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
    center: {lat: 37.801663, lng: -122.447909},
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
  self.listLoc = ko.observableArray();

  this.attractionsList = ko.observableArray(attractions);

// listing marker icon
var icon_default = markerIcon('FF4500');
// highlighted icon when hovered over
var icon_highlighted = markerIcon('FFFF33');
// create a search box object
var searchBox = new google.maps.places.SearchBox(
  document.getElementById('places-search'));


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

  searchBox.addListener('places_changed', function() {
    searchBoxPlaces(this);
  });


  // add event listeners to show/hide attractions buttons
  document.getElementById('show-attraction').addEventListener('click', showAttractions);
  document.getElementById('hide-attraction').addEventListener('click', function() {
    hideMarkers(markers);
  });


var filterPoints = function(data) {
  this.name = data.name;
  this.location = data.location;
  this.marker = data.marker;
};

self.markerList = ko.observableArray();
attractions.forEach(function(filterItem) {
self.markerList.push(new filterPoints(filterItem));
});

self.go = ko.observable('');
self.filterList = ko.computed(function() {
  var go = self.go().toLowerCase();
  return ko.utils.arrayFilter(self.markerList(), function(list) {
    var result = (list.name.toLowerCase().search(go) >= 0);
    list.marker.setVisible(result);
    return result;
  });
});

}

// populate info window with attraction information
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


// show attractions function
function showAttractions() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// hide attractions function
function hideMarkers(markers) {
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

function searchBoxPlaces(searchBox) {
  hideMarkers(placeMarkers);
  var places = searchBox.getPlaces();
  if (places.length == 0) {
    window.alert('We did not find any places for that search.');
  } else {
    createMarkers(places);
  }
}


// this function creates markers for each place found in either places search.
function createMarkers(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
    url: place.icon,
    size: new google.maps.Size(20, 20),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(15, 34),
    scaledSize: new google.maps.Size(25, 25)
  };
  // create a marker for each place.
  var marker = new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location,
    id: place.place_id
  });
  // create info window for each place
  var placeInfoWindow = new google.maps.InfoWindow();
  marker.addListener('click', function() {
    if (placeInfoWindow.marker == this) {
      console.log("This infowindow already is on this marker.");
    } else {
      placesDetails(this, placeInfoWindow);
    }
  });
  placeMarkers.push(marker);
  if (place.geometry.viewport) {
    bounds.union(place.geometry.viewport);
  } else {
    bounds.extend(place.geometry.location);
  }
}
map.fitBounds(bounds);
}


function placesDetails(marker, infowindow) {
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      infowindow.marker = marker;
      var innerHTML = '<div>';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>';
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      if (place.formatted_phone_number) {
        innerHTML += '<br>' + place.formatted_phone_number;
      }
      if (place.opening_hours) {
        innerHTML += '<br><br><strong>Hours:</strong><br>' +
          place.opening_hours.weekday_text[0] + '<br>' +
          place.opening_hours.weekday_text[1] + '<br>' +
          place.opening_hours.weekday_text[2] + '<br>' +
          place.opening_hours.weekday_text[3] + '<br>' +
          place.opening_hours.weekday_text[4] + '<br>' +
          place.opening_hours.weekday_text[5] + '<br>' +
          place.opening_hours.weekday_text[6];
      }
      if (place.photos) {
        innerHTML += '<br><br><img src ="' + place.photos[0].getUrl(
          {maxHeight: 100, maxWidth: 200}) + '">';
      }
      innerHTML += '</div>';
      infowindow.setContent(innerHTML);
      infowindow.open(map, marker);
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  });
}