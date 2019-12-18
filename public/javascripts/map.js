// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";


/**
* @desc Geosoftware 2;
* apllication for changing the cursor
*/

var map = L.map('mapdiv');
var output;
var startpoint;

// setting the wfs input in var output to work with it locally
function set_output(x) {
    output = x;
};

function get_output() {
    return output;
}

initMap();

/**
* @desc create map
*/
function initMap() {
    var startpoint = [51.26524, 9.72767];
    var zoomLevel = 6;
    var urlParam = getAllUrlParams();
    var bbox = [];
    var twittersearch = "";

    //BBox
    if (urlParam.bbox !== undefined && urlParam.bbox !== "") {
        try {
            //TODO Bedingung für bbox checken und hier ergänzen
            //if (urlParam.bbox){
            bbox = urlParam.bbox;
            //}
            /**
            else{

                $("#message").append("<div class='alert alert-danger' role='alert'>invalid BBox - please check the <a href='/doku'>documentation</a></div>");
            }
            */
        }
        catch (err) {
            $("#message").append("<div class='alert alert-danger col-12' role='alert'>" + err.message + "</div>");
        }
    }
    else {
        }

    if (urlParam.zoomlevel !== undefined && urlParam.zoomlevel !== "") {
        try {
            if (urlParam.zoomlevel >= 0 && urlParam.zoomlevel <= 18) {
                zoomLevel = urlParam.zoomlevel;
            }
            else {
                $("#message").append("<div class='alert alert-danger col-12' role='alert' >invalid zoomlevel - please check the <a href='/doku'>documentation</a></div>");
            }
        }
        catch (err) {
            $("#message").append("<div class='alert alert-danger col-12' role='alert'>" + err.message + "</div>");
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
            startpoint = JSON.parse(urlParam.centerpoint);
        }
        catch (err) {
            $("#message").append("<div class='alert alert-danger col-12' role='alert'>" + err.message + "</div>");
        }
    }
    else {

        if (getCookie("startX") != "" && getCookie("startY") != "") {
            try {
                startpoint = [getCookie("startX"), getCookie("startY")];
            }
            catch (err) {
                $("#message").append("<div class='alert alert-danger col-12' role='alert'>" + err.message + "</div>");

            }
        }
    }
    //twittersearch
    if (urlParam.twittersearch !== undefined && urlParam.twittersearch !== "") {
        try {
            twittersearch = urlParam.twittersearch;
        }
        catch (err) {
            $("#message").append("<div class='alert alert-danger col-12' role='alert'>" + err.message + "</div>");
        }
    }

        //TODO es mnüssen noch der Searchbegriff und die BBox an die entsprechenden Stellen weitergeleitet werden
        //TODO twittersearch als Cookie speichern
        //TODO Bbox entweder in die Datenbank oder auch als Cookie

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

        map.on('load', function () {
            //TODO if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
            var bbox = map.getBounds();
            document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
            document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
            document.cookie = "bboxnorthEast_lat=" + bbox._northEast.lat;
            document.cookie = "bboxnorthEast_lng=" + bbox._northEast.lng;
            // }
        });

        //add the set values to the current URL
        var newRequest = ["centerpoint=[" + startpoint[0] + "," + startpoint[1] + "]", "zoomlevel=" + zoomLevel];
        var newURL = buildUrl(newRequest);
        var justReq = newURL.split("?")[1];
        var stateObj = { foo: justReq };
        history.pushState(stateObj, "init", "?" + justReq);

        map.setView(startpoint, zoomLevel)
            .on('zoomend', function () {
                var currentCenter = map.getCenter();
                newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
                newURL = buildUrl(newRequest);
                justReq = newURL.split("?")[1];
                stateObj = { foo: justReq };
                history.pushState(stateObj, "test", "?" + justReq);

                //TODO if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
                var bbox = map.getBounds();
                document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
                document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
                document.cookie = "bboxnorthEast_lat=" + bbox._northEast.lat;
                document.cookie = "bboxnorthEast_lng=" + bbox._northEast.lng;
                //console.log(bbox);
                // }


            })
            .on('moveend', function () {
                var currentCenter = map.getCenter();
                newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
                newURL = buildUrl(newRequest);
                justReq = newURL.split("?")[1];
                stateObj = { foo: justReq };
                history.pushState(stateObj, "test", "?" + justReq);

                //TODO if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
                var bbox = map.getBounds();
                document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
                document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
                document.cookie = "bboxnorthEast_lat=" + bbox._northEast.lat;
                document.cookie = "bboxnorthEast_lng=" + bbox._northEast.lng;
                //console.log(bbox);
                // }
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
            "DWD Warnings": warnlayer
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
                rectangle: true,
                circle: false,
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

            document.cookie = "bboxsouthWest_lat=" + e.layer._latlngs[0][0].lat;
            document.cookie = "bboxsouthWest_lng=" + e.layer._latlngs[0][0].lng;
            document.cookie = "bboxnorthEast_lat=" + e.layer._latlngs[0][2].lat;
            document.cookie = "bboxnorthEast_lng=" + e.layer._latlngs[0][2].lng;
        });

        var bbox;
        var poly;

        // Suchfeld für Städte
        var geocoder = L.Control.geocoder({
            defaultMarkGeocode: false
        })
            .on('markgeocode', function (e) {
                //console.log(poly);
                if (poly != null) {
                    //console.log("if");
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

        //Button, um Startansicht zu speichern
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

    //console.log("2  " + startpoint);

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