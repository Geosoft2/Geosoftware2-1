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
    var controlLayers;
    initMap();
    extendMap();
    getWFSLayer();

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
            //update the URL in browser
            var currentCenter = map.getCenter();
            newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
            newURL = buildUrl(newRequest);
            justReq = newURL.split("?")[1];
            stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);
            saveBboxtoCookies();

            //TODO: hier noch die flickr Anfrage updaten dass ich neuen bereich ein Knopf ersheint um diese zu updaten
            //if(getCookie("groupID")!=inactive)
            //TODO: zuvor muss der Button entfernt werden um ihn dann neu einzuladen
            //oder checken ob er schon existiert
            reloadSocialMedia();
        })
        .on('moveend', function () {
            //update the URL in browser
            var currentCenter = map.getCenter();
            newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
            newURL = buildUrl(newRequest);
            justReq = newURL.split("?")[1];
            stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);
            saveBboxtoCookies();
            //TODO: ebenso wie bei Zoomend
            reloadSocialMedia();
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
    var radarlayer = L.tileLayer.betterWms("https://maps.dwd.de/geoserver/dwd/ows", {
        layers: 'dwd:RX-Produkt',
        request: 'GetMap',
        format: 'image/png',
        transparent: true,
        opacity: 0.6,
        attribution: 'Radardaten: &copy; <a href="https://www.dwd.de">DWD</a>'
    }).addTo(map);

    var overlayMaps = {
        "DWD rain radar": radarlayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);
    // Einfügen der Legende auf der Karte
    var legend = L.control({position: 'bottomleft'});

  

    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    labels = ['<strong>Severity</strong>'],
   categories = ['Minor', 'Moderate', 'Severe', 'Extreme'];

    for (var i = 0; i < categories.length; i++) {
      //console.log(getColor(categories[i] + 1));
      div.innerHTML +=labels.push(
            '<i style="background:' + getColor(categories[i] ) + '; opacity:0.4"></i> ' +
            categories[i]);
          }
          div.innerHTML = labels.join('<br>');
          return div;
        };

    legend.addTo(map);

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

function getWFSLayer() {
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
      url : URL,
      dataType : 'jsonp',
      jsonpCallback : 'getJson',
      success : function (response) {
        set_output(response);
        if (response != null) {
          var filtered_response= new Array();
          var filtered_response_nd=new Array();
          var counter_all=0;
          var counter_nd=0;
          var double=0;
          for (var i =0; i<output.features.length; i++) {
            var filter_feature=filter_wfs_output(output.features[i]);
            if (filter_feature != null) {
              filtered_response[counter_all]=filter_feature;
              counter_all++;
              filtered_response_nd=filter_severity_map(filter_feature, filtered_response_nd);
            }
          }
          console.log(filtered_response);
          console.log(filtered_response_nd);
        }

          WFSLayer = L.geoJson(filtered_response_nd, {
          style: setStyles, // setStyles function steht unten im Dokument.
          onEachFeature: function (feature, layer) {
              //popupOptions = {maxWidth: 200};
              var index= filtered_response_nd.indexOf(feature);
              var photo=getSymbol(feature);
              var feature_both_start=feature.properties.EFFECTIVE;
              var cut=feature_both_start.indexOf('T',0);
              var feature_date_part_start=feature_both_start.slice(0,cut);
              var feature_time_part_start=feature_both_start.slice(cut+1,feature_both_start.length-1);
              var feature_both_end=feature.properties.EXPIRES;
              cut=feature_both_end.indexOf('T',0);
              var feature_date_part_end=feature_both_end.slice(0,cut);
              var feature_time_part_end=feature_both_end.slice(cut+1,feature_both_end.length-1);
              layer.bindPopup(photo[0]+" "+photo[1]+"<br><br>"+"from: "+feature_date_part_start+", "+feature_time_part_start+"<br>to: "+feature_date_part_end+", "+feature_time_part_end+"<br><br>"
                              +"district: "+feature.properties.AREADESC+"<br><br>"+"(timestamp: "+feature_date_part_start+", "+feature_time_part_start+")");
          }
      }).addTo(map);
  }
}).responseText;
}


/*function setPopup (feature, layer) {
    console.log(layer);
    //popupOptions = {maxWidth: 200};
    layer.bindPopup(feature.properties.EVENT + "<br><br>" + "VON: " + feature.properties.EFFECTIVE + "<br>Bis voraussichtlich: " + feature.properties.EXPIRES);

};*/

function extendMap() {
    //Button, to save personal default view
    var saveviewControl = L.Control.extend({
        options: {
            position: "topleft"
        },
        onAdd: () => {
          //var
             var container = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');

            container.innerHTML = '<i class="far fa-save"></i>';
            container.style.width = '30px';
            container.style.height = '30px';
            container.title="save the current mapview";

            container.onclick = () => {
                saveCookie();
            }
            return container;
        }
    });
    map.addControl(new saveviewControl);
}


function getColor(d) {

        return d === 'Minor'  ? "#F4D03F" :
               d === 'Moderate'  ? "#D35400" :
               d === 'Severe' ? "#C0392B" :
               d === 'Extreme' ? "#7D3C98" :
                            "#2E2EFE";
    }
/**
 * function to add a button for reloading the current socialmedia points
 * @private
 *
 */
function reloadSocialMedia() {
    //Button, to save personal default view
    var socialMediaControl = L.Control.extend({
        options: {
            position: "topleft"
        },
        onAdd: () => {
            var updatecontainer = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom')

            updatecontainer.innerHTML = '<i class="far fa-exclamation-circle"></i>';
            updatecontainer.style.width = '30px';
            updatecontainer.style.height = '30px';
            updatecontainer.onclick = () => {
                updatecontainer.remove(container)
                //TODO: Button entfernen
                //controlLayers.removeLayer()
                /*var flickrGroup = getCookie("flickr_groupID");
                if (flickrGroup == "public"){
                    axios.get('/api/v1/flickr/group/14643952@N25')
                }
                else{
                    if(flickrGroup == "false")
                }
                console.log("Socialmedia ius getting updated");
                */
            map.on("moveend", () => {
                updatecontainer.remove(updatecontainer);
            })
            }
            return updatecontainer;
        }
    });
    //controlLayers.addOverlay(socialMediaControl,"socialMediaControl")
    map.addControl(new socialMediaControl);
}

/**
*@description this saves the new mapextension as the last bbox, if there is no Bbox drawn
*@private
*
*/
function saveBboxtoCookies(){
    //TODO: if (wenn keine Bbox im Bbox Layer eingezeichnet wurde, dann soll der neue Ausschnitt hier als Bbox für Twitter dienen){
    var bbox = map.getBounds();
    document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
    document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
    document.cookie = "bboxnorthEast_lat=" + bbox._northEast.lat;
    document.cookie = "bboxnorthEast_lng=" + bbox._northEast.lng;
}

/**
 * @description change the activated element in map parallel to the shown element in the carousel
 * @private
 */
function changeActive(){
    var lat = $(".active").attr("lat")
    var lon = $(".active").attr("lon")
    map.fireEvent('click', "[51.147158,13.817316]")
    //console.log('id:', id)
}
