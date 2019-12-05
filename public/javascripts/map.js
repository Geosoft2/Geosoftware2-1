// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";


/**
* @desc Geosoftware 2;
* apllication for changing the cursor
*/

var map;

/**
* @desc create map
*/
function map() {
    var startpoint = [51.26524, 9.72767];
    var expansion = 6;

    if (getCookie("startPoint") != "") {
        var cookiePointX = getCookie("startPoint").substr(7, 8);
        var cookiePointY = getCookie("startPoint").substr(17, 7);

        startpoint = [cookiePointX, cookiePointY];
    }

    var cookieExpansion = getCookie("expansion");
    if (cookieExpansion != "") {
        expansion = cookieExpansion;
    }

    map = L.map('mapdiv')
        .setView(startpoint, expansion);

    var accessToken = 'pk.eyJ1IjoiY2hyaXNzaTMxNyIsImEiOiJjanZ6MXdha3AwMmQ2NDlwM3c4ZTh2amt1In0.4h6xg5OtZ5TGU6uInpQnjQ';

    //OSM
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //OSM
    var grey = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; <a href="https://www.google.com/intl/de_de/help/terms_maps/">GoogleMaps</a> contributors'
    }).addTo(map);

    var baseMaps = {
        "OpenStreesMap": osm,
        "Grey": grey,
        "Satellite": googleSat
    };

    //TODO hier kommen dann die Wetterdaten rein zunöchst ein Platzhalter, als Beispiel ein Punkt
    var start = L.marker([52.26524, 7.72767]).bindPopup('This is the Startpoint');
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

    var drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    var drawControl = new L.Control.Draw({
        draw: {
            polygon: false,
            marker: false,
            polyline: false,
            circlemarker: false,
            rectangle: false,
            circle: true,
        },
        edit: {
            featureGroup: drawnItems
        }
    });

    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, function (e) {
        drawnItems.clearLayers();
        var layer = e.layer;
        drawnItems.addLayer(layer);
        layer.bindPopup(JSON.stringify(layer.toGeoJSON()));
        map.addLayer(layer);

        let geocode = "" + e.layer._latlng.lat + "," + e.layer._latlng.lng + "," + Math.floor(e.layer._mRadius / 1000) + "km";

        document.cookie = "geocode=" + geocode;
    });

    var bbox;
    var poly;

    // Suchfeld für Städte
    var geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
    })
        .on('markgeocode', function (e) {
            console.log(poly);
            if (poly != null) {
                console.log("if");
                map.removeLayer(poly);
            }
            bbox = e.geocode.bbox;
            poly = L.polygon([
                bbox.getSouthEast(),
                bbox.getNorthEast(),
                bbox.getNorthWest(),
                bbox.getSouthWest()
            ]).addTo(map);
            map.fitBounds(poly.getBounds());
        })
        .addTo(map);

}