// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";


/**
* @desc Geosoftware 2;
* apllication for changing the cursor
*/

var map;
var output;
var startpoint;


// setting the wfs input in var output to work with it locally
function set_output (x) {
    output=x;
};

function get_output () {
    return output;
}

/**
* @desc create map
*/
function map() {

    var startpoint = [51.26524, 9.72767];
    var zoomLevel = 6;
    var urlParam = getAllUrlParams();

    if (urlParam.zoomlevel !== undefined && urlParam.zoomlevel !== "") {
        zoomLevel = urlParam.zoomlevel;
    }
    else {
        var cookieZoomLevel = getCookie("zoomLevel");
        if (cookieZoomLevel != "") {
            zoomLevel = cookieZoomLevel;
        }
    }
    if (urlParam.centerpoint !== undefined && urlParam.centerpoint !== "") {
        try {
            var parsedcenter = JSON.parse(urlParam.centerpoint);
            var cookiePointX = parsedcenter[0];
            var cookiePointY = parsedcenter[1];

            startpoint = [cookiePointX, cookiePointY];
        }
        catch (err) {
            $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
        }
    }
    else {

        if (getCookie("startX") != "" && getCookie("startY") != "") {
            try {
                var cookiePointX = getCookie("startX");
                var cookiePointY = getCookie("startY");
                startpoint = [cookiePointX, cookiePointY];
                $("#message").append("<div class='alert alert-secondary col-12' role='alert' style='margin-top:5px'>" + "Your view has set to your saved view saved as a cookie" + "</div>");
                $("#message").append("<div class='alert alert-secondary col-12' role='alert' style='margin-top:5px'>" + "Your view has set to your saved view saved as a cookie" + "</div>");
            }
            catch (err) {
                $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");

            }
        }
    }

    if (getCookie("expansionURL") != "") {
        expansion = getCookie("expansionURL");
    }
    else {

    }

    // setting connection to wfs server with a ajax call

    var owsrootUrl = 'https://maps.dwd.de/geoserver/dwd/ows';

var defaultParameters = {
    service : 'WFS',
    version : '2.0',
    request : 'GetFeature',
    typeName : 'dwd:Warnungen_Landkreise',
    outputFormat : 'text/javascript',
    format_options : 'callback:getJson',
    SrsName : 'EPSG:4326'
};

var parameters = L.Util.extend(defaultParameters);
var URL = owsrootUrl + L.Util.getParamString(parameters);

var WFSLayer = null;
var ajax = $.ajax({
    url : URL,
    dataType : 'jsonp',
    jsonpCallback : 'getJson',
    success : function (response) {
        set_output(response);
        // muss noch weiter bearbeitet werden. Idee: den Startpunkt der Karte abhängig von dem
        // wfs output zu machen. zoom() funktion steht in wfs.js
        if (response != null) {
            startpoint=zoom();
        }

        WFSLayer = L.geoJson(response, {
            style: setStyles, // setStyles function steht unten im Dokument.
            onEachFeature: function (feature, layer) {
                //popupOptions = {maxWidth: 200};
                layer.bindPopup(feature.properties.EVENT+"<br><br>"+"VON: "+feature.properties.EFFECTIVE+"<br>Bis voraussichtlich: "+feature.properties.EXPIRES);

            }
        }).addTo(map);
        return response;
    }
}).responseText;

    map = L.map('mapdiv')
        .setView(startpoint, zoomLevel);

    //TODO what is this token for??
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

// Funktion um die einzelnen Landkreise farblich korrekt darzustellen. Die Farbe ist anhängig
// vom Stärkegrad des Unwetters. Gelb steht für minor, orange für moderate, rot für severe
// und violett für Extreme
function setStyles (feature) {

    console.log("2  "+ startpoint);

    var test=document.getElementById("Selection_Severity");

    if (document.getElementById("Severity_Minor").checked==true) {
    if (feature.properties.SEVERITY== "Minor") {
        return {
        stroke: true,
        fillColor: '#F4D03F',
        fillOpacity: 0.8
        };
    };
    }
    if (feature.properties.SEVERITY == "Moderate") {
        return {
            stroke: true,
            fillColor: '#D35400',
            fillOpacity: 0.8
        };
    };
    if (feature.properties.SEVERITY == "Severe") {
        return {
            stroke: true,
            fillColor: '#C0392B',
            fillOpacity: 0.8
        };
    };
    if (feature.properties.SEVERITY == "Extreme") {
        return {
            stroke: true,
            fillColor: '#7D3C98',
            fillOpacity: 0.8
        };
    };


}
