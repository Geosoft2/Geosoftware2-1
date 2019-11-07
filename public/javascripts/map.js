// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";


/**
* @desc Geosoftware 2;
* apllication for changing the cursor
*/



/**
* @desc create map
*/
function map(){
    var startpoint = [52.26524,7.72767];

    var map = L.map('mapdiv',{
    attributionControl: true})
    .setView(startpoint, 13);

    //OSM
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //OSM
    var grey = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: '&copy; <a href="https://www.google.com/intl/de_de/help/terms_maps/">GoogleMaps</a> contributors'
    }).addTo(map);

    var baseMaps = {
               	"OpenStreesMap": osm,
               	"Grey": grey,
               	"Satellite" : googleSat
               };

    //TODO hier kommen dann die Wetterdaten rein zunöchst ein Platzhalter, als Beispiel ein Punkt
    var start = L.marker([52.26524,7.72767]).bindPopup('This is the Startpoint');
    var excample = L.layerGroup([start]);

// Warnungs-Layer vom DWD-Geoserver
/**
	var warnlayer = L.tileLayer("https://maps.dwd.de/geoproxy_warnungen/service/", {
		layers: 'Warnungen_Gemeinden_vereinigt',
		// eigene Styled Layer Descriptor (SLD) können zur alternativen Anzeige der Warnungen genutzt werden (https://docs.geoserver.org/stable/en/user/styling/sld/reference/)
		//sld: 'https://eigenerserver/alternativer.sld',
		format: 'image/png',
		transparent: true,
		opacity: 0.8,
		attribution: 'Warndaten: &copy; <a href="https://www.dwd.de">DWD</a>'
	});

// Niederschlags-Layer vom DWD-Geoserver
	var niederschlagslayer = L.tileLayer("https://maps.dwd.de/geoserver/dwd/ows?service=WMS&version=1.3&request=GetMap&layers=dwd:RX-Produkt&srs=EPSG:4326&format=image/jpeg", {
		attribution: 'Niederschlagsradar: &copy; <a href="https://www.dwd.de">DWD</a>'
	});



	// Warnungs-Layer pro Kreis vom DWD-Geoserver
    	var warnlayer_kreis = L.tileLayer("https://maps.dwd.de/geoproxy_warnungen/service/", {
    		layers: 'dwd%3AWarngebiete_Kreise',
    		// eigene Styled Layer Descriptor (SLD) können zur alternativen Anzeige der Warnungen genutzt werden (https://docs.geoserver.org/stable/en/user/styling/sld/reference/)
    		//sld: 'https://eigenerserver/alternativer.sld',
    		format: 'image/png',
    		transparent: true,
    		opacity: 0.8,
    		attribution: 'Warndaten: &copy; <a href="https://www.dwd.de">DWD</a>'
    	});

	// Warnungs-Layer pro Kreis vom DWD-Geoserver
    	var wind_warn = L.TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/ows?", {
    	version: 1.3,
    	layers: 'dwd:Warnungen_Landkreise',
        transparent: true,
        opacity: 0.8,
    	attribution: 'Warndaten: &copy; <a href="https://www.dwd.de">DWD</a>'
    	})

**/

    var overlayMaps = {
        "Excample": excample,
        //"DWD Warnings": warnlayer,
        //"DWD Niederschlag": niederschlagslayer,
        //"DWD Wind": wind_warn,
        //"DWD Kreis-Warning": warnlayer_kreis
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);


}