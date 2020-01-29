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
var flickrmarkergroup
var tweetgroup


/**
*@desc function to set the dwd output into the variable output
*@param x is the dwd output
*/
function set_output(x) {
    output = x;
};

/**
*@desc function to get the dwd output from the variable output
*@return variable output
*/
function get_output() {
    return output;
}

//start the functions needed to load the map, dwd data and
var controlLayers;
var drawnItems;
initMap();
extendMap();

/**
* @desc creates  the map load layers and also set events for moveend and zoomend on load of the index page
*/
function initMap() {
    //get all params send by URL
    var urlParam = getAllUrlParams();

    //default parameters if there are no saved neither in the url nor the cookies
    var startpoint = [51.26524, 9.72767];
    var zoomLevel = 6;

    //TODO: wenn diese false sind sind die beiden deaktiviert wenn auf true gesetzt wird dann aktiviert
    var twitter = false;
    var instagram = false;
    // set drawItems;
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

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
        //what happens if the user zoom in or out
        .on('zoomend', function () {
            //update the URL in browser
            var currentCenter = map.getCenter();
            newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
            newURL = buildUrl(newRequest);
            justReq = newURL.split("?")[1];
            stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);
            
            saveBboxtoCookies()
            
            var bboxSW_lng = getCookie("bboxsouthWest_lng")
            var bboxSW_lat = getCookie("bboxsouthWest_lat")
            var bboxNE_lng = getCookie("bboxnorthEast_lng")
            var bboxNE_lat = getCookie("bboxnorthEast_lat")
            
            var group_id = getCookie("flickr_group")
            var keyword = getCookie("flickr_keyword")


        })
        //what happens if the user moves the map
        .on('moveend', function () {
            //update the URL in browserflickr_group
            var currentCenter = map.getCenter();
            newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + map.getZoom()];
            newURL = buildUrl(newRequest);
            justReq = newURL.split("?")[1];
            stateObj = { foo: justReq };
            history.pushState(stateObj, "test", "?" + justReq);
            saveBboxtoCookies()
            var bboxSW_lng = getCookie("bboxsouthWest_lng")
            var bboxSW_lat = getCookie("bboxsouthWest_lat")
            var bboxNE_lng = getCookie("bboxnorthEast_lng")
            var bboxNE_lat = getCookie("bboxnorthEast_lat")

            var group_id = getCookie("flickr_group")
            var keyword = getCookie("flickr_keyword")
            /*
            var flickr_active = getCookie("flickr")
            console.log('flickr_active:', flickr_active)
            if (flickr_active!=false){
                console.log("yewah")
                axios.get('/api/v1/flickr')
                .then(function (response) {
                    console.log('response:', response)
                    drawFlickrToMap(response)
                    drawFlickrToUI(response)
                })
                .catch(function (error) {
                    $(".flickr").delay(0).fadeOut(0)
                    giveErrorMessage("An error with Flickr has been occured. Try again.")
                    console.log(error)
                })
            }
            var twitter_active = getCookie("twitter")
            if (twitter_active=="true"){
                axios.get('/api/v1/twitter/tweets?bbox=['+bboxSW_lat+','+bboxSW_lng+','+bboxNE_lat+','+bboxNE_lng+']')
                .then(function (data) {
                    filterTweets(data)
                })
            }
            */


            
            

        });

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

    // set radarlayer and add to the map
    var radarlayer = L.tileLayer.betterWms("https://maps.dwd.de/geoserver/dwd/ows", {
        layers: 'dwd:FX-Produkt',
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
    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = ['<strong>Severity</strong>'],
            categories = ['Minor', 'Moderate', 'Severe', 'Extreme'];

        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += labels.push(
                '<i style="background:' + getColor(categories[i]) + '; opacity:0.4"></i> ' +
                categories[i]);
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

// add draw functionality to the map
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
        drawnItems.clearLayers()
        var layer = e.layer
        drawnItems.addLayer(layer)
        map.addLayer(layer)

        alert("We are not proud of this, but right now it has no effect to draw a Bounding Box, except you realy like to draw Bounding Boxes, then it may put a smile on your face.")

        document.cookie = "bboxsouthWest_lat=" + e.layer._latlngs[0][0].lat
        document.cookie = "bboxsouthWest_lng=" + e.layer._latlngs[0][0].lng
        document.cookie = "bboxnorthEast_lat=" + e.layer._latlngs[0][2].lat
        document.cookie = "bboxnorthEast_lng=" + e.layer._latlngs[0][2].lng

    })
    var bbox;
    var poly;

    // Suchfeld für Städte
    var geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
    })
        .on('markgeocode', function (e) {
            if (poly != null) {
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

/**
*@desc function which is called after the user pushes the "change Warnings"-button
* an ajax call is set to get the information from the DWD Geoserver. A style function is called
* to display the warnlayers into the map and set the popups for each warnlayer
*
*/
 function getWFSLayer() {
 
    WFSLayer = null;
    var ajax =  $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/v1/dwd/events/warnings',
        dataType: 'json',
        encode: true
    }).done(function (response) {
        set_output(response);
        if (response != null) {
          var filtered_response= new Array();
          var filtered_response_nd=new Array();
          var counter_all=0;
          var counter_nd=0;
          var double=0;
          for (var i =0; i<output.features.length; i++) {
            var filter_feature=filter_wfs_output(output.features[i]); //this function is described in dwd.js
            if (filter_feature != null) {
              filtered_response[counter_all]=filter_feature;
              counter_all++;
              filtered_response_nd=filter_severity_map(filter_feature, filtered_response_nd); //this function is described in dwd.js
            }
          }
        }

          WFSLayer = L.geoJson(filtered_response_nd, {
          style: setStyles, // this function is described in dwd.js. It is used for choosing the right color for the warnlayers on the map
          onEachFeature: function (feature, layer) { //this function is for the layout of each warnlayer-popup
              var index= filtered_response_nd.indexOf(feature);
              var photo=getSymbol(feature); // function to show the right event symbol in the popup
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
      }).addTo(map)
  }).fail(function (xhr, status, error) {
    console.log('Error: ' + error);
});
}

/**
*@desc function to draw a button on the map that saves the current map view as a default view
*
*/
function extendMap() {
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
            container.title = "save the current mapview";

            container.onclick = () => {
                saveCookie();
            }
            return container;
        }
    });
    map.addControl(new saveviewControl);
}

/**
*@desc function to get the right color for the legend on the map. It is called in the initMap(), where the legend is build
*@param d a severity_category
*@return the right color depending on severity
*/
function getColor(d) {

    return d === 'Minor' ? "#F4D03F" :
        d === 'Moderate' ? "#D35400" :
            d === 'Severe' ? "#C0392B" :
                d === 'Extreme' ? "#7D3C98" :
                    "#2E2EFE";
}

/**
*@description this saves the new mapextension as the last bbox, if there is no Bbox drawn
*@private
*
*/
function saveBboxtoCookies() {
  
    if (drawnItems.layers==undefined) {

    var bbox = map.getBounds();
    document.cookie = "bboxsouthWest_lat=" + bbox._southWest.lat;
    document.cookie = "bboxsouthWest_lng=" + bbox._southWest.lng;
    document.cookie = "bboxnorthEast_lat=" + bbox._northEast.lat;
    document.cookie = "bboxnorthEast_lng=" + bbox._northEast.lng;
    }
}

//TODO: the curser of the picture in the carousel should light up on the map
/**
 * @description change the activated element in map parallel to the shown element in the carousel
 * @private
 */
function changeActive() {
    var lat = $(".active").attr("lat")
    var lon = $(".active").attr("lon")
    map.flyTo([lat, lon]) 
}


/**
 * @description this function draws the given Flickr pictures to the map
 * @param {JSON} flickrpic
 */
function drawFlickrToMap(flickrpic) {
    //TODO: this seems to not work

    if (flickrmarkergroup != undefined){
        flickrmarkergroup.clearLayers()
        }

    var flickrIcon = L.ExtraMarkers.icon({
        markerColor: 'red',
        prefix: 'fab',
        icon: 'fa-flickr',
        iconColor: 'white'
    });

    var flickrselectedIcon = L.ExtraMarkers.icon({
        markerColor: 'yellow',
        prefix: 'fab',
        icon: 'fa-flickr',
        iconColor: 'white'
    });
    flickrmarkergroup = L.featureGroup()
        .addEventListener("click", (e) => {
            flickrmarkergroup.eachLayer((marker) => {
                marker.setIcon(flickrIcon)
            });
            e.layer.setIcon(flickrselectedIcon)
            var id = e.layer.options.myCustomId
            $(".active").removeClass("active")
            $("#" + id).addClass("active")

        })
        .addTo(map)

    flickrpic.data.forEach((t) => {
        if (t.latitude != null && t.longitude) {
            var cut = t.timestamp.indexOf('T', 0);
            var date = t.timestamp.slice(0, cut);
            var time = t.timestamp.slice(cut + 1, t.timestamp.indexOf('.', 0));
            var marker = L.marker([t.latitude, t.longitude], { icon: flickrIcon, alt: "marker", myCustomId: t.photo_id })
                .bindPopup("user_name: " + t.user_name + "<br><br>" + "URL: " + "<a href='" + t.url + "' target='_blank'>Link</a>" + '<br><br>' + "timestamp: " + date + ", " + time)
            //marker.id = t.photo_id

            flickrmarkergroup.addLayer(marker)
        }
    });

};

/**
 * this draws a array of tweets to the map
 * @param {JSON} tweets 
 */
function drawTweetsToMap(tweets) {
    if (tweetgroup != undefined){
        tweetgroup.clearLayers()
        }   
    var defaultIcon = L.ExtraMarkers.icon({
        markerColor: 'cyan',
        prefix: 'fab',
        icon: 'fa-twitter',
        iconColor: 'white'
    });

    var selectedIcon = L.ExtraMarkers.icon({
        markerColor: 'yellow',
        prefix: 'fab',
        icon: 'fa-twitter',
        iconColor: 'white'
    });

    tweetgroup = L.featureGroup()
        .addEventListener("click", (e) => {
            tweetgroup.eachLayer((marker) => {
                marker.setIcon(defaultIcon);
            });

            e.layer.setIcon(selectedIcon);
        })
        .addTo(map);

    tweets.forEach((t) => {
        var latlng = [t.location.coordinates[1], t.location.coordinates[0]];
        var marker = L.marker(latlng, { icon: defaultIcon, alt: "marker" });
        tweetgroup.addLayer(marker);
    });
};
