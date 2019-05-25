// Store our API endpoint inside queryUrl
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var plateBoundariesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(quakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});
function markerSize(mag) {
    return mag *7.5;  
}
function markerColor(mag) {
    if(mag >= 5)
    {
      mColor = "#f06b6b";
    }
    else if(mag >= 4){
      mColor = "#f0a76b";
    }
    else if(mag >= 3){
      mColor = "#f3ba4d";
    }
    else if(mag >= 2){
      mColor = "#e1f34d";
    }
    else if(mag >= 1){
      mColor = "#e1f34d";
    }
    else{
      mColor = "#b7f34d";
    }
    return mColor;  
}
function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>"+ feature.properties.place + "</h3><h4>Magnitude: " + feature.properties.mag + "</h4><hr><p>" + new Date(feature.properties.time) + "</p>"+'<a href="'+feature.properties.url+'" target="_blank">Learn More</a>');
}
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng,{
            radius: markerSize(feature.properties.mag ),
            color: "#999999",
            fillColor: markerColor(feature.properties.mag ),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
  });
  var platesLayer = new L.LayerGroup();
  d3.json(plateBoundariesUrl,function(jsonPlates){
    L.geoJSON(jsonPlates,{
        color:"red",
    }).addTo(platesLayer);
  });
  createMap(earthquakes,platesLayer);
}

function createMap(earthquakes,plates) {
  var satMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    // attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.satellite",
    accessToken: 'pk.eyJ1Ijoiam9yZ2VwaXJlcyIsImEiOiJjanZvajBudGMwYmptNDRxbG95cWU0ZW0yIn0.x51Y6jI0l8i17yi1qdANpA'
  });
  var greyMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    // attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken:'pk.eyJ1Ijoiam9yZ2VwaXJlcyIsImEiOiJjanZvajBudGMwYmptNDRxbG95cWU0ZW0yIn0.x51Y6jI0l8i17yi1qdANpA'
  });
  var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    // attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken:'pk.eyJ1Ijoiam9yZ2VwaXJlcyIsImEiOiJjanZvajBudGMwYmptNDRxbG95cWU0ZW0yIn0.x51Y6jI0l8i17yi1qdANpA'
  });
  var comicMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    // attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.comic",
    accessToken:'pk.eyJ1Ijoiam9yZ2VwaXJlcyIsImEiOiJjanZvajBudGMwYmptNDRxbG95cWU0ZW0yIn0.x51Y6jI0l8i17yi1qdANpA'
  });
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Greyscale": greyMap, 
    "Satillite": satMap,
    "Outdoors": outdoorsMap,
    "Comic":comicMap
  };
  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };
  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.7412, -25.6756
    ],
    zoom: 3,
    layers: [greyMap, earthquakes,plates]
  });

  // Layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var info = L.control({
    position: "bottomright"
  });
   
  info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    return div;
  };
  info.addTo(myMap);
  function updateLegend() {
    document.querySelector(".legend").innerHTML = [
      "<ul>",
      '<li class="mag-0-1"><span></span>&nbsp;0-1</li>',
      '<li class="mag-1-2"><span></span>&nbsp;1-2</li>',
      '<li class="mag-2-3"><span></span>&nbsp;2-3</li>',
      '<li class="mag-3-4"><span></span>&nbsp;3-4</li>',
      '<li class="mag-4-5"><span></span>&nbsp;4-5</li>',
      '<li class="mag-5"><span></span>&nbsp;5+</li>',
      '</ul>'
    ].join("");
   
  }
  updateLegend();
}
