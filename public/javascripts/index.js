$(document).ready(() => {
    setInterval(() => {
        initTweets();
    }, interval * 1000);
    initDWDWarnings();
    getTweets();
});

var url = window.location.href;
var arr = url.split("/");
var host = arr[0] + "//" + arr[2];

function initTweets() {
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/v1/twitter/init',
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });
};

function getTweets() {
    $("#btn_tweetrequest").on("click", () => {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/api/v1/twitter/tweets',
            dataType: 'json',
            encode: true
        }).done(function (data) {
            console.log('Success: Tweets loaded from MongoDB.');
            //filterTweets(data);
            console.log(data);
        }).fail(function (xhr, status, error) {
            console.log('Error: ' + error);
        });
    });
};

async function initDWDWarnings() {
    await $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/v1/dwd/events/init',
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });

    getDWDWarnings();
};

function getDWDWarnings() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/v1/dwd/events/warnings',
        dataType: 'json',
        encode: true
    }).done(function (data) {
        console.log('Success: Warnings loaded from MongoDB.');
        drawWarningsToMap(data);
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });
};

function drawWarningsToMap(warnings) {
    WFSLayer = L.geoJson(warnings, {
        style: setStyles,
        onEachFeature: function (feature, layer) {
            //popupOptions = {maxWidth: 200};
            layer.bindPopup(feature.properties.EVENT + "<br><br>" + "VON: " + feature.properties.EFFECTIVE + "<br>Bis voraussichtlich: " + feature.properties.EXPIRES);
        }
    }).addTo(map);
};

/* function filterTweets(tweets) {
    var polygons = getPolygonsInBbox();
    var multipolygon = turf.multiPolygon(polygons).geometry;

    console.log(JSON.stringify(multipolygon));

    map.addLayer(L.geoJSON(multipolygon));

    var filteredtweets = [];
    var geo = [];

    tweets.forEach((t) => {
        var tweet = tweetToJSON(t);
        if (tweet.geo != null) {
            geo.push(tweet);
        };
    });

    geo.forEach((tweet) => {
         console.log(turf.booleanPointInPolygon(tweet.geo, multipolygon));
     }); 

    drawTweetsToMap(filteredtweets);
    drawTweetsToUI(filteredtweets); 
}; */

function getPolygonsInBbox() {
    var bboxsouthWest_lat = parseFloat(getCookie("bboxsouthWest_lat"));
    var bboxsouthWest_lng = parseFloat(getCookie("bboxsouthWest_lng"));
    var bboxnorthEast_lat = parseFloat(getCookie("bboxnorthEast_lat"));
    var bboxnorthEast_lng = parseFloat(getCookie("bboxnorthEast_lng"));

    var bboxsouthWest = [bboxsouthWest_lng, bboxsouthWest_lat];
    var bboxnorthWest = [bboxsouthWest_lng, bboxnorthEast_lat];
    var bboxnorthEast = [bboxnorthEast_lng, bboxnorthEast_lat];
    var bboxsouthEast = [bboxnorthEast_lng, bboxsouthWest_lat];

    var bbox = {
        "type": "Polygon",
        "coordinates": [[
            bboxsouthWest, bboxnorthWest, bboxnorthEast, bboxsouthEast, bboxsouthWest
        ]]
    };

    var dwd = output.features;
    var polygons = [];

    dwd.forEach((polygon) => {
        if (polygon.geometry.type == "MultiPolygon") {
            polygon.geometry.coordinates.forEach((c) => {
                c.forEach((coordinates) => {
                    var poly = {
                        "type": "Polygon",
                        "coordinates": [coordinates]
                    };

                    polygons.push(poly);
                });
            });
        } else {
            if (polygon.geometry.type == "Polygon") {
                polygons.push(polygon.geometry);
            }
        }
    });

    var polygonswithinbbox = [];

    polygons.forEach((p) => {
        if (turf.booleanContains(bbox, p)) {
            polygonswithinbbox.push(p);
        }
    });

    return polygonswithinbbox;
};

function drawTweetsToUI(tweets) {
    var first = tweets[0].id_str;
    tweets.forEach((tweet) => {
        var tweet_id = tweet.id_str;
        var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
        $("#tweet_carousel_inner").append(tweet_html);
        var tweet_dom = $("#" + tweet_id)[0];
        twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
    });

    $(".carousel-item").first().addClass("active");
};

function drawTweetsToMap(tweets) {
    var defaultIcon = L.ExtraMarkers.icon({
        markerColor: 'cyan',
        prefix: 'fab',
        icon: 'fa-twitter',
        iconColor: 'white'
    });

    var selectedIcon = L.ExtraMarkers.icon({
        markerColor: 'green-light',
        prefix: 'fab',
        icon: 'fa-twitter',
        iconColor: 'white'
    });

    var markergroup = L.featureGroup()
        .addEventListener("click", (e) => {
            markergroup.eachLayer((marker) => {
                marker.setIcon(defaultIcon);
            });

            e.layer.setIcon(selectedIcon);
        })
        .addTo(map);

    tweets.forEach((t) => {
        if (t.geo != null) {
            var marker = L.marker(t.geo.coordinates, { icon: defaultIcon, alt: "marker" })

            markergroup.addLayer(marker);
        }
    });
};

function tweetToJSON(tweet) {
    return {
        id: JSON.parse(tweet.id),
        geo: JSON.parse(tweet.geo),
        place: JSON.parse(tweet.place)
    };
};

/* function mergePolygons(polygons) {
    var result = {
        "type": "MultiPolygon",
        "coordinates": []
    };

    polygons.forEach((p) => {
        result.coordinates.push(p.coordinates);
    });

    return result;
}; */