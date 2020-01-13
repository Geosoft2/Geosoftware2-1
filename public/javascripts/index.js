$(document).ready(() => {
    requestTweets();
});
var url = window.location.href;
var arr = url.split("/");
var host = arr[0] + "//" + arr[2];
//TODO: das ist ein test TODO
function requestTweets() {
    $("#btn_tweetrequest").on("click", async () => {

        //Search API
        var query = twitter_default;
        query.q = $("#keyword_input").val();
        query.lang = $("#language_select").val();

        await $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/api/v1/twitter/tweets',
            data: query,
            dataType: 'json',
            encode: true
        }).done(function (data) {
            console.log('Success: Data from Twitter received');
            console.log(data);
            //filterTweets(data);
        }).fail(function (xhr, status, error) {
            console.log('Error: ' + error);
        });
    });
};

function filterTweets(tweets) {
    var polygons = getPolygonsInBbox();

    var filteredtweets = [];

    tweets.forEach((t, index) => {
        tweets[index] = toJSON(t);

        /* var inside = false;
        var i = 0;
        //TODO: Laufzeit problematisch
        while ((!inside) && (i < polygons.length)) {
            if (tweetInPolygon(tweet, polygons[i])) {
                filteredtweets.push(tweet);
                inside = true;
            }
        } */

        t = tweets[index];

        if (t.geo != null) {
            filteredtweets.push(t);
        }
    });

    drawTweetsToMap(filteredtweets);
    drawTweetsToUI(filteredtweets);
};

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

//TODO: Ueberpruefe, ob Tweet im Polygon liegt
function tweetInPolygon(tweet, polygon) {
    if (tweet.geo != null) {
        return d3.geoContains(polygon, tweet.geo);
    } else {
        if (tweet.place != null) {
            //console.log(tweet.place);
        }
    }
};

function drawTweetsToUI(tweets) {
    var first = tweets[0].id_str;
    tweets.forEach((tweet) => {
        console.log(tweet);
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

function toJSON(tweet) {
    return {
        id: JSON.parse(tweet.id),
        geo: JSON.parse(tweet.geo),
        place: JSON.parse(tweet.place)
    };
}