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
//TODO die URL muss direkt beim Laden der Seite die richtigen Requestes haben

      var startpoint = [51.26524,9.72767];
      var zoomLevel = 6;
      var urlParam =  getAllUrlParams();
      var bbox = [];
      var twittersearch = "";

      //BBox
      if (urlParam.bbox !== undefined && urlParam.bbox !== ""){
            try{
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
            catch(err) {
                $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
            }
      }
      else{
        var cookieZoomLevel = getCookie("zoomlevel");
        if (cookieZoomLevel != ""){
        zoomLevel = cookieZoomLevel;
        }
      }
      if (urlParam.zoomlevel !== undefined && urlParam.zoomlevel !== ""){
        try{
            if (urlParam.zoomlevel >= 0 && urlParam.zoomlevel <= 18){
                zoomLevel = urlParam.zoomlevel;
            }
            else{
                $("#message").append("<div class='alert alert-danger' role='alert'>invalid zoomlevel - please check the <a href='/doku'>documentation</a></div>");
            }
        }
        catch(err) {
            $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
        }
      }
      else{
        var cookieZoomLevel = getCookie("zoomlevel");
        if (cookieZoomLevel != ""){
        zoomLevel = cookieZoomLevel;
        }
      }
      if (urlParam.centerpoint !== undefined && urlParam.centerpoint !== ""){
            try{
            startpoint = JSON.parse(urlParam.centerpoint);
            }
            catch(err) {
                $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
            }
        }
        else{

            if (getCookie("startX") != "" && getCookie("startY") != ""){
                try{
                startpoint = [getCookie("startX"),getCookie("startY")];
                    }
                catch (err){
                    $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");

                }
            }
        }
        //twittersearch
          if (urlParam.twittersearch !== undefined && urlParam.twittersearch !== ""){
                    try{
                    twittersearch = urlParam.twittersearch;
                    }
                    catch(err) {
                        $("#message").append("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
                    }
          }

    //TODO es mnüssen noch der Searchbegriff und die BBox an die entsprechenden Stellen weitergeleitet werden
    //TODO twittersearch als Cookie speichern
    //TODO Bbox entweder in die Datenbank oder auch als Cookie

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

    map = L.map('mapdiv');
    map.on('load', function() {
                           //TODO if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
                               var bbox = map.getBounds();
                               document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
                               document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
                               document.cookie = "bboxnothEast_lat=" + bbox._northEast.lat;
                               document.cookie = "bboxnothEast_lng=" + bbox._northEast.lng;
                           // }
                       });

        map.setView(startpoint, zoomLevel)
        .on('zoomend', function() {
            var newRequest = ["zoomlevel=" + map.getZoom()];
            var newURL = buildUrl(newRequest);
            var justReq = newURL.split("?")[1];
            var stateObj = {foo: justReq};
            history.pushState(stateObj, "test", "?" + justReq);

            //TODO if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
                                    var bbox = map.getBounds();
                                    document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
                                    document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
                                    document.cookie = "bboxnothEast_lat=" + bbox._northEast.lat;
                                    document.cookie = "bboxnothEast_lng=" + bbox._northEast.lng;
                                    console.log(bbox);
                                // }


                })
        .on('moveend', function() {
            var currentCenter = map.getCenter();
            var newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]"];
            var newURL = buildUrl(newRequest);
            var justReq = newURL.split("?")[1];
            var stateObj = {foo: justReq};
            history.pushState(stateObj, "test", "?" + justReq);
        });


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

    /**
    // Layer mit neutraler Darstellung der Gemeinde-Warngebiete
    var gemeindelayer = L.tileLayer.wms("https://maps.dwd.de/geoproxy_warnungen/service/", {
        layers: 'Warngebiete_Gemeinden',
        format: 'image/png',
        styles: '',
        transparent: true,
        opacity: 0.6,
        attribution: 'Geobasisdaten Gemeinden: &copy; <a href="https://www.bkg.bund.de">BKG</a> 2015 (Daten verändert)'
    });
    */

    var overlayMaps = {
        //"Rechteck": gemeindelayer,
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
        console.log("eeeee");
        console.log(e);

        document.cookie = "bboxsouthWest_lat=" + e.layer._latlngs[0][0].lat;
        document.cookie = "bboxsouthWest_lng=" + e.layer._latlngs[0][0].lng;
        document.cookie = "bboxnothEast_lat=" + e.layer._latlngs[0][2].lat;
        document.cookie = "bboxnothEast_lng=" + e.layer._latlngs[0][2].lng;

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
