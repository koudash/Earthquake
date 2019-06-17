// Data url for all earthquakes in the past 7 days from USGS
const eqUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
// Data url for tectonic plates
      tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Array of legend color info
let colorScale = [
  {"mathTruncNum": 0,
  "color": "greenyellow"},
  {"mathTruncNum": 1,
  "color": "yellow"}, 
  {"mathTruncNum": 2,
  "color": "goldenrod"},
  {"mathTruncNum": 3,
  "color": "darkorange"},
  {"mathTruncNum": 4,
  "color": "lightcoral"},
];




Promise.all([
  d3.json(eqUrl),
  d3.json(tectonicPlatesUrl)
]).then((data) => {

  
  // 
  let tectonicBndr = L.geoJson(data[1], {
    color: "orange",
    weight: 2
  });

  // Variable for features array
  let features = data[0].features;

  // Create GeoJSON layers
  let earthquakes = L.geoJSON(features, {

    pointToLayer: (feature, latlng) => {
      return new L.circle(latlng, {
        raidus: radiusPuller(feature),
        fillColor: colorPuller(feature),
        fillOpacity: 1,
        stroke: true,
        weight: 0.5
      });
      console.log(radius);
      
    },
    
    onEachFeature: (feature, layer) => {

      layer.on({
        mouseover: (e) => {
          layer = e.target;
          layer.setStyle({
            radius: 150000,
            fillColor: "black"
          });
          layer.openPopup();
        },
        mouseout: (e) => {
          layer = e.target;
          layer.setStyle({
            radius: radiusPuller(feature),
            fillColor: colorPuller(feature)
          });
          layer.closePopup();
        } 
      });

      layer.bindPopup(`<h5>${feature.properties.place}</h5><hr>
      <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
      <p><strong>Time:</strong> ${new Date(feature.properties.time)}</p>`);

    }

  });

  // Define map layers
  let streetsSatelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
  }),
      lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
      }),
      outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
      });

  
  // Define "baseMaps" object to hold base layers
  let baseMaps = {
    "Satellite": streetsSatelliteMap,
    "Grayscale": lightMap,
    "Outdoors": outdoorMap
  };

  // Create overlay object to hold overlay layers
  let overlayMaps = {
    "Fault Lines": tectonicBndr,
    "Earthquakes": earthquakes
  }; 
  
  // Leaflet default map
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [streetsSatelliteMap, tectonicBndr, earthquakes]
  });

  // Create a layer control and add it to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);



  /**
   * Determine the visualization color for each datapoint based on its magnitude point value
   * @param {*} feature feature of each datapoint retrieved from earthquake url
   */
  function colorPuller(feature) {
  
    // Calculate the integer part of the mag figure
    let magTrunc = Math.trunc(feature.properties.mag);
  
    // Variable for the visualization color of each datapoint on the map
    let color = "";
  
    // Determine color
    if (magTrunc >= 5) {
      color = "orangered";  
    } else {
      colorScale.forEach((score) => {
        if (score.mathTruncNum === magTrunc) color = score.color;
      });
    }
    
    return color;
  
  }
  
  /**
   * Determine the radius (relative) of circle for each datapoint based on its magnitude point value
   * @param {*} feature feature of each datapoint retrieved from earthquake url
   */
  function radiusPuller(feature) {  
   
    return feature.properties.mag * 20000;
  }

});




