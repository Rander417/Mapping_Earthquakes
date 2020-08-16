// Add console.log to check to see if our code is working.
console.log("working");

// Street map tile layer
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: mapBox_key 
});

// Satellite-Streets map tile layer
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: mapBox_key 
});

// Tectonic map tile layer - change this to a new style
let dark_style = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: mapBox_key 
});


// Create a base layer that holds both maps
let baseMaps = {
  "Streets": streets,
  "Satellite Streets": satelliteStreets,
  "Dark": dark_style
};

// Create the earthquake & tectonic layers for our map
let earthquakes = new L.layerGroup();
let tectonic = new L.layerGroup();

// Object that contains the overlays
// These overlays will be visible all the time
let overlays = {
	Earthquakes: earthquakes,
	"Tectonic Plates": tectonic
  };

let map = L.map('mapid', {
	center: [39.5, -18.5],
	zoom: 2.5,
	layers: [streets]
})

// Then we add a control to the map that will allow the user to change
// which layers are visible
L.control.layers(baseMaps, overlays).addTo(map);

// Access the earthquake and tectonic plate data
let earthquakes7Days = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Processing the earthquake GeoJSON
d3.json(earthquakes7Days).then(function(data) {

	// This function returns the style data for each of the earthquakes we plot on
	// the map. We pass the magnitude of the earthquake into a function
	// to calculate the radius.
	function styleInfo(feature) {
		return {
			opacity: 1,
			fillOpacity: 1,
			fillColor: getColor(feature.properties.mag),
			color: "#000000",
			radius: getRadius(feature.properties.mag),
			stroke: true,
			weight: 0.5
		};
	}

	// This function determines the color of the circle based on the magnitude of the earthquake
	function getColor(magnitude) {
		if (magnitude > 5) {
		return "#ea2c2c";
		}
		if (magnitude > 4) {
		return "#ea822c";
		}
		if (magnitude > 3) {
		return "#ee9c00";
		}
		if (magnitude > 2) {
		return "#eecc00";
		}
		if (magnitude > 1) {
		return "#d4ee00";
		}
		return "#98ee00";
	}

	// This function determines the radius of the earthquake marker based on its magnitude
	// Earthquakes with a magnitude of 0 will be plotted with a radius of 1
	function getRadius(magnitude) {
		if (magnitude === 0) {
		return 1;
		}
		return magnitude * 4;
	}


	// Creating a GeoJSON layer with the retrieved data
	L.geoJson(data, {
		// We turn each feature into a circleMarker on the map
		pointToLayer: function(feature, latlng) {
			return L.circleMarker(latlng);
		},
		// Set the style for each circleMarker using styleInfo function
		style: styleInfo,
		// Create a popup for each circleMarker to display the magnitude and
		// location of the earthquake after the marker has been created and styled
		onEachFeature: function(feature, layer) {
		layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
		}
	}).addTo(earthquakes);

	// Create a legend control object
	let legend = L.control({
		position: "bottomright"
	});

	// Add all the details for the legend
	legend.onAdd = function() {
		let div = L.DomUtil.create("div", "info legend");
		const magnitudes = [0, 1, 2, 3, 4, 5];
		const colors = [
		"#98ee00",
		"#d4ee00",
		"#eecc00",
		"#ee9c00",
		"#ea822c",
		"#ea2c2c"
		];
		// Looping through our intervals to generate a label with a colored square for each interval
		for (var i = 0; i < magnitudes.length; i++) {
			div.innerHTML +=
			"<i style='background: " + colors[i] + "'></i> " +
			magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
		}
		return div;
		};

	legend.addTo(map);

	earthquakes.addTo(map);
});
// END earthquake //////////////////////////////////////////////////

// Processing the tectonic GeoJSON
d3.json(tectonicData).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data,{color: "purple"}).addTo(tectonic);
  tectonic.addTo(map);
});