// model
var map;
var markers = [];
var viewModel;
var bounds;
var attractionsList = [];
var placeMarkers  = [];
var infowindow;


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
];

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.801663, lng: -122.447909},
    styles: styles,
    mapTypeControl: false,
    zoom: 12
  });

  bounds = new google.maps.LatLngBounds();
  ViewModel = new ViewModel();
  ko.applyBindings(ViewModel);
  infowindow = new google.maps.InfoWindow();
}

var mapError =  function() {
  alert('Error loading Google Maps!');
};


var ViewModel = function() {
  var self = this;
  this.attractionsList = ko.observableArray(attractions);



  var iconHighlighted = markerIcon('C6E2FF');
  // listing marker icon
  var iconDefault = markerIcon('FF4500');
  // highlighted icon when hovered over
  var currentIcon = markerIcon('FFFF33');
  // create a search box object
  var searchBox = new google.maps.places.SearchBox(
    document.getElementById('places-search'));



function clickListener(marker) {
  populateInfoWindow(this, infowindow);
  this.setIcon(currentIcon);
}

function mouseoverListener() {
    this.setIcon(iconHighlighted);
}

function mouseoutListener() {
    this.setIcon(iconDefault);

}

function toggleBounce(marker) {
  marker.setAnimation() !== null;
  marker.setAnimation(null);
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
    marker.setIcon(iconDefault);
    }, 2500);

}

  // use attractions array to create an array of markers on initialize
  for (var i = 0; i < attractions.length; i++) {
    var position = attractions[i].location;
    var title = attractions[i].name;

    // create a marker per attraction and put in markers array
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      name: attractions[i].name,
      icon: iconDefault,
      animation: google.maps.Animation.DROP,
      id: attractions[i].placeID
    });

    this.attractionsList()[i].marker = marker;
    // push marker to empty markers array
    markers.push(marker);
    // extend boundaries for each marker
    bounds.extend(marker.position);


    marker.addListener('click', clickListener);
    marker.addListener('mouseover', mouseoverListener);
    marker.addListener('mouseout', mouseoutListener);

  }

    this.showClicked = function(position) {
      google.maps.event.trigger(position.marker, 'click');
      toggleBounce(position.marker);
    };

    this.showMarkers = function(markers) {
      google.maps.event.trigger(markers, 'click');
    };
  
    searchBox.addListener('places_changed', function() {
    searchBoxPlaces(this);
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

};

// get street view information 
function getStreetView(data, status) {
  if (status == google.maps.StreetViewStatus.OK) {
    var nearStreetViewLocation = data.location.latLng;
    var heading = google.maps.geometry.spherical.computeHeading(
      nearStreetViewLocation, nearStreetViewLocation);
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
    infowindow.setContent('<div style = "text-align:center">' + titleContent + '<p>No Street View Image Found</p>' + ' </div>');
  }
}


// get foursquare information
var fourSquare = function(marker) {

  $.ajax({
    url: 'https://api.foursquare.com/v2/venues/' + marker.id + '?client_id=4XA3L1IFJEI02HKE03NKRML1SHMD4VO5VGKLHUYWJ05QGJ4K&client_secret=BQNQFXJ0PZZTIMQBATLVI2VOSNHVHJ02OJUBG0GWXJCOUWQE&v=20170921',
    success: function(data) {
      var rating = data.response.venue.rating || 'No Rating Available';
      var name = data.response.venue.name; 
      var likes = data.response.venue.likes.count;
      var location = data.response.venue.location.address || 'No Address Available';

      streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      titleContent = '<strong>' + name + 
        '</strong><br><strong>Rating:</strong> ' + rating + "<br><strong>Address:</strong> " + 
        location + '<br><strong>Likes:</strong> ' + likes + '<div id="pano"></div>';
      infowindow.setContent('<div style = "text-align: center"><strong>' + name + 
        '</strong><br><strong>Rating:</strong> ' + rating + "<br><strong>Address:</strong> " + 
        location + '<br><strong>Likes:</strong> ' + likes + '<div id="pano"></div>');
      infowindow.open(map, marker);

      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    },
    error: function() {
      alert("Unable to retrieve information from Foursquare.");
    }
  });
};

// populate info window foursquare and weather information
function populateInfoWindow(marker, infowindow) {
    fourSquare(marker);
}

// hide markers function
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
  if (places.length === 0) {
    window.alert('We did not find any places for that search.');
  } else {
    createMarkers(places);
  }
}

function clickAddListener() {
  placesDetails(this, infowindow);
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

  var placeInfoWindow = new google.maps.InfoWindow();
  marker.addListener('click', clickAddListener);
  placeMarkers.push(marker);
  if (place.geometry.viewport) {
    bounds.union(place.geometry.viewport);
  } else {
    bounds.extend(place.geometry.location);
  }
}
google.maps.event.addDomListener(window, 'resize', function() {
  map.fitBounds(bounds);
});
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
      infowindow.addListener('click', function() {
        infowindow.marker = null;
      });
    }
  });
}