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

	// Warnungs-Layer vom DWD-Geoserver - betterWms fügt Möglichkeiten zur GetFeatureInfo hinzu
	var warnlayer = L.tileLayer.betterWms("https://maps.dwd.de/geoproxy_warnungen/service/", {
		layers: 'Warnungen_Landkreise',
		// eigene Styled Layer Descriptor (SLD) können zur alternativen Anzeige der Warnungen genutzt werden (https://docs.geoserver.org/stable/en/user/styling/sld/reference/)
		//sld: 'https://eigenerserver/alternativer.sld',
		format: 'image/png',
		transparent: true,
		opacity: 0.8,
		attribution: 'Warndaten: &copy; <a href="https://www.dwd.de">DWD</a>'
	});

	// CQL_FILTER können benutzt werden um angezeigte Warnungen zu filtern (https://docs.geoserver.org/stable/en/user/tutorials/cql/cql_tutorial.html)
	// Filterung kann auf Basis der verschiedenen properties der Warnungen erfolgen (bspw. EC_II, EC_GROUP, DESCRIPTION ... ) siehe https://www.dwd.de/DE/wetter/warnungen_aktuell/objekt_einbindung/einbindung_karten_geowebservice.pdf
 	// warnlayer.setParams({CQL_FILTER:"DESCRIPTION LIKE '%Sturm%'"});
 	// Filter können zur Laufzeit, z.B. über Nutzereingaben angepasst werden
 	//delete warnlayer.wmsParams.CQL_FILTER;
 	//warnlayer.redraw();

 	// Layer mit neutraler Darstellung der Gemeinde-Warngebiete
	var gemeindelayer = L.tileLayer.wms("https://maps.dwd.de/geoproxy_warnungen/service/", {
		layers: 'Warngebiete_Gemeinden',
		format: 'image/png',
		styles: '',
		transparent: true,
		opacity: 0.6,
		attribution: 'Geobasisdaten Gemeinden: &copy; <a href="https://www.bkg.bund.de">BKG</a> 2015 (Daten verändert)'
	});

    var overlayMaps = {
        "Excample": excample,
        "DWD Warnings": warnlayer,
        "Gemeindegrenzen": gemeindelayer,
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);


}