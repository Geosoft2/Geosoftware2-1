// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";

/**
* @desc Geosoftware 2;
* apllication for starting the map
*/

var map = L.map('mapdiv');
var output;
var startpoint;
var WFSLayer;
var marker;

// setting the wfs input in var output to work with it locally
function set_output(x) {
    output = x;
};

function get_output() {
    return output;
}

//start the functions needed to load the map, dwd data and
initMap();
extendMap();

//TODO: ordnung halten und sowas an die richtige stelle schieben
$(".err_mess").on("mouseenter", function () {
    $(".err_mess").stop(true, true);
    $(".err_mess").delay(0).fadeIn(0);
});
$(".err_mess").on("mouseleave", function () {
    $(".err_mess").delay(0).fadeOut(3000);
});

/**
* @desc create map
*/
function initMap() {
    //get all params send by URL
    var urlParam = getAllUrlParams();

    //default parameters if there are no saved neither in the url nor the cookies
    var startpoint = [51.26524, 9.72767];
    var zoomLevel = 6;
    //TODO: bbox nicht in die URL und twittersearch vielleicht auch nicht
    //TODO: die BBOX dafür aber dennoch zwischenspeichern und eventuell jedes mal mit einladen
    var bbox = [];
    var twittersearch = "";
    //TODO: wenn diese false sind sind die beiden deaktiviert wenn auf true gesetzt wird dann aktiviert
    var twitter = false;
    var instagram = false;

    //ZOOMLEVEL
    //check if there is a saved zoomlevel in the URL?
    if (urlParam.zoomlevel !== undefined && urlParam.zoomlevel !== "") {
        try {
            if (urlParam.zoomlevel >= 0 && urlParam.zoomlevel <= 18) {
                zoomLevel = urlParam.zoomlevel;
            }
            else {
                giveErrorMessage("invalid zoomlevel - please check the <a href='/doku'>documentation</a>")
            }
        }
        catch (err) {
            giveError(err);
        }
    }
    //or is there else a zoomlevel saved in the cookies?
    else {
        var cookieZoomLevel = getCookie("zoomlevel");
        if (cookieZoomLevel != "") {
            zoomLevel = cookieZoomLevel;
        }
    }

    //CENTERPOINT
    //is there a centerpoint given in the URL?
    if (urlParam.centerpoint !== undefined && urlParam.centerpoint !== "") {
        try {
            startpoint = JSON.parse(urlParam.centerpoint);
        }
        catch (err) {
            giveError(err);
            console.log(err);
        }
    }
    //or is there elsse a centerpoint in the cookies?
    else {
        if (getCookie("startX") != "" && getCookie("startY") != "") {
            try {
                startpoint = [getCookie("startX"), getCookie("startY")];
            }
            catch (err) {
                giveError(err);
            }
        }
    }

    //TWITTERSEARCH
    //is there a twittersearch in the URL?
    if (urlParam.twittersearch !== undefined && urlParam.twittersearch !== "") {
        try {
            twittersearch = urlParam.twittersearch;
        }
        catch (err) {
            giveError(err);
        }
    }



    //TODO: es mnüssen noch der Searchbegriff und die BBox an die entsprechenden Stellen weitergeleitet werden
    //TODO: twittersearch als Cookie speichern??? Muss nicht unbedingt sein oder?
    //TODO: Bbox entweder in die Datenbank oder auch als Cookie

    // setting connection to wfs server with a ajax call
    /*  var owsrootUrl = 'https://maps.dwd.de/geoserver/dwd/ows';
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
      }).responseText;*/

    map.on('load', function () {
        saveBboxtoCookies();
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
            saveBboxtoCookies();
        })
        .on('moveend', function () {
            var currentCenter = map.getCenter();
            newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
            newURL = buildUrl(newRequest);
            justReq = newURL.split("?")[1];
            stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);

            saveBboxtoCookies();
        });

    /* $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/v1/mapbox/dark/256/1',
    }).done(function (data) {
        console.log('Success: Tile from Mapbox received.');
        console.log(typeof (data));
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    }); */

    const mapbox_accessToken = 'pk.eyJ1IjoibWdhZG8wMSIsImEiOiJjazQxaHZvZTcwMWdqM2RvYmF4eWRzZ2diIn0.z3YweqsFFX-KbTYMRmz_AA';

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
    var radarlayer = L.tileLayer.betterWms("https://maps.dwd.de/geoserver/dwd/ows", {
        layers: 'dwd:RX-Produkt',
        request: 'GetMap',
        format: 'image/png',
        transparent: true,
        opacity: 0.6,
        attribution: 'Radardaten: &copy; <a href="https://www.dwd.de">DWD</a>'
    }).addTo(map);

    // CQL_FILTER können benutzt werden um angezeigte Warnungen zu filtern (https://docs.geoserver.org/stable/en/user/tutorials/cql/cql_tutorial.html)
    // Filterung kann auf Basis der verschiedenen properties der Warnungen erfolgen (bspw. EC_II, EC_GROUP, DESCRIPTION ... ) siehe https://www.dwd.de/DE/wetter/warnungen_aktuell/objekt_einbindung/einbindung_karten_geowebservice.pdf
    // warnlayer.setParams({CQL_FILTER:"DESCRIPTION LIKE '%Sturm%'"});
    // Filter können zur Laufzeit, z.B. über Nutzereingaben angepasst werden
    //delete warnlayer.wmsParams.CQL_FILTER;
    //warnlayer.redraw();

    var overlayMaps = {
        "DWD rain radar": radarlayer
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
    //TODO: diese vielleicht bei den cookies unter eingenen Werten speicher, dann kann man prüfen, obn diese auf 0 stehen oder nicht.
    //TODO: wenn das Polygon geläscht wird soll die BBOX dieser WErte dann auf 0 gesetzt werden und die aktuelle BBox des Ansichtsfensters aktualisiert werden
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
}

/* function getWFSLayer() {
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

    WFSLayer = null;
    var ajax = $.ajax({
        url: URL,
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: function (response) {
            console.log(response);
            set_output(response);
            //response=filter_wfs_output(response);
            // muss noch weiter bearbeitet werden. Idee: den Startpunkt der Karte abhängig von dem
            // wfs output zu machen. zoom() funktion steht in wfs.js
            if (response != null) {
                //console.log(response.features.length);
                //console.log(output);
                var filtered_response = new Array();
                var counter = 0;
                for (var i = 0; i < output.features.length; i++) {
                    var filter_feature = filter_wfs_output(output.features[i]);
                    //console.log(filter_feature);
                    if (filter_feature != null) {
                        filtered_response[counter] = filter_feature;
                        counter++;
                    }
                }
                //console.log(filtered_response);
            }

            WFSLayer = L.geoJson(filtered_response, {
                style: setStyles, // setStyles function steht unten im Dokument.
                onEachFeature: function (feature, layer) {
                    //popupOptions = {maxWidth: 200};
                    layer.bindPopup(feature.properties.EVENT + "<br><br>" + "VON: " + feature.properties.EFFECTIVE + "<br>Bis voraussichtlich: " + feature.properties.EXPIRES + "<br><br>" + feature.properties.EC_II);

                }
            }).addTo(map);

        }
    }).responseText;
} */


/*function setPopup (feature, layer) {
    console.log(layer);
    //popupOptions = {maxWidth: 200};
    layer.bindPopup(feature.properties.EVENT + "<br><br>" + "VON: " + feature.properties.EFFECTIVE + "<br>Bis voraussichtlich: " + feature.properties.EXPIRES);

};*/

// Funktion um die einzelnen Landkreise farblich korrekt darzustellen. Die Farbe ist anhängig
// vom Stärkegrad des Unwetters. Gelb steht für minor, orange für moderate, rot für severe
// und violett für Extreme
function setStyles(feature) {

    //console.log(feature.properties.SEVERITY);

    if (feature.properties.SEVERITY == "Minor") {
        return {
            stroke: true,
            weight: 1,
            color: '#A4A4A4',
            fillColor: '#F4D03F',
            fillOpacity: 0.2,
        };
    }
    if (feature.properties.SEVERITY == "Moderate") {
        return {
            stroke: true,
            weight: 0.5,
            color: '#A4A4A4',
            fillColor: '#D35400',
            fillOpacity: 0.2
        };
    }

    if (feature.properties.SEVERITY == "Severe") {
        return {
            stroke: true,
            weight: 0.5,
            color: '#A4A4A4',
            fillColor: '#C0392B',
            fillOpacity: 0.2
        };
    }

    if (feature.properties.SEVERITY == "Extreme") {
        return {
            stroke: true,
            weight: 0.5,
            color: '#A4A4A4',
            fillColor: '#7D3C98',
            fillOpacity: 0.2
        };
    }
}

function filter_wfs_output(response) {
    var e = document.getElementById('wfs_selection_box');
    var selectedOption = e.options[e.selectedIndex].text;
    //console.log(selectedOption);

    //TODO:: das kann man doch noch alles auslagern und n bisschen vereinfachen oder?

    if (selectedOption == "All") {
        return filter_dwdoutput_severity(response);
    }

    if (selectedOption == "storm/wind") {
        //if (response.properties.EVENT=="STURM" || response.properties.EVENT=="STURMBÖEN" || response.properties.EVENT=="WINDBÖEN" || response.properties.EVENT=="SCHWERE STURMBÖEN" || response.properties.EVENT=="ORKANARTIGE BÖEN" || response.properties.EVENT=="ORKANBÖEN" || response.properties.EVENT=="EXTREME ORKANBÖEN" ) {
        if (response.properties.EC_II == 13 || response.properties.EC_II == 51 || response.properties.EC_II == 52 || response.properties.EC_II == 53 || response.properties.EC_II == 54 || response.properties.EC_II == 55 || response.properties.EC_II == 56 || response.properties.EC_II == 57 || response.properties.EC_II == 58) {
            return filter_dwdoutput_severity(response);
        }
    }

    if (selectedOption == "thunderstorm") {
        if (response.properties.EVENT == "GEWITTER" || response.properties.EVENT == "STARKES GEWITTER" || response.properties.EVENT == "SCHWERES GEWITTER mit EXTREMEN ORKANBÖEN") {
            return filter_dwdoutput_severity(response);
        }
    }

    if (selectedOption == "fog") {
        if (response.properties.EVENT == "NEBEL") {
            return filter_dwdoutput_severity(response);
        }
    }

    if (selectedOption == "rain") {
        if (response.properties.EVENT == "DAUERREGEN" || response.properties.EVENT == "STARKREGEN" || response.properties.EVENT == "HEFTIGER STARKREGEN" || response.properties.EVENT == "ERGIEBIGER DAUERREGEN" || response.properties.EVENT == "EXTREM HEFTIGER STARKREGEN") {
            return filter_dwdoutput_severity(response);
        }
    }

    if (selectedOption == "snowfall") {
        if (response.properties.EVENT == "STARKER SCHNEEFALL" || response.properties.EVENT == "EXTREM STARKER SCHNEEFALL" || response.properties.EVENT == "STARKE SCHNEEVERWEHUNG" || response.properties.EVENT == "EXTREM STARKE SCHNEEVERWEHUNG") {
            return filter_dwdoutput_severity(response);
        }
    }

    if (selectedOption == "frost") {
        if (response.properties.EVENT == "FROST" || response.properties.EVENT == "STRENGER FROST") {
            return filter_dwdoutput_severity(response);
        }
    }

    if (selectedOption == "glazed frost") {

        if (response.properties.EVENT == "GLÄTTE" || response.properties.EVENT == "GLATTEIS") {
            return filter_dwdoutput_severity(response);
        }
    }



}

//TODO: hier muss die function noch beschrieben werden
/**
 * function to 
 * @param {*} response 
 */
function filter_dwdoutput_severity(response) {
    if (document.getElementById("Severity_Minor").checked == true) {
        if (response.properties.SEVERITY == "Minor") {
            return response;
        }
    }

    if (document.getElementById("Severity_Moderate").checked == true) {
        if (response.properties.SEVERITY == "Moderate") {
            return response;
        }
    }

    if (document.getElementById("Severity_Severe").checked == true) {
        if (response.properties.SEVERITY == "Severe") {
            return response;
        }
    }

    if (document.getElementById("Severity_Extreme").checked == true) {
        if (response.properties.SEVERITY == "Extreme") {
            return response;
        }
    }
    else {
        return null;
    }
}



/**
 * function to add a button for saving the current view to your cookies as default view
 * @private
 * 
 */
function extendMap() {
    //Button, to save personal default view
    var saveviewControl = L.Control.extend({
        options: {
            position: "bottomleft"
        },
        onAdd: () => {
            var container = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');

            container.innerHTML = '<i class="far fa-save"></i>';
            container.style.width = '30px';
            container.style.height = '30px';

            container.onclick = () => {
                saveCookie();
            }
            return container;
        }
    });

    map.addControl(new saveviewControl);
}

/**
*function that saves the new mapextension as the last bbox, if there is no Bbox drawn
*
*
*/
function saveBboxtoCookies() {
    //TODO: if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
    var bbox = map.getBounds();
    document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
    document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
    document.cookie = "bboxnorthEast_lat=" + bbox._northEast.lat;
    document.cookie = "bboxnorthEast_lng=" + bbox._northEast.lng;
}