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
function set_output(x) {
    output = x;
};

function get_output() {
    return output;
}

/**
* @desc create map
*/
function map() {

    var startpoint = [51.26524, 9.72767];
    var zoomLevel = 5;
    var urlParam = getAllUrlParams();

    if (urlParam.zoomlevel !== undefined && urlParam.zoomlevel !== "") {
        try {
            if (urlParam.zoomlevel >= 0 && urlParam.zoomlevel <= 18) {
                zoomLevel = urlParam.zoomlevel;
            }
            else {
                //TODO hier muss der Link vervollständigt werden. Dieser führt letztenendlich in das Usermanual, wo der User nachschauen kann welche Werte akzeptiert werden.
                $("#message").append("<div class='alert alert-danger' role='alert'>invalid zoomlevel. Please check the <a >manual</a></div>");
            }
        }
        catch (err) {
            $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
        }
    }
    else {
        var cookieZoomLevel = getCookie("zoomlevel");
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
            }
            catch (err) {
                $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");

            }
        }
    }


    // setting connection to wfs server with a ajax call

    var owsrootUrl = 'https://maps.dwd.de/geoserver/dwd/ows';

    var defaultParameters = {
        service: 'WFS',
        version: '2.0',
        request: 'GetFeature',
        typeName: 'dwd:Warnungen_Landkreise',
        outputFormat: 'text/javascript',
        format_options: 'callback:getJson',
        SrsName: 'EPSG:4326'
    };

    var parameters = L.Util.extend(defaultParameters);
    var URL = owsrootUrl + L.Util.getParamString(parameters);

    var WFSLayer = null;
    var ajax = $.ajax({
        url: URL,
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: function (response) {
            set_output(response);
            // muss noch weiter bearbeitet werden. Idee: den Startpunkt der Karte abhängig von dem
            // wfs output zu machen. zoom() funktion steht in wfs.js
            if (response != null) {
                startpoint = zoom();
            }

            WFSLayer = L.geoJson(response, {
                style: setStyles, // setStyles function steht unten im Dokument.
                onEachFeature: function (feature, layer) {
                    //popupOptions = {maxWidth: 200};
                    layer.bindPopup(feature.properties.EVENT + "<br><br>" + "VON: " + feature.properties.EFFECTIVE + "<br>Bis voraussichtlich: " + feature.properties.EXPIRES);

                }
            }).addTo(map);
            return response;
        }
    }).responseText;

    map = L.map('mapdiv')
        .setView(startpoint, zoomLevel)
        .on('zoomend', function () {
            var newRequest = ["zoomlevel=" + map.getZoom()];
            var newURL = buildUrl(newRequest);
            var justReq = newURL.split("?")[1];
            var stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);
        })
        .on('moveend', function () {
            var currentCenter = map.getCenter();
            var newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]"];
            var newURL = buildUrl(newRequest);
            var justReq = newURL.split("?")[1];
            var stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);
        });

    var mapbox_accessToken = 'pk.eyJ1IjoibWdhZG8wMSIsImEiOiJjazQxaHZvZTcwMWdqM2RvYmF4eWRzZ2diIn0.z3YweqsFFX-KbTYMRmz_AA';

    var light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        accessToken: mapbox_accessToken
    }).addTo(map);

    var dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        accessToken: mapbox_accessToken
    });

    var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        accessToken: mapbox_accessToken
    });

    var baseMaps = {
        "Light": light,
        "Dark": dark,
        "Satellite": satellite
    };

    //TODO hier kommen dann die Wetterdaten rein zunöchst ein Platzhalter, als Beispiel ein Punkt
    var start = L.marker([52.26524, 7.72767]).bindPopup('This is the Startpoint');
    var example = L.layerGroup([start]);

    // Warnungs-Layer vom DWD-Geoserver - betterWms fügt Möglichkeiten zur GetFeatureInfo hinzu
    var warnlayer = L.tileLayer.betterWms("https://maps.dwd.de/geoproxy_warnungen/service/", {
        layers: 'Warnungen_Landkreise',
        // eigene Styled Layer Descriptor (SLD) können zur alternativen Anzeige der Warnungen genutzt werden (https://docs.geoserver.org/stable/en/user/styling/sld/reference/)
        //sld: 'https://eigenerserver/alternativer.sld',
        format: 'image/png',
        transparent: true,
        opacity: 0.8,
        attribution: 'Warndaten: &copy; <a href="https://www.dwd.de">DWD</a>'
    }).addTo(map);

    // CQL_FILTER können benutzt werden um angezeigte Warnungen zu filtern (https://docs.geoserver.org/stable/en/user/tutorials/cql/cql_tutorial.html)
    // Filterung kann auf Basis der verschiedenen properties der Warnungen erfolgen (bspw. EC_II, EC_GROUP, DESCRIPTION ... ) siehe https://www.dwd.de/DE/wetter/warnungen_aktuell/objekt_einbindung/einbindung_karten_geowebservice.pdf
    // warnlayer.setParams({CQL_FILTER:"DESCRIPTION LIKE '%Sturm%'"});
    // Filter können zur Laufzeit, z.B. über Nutzereingaben angepasst werden
    //delete warnlayer.wmsParams.CQL_FILTER;
    //warnlayer.redraw();

    var overlayMaps = {
        "Example": example,
        "DWD Warnings": warnlayer,
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

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

    //Custom Controls
    var custom = L.Control.extend({
        options: {
            position: "bottomleft"
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';

            container.onclick = function () {
                saveCookie();
            }
            return container;
        }
    });

    map.addControl(new custom());
}

// Funktion um die einzelnen Landkreise farblich korrekt darzustellen. Die Farbe ist anhängig
// vom Stärkegrad des Unwetters. Gelb steht für minor, orange für moderate, rot für severe
// und violett für Extreme
function setStyles(feature) {

    console.log("2  " + startpoint);

    var test = document.getElementById("Selection_Severity");

    if (document.getElementById("Severity_Minor").checked == true) {
        if (feature.properties.SEVERITY == "Minor") {
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